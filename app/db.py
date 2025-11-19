# In-memory message store: conversation_id -> list of messages
MESSAGES: dict[str, list[dict]] = {}

def get_messages() -> dict[str, list[dict]]:
    return MESSAGES

# Generate a consistent conversation ID for two users
def conv_id(user_a: str, user_b: str) -> str:
    if user_a == user_b:
        raise ValueError("Cannot create conversation with self")
    a, b = sorted([user_a, user_b])
    return f"conv-{a}-{b}"
