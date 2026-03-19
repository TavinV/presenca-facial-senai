# 🔍 Documentação da API Facial - Presença Facial SENAI

## Índice
- [Informações Gerais](#informações-gerais)
- [Autenticação](#autenticação)
- [Health Check](#health-check)
- [Endpoints](#endpoints)
  - [Gerar Embedding Facial](#gerar-embedding-facial-encode)
  - [Reconhecer Aluno](#reconhecer-aluno-recognize)
  - [Testar Comparação de Embeddings](#testar-comparação-de-embeddings-test-embeddings)
  - [Calibrar Threshold](#calibrar-threshold-calibrate-threshold)
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
- **Sucesso `/encode` (200):**
  ```json
  {
    "embedding": "base64_ciphertext...",
    "nonce": "base64_nonce...",
    "photos_processed": 2
  }
  ```

- **Sucesso `/recognize` (200):**
  ```json
  {
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
- **Obrigatório para:** `/recognize` (reconhecimento pelo totem)
- **Exemplo:**
  ```bash
  curl -X POST http://localhost:8000/recognize \
    -H "x-facial-api-key: sua-chave-aqui" \
    -F "room=<roomId>" \
    -F "candidates=[...]" \
    -F "image=@foto.jpg"
  ```

> **Nota:** O endpoint `/encode` não requer autenticação, mas deve ser protegido por firewall/rede para que apenas a API principal possa acessá-lo. Os endpoints `/test-embeddings` e `/calibrate-threshold` são exclusivos para desenvolvimento e não devem ser expostos em produção.

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

Gera um embedding facial (vetorização) a partir de 1 a 5 fotos do mesmo aluno. Quando múltiplas fotos são enviadas, o embedding retornado é a média dos embeddings individuais, aumentando a robustez do reconhecimento.

**Autenticação:** Nenhuma

**Uso:** Integração com API principal para cadastro de alunos

**Request (Form Data):**

| Campo | Tipo | Obrigatório | Descrição |
| ---   | ---  | ---         |    ----   |
| images | file (lista) | Sim | 1 a 5 fotos da mesma pessoa (JPG, PNG) |

**Fluxo:**
1. Recebe lista de imagens (1-5)
2. Lê os bytes de cada imagem em memória
3. Para cada imagem, detecta o rosto e gera embedding 128-dimensional
4. Se múltiplas imagens: calcula embedding médio (np.mean)
5. Criptografa o embedding com AES-256-GCM
6. Retorna embedding criptografado + nonce + quantidade de fotos processadas

**Resposta (200 OK):**
```json
{
  "embedding": "AAAAAAAA/z8AAAAAAAAAP8...",
  "nonce": "abcdef1234567890...",
  "photos_processed": 3
}
```

**Exemplo cURL (1 foto):**
```bash
curl -X POST http://localhost:8000/encode \
  -F "images=@aluno.jpg"
```

**Exemplo cURL (múltiplas fotos):**
```bash
curl -X POST http://localhost:8000/encode \
  -F "images=@foto1.jpg" \
  -F "images=@foto2.jpg" \
  -F "images=@foto3.jpg"
```

**Exemplo Python:**
```python
import requests

with open('foto1.jpg', 'rb') as f1, open('foto2.jpg', 'rb') as f2:
    files = [
        ('images', ('foto1.jpg', f1, 'image/jpeg')),
        ('images', ('foto2.jpg', f2, 'image/jpeg')),
    ]
    response = requests.post('http://localhost:8000/encode', files=files)

data = response.json()
embedding = data['embedding']
nonce = data['nonce']
```

**Exemplo JavaScript (Frontend):**
```javascript
const formData = new FormData();
for (const imageFile of imageFiles) {
  formData.append('images', imageFile);
}

const response = await fetch('http://localhost:8000/encode', {
  method: 'POST',
  body: formData
});

const { embedding, nonce, photos_processed } = await response.json();
```

**Possíveis Erros:**

- **400 Bad Request** - Nenhuma imagem enviada
  ```json
  { "detail": "Envie pelo menos 1 foto" }
  ```

- **400 Bad Request** - Mais de 5 fotos enviadas
  ```json
  { "detail": "Máximo de 5 fotos permitidas" }
  ```

- **400 Bad Request** - Nenhum rosto detectado em alguma imagem
  ```json
  { "detail": "Nenhum rosto detectado na imagem" }
  ```

- **400 Bad Request** - Múltiplos rostos em alguma imagem
  ```json
  { "detail": "Mais de um rosto detectado na imagem" }
  ```

**Características Técnicas:**
- Embedding: vetor de 128 dimensões (float32)
- Múltiplas fotos: embedding médio via `np.mean(embeddings, axis=0)`
- Criptografia: AES-256-GCM (retorna `embedding` + `nonce`)
- Detecção: usa CNN (Convolutional Neural Network) do `dlib`
- Encoding: usa modelo deep learning pré-treinado

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
  
---

### Testar Comparação de Embeddings (Test Embeddings)

#### POST /test-embeddings

Rota de teste para comparar dois embeddings criptografados contra uma foto. Útil para depurar o reconhecimento ou validar o cadastro de diferentes alunos.

**Autenticação:** Nenhuma

**Request (Form Data):**

| Campo | Tipo | Obrigatório | Descrição |
| ---   | ---  | ---         |    ----   |
| embedding1 | string (JSON) | Sim | JSON com campos `embedding`, `nonce` e `nome` (opcional) |
| embedding2 | string (JSON) | Sim | JSON com campos `embedding`, `nonce` e `nome` (opcional) |
| image | file | Sim | Foto para comparar contra os dois embeddings |

**Formato dos campos `embedding1` / `embedding2`:**
```json
{
  "embedding": "base64_ciphertext...",
  "nonce": "base64_nonce...",
  "nome": "Aluno João"
}
```

**Resposta (200 OK):**
```json
{
  "winner": "Aluno João",
  "results": {
    "Aluno João": {
      "distance": 0.2341,
      "passed_threshold": true
    },
    "Aluno Maria": {
      "distance": 0.5812,
      "passed_threshold": false
    }
  },
  "difference": 0.3471,
  "threshold": 0.35,
  "conclusion": {
    "more_similar": "Aluno João",
    "confidence": "high"
  }
}
```

**Possíveis Erros:**
- **400 Bad Request** - JSON inválido, campos faltando, imagem vazia ou rosto não detectado
- **500 Internal Server Error** - Erro ao descriptografar embeddings

---

### Calibrar Threshold (Calibrate Threshold)

#### POST /calibrate-threshold

Rota para calibrar e testar diferentes valores de threshold de reconhecimento. Retorna análise detalhada de margem e confiança.

**Autenticação:** Nenhuma

**Request (Form Data):**

| Campo | Tipo | Obrigatório | Descrição |
| ---   | ---  | ---         |    ----   |
| embedding | string (JSON) | Sim | JSON com campos `embedding`, `nonce` e `nome` (opcional) |
| threshold | float | Sim | Valor de threshold para testar (0 < threshold ≤ 2.0) |
| image | file | Sim | Foto para comparar |

**Resposta (200 OK):**
```json
{
  "distance": 0.2341,
  "threshold_tested": 0.4,
  "would_match": true,
  "margin": 0.1659,
  "margin_percentage": 41.47,
  "confidence": "very_high",
  "confidence_text": "Muito Alta (margem > 0.15)",
  "default_threshold": 0.35,
  "would_match_default": true
}
```

**Níveis de confiança:**
| Margem (`threshold - distance`) | Confiança |
|---|---|
| > 0.15 | `very_high` |
| > 0.08 | `high` |
| > 0.03 | `medium` |
| > 0 (match) | `low` |
| ≤ 0 (no match) | `no_match` |

**Possíveis Erros:**
- **400 Bad Request** - Threshold inválido (≤ 0 ou > 2.0), JSON inválido, imagem vazia ou rosto não detectado

---

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
| `/encode` | Nenhuma | Apenas API principal (restringir por firewall/rede) |
| `/recognize` | x-facial-api-key | Totens |
| `/test-embeddings` | Nenhuma | Apenas ambiente de desenvolvimento |
| `/calibrate-threshold` | Nenhuma | Apenas ambiente de desenvolvimento |

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
