import face_recognition
import numpy as np
import tempfile
import os

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
