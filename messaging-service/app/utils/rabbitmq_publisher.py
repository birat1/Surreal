import json
import logging

from aio_pika.exceptions import AMQPConnectionError

from .rabbitmq_client import RabbitMQClient, client

logger = logging.getLogger(__name__)


class RabbitMQPublisher:
    """Publisher."""

    def __init__(self, client: RabbitMQClient) -> None:
        """Instantiate class variables."""
        self.client = client

    async def publish_event(self, event: dict) -> None:
        """Convert and publish event."""
        body = json.dumps(event).encode()

        try:
            await self.client.publish(body)
            return True
        except AMQPConnectionError:
            logger.error("Failed to publish, due to connection error")
            return False
        except Exception as e:
            logger.exception(f"Failed to publish event: {e}")
            return False


publisher = RabbitMQPublisher(client)
