import os
import json
import logging
import time
import asyncio
import aio_pika

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST")
RABBITMQ_PORT = os.getenv("RABBITMQ_PORT")
RABBITMQ_USER = os.getenv("RABBITMQ_USER")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS")

EXCHANGE = "notification.exchange"
ROUTING_KEY = "notification.chat"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# Publisher to publish events to message broker
class RabbitMQPublisher:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.exchange = None
        self.breaker = CircuitBreaker(10)
        self.connect_lock = asyncio.Lock()
        self.running = False

    async def connect(self):    
        if self.connection and not self.connection.is_closed:
            return
            
        self.connection = await aio_pika.connect_robust(
            host=RABBITMQ_HOST,
            port=int(RABBITMQ_PORT),
            login=RABBITMQ_USER,
            password=RABBITMQ_PASS,
            timeout=3
        )
        self.channel = await self.connection.channel(publisher_confirms=True)
        self.exchange = await self.channel.declare_exchange(
            EXCHANGE,
            aio_pika.ExchangeType.TOPIC,
            durable=True
        )

    
    async def reconnect_loop(self):
        self.running = True

        while self.running:
            if self.breaker.state != "CLOSED":
                async with self.connect_lock:
                    try:
                        await self.connect()
                        await self.breaker.record_success()
                        logger.info("RabbitMQ connected")

                    except Exception as e:
                        await self.breaker.record_failure()
                        logger.warning(
                            "RabbitMQ unavailable",
                            extra={"error": str(e)}
                        )

            await asyncio.sleep(5)


    async def publish_event(self, event: dict, routing_key=ROUTING_KEY):
        if not self.breaker.allow_publish():
            return
        
        try:
            body = json.dumps(event).encode()

            message = aio_pika.Message(
                body=body,
                content_type="application/json",
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            )
            await self.exchange.publish(message, routing_key=routing_key)

        except Exception as e:
            await self.breaker.record_failure()
            logger.error(
                "Publish failed",
                extra={"error": str(e), "event": event}
            )

    async def close(self):
        if self.connection and not self.connection.is_closed:
            await self.connection.close()
    
    async def start(self):
        asyncio.create_task(self.reconnect_loop())
    
    async def stop(self):
        self.running = False
        await self.close()


# Circuitbreaker to gracefully, handle connection and reconnection to broker
class CircuitBreaker:
    def __init__(self, reset_timeout: int):
        self.state = "OPEN"
        self.reset_timeout = reset_timeout
        self.last_failure = 0.0
        self.lock = asyncio.Lock()
    
    def allow_publish(self):
        if self.state == "CLOSED":
            return True
    
        if time.time() - self.last_failure >= self.reset_timeout:
            self.state = "HALF"
            return False

        return False
    
    async def record_success(self):
        async with self.lock:
            self.state = "CLOSED"
    
    async def record_failure(self):
        async with self.lock:
            self.state = "OPEN"
            self.last_failure = time.time()



publisher = RabbitMQPublisher()