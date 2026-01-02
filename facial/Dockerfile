FROM python:3.11-slim

# Evita prompts interativos
ENV DEBIAN_FRONTEND=noninteractive

# Dependências de sistema para dlib
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia requirements primeiro (cache)
COPY requirements.txt .

# Atualiza pip
RUN pip install --upgrade pip

# Instala dependências (vai demorar, é normal)
RUN pip install --no-cache-dir -r requirements.txt

# Copia o resto do código
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
