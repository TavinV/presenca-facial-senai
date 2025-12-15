import base64
import numpy as np

def embedding_to_base64(embedding: np.ndarray) -> str:
    float32 = embedding.astype("float32")
    buffer = float32.tobytes()
    return base64.b64encode(buffer).decode("utf-8")
