# 🔍 Documentação da API Facial - Presença Facial SENAI

## Índice
- [Informações Gerais](#informações-gerais)
- [Autenticação](#autenticação)
- [Health Check](#health-check)
- [Endpoints](#endpoints)
  - [Gerar Embedding Facial](#gerar-embedding-facial-encode)
  - [Reconhecer Aluno](#reconhecer-aluno-recognize)
- [Fluxos de Integração](#fluxos-de-integração)
- [Cache de Alunos](#cache-de-alunos)
- [Modelos de Dados](#modelos-de-dados)

---

## Informações Gerais

**Framework:** FastAPI (Python)

**Base URL:** `http://localhost:8000`

**Porta:** `8000`

**Propósito:** API especializada em reconhecimento facial e geração de embeddings para o sistema de presença facial SENAI

**Padrão de Resposta:**
- **Sucesso (200):**
  ```json
  {
    "embedding": "base64_encoded_string",
    "studentId": "507f1f77bcf86cd799439014"
  }
  ```

- **Erro (400/401):**
  ```json
  {
    "detail": "Descrição do erro"
  }
  ```

---

## Autenticação

### API Key Header
- **Header:** `x-facial-api-key`
- **Tipo:** String
- **Obrigatório para:** `/encode` (geração de embedding)
- **Exemplo:**
  ```bash
  curl -X POST http://localhost:8000/encode \
    -H "x-facial-api-key: sua-chave-aqui" \
    -F "image=@foto.jpg"
  ```

### Validação
```python
def verify_api_key(x_facial_api_key: str = Header(...)):
    if x_facial_api_key != FACIAL_API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key"
        )
```

---

## Health Check

### GET /health

Verifica se a API está funcionando e responsiva.

**Autenticação:** Nenhuma

**Resposta (200 OK):**
```json
{
  "status": "ok"
}
```

**Uso:**
```bash
curl http://localhost:8000/health
```

---

## Endpoints

### Gerar Embedding Facial (Encode)

#### POST /encode

Gera um embedding facial (vetorização) a partir de uma imagem.

**Autenticação:** `x-facial-api-key` (obrigatório)

**Uso:** Integração com API principal para cadastro de alunos

**Request (Form Data):**
- `image` - Arquivo de imagem (JPG, PNG) contendo um único rosto (obrigatório)

**Fluxo:**
1. Recebe arquivo de imagem
2. Carrega imagem em memória (temporário)
3. Detecta rosto usando `face_recognition.load_image_file()`
4. Gera embedding 128-dimensional usando `face_recognition.face_encodings()`
5. Converte embedding para base64
6. Retorna embedding codificado
7. Deleta arquivo temporário

**Resposta (200 OK):**
```json
{
  "embedding": "AAAAAAAA/z8AAAAAAAAAP8AAAAAAAAA/QAAAAAAAAD/AAAAAAAAAP8AAAAAAAAAP8AAAAAAAAAP8AAAAAAAAAP..."
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:8000/encode \
  -H "x-facial-api-key: sua-chave-secreta" \
  -F "image=@aluno.jpg"
```

**Exemplo Python:**
```python
import requests

with open('aluno.jpg', 'rb') as f:
    files = {'image': f}
    headers = {'x-facial-api-key': 'sua-chave-secreta'}
    response = requests.post(
        'http://localhost:8000/encode',
        files=files,
        headers=headers
    )
    
embedding_base64 = response.json()['embedding']
print(f"Embedding gerado: {embedding_base64[:50]}...")
```

**Exemplo JavaScript (Frontend):**
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('http://localhost:8000/encode', {
  method: 'POST',
  headers: {
    'x-facial-api-key': 'sua-chave-secreta'
  },
  body: formData
});

const data = await response.json();
const embedding = data.embedding;
```

**Possíveis Erros:**

- **400 Bad Request** - Nenhum rosto detectado
  ```json
  {
    "detail": "Nenhum rosto detectado na imagem"
  }
  ```

- **400 Bad Request** - Múltiplos rostos detectados
  ```json
  {
    "detail": "Mais de um rosto detectado na imagem"
  }
  ```

- **401 Unauthorized** - API Key inválida ou ausente
  ```json
  {
    "detail": "Invalid API Key"
  }
  ```

**Características Técnicas:**
- Embedding: vetor de 128 dimensões (float32)
- Formato de saída: Base64 (para transmissão por HTTP)
- Detecção: usa CNN (Convolutional Neural Network) do `dlib`
- Encoding: usa modelo deep learning pré-treinado
- Arquivo temporário é deletado automaticamente

---

### Reconhecer Aluno (Recognize)

#### POST /recognize

Realiza o reconhecimento facial de um aluno a partir de uma imagem, comparando contra uma lista de candidatos previamente selecionados.

**Autenticação: x-facial-api-key (header)**

**Uso:** Chamado pelo totem para reconhecer alunos em tempo real

**Request (Form Data):**
| Campo | Tipo | Obrigatório | Descrição |
| ---   | ---  | ---         |    ----   |
| room  | string | Sim | Objectid da sala aonde o reconhecimento está acontecendo |
| candidates | string (JSON) | Sim | Lista de alunos candidatos ao reconhecimento |
| image | file | Sim | Imagem contendo apenas um rosto para o reconhecimento |

**Formato do campo `candidates`:**
O campo candidates DEVE ser uma string JSON válida representando um array.

```json
[
  {
    "studentId": "507f1f77bcf86cd799439014",
    "facialEmbedding": {
      "embedding": "AAAAA...base64...AAAA",
      "nonce": "AES nonce"
     }
  },
  {
    "studentId": "507f1f77bcf86cd799439015",
    "facialEmbedding": {
      "embedding": "BBBBB...base64...BBBB",
      "nonce": "AES nonce"
     }
  },
]

```

Todo o reconhecimento acontece em memória, os dados faciais são descriptografados e armazenados em cache para agilizar o reconhecimento. Não são feitas consultas no banco de dados neste endpoint.

**Resposta (200 OK - Aluno Identificado):**
```json
{
  "studentId": "507f1f77bcf86cd799439014"
}
```

**Possíveis Erros:**

- **400 Bad Request** - Nenhum rosto detectado
  ```json
  {
    "detail": "Nenhum rosto detectado na imagem"
  }
  ```

- **400 Bad Request** - Múltiplos rostos na imagem
  ```json
  {
    "detail": "Mais de um rosto detectado na imagem"
  }
  ```

- **400 Bad Request** - Aluno não encontrado (distância > threshold)
  ```json
  {
    "detail": "Aluno não encontrado"
  }
  ```

- **400 Bad Request** - Nenhum candidato na sala
  ```json
  {
    "detail": "Nenhum aluno registrado para esta sala"
  }
  ```
  
## Variáveis de Ambiente

### Arquivo `.env`

```env
# ============================
# 🔐 AUTHENTICATION
# ============================
FACIAL_API_KEY= ChaveSuperSecreta
AES_ENCRYPTION_KEY= ChaveAindaMaisSecreta

# ============================
# 🌐 API URLS
# ============================
# URL desta API (para referência interna)
FACIAL_API_URL=http://facial:8000
MAIN_API_URL=http://server:5000/api

# ============================
# 🧠 FACE RECOGNITION
# ============================
FACE_MATCH_THRESHOLD=0.35

# ============================
# 🚀 ENVIRONMENT
# ============================
PRODUCTION=false
```

### Descrição de Variáveis

| Variável | Tipo | Padrão | Descrição |
|----------|------|--------|-----------|
| `FACIAL_API_KEY` | string | - | Chave secreta para o endpoint `/encode` |
| `AES_ENCRYPTION_KEY` | string | - | Chave utilizada na criptografia AES dos embeddings faciais. |
| `MAIN_API_URL` | string | - | URL base da API Node.js principal (ex: http://localhost:5000/api) |
| `FACE_MATCH_THRESHOLD` | float | 0.6 | Distância máxima euclidiana para considerar um match válido |
| `PRODUCTION` | boolean | false | Determina se o ambiente é de produção ou desenvolvimento.


---

## Dependências

### requirements.txt

```
fastapi          # Framework web assíncrono
uvicorn          # Servidor ASGI
python-dotenv    # Carrega variáveis de .env
face_recognition # Detecta e codifica rostos (usa dlib + CNN)
numpy            # Computação vetorizada (cálculo de distâncias)
httpx            # Cliente HTTP assíncrono (sincronização)
cryptography     # Módulo de criptografia AES-256-gcm
```

### Instalação

```bash
pip install -r requirements.txt
```

---

## Execução

### Desenvolvimento

```bash
# Navegar para a pasta
cd facial

# Instalar dependências
pip install -r requirements.txt

# Executar com auto-reload
uvicorn main:app --reload --port 8000

# Acesso:
# API: http://localhost:8000
```

---

### Health Check

Monitore a saúde da API periodicamente:

```bash
# A cada 10 segundos
while true; do 
  curl -s http://localhost:8000/health | jq .
  sleep 10
done
```

---

## Segurança

### Boas Práticas

✅ **Faça:**
- Armazene `FACIAL_API_KEY` em variáveis de ambiente
- Use HTTPS em produção
- Valide tamanho de arquivo de imagem (máx. 5MB)
- Implemente rate limiting para `/recognize`
- Monitore latência de sincronização

❌ **Evite:**
- Incluir API Key no código-fonte
- Expor logs com chaves sensíveis
- Aceitar uploads ilimitados
- Deixar `/recognize` aberto para qualquer IP (use firewall)

### Proteção de Endpoints

| Endpoint | Autenticação | Uso |
|----------|--------------|-----|
| `/health` | Nenhuma | Health check público |
| `/encode` | Nenhuma | Apenas API principal |
| `/recognize` | x-facial-api-key | Totens (recomenda-se firewall) |

---

## Troubleshooting

### Problema: "Nenhum rosto detectado"
**Causa:** Imagem de má qualidade, rosto muito pequeno ou ângulo desfavorável
**Solução:** 
- Use imagens de resolução ≥ 640x480
- Posicione o rosto no centro da imagem
- Iluminação adequada
- Distância apropriada (40-60cm no totem)

### Problema: "Mais de um rosto detectado"
**Causa:** Múltiplas pessoas na imagem
**Solução:** 
- Capture apenas um rosto
- Melhore o enquadramento da câmera do totem

### Problema: Aluno não é reconhecido
**Causa:** Distância euclidiana > threshold (0.6)
**Soluções:**
- Recapture a foto de cadastro em iluminação similar
- Aumente o threshold em `.env` (ex: 0.7)
- Verifique se o aluno está cadastrado
- Confirme se o aluno está associado à sala

### Problema: Timeout em /recognize
**Causa:** Muitos candidatos ou imagem muito grande
**Solução:**
- Otimize o tamanho da imagem (<2MB)
- Reduza número de alunos por sala
- Aumente timeout da requisição

---

**Última atualização:** 23 de Janeiro de 2026  
**Versão da API:** 1.0  
**Ambiente:** Desenvolvimento / Produção
