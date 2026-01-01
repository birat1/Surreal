import logging
import os
import uuid

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

AWS_REGION = os.getenv("AWS_REGION")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


def upload_image_to_s3(user_id: str, content: bytes, content_type: str = "image/webp") -> str:
    """
    Upload an image to S3 and return the public URL.

    Args:
        content: The image file content as bytes
        content_type: MIME type of the image (default: image/webp)

    Returns:
        The public URL of the uploaded image

    """
    try:
        filename = f"{uuid.uuid4().hex}.webp"
        key = f"profile-pictures/uploads/{user_id}/{filename}"

        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=key,
            Body=content,
            ContentType=content_type,
        )

        url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{key}"
        logger.info(f"Successfully uploaded image to S3: {url}")
        return url

    except ClientError as e:
        logger.error(f"Failed to upload image to S3: {e}")
        raise Exception(f"Failed to upload image to S3: {str(e)}")


def delete_image_from_s3(image_url: str) -> bool:
    """
    Delete an image from S3 given its URL.

    Args:
        image_url: The full S3 URL of the image to delete

    Returns:
        True if deletion was successful, False otherwise
    """
    try:
        # Extract the key from the URL
        # URL format: https://bucket-name.s3.region.amazonaws.com/key
        if not image_url or S3_BUCKET_NAME not in image_url:
            logger.warning(f"Invalid S3 URL provided: {image_url}")
            return False

        # Extract key from URL
        key = image_url.split(f"{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/")[1]

        s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=key)

        logger.info(f"Successfully deleted image from S3: {key}")
        return True

    except ClientError as e:
        logger.error(f"Failed to delete image from S3: {e}")
        return False
    except IndexError:
        logger.error(f"Could not parse S3 key from URL: {image_url}")
        return False


# def image_exists_in_s3(image_url: str) -> bool:
#     """
#     Check if an image exists in S3.

#     Args:
#         image_url: The full S3 URL of the image

#     Returns:
#         True if the image exists, False otherwise
#     """
#     try:
#         if not image_url or S3_BUCKET_NAME not in image_url:
#             return False

#         key = image_url.split(f"{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/")[1]

#         s3_client.head_object(
#             Bucket=S3_BUCKET_NAME,
#             Key=key
#         )
#         return True

#     except ClientError:
#         return False
#     except IndexError:
#         return False
