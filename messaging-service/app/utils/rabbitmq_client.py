import logging
import os

import aio_pika
from aio_pika.exceptions import AMQPConnectionError

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST")
RABBITMQ_PORT = os.getenv("RABBITMQ_PORT")
RABBITMQ_USER = os.getenv("RABBITMQ_USER")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS")

EXCHANGE = "notification.exchange"
ROUTING_KEY = "notification.chat"

logger = logging.getLogger(__name__)

class RabbitMQClient:
    """Creates connection and publishes messages to message broker."""

    def __init__(self) -> None:
        """Instantiate class variables."""
        self.url = f"amqp://{RABBITMQ_USER}:{RABBITMQ_PASS}@{RABBITMQ_HOST}:{RABBITMQ_PORT}/"
        self.exchange_name = EXCHANGE
        self.routing_key = ROUTING_KEY

        self.connection = None
        self.channel = None
        self.exchange = None

    async def connect(self) -> None:
        """Connect to RabbitMQ broker."""
        if self.connection and not self.connection.is_closed:
            return

        logger.info("Connecting to RabbitMQ")

        try:
            self.connection = await aio_pika.connect_robust(
                self.url,
                timeout=3,
            )

            self.channel = await self.connection.channel(
                publisher_confirms=True,
            )

            self.exchange = await self.channel.declare_exchange(
                self.exchange_name,
                aio_pika.ExchangeType.TOPIC,
                durable=True,
            )

            logger.info("Successfully connected to RabbitMQ")
        except Exception:
            self.connection = None
            self.channel = None
            self.exchange = None

            logger.exception("Failed to connect to RabbitMQ")

    async def publish(self, body: bytes) -> None:
        """Publish event to RabbitMQ broker."""
        if not self.connection.is_closed:
            await self.connect()


        try:
            message = aio_pika.Message(
                body=body,
                content_type="application/json",
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            )

            await self.exchange.publish(
                message,
                routing_key=self.routing_key,
            )
        except AMQPConnectionError:
            logger.error("Connection error when publishing message")
            raise
        except Exception:
            raise

    async def close(self) -> None:
        """Close connection to RabbitMQ broker."""
        if self.connection and not self.connection.is_closed:
            await self.connection.close()

client = RabbitMQClient()
