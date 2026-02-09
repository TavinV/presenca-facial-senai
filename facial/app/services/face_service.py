import face_recognition
import numpy as np
import tempfile
import os

def generate_embedding_from_images(file_bytes_list: list[bytes]) -> np.ndarray:
    """
    Gera embedding médio a partir de múltiplas fotos da mesma pessoa.
    
    Args:
        file_bytes_list: Lista de bytes de imagens
        
    Returns:
        np.ndarray: Embedding médio normalizado
        
    Raises:
        ValueError: Se nenhuma foto válida for processada
    """
    if not file_bytes_list:
        raise ValueError("Lista de imagens vazia")
    
    embeddings = []
    errors = []
    
    for idx, file_bytes in enumerate(file_bytes_list):
        tmp_path = None
        try:
            # Criar arquivo temporário
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name
            
            # Carregar e processar imagem
            image = face_recognition.load_image_file(tmp_path)
            face_locations = face_recognition.face_locations(image)
            
            # Validações
            if not face_locations:
                errors.append(f"Foto {idx + 1}: Nenhum rosto detectado")
                continue
            
            if len(face_locations) > 1:
                errors.append(f"Foto {idx + 1}: Múltiplos rostos detectados")
                continue
            
            # Verificar tamanho do rosto
            top, right, bottom, left = face_locations[0]
            face_height = bottom - top
            if face_height < 80:
                errors.append(f"Foto {idx + 1}: Rosto muito pequeno ou distante")
                continue
            
            # Gerar embedding
            encodings = face_recognition.face_encodings(image, face_locations)
            if encodings:
                embeddings.append(encodings[0])
            
        except Exception as e:
            errors.append(f"Foto {idx + 1}: Erro ao processar - {str(e)}")
        
        finally:
            # Limpar arquivo temporário
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)
    
    # Verificar se conseguimos processar pelo menos algumas fotos
    if not embeddings:
        error_msg = "Nenhuma foto válida processada.\n" + "\n".join(errors)
        raise ValueError(error_msg)
    
    # Avisar se algumas fotos falharam
    if len(embeddings) < len(file_bytes_list):
        print(
            f"Apenas {len(embeddings)}/{len(file_bytes_list)} fotos processadas. "
            f"Erros: {'; '.join(errors)}"
        )
    
    # Calcular embedding médio
    avg_embedding = np.mean(embeddings, axis=0)
    
    # Normalizar
    avg_embedding = avg_embedding / np.linalg.norm(avg_embedding)
    
    return avg_embedding


def generate_embedding_from_image(file_bytes: bytes) -> np.ndarray:
    # cria arquivo temporário
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        image = face_recognition.load_image_file(tmp_path)
        encodings = face_recognition.face_encodings(image)

        if not encodings:
            raise ValueError("Nenhum rosto detectado na imagem")

        if len(encodings) > 1:
            raise ValueError("Mais de um rosto detectado na imagem")

        return encodings[0]

    finally:
        os.remove(tmp_path)
