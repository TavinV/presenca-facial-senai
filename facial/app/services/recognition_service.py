"""
Serviço de reconhecimento facial usando DISTÂNCIA EUCLIDIANA
- Vetorizado
- Com cache de embeddings
- Sem cosine similarity
- Estável e consistente com versão antiga
"""

from typing import List, Dict, Optional
import numpy as np

from app.services.face_service import generate_embedding_from_image
from app.services.embedding_cache import embedding_cache
from app.core.settings import settings


# ================================
# 🔢 VALIDAÇÃO
# ================================

def validate_embedding(embedding: List[float]) -> np.ndarray:
    """
    Converte embedding para numpy array e valida.
    """
    vec = np.asarray(embedding, dtype=np.float32)

    if vec.ndim != 1:
        raise ValueError("Embedding inválido")
    
    norm = np.linalg.norm(vec)

    if norm == 0:
        raise ValueError("Embedding com norma zero")

    return vec / norm


# ================================
# 🧠 RECONHECIMENTO FACIAL
# ================================

def recognize_student(
    room_id: str,
    image_bytes: bytes,
    candidates: Optional[List[Dict]] = None,
) -> Dict:
    """
    Reconhecimento facial usando distância euclidiana.

    Returns:
        {
            "studentId": str | None,
            "distance": float,
            "recognized": bool
        }
    """

    if not candidates:
        print("⚠️ Nenhum candidato fornecido para reconhecimento")
        return {
            "studentId": None,
            "distance": 0.0,
            "recognized": False
        }

    print(f"🔍 Reconhecendo aluno | Room: {room_id}")

    # ===========================
    # 1️⃣ EMBEDDING DA QUERY
    # ===========================
    try:
        input_embedding = generate_embedding_from_image(image_bytes)
        query_vec = validate_embedding(input_embedding)
    except Exception as e:
        print(f"❌ Erro ao gerar embedding da imagem: {e}")
        raise

    # ===========================
    # 2️⃣ STACK DOS EMBEDDINGS
    # ===========================
    embeddings = []
    student_ids = []
    for candidate in candidates:
        student_id = candidate.get("_id")
        facial_data = candidate.get("facialEmbedding")

        if not student_id or not facial_data or "embedding" not in facial_data:
            continue

        try:
            stored_embedding = embedding_cache.get_decrypted_embedding(facial_data)
            embeddings.append(validate_embedding(stored_embedding))
            student_ids.append(student_id)
        except Exception as e:
            print(f"⚠️ Erro no embedding do aluno {student_id}: {e}")

    if not embeddings:
        return {
            "studentId": None,
            "distance": 0.0,
            "recognized": False
        }

    embeddings_matrix = np.vstack(embeddings)  # NxD

    # ===========================
    # 3️⃣ DISTÂNCIA EUCLIDIANA VETORIZADA
    # ===========================
    distances = np.linalg.norm(embeddings_matrix - query_vec, axis=1)

    best_index = int(np.argmin(distances))
    best_distance = float(distances[best_index])
    best_match_id = student_ids[best_index]

    has_seccond_best = len(distances) > 1

    if has_seccond_best:
        seccond_best_index = int(np.argsort(distances)[1])
        seccond_best_distance = float(distances[seccond_best_index])
        margin_between = seccond_best_distance - best_distance
    else:
        margin_between = None
        seccond_best_distance = None

    print("\n" + "=" * 60)
    print("🎯 RESULTADO")
    print(f"   Melhor ID: {best_match_id}")
    print(f"   Distância: {best_distance:.4f}")
    print(f"   Threshold: {settings.FACE_MATCH_THRESHOLD}")
    print("=" * 60)

    # ===========================
    # 4️⃣ DECISÃO
    # ===========================

    accept_match = False

    if best_distance <= settings.FACE_MATCH_THRESHOLD:

        if has_seccond_best:
            if (
                margin_between is not None and
                margin_between >= settings.FACE_MATCH_MARGIN
            ):
                print(
                    f"✅ MATCH ACEITO: {best_match_id} "
                    f"(margem de {margin_between:.4f})"
                )
                accept_match = True
            else:
                print(
                    f"⚠️ MATCH AMBÍGUO REJEITADO: {best_match_id} "
                    f"(margem {margin_between:.4f} abaixo do mínimo "
                    f"{settings.FACE_MATCH_MARGIN})"
                )

        else:
            print(f"✅ MATCH ACEITO (único candidato): {best_match_id}")
            accept_match = True

    else:
        print("❌ MATCH REJEITADO (distância acima do threshold)")

    if accept_match:
        return {
            "studentId": best_match_id,
            "distance": round(best_distance, 4),
            "recognized": True
        }

    return {
        "studentId": None,
        "distance": round(best_distance, 4),
        "recognized": False
}


# ================================
# 🧹 CACHE
# ================================

def clear_embedding_cache():
    embedding_cache.clear_cache()
    print("🧹 Cache de embeddings limpo")


def get_cache_statistics() -> Dict:
    return embedding_cache.get_cache_info()
