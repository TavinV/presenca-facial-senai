FROM ageitgey/face_recognition:latest

WORKDIR /app

COPY requirements.txt .

# só instala o que NÃO for dlib/face_recognition
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
