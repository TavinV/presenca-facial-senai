import numpy as np
from app.state import STUDENTS
from app.core.settings import settings
from app.services.face_service import generate_embedding_from_image

def recognize_student(room_id: str, image_bytes: bytes) -> str | None:
    # 1️⃣ gera embedding da imagem recebida
    input_embedding = generate_embedding_from_image(image_bytes)

    # 2️⃣ filtra alunos da sala
    candidates = [
        s for s in STUDENTS if room_id in s.rooms
    ]

    if not candidates:
        return None

    # 3️⃣ stack dos embeddings (Nx128)
    embeddings = np.vstack([s.facial for s in candidates])

    # 4️⃣ distância euclidiana vetorizada
    distances = np.linalg.norm(embeddings - input_embedding, axis=1)

    # 5️⃣ melhor match
    best_index = np.argmin(distances)
    best_distance = distances[best_index]

    # 6️⃣ threshold
    if best_distance > settings.FACE_MATCH_THRESHOLD:
        return None

    return candidates[best_index].id
