import base64
import numpy as np
import httpx

from app.state import STUDENTS
from app.models.student import StudentEmbedding
from app.core.settings import settings

MAIN_API_URL = settings.MAIN_API_URL
FACIAL_API_KEY = settings.FACIAL_API_KEY


def base64_to_embedding(base64_str: str) -> np.ndarray:
    buffer = base64.b64decode(base64_str)
    return np.frombuffer(buffer, dtype=np.float32)


async def sync_students():
    url = f"{MAIN_API_URL}/students/faces"

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            url,
            headers={
                "x-facial-api-key": FACIAL_API_KEY
            }
        )
        response.raise_for_status()

        payload = response.json()
        students_data = payload.get("data", [])

        new_students = []

        for item in students_data:
            facial = item.get("facial")
            if not facial:
                continue

            new_students.append(
                StudentEmbedding(
                    id=item["_id"],
                    facial=base64_to_embedding(facial),
                    rooms=item.get("rooms", [])
                )
            )

        # 🔁 troca atômica do cache
        STUDENTS.clear()
        STUDENTS.extend(new_students)
