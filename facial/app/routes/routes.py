from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException
)

from app.core.security import verify_api_key
from app.services.face_service import generate_embedding_from_image
from app.services.recognition_service import recognize_student
from app.utils.embedding_codec import embedding_to_base64

router = APIRouter()


# =========================================================
# 🔐 GERAR EMBEDDING FACIAL (CADASTRO DE ALUNO)
# =========================================================
# - Uso interno (API principal)
# - Protegido por x-facial-api-key
# - Recebe uma imagem
# - Retorna embedding em base64
# =========================================================
@router.post(
    "/encode",
    tags=["encoding"]
)
async def encode_face(
    image: UploadFile = File(...),
    _: None = Depends(verify_api_key)
):
    try:
        file_bytes = await image.read()

        embedding = generate_embedding_from_image(file_bytes)
        embedding_base64 = embedding_to_base64(embedding)

        return {
            "embedding": embedding_base64
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================================================
# 🎯 RECONHECER ALUNO PELO ROSTO (TOTEM)
# =========================================================
# - Recebe roomId + imagem
# - Filtra alunos pelo roomId
# - Faz matching facial em memória
# - Retorna apenas studentId
# =========================================================
@router.post(
    "/recognize",
    tags=["recognize"]
)
async def recognize_face(
    room: str = Form(...),
    image: UploadFile = File(...)
):
    print("Começando recognize face")
    try:
        image_bytes = await image.read()
        print ("Tenho os bytes da imagem")
        student_id = recognize_student(
            room_id=room,
            image_bytes=image_bytes
        )

        return {
            "studentId": student_id
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
