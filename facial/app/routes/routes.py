import json
import numpy as np
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException
)

from app.core.settings import settings

from app.services.face_service import generate_embedding_from_images
from app.services.face_service import generate_embedding_from_image

from app.services.encryption_service import encrypt_embedding

from app.services.embedding_cache import embedding_cache

from app.services.recognition_service import recognize_student
from app.services.recognition_service import validate_embedding

router = APIRouter()

# =========================================================
# 🔐 GERAR EMBEDDING FACIAL (CADASTRO)
# =========================================================
# - Recebe apenas uma imagem
# - Retorna embedding criptografado + nonce (Base64)
# =========================================================
@router.post(
    "/encode",
    tags=["encoding"]
)
async def encode_face(
    images: list[UploadFile] = File(..., description="1-5 fotos da mesma pessoa")
):
    try:
        # Validação
        if not images:
            raise ValueError("Envie pelo menos 1 foto")
        
        if len(images) > 5:
            raise ValueError("Máximo de 5 fotos permitidas")

        # ===========================
        # 1️⃣ LER TODAS AS IMAGENS
        # ===========================
        file_bytes_list = []
        for image in images:
            file_bytes = await image.read()
            if file_bytes:
                file_bytes_list.append(file_bytes)
        
        if not file_bytes_list:
            raise ValueError("Todas as imagens estão vazias")

        # ===========================
        # 2️⃣ GERAR EMBEDDING (MÉDIO SE MÚLTIPLAS)
        # ===========================
        embedding = generate_embedding_from_images(file_bytes_list)

        # ===========================
        # 3️⃣ CRIPTOGRAFAR EMBEDDING
        # ===========================
        encrypted = encrypt_embedding(embedding.tolist())

        return {
            "embedding": encrypted["ciphertext"],
            "nonce": encrypted["nonce"],
            "photos_processed": len(file_bytes_list)
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================================================
# 🎯 RECONHECER ALUNO PELO ROSTO (TOTEM)
# =========================================================
# - Recebe room + candidates + imagem
# - Faz matching facial em memória
# =========================================================
@router.post(
    "/recognize",
    tags=["recognize"]
)
async def recognize_face(
    room: str = Form(...),
    candidates: str = Form(...),  # JSON string
    image: UploadFile = File(...)
):
    print("🔵 Começando recognize_face")

    try:
        # ===========================
        # 1️⃣ BYTES DA IMAGEM
        # ===========================
        image_bytes = await image.read()
        print(f"🖼️ Bytes da imagem: {len(image_bytes)}")

        if not image_bytes:
            raise ValueError("Imagem vazia")

        # ===========================
        # 2️⃣ PARSE DOS CANDIDATOS
        # ===========================
        try:
            candidates_list = json.loads(candidates)
        except json.JSONDecodeError:
            raise ValueError("Campo 'candidates' não é um JSON válido")

        if not isinstance(candidates_list, list):
            raise ValueError("'candidates' deve ser uma lista")

        print(f"👥 Candidatos recebidos: {len(candidates_list)}")

        # ===========================
        # 3️⃣ RECONHECIMENTO
        # ===========================
        result = recognize_student(
            room_id=room,
            image_bytes=image_bytes,
            candidates=candidates_list
        )

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

# =========================================================
# 🧪 TESTAR COMPARAÇÃO DE EMBEDDINGS
# =========================================================
# - Recebe 2 embeddings criptografados + 1 foto
# - Mostra qual embedding é mais similar (menor distância euclidiana)
# =========================================================
@router.post(
    "/test-embeddings",
    tags=["testing"]
)
async def test_embeddings_comparison(
    embedding1: str = Form(..., description="JSON com embedding, nonce e nome"),
    embedding2: str = Form(..., description="JSON com embedding, nonce e nome"),
    image: UploadFile = File(..., description="Foto para comparar")
):
    """
    Rota de teste para comparar dois embeddings com uma foto.
    
    Retorna qual embedding é mais similar à foto usando distância euclidiana.
    """
    print("🧪 Começando test_embeddings_comparison")

    try:
        # ===========================
        # 1️⃣ BYTES DA IMAGEM
        # ===========================
        image_bytes = await image.read()
        print(f"🖼️ Bytes da imagem: {len(image_bytes)}")

        if not image_bytes:
            raise ValueError("Imagem vazia")

        # ===========================
        # 2️⃣ PARSE DOS EMBEDDINGS
        # ===========================
        try:
            emb1_data = json.loads(embedding1)
            emb2_data = json.loads(embedding2)
        except json.JSONDecodeError as e:
            raise ValueError(f"JSON inválido nos embeddings: {str(e)}")

        # Validar estrutura
        for idx, emb_data in enumerate([emb1_data, emb2_data], 1):
            if not isinstance(emb_data, dict):
                raise ValueError(f"Embedding {idx} deve ser um objeto JSON")
            if "embedding" not in emb_data or "nonce" not in emb_data:
                raise ValueError(f"Embedding {idx} deve conter 'embedding' e 'nonce'")

        nome1 = emb1_data.get("nome", f"Embedding 1")
        nome2 = emb2_data.get("nome", f"Embedding 2")

        print(f"📦 Embedding 1: {nome1}")
        print(f"📦 Embedding 2: {nome2}")

        # ===========================
        # 3️⃣ GERAR EMBEDDING DA FOTO
        # ===========================
        try:
            input_embedding = generate_embedding_from_image(image_bytes)
            query_vec = validate_embedding(input_embedding)
        except Exception as e:
            raise ValueError(f"Erro ao processar a foto: {str(e)}")

        # ===========================
        # 4️⃣ DESCRIPTOGRAFAR EMBEDDINGS
        # ===========================
        try:
            # Simular estrutura de facialEmbedding
            facial_data_1 = {
                "embedding": emb1_data["embedding"],
                "nonce": emb1_data["nonce"]
            }
            facial_data_2 = {
                "embedding": emb2_data["embedding"],
                "nonce": emb2_data["nonce"]
            }

            stored_emb1 = embedding_cache.get_decrypted_embedding(facial_data_1)
            stored_emb2 = embedding_cache.get_decrypted_embedding(facial_data_2)

            vec1 = validate_embedding(stored_emb1)
            vec2 = validate_embedding(stored_emb2)

        except Exception as e:
            raise ValueError(f"Erro ao descriptografar embeddings: {str(e)}")

        # ===========================
        # 5️⃣ CALCULAR DISTÂNCIAS EUCLIDIANAS
        # ===========================
        distance1 = float(np.linalg.norm(vec1 - query_vec))
        distance2 = float(np.linalg.norm(vec2 - query_vec))

        # ===========================
        # 6️⃣ DETERMINAR VENCEDOR
        # ===========================
        winner = nome1 if distance1 < distance2 else nome2
        winner_distance = min(distance1, distance2)
        loser_distance = max(distance1, distance2)
        
        difference = abs(distance1 - distance2)

        # ===========================
        # 7️⃣ VERIFICAR THRESHOLD
        # ===========================
        threshold = settings.FACE_MATCH_THRESHOLD
        emb1_passed = distance1 <= threshold
        emb2_passed = distance2 <= threshold

        print("\n" + "=" * 60)
        print("🧪 RESULTADO DO TESTE")
        print(f"   {nome1}: {distance1:.4f} {'✅ PASSOU' if emb1_passed else '❌ FALHOU'}")
        print(f"   {nome2}: {distance2:.4f} {'✅ PASSOU' if emb2_passed else '❌ FALHOU'}")
        print(f"   Diferença: {difference:.4f}")
        print(f"   Threshold: {threshold}")
        print(f"   🏆 Vencedor: {winner}")
        print("=" * 60 + "\n")

        return {
            "winner": winner,
            "results": {
                nome1: {
                    "distance": round(distance1, 4),
                    "passed_threshold": emb1_passed
                },
                nome2: {
                    "distance": round(distance2, 4),
                    "passed_threshold": emb2_passed
                }
            },
            "difference": round(difference, 4),
            "threshold": threshold,
            "conclusion": {
                "more_similar": winner,
                "confidence": "high" if difference > 0.1 else "low"
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        print(f"❌ Erro inesperado: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

# =========================================================
# ⚙️ CALIBRAR THRESHOLD
# =========================================================
# - Recebe embedding + foto + threshold customizado
# - Testa se o match seria aceito com esse threshold
# - Útil para encontrar o threshold ideal
# =========================================================
@router.post(
    "/calibrate-threshold",
    tags=["testing"]
)
async def calibrate_threshold(
    embedding: str = Form(..., description="JSON com embedding, nonce e nome"),
    threshold: float = Form(..., description="Valor de threshold para testar"),
    image: UploadFile = File(..., description="Foto para comparar")
):
    """
    Rota para calibrar e testar diferentes valores de threshold.
    
    Retorna se o match seria aceito com o threshold fornecido,
    a distância euclidiana calculada, e análise de margem.
    """
    print(f"⚙️ Começando calibrate_threshold com threshold={threshold}")

    try:
        # ===========================
        # 1️⃣ VALIDAR THRESHOLD
        # ===========================
        if threshold <= 0:
            raise ValueError("Threshold deve ser maior que 0")
        
        if threshold > 2.0:
            raise ValueError("Threshold muito alto (máximo recomendado: 2.0)")

        # ===========================
        # 2️⃣ BYTES DA IMAGEM
        # ===========================
        image_bytes = await image.read()
        print(f"🖼️ Bytes da imagem: {len(image_bytes)}")

        if not image_bytes:
            raise ValueError("Imagem vazia")

        # ===========================
        # 3️⃣ PARSE DO EMBEDDING
        # ===========================
        try:
            emb_data = json.loads(embedding)
        except json.JSONDecodeError as e:
            raise ValueError(f"JSON inválido no embedding: {str(e)}")

        # Validar estrutura
        if not isinstance(emb_data, dict):
            raise ValueError("Embedding deve ser um objeto JSON")
        if "embedding" not in emb_data or "nonce" not in emb_data:
            raise ValueError("Embedding deve conter 'embedding' e 'nonce'")

        nome = emb_data.get("nome", "Embedding Teste")
        print(f"📦 Embedding: {nome}")

        # ===========================
        # 4️⃣ GERAR EMBEDDING DA FOTO
        # ===========================
        try:
            input_embedding = generate_embedding_from_image(image_bytes)
            query_vec = validate_embedding(input_embedding)
        except Exception as e:
            raise ValueError(f"Erro ao processar a foto: {str(e)}")

        # ===========================
        # 5️⃣ DESCRIPTOGRAFAR EMBEDDING
        # ===========================
        try:
            facial_data = {
                "embedding": emb_data["embedding"],
                "nonce": emb_data["nonce"]
            }

            stored_emb = embedding_cache.get_decrypted_embedding(facial_data)
            stored_vec = validate_embedding(stored_emb)

        except Exception as e:
            raise ValueError(f"Erro ao descriptografar embedding: {str(e)}")

        # ===========================
        # 6️⃣ CALCULAR DISTÂNCIA EUCLIDIANA
        # ===========================
        distance = float(np.linalg.norm(stored_vec - query_vec))

        # ===========================
        # 7️⃣ TESTAR COM THRESHOLD FORNECIDO
        # ===========================
        would_match = distance <= threshold
        margin = threshold - distance
        margin_percentage = (margin / threshold) * 100 if threshold > 0 else 0

        # Comparar com threshold padrão do sistema
        default_threshold = settings.FACE_MATCH_THRESHOLD
        would_match_default = distance <= default_threshold

        # Análise de confiança
        if margin > 0.15:
            confidence = "very_high"
            confidence_text = "Muito Alta (margem > 0.15)"
        elif margin > 0.08:
            confidence = "high"
            confidence_text = "Alta (margem > 0.08)"
        elif margin > 0.03:
            confidence = "medium"
            confidence_text = "Média (margem > 0.03)"
        elif margin > 0:
            confidence = "low"
            confidence_text = "Baixa (margem < 0.03)"
        else:
            confidence = "rejected"
            confidence_text = "Rejeitado (acima do threshold)"

        print("\n" + "=" * 60)
        print("⚙️ RESULTADO DA CALIBRAÇÃO")
        print(f"   Nome: {nome}")
        print(f"   Distância: {distance:.4f}")
        print(f"   Threshold Testado: {threshold}")
        print(f"   Threshold Padrão: {default_threshold}")
        print(f"   Match: {'✅ SIM' if would_match else '❌ NÃO'}")
        print(f"   Margem: {margin:+.4f} ({margin_percentage:+.1f}%)")
        print(f"   Confiança: {confidence_text}")
        print("=" * 60 + "\n")

        return {
            "match_result": {
                "would_match": would_match,
                "distance": round(distance, 4),
                "tested_threshold": threshold,
                "margin": round(margin, 4),
                "margin_percentage": round(margin_percentage, 1)
            },
            "confidence": {
                "level": confidence,
                "description": confidence_text
            },
            "comparison_with_default": {
                "default_threshold": default_threshold,
                "would_match_with_default": would_match_default,
                "difference_from_default": round(threshold - default_threshold, 4)
            },
            "recommendations": {
                "status": "✅ APROVADO" if would_match else "❌ REJEITADO",
                "suggestion": _get_threshold_suggestion(distance, threshold, margin)
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        print(f"❌ Erro inesperado: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )


def _get_threshold_suggestion(distance: float, threshold: float, margin: float) -> str:
    """
    Fornece sugestões baseadas no resultado da calibração.
    """
    if margin > 0.15:
        return "Excelente! Grande margem de segurança. Threshold pode até ser reduzido."
    elif margin > 0.08:
        return "Bom! Margem confortável. Threshold adequado."
    elif margin > 0.03:
        return "Aceitável. Margem pequena, considere testar com threshold ligeiramente maior."
    elif margin > 0:
        return "Atenção! Margem muito pequena. Aumente o threshold para mais segurança."
    else:
        diff = abs(margin)
        if diff < 0.05:
            return f"Quase passou! Faltaram apenas {diff:.4f}. Aumente o threshold um pouco."
        elif diff < 0.15:
            return f"Distância moderadamente acima. Faltaram {diff:.4f}. Considere se é a mesma pessoa."
        else:
            return f"Distância muito alta ({diff:.4f} acima). Provavelmente não é a mesma pessoa."