# 📚 Documentação da API - Presença Facial SENAI

## Índice
- [Informações Gerais](#informações-gerais)
- [Autenticação](#autenticação)
- [Health Check](#health-check)
- [Autenticação (Auth)](#autenticação-auth)
- [Usuários (Users)](#usuários-users)
- [Turmas (Classes)](#turmas-classes)
- [Sessões de Aula (Class Sessions)](#sessões-de-aula-class-sessions)
- [Alunos (Students)](#alunos-students)
- [Salas (Rooms)](#salas-rooms)
- [Totens (Totems)](#totens-totems)
- [Presença (Attendance)](#presença-attendance)
- [Pedidos de acesso (Access Requests)](#requisições-de-acesso-access-requests)

---

## Informações Gerais

**Base URL:** `http://localhost:3000/api`

**Padrão de Resposta:**
- **Sucesso (2xx):**
  ```json
  {
    "success": true,
    "message": "Descrição da operação",
    "data": {}
  }
  ```

- **Erro (4xx/5xx):**
  ```json
  {
    "success": false,
    "message": "Descrição do erro",
    "data": null
  }
  ```

---

## Autenticação

### JWT Token
- O token JWT é retornado no login e deve ser enviado em todas as requisições autenticadas
- **Header:** `Authorization: Bearer <token>`
- **Payload do token:**
  ```json
  {
    "id": "<userId>",
    "name": "<userName>",
    "role": "professor|coordenador"
  }
  ```

### Middlewares de Segurança
- `authenticateJWT()` - Requer token válido
- `authenticateJWT("coordenador")` - Requer role coordenador
- `facialApiAuth` - Autenticação para a API facial (header `x-facial-api-key`)
- `totemApiAuth` - Autenticação para totens (header `x-totem-api-key`)

---

## Health Check

### GET /api/health

Verifica se a API está funcionando.

**Autenticação:** Nenhuma

**Resposta (200 OK):**
```json
{
  "message": "API Presença Facial SENAI funcionando 🚀"
}
```

---

## Autenticação (Auth)

### POST /api/auth/login

Realiza login e retorna um token JWT.

**Autenticação:** Nenhuma

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Possíveis Erros:**
- `401 Unauthorized` - Credenciais inválidas

---

## Usuários (Users)

### POST /api/users

Criar novo usuário.

**Autenticação:** JWT - Role: `coordenador`

**Request Body:**
```json
{
  "name": "Professor João",
  "email": "joao@escola.edu",
  "password": "senha123",
  "role": "professor|coordenador"
}
```

**Validação:**
- `name`: string, 3-100 caracteres (obrigatório)
- `email`: email válido (obrigatório)
- `password`: string, 6-50 caracteres (obrigatório)
- `role`: "professor" ou "coordenador" (obrigatório)

**Resposta (201 Created):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Professor João",
    "email": "joao@escola.edu",
    "role": "professor",
    "isActive": true,
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

---

### POST /api/users/root

Criar usuário root do sistema, caso não haja um ainda. utiliza as credenciais salvas nas variáveis de ambiente.

**Resposta (201 Created):**

```json
{
    "success": true,
    "status": 201,
    "message": "Usuário root criado com sucesso."
}
```

---

### GET /api/users

Listar todos os usuários. (contem paginação via query params).
#### Paginação padrão:

| limit | page | filter |
| ---   | ---  | ---    | 
|  10   |   1  |  {}    |

---

**Autenticação:** JWT

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": {
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      [  
        {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Professor João",
          "email": "joao@escola.edu",
          "role": "professor",
          "isActive": true,
          "createdAt": "2025-12-15T10:30:00Z",
          "updatedAt": "2025-12-15T10:30:00Z"
        }
      ]
    }
  
}
```

---

### GET /api/users/me

Obter dados do usuário autenticado.

**Autenticação:** JWT

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Professor João",
    "role": "professor"
  }
}
```

---

### GET /api/users/:id

Obter usuário por ID.

**Autenticação:** Nenhuma

**Parâmetros:**
- `id` - ObjectId do usuário

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Professor João",
    "email": "joao@escola.edu",
    "role": "professor",
    "isActive": true,
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

---

### PATCH /api/users/me

Atualizar dados do usuário autenticado.

**Autenticação:** JWT

**Request Body:**
```json
{
  "name": "Professor João Silva",
  "email": "joao.silva@escola.edu"
}
```

**Validação:**
- `name`: string, 3-100 caracteres (opcional)
- `email`: email válido (opcional)
- `password`: não pode ser atualizada por esta rota

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Professor João Silva",
    "email": "joao.silva@escola.edu",
    "role": "professor",
    "isActive": true,
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

---

### PATCH /api/users/me/change-password

Alterar senha do usuário autenticado.

**Autenticação:** JWT

**Request Body:**
```json
{
  "oldPassword": "senha123",
  "newPassword": "novaSenha456",
  "confirmNewPassword": "novaSenha456"
}
```

**Validação:**
- `oldPassword`: string (obrigatório)
- `newPassword`: string (obrigatório)
- `confirmNewPassword`: deve ser igual a `newPassword` (obrigatório)

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Senha atualizada com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Professor João",
    "email": "joao@escola.edu",
    "role": "professor",
    "isActive": true
  }
}
```

**Possíveis Erros:**
- `400 Bad Request` - Senhas não coincidem ou campos faltando

---

### PATCH /api/users/:id/activate

Ativar usuário (apenas coordenador).

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId do usuário

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Usuário ativado com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Professor João",
    "email": "joao@escola.edu",
    "role": "professor",
    "isActive": true
  }
}
```

---

### PATCH /api/users/:id/deactivate

Desativar usuário (apenas coordenador).

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId do usuário

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Usuário desativado com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Professor João",
    "email": "joao@escola.edu",
    "role": "professor",
    "isActive": false
  }
}
```

---

### DELETE /api/users/:id

Deletar usuário (apenas coordenador).

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId do usuário

**Resposta (204 No Content)**

**Possíveis Erros:**
- `404 Not Found` - Usuário não encontrado

---

## Turmas (Classes)

### POST /api/classes

Criar nova turma.

**Autenticação:** JWT - Role: `coordenador`

**Request Body:**
```json
{
  "code": "I2P4",
  "course": "Informática",
  "shift": "manhã",
  "year": 2025
}
```

**Validação:**
- `code`: string, 2-20 caracteres, uppercase (obrigatório)
- `course`: string, 2-100 caracteres (obrigatório)
- `shift`: "manhã", "tarde" ou "noite" (obrigatório)
- `year`: número, 2000-2100 (obrigatório)

**Resposta (201 Created):**
```json
{
  "success": true,
  "message": "Turma criada com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "code": "I2P4",
    "course": "Informática",
    "shift": "manhã",
    "year": 2025,
    "teachers": [],
    "rooms": [],
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

---

### GET /api/classes

Listar todas as turmas.

**Autenticação:** JWT - Role: `coordenador`

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "code": "I2P4",
      "course": "Informática",
      "shift": "manhã",
      "year": 2025,
      "teachers": [],
      "rooms": [],
      "createdAt": "2025-12-15T10:30:00Z",
      "updatedAt": "2025-12-15T10:30:00Z"
    }
  ]
}
```

---

### GET /api/classes/:id

Obter turma por ID.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId da turma

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "code": "I2P4",
    "course": "Informática",
    "shift": "manhã",
    "year": 2025,
    "teachers": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Professor João",
        "email": "joao@escola.edu"
      }
    ],
    "rooms": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "code": "SALA101",
        "name": "Sala 101",
        "location": "Bloco A"
      }
    ],
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

---

### GET /api/classes/my

Busca as turmas associadas a um professor loggado.

**Autenticação:** JWT

**Resposta (200 OK):**
```json
{
    "success": true,
    "status": 200,
    "message": "",
    "data": [
        {
            "_id": "693ce60e5858dd95e811d480",
            "code": "I2C",
            "course": "Mecatrônica",
            "shift": "manhã",
            "year": 2025,
            "teachers": [
                {
                    "_id": "693d75775858dd95e811d488",
                    "name": "Bruno Messias Aguiar",
                    "role": "professor",
                    "isActive": true
                }
            ],
            "rooms": [
                {
                    "_id": "693d7bb143b7dbdf812131c1",
                    "name": "Laboratório de Redes",
                    "isActive": true
                }
            ],
            "createdAt": "2025-12-13T04:05:34.362Z",
            "updatedAt": "2025-12-13T14:52:55.914Z",
            "__v": 7
        },
        {
            "_id": "693e14aa8034fc53b35b86b9",
            "code": "I2P",
            "course": "Desenvolvimento de Sistemas",
            "shift": "manhã",
            "year": 2025,
            "teachers": [
                {
                    "_id": "693d75775858dd95e811d488",
                    "name": "Bruno Messias Aguiar",
                    "role": "professor",
                    "isActive": true
                }
            ],
            "rooms": [
                {
                    "_id": "693d7bb143b7dbdf812131c1",
                    "name": "Laboratório de Redes",
                    "isActive": true
                },
                {
                    "_id": "693efe7609cd37ab70141fd6",
                    "name": "Sala de Aula 7",
                    "isActive": true
                },
                {
                    "_id": "693f00206c0ad14a6dd98776",
                    "name": "Laboratório de Pneumatica",
                    "isActive": true
                }
            ],
            "createdAt": "2025-12-14T01:36:42.046Z",
            "updatedAt": "2025-12-14T18:21:35.859Z",
            "__v": 4
        }
    ]
}
```

---

### GET /api/classes/name/:name

Buscar turma pelo código.

**Autenticação:** JWT

**Parâmetros:**
- `name` - Código da turma (ex: I2P4)

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "code": "I2P4",
    "course": "Informática",
    "shift": "manhã",
    "year": 2025,
    "teachers": [],
    "rooms": [],
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

---

### PATCH /api/classes/:id

Atualizar turma.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId da turma

**Request Body:**
```json
{
  "code": "I2P4",
  "course": "Informática Avançada",
  "shift": "tarde",
  "year": 2025
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Turma atualizada com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "code": "I2P4",
    "course": "Informática Avançada",
    "shift": "tarde",
    "year": 2025,
    "teachers": [],
    "rooms": [],
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

---

### DELETE /api/classes/:id

Deletar turma.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId da turma

**Resposta (204 No Content)**

---

### GET /api/classes/:id/teachers

Listar professores da turma.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId da turma

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Professor João",
      "email": "joao@escola.edu",
      "role": "professor"
    }
  ]
}
```

---

### POST /api/classes/:id/teachers/:teacherId

Adicionar professor à turma.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId da turma
- `teacherId` - ObjectId do professor

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Professor adicionado à turma com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "code": "I2P4",
    "teachers": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Professor João"
      }
    ]
  }
}
```

---

### DELETE /api/classes/:id/teachers/:teacherId

Remover professor da turma.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId da turma
- `teacherId` - ObjectId do professor

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Professor removido da turma com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "code": "I2P4",
    "teachers": []
  }
}
```

---

### GET /api/classes/:id/rooms

Listar salas associadas à turma.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId da turma

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "code": "SALA101",
      "name": "Sala 101",
      "location": "Bloco A",
      "isActive": true
    }
  ]
}
```

---

### POST /api/classes/:id/rooms/:roomId

Associar sala à turma.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId da turma
- `roomId` - ObjectId da sala

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Sala adicionada à turma com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "code": "I2P4",
    "rooms": ["507f1f77bcf86cd799439013"]
  }
}
```

---

### DELETE /api/classes/:id/rooms/:roomId

Remover sala da turma.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId da turma
- `roomId` - ObjectId da sala

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Sala removida da turma com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "code": "I2P4",
    "rooms": []
  }
}
```

---

### GET /api/classes/:id/students

Listar alunos da turma.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId da turma

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Aluno João",
      "registration": "2025001",
      "facialId": "facial_embedding_string",
      "classes": ["I2P4"],
      "isActive": true
    }
  ]
}
```

---

## Sessões de Aula (Class Sessions)

### POST /api/class-sessions

Criar nova sessão de aula.

**Autenticação:** JWT - Role: `professor` ou `coordenador`

**Request Body:**
```json
{
  "classId": "507f1f77bcf86cd799439012",
  "room": "507f1f77bcf86cd799439013",
  "name": "Aula 1 - Introdução",
  "date": "2025-12-15T10:30:00Z"
}
```

**Validação:**
- `classId`: ObjectId válido (obrigatório)
- `room`: ObjectId válido (obrigatório)
- `name`: string, 3-80 caracteres (obrigatório)
- `date`: data válida (obrigatório)

**Resposta (201 Created):**
```json
{
  "success": true,
  "message": "Sessão criada com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "classId": "507f1f77bcf86cd799439012",
    "teacherId": "507f1f77bcf86cd799439011",
    "room": "507f1f77bcf86cd799439013",
    "name": "Aula 1 - Introdução",
    "date": "2025-12-15T10:30:00Z",
    "status": "open",
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

---

### GET /api/class-sessions/:id

Obter sessão por ID.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId da sessão

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "classId": "507f1f77bcf86cd799439012",
    "teacherId": "507f1f77bcf86cd799439011",
    "room": "507f1f77bcf86cd799439013",
    "name": "Aula 1 - Introdução",
    "date": "2025-12-15T10:30:00Z",
    "status": "open",
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

---

### GET /api/class-sessions/class/:classId

Listar todas as sessões de uma turma.

**Autenticação:** JWT

**Parâmetros:**
- `classId` - ObjectId da turma

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "classId": "507f1f77bcf86cd799439012",
      "teacherId": "507f1f77bcf86cd799439011",
      "room": "507f1f77bcf86cd799439013",
      "name": "Aula 1 - Introdução",
      "date": "2025-12-15T10:30:00Z",
      "status": "open"
    }
  ]
}
```

---

### GET /api/class-sessions/teacher/:teacherId

Listar todas as sessões de um professor.

**Autenticação:** JWT

**Parâmetros:**
- `teacherId` - ObjectId do professor

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "classId": "507f1f77bcf86cd799439012",
      "teacherId": "507f1f77bcf86cd799439011",
      "room": "507f1f77bcf86cd799439013",
      "name": "Aula 1 - Introdução",
      "date": "2025-12-15T10:30:00Z",
      "status": "open"
    }
  ]
}
```

---

### PATCH /api/class-sessions/:id

Atualizar sessão.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId da sessão

**Request Body:**
```json
{
  "name": "Aula 1 - Introdução (Revisada)",
  "date": "2025-12-15T11:30:00Z"
}
```

**Validação:**
- `name`: string, 3-80 caracteres (opcional)
- `date`: data válida (opcional)

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Sessão atualizada com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "classId": "507f1f77bcf86cd799439012",
    "teacherId": "507f1f77bcf86cd799439011",
    "room": "507f1f77bcf86cd799439013",
    "name": "Aula 1 - Introdução (Revisada)",
    "date": "2025-12-15T11:30:00Z",
    "status": "open",
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

---

### PATCH /api/class-sessions/:id/close

Fechar sessão.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId da sessão

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Sessão fechada com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "classId": "507f1f77bcf86cd799439012",
    "teacherId": "507f1f77bcf86cd799439011",
    "name": "Aula 1 - Introdução",
    "date": "2025-12-15T10:30:00Z",
    "status": "closed",
    "updatedAt": "2025-12-15T11:30:00Z"
  }
}
```

---

### DELETE /api/class-sessions/:id

Deletar sessão.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId da sessão

**Resposta (204 No Content)**

---

## Alunos (Students)

### POST /api/students

Criar novo aluno.

**Autenticação:** JWT

**Request Body:**
```json
{
  "name": "Aluno João",
  "registration": "2025001",
  "facialEmbedding": {
    "embedding": "Embedding facial encriptado via AES-256-gcm",
    "nonce": "nonce do facial" 
  },
  "classes": ["I2P4"]
}
```

**Validação:**
- `name`: string, 3-100 caracteres (obrigatório)
- `registration`: string, 3-50 caracteres, único (obrigatório)
- `facialEmbedding`: objeto com "embedding" e "nonce", único (opcional, por conta da LGPD)
- `classes`: string array, uppercase (obrigatório)

**Resposta (201 Created):**
```json
{
  "success": true,
  "message": "Aluno criado com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Aluno João",
    "registration": "2025001",
    "classes": ["I2P4"],
    "isActive": true,
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

---

### GET /api/students

Listar todos os alunos (contem paginação via query params).
#### Paginação padrão:

| limit | page | filter |
| ---   | ---  | ---    | 
|  10   |   1  |  {}    |

---

**Autenticação:** JWT

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": {
          "page": 1,
          "limit": 10,
          "totalPages": 1,
          "data": [
                {
                  "_id": "507f1f77bcf86cd799439014",
                "name": "Aluno João",
                "registration": "2025001",
                "classes": ["I2P4"],
                "isActive": true
              }
            ] 
      }
}
```

---

### GET /api/students/:id

Obter aluno por ID.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId do aluno

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Aluno João",
    "registration": "2025001",
    "classes": ["I2P4"],
    "isActive": true,
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

---

### GET /api/students/class/:classCode

Listar alunos de uma turma específica.

**Autenticação:** JWT

**Parâmetros:**
- `classCode` - Código da turma (ex: I2P4)

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Aluno João",
      "registration": "2025001",
      "classes": ["I2P4"],
      "isActive": true
    }
  ]
}
```

---

### PATCH /api/students/:id

Atualizar aluno.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId do aluno

**Request Body:**
```json
{
  "name": "Aluno João Silva"
}
```

**Validação:**
- `name`: string, 3-100 caracteres (opcional)
- Outros campos como `registration` e `facialId` não podem ser atualizados

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Aluno atualizado com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Aluno João Silva",
    "registration": "2025001",
    "facialId": "facial_embedding_string_long",
    "classes": ["I2P4"],
    "isActive": true,
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

---

### PATCH /api/students/:id/face

Atualizar identificação facial do aluno.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId do aluno

**Request Body:**
```json
{
  "facialEmbedding": {
    "embedding": "Embedding facial encriptado via AES-256-gcm",
    "nonce": "nonce do facial" 
  }
}
```

**Validação:**
- `facialEmbedding`: objeto, contendo embedding e nonce. (pode ser nulo, devido à LGPD)

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Identificação facial atualizada com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Aluno João",
    "registration": "2025001",
    "classes": ["I2P4"],
    "isActive": true,
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

---

### POST /api/students/:id/classes/:classCode

Adicionar aluno a uma turma.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId do aluno
- `classCode` - Código da turma (ex: I2P4)

**Autorização:**
- Coordenador: pode adicionar qualquer aluno
- Professor: pode adicionar apenas em turmas onde é professor

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Aluno adicionado à turma com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Aluno João",
    "registration": "2025001",
    "classes": ["I2P4", "I2P5"],
    "isActive": true,
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

**Possíveis Erros:**
- `403 Forbidden` - Acesso negado (professor não autorizado)

---

### DELETE /api/students/:id/classes/:classCode

Remover aluno de uma turma.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId do aluno
- `classCode` - Código da turma (ex: I2P4)

**Autorização:**
- Coordenador: pode remover qualquer aluno
- Professor: pode remover apenas em turmas onde é professor

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Aluno removido da turma com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Aluno João",
    "registration": "2025001",
    "classes": ["I2P5"],
    "isActive": true,
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

---

### DELETE /api/students/:id

Deletar aluno.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId do aluno

**Resposta (204 No Content)**

---

## Salas (Rooms)

### POST /api/rooms

Criar nova sala.

**Autenticação:** JWT - Role: `coordenador`

**Request Body:**
```json
{
  "code": "SALA101",
  "name": "Sala 101",
  "location": "Bloco A - 1º Piso",
  "isActive": true
}
```

**Validação:**
- `code`: string, 2-20 caracteres, uppercase (obrigatório)
- `name`: string, 2-100 caracteres (obrigatório)
- `location`: string, 2-100 caracteres (opcional)
- `isActive`: booleano (opcional, padrão: true)

**Resposta (201 Created):**
```json
{
  "success": true,
  "message": "Sala criada com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "code": "SALA101",
    "name": "Sala 101",
    "location": "Bloco A - 1º Piso",
    "isActive": true,
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

---

### GET /api/rooms

Listar todas as salas.

**Autenticação:** JWT

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "code": "SALA101",
      "name": "Sala 101",
      "location": "Bloco A - 1º Piso",
      "isActive": true
    }
  ]
}
```

---

### GET /api/rooms/:id

Obter sala por ID.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId da sala

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "code": "SALA101",
    "name": "Sala 101",
    "location": "Bloco A - 1º Piso",
    "isActive": true,
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

---

### PATCH /api/rooms/:id

Atualizar sala.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId da sala

**Request Body:**
```json
{
  "code": "SALA101",
  "name": "Sala de Informática 101",
  "location": "Bloco A - 1º Piso"
}
```

**Validação:**
- `code`: string, 2-20 caracteres, uppercase (opcional)
- `name`: string, 2-100 caracteres (opcional)
- `location`: string, 2-100 caracteres (opcional)
- `isActive`: booleano (opcional)

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Sala atualizada com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "code": "SALA101",
    "name": "Sala de Informática 101",
    "location": "Bloco A - 1º Piso",
    "isActive": true,
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

---

### PATCH /api/rooms/:id/toggle-status

Ativar/Desativar sala.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId da sala

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Status da sala atualizado com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "code": "SALA101",
    "name": "Sala 101",
    "location": "Bloco A - 1º Piso",
    "isActive": false,
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

---

### DELETE /api/rooms/:id

Deletar sala.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId da sala

**Resposta (204 No Content)**

---

## Totens (Totems)

### POST /api/totems

Criar novo totem.

**Autenticação:** JWT - Role: `coordenador`

**Request Body:**
```json
{
  "name": "Totem Entrada",
  "location": "Bloco A - Entrada",
  "room": "507f1f77bcf86cd799439013",
  "isActive": true
}
```

**Validação:**
- `name`: string, 3-80 caracteres (obrigatório)
- `location`: string, 3-120 caracteres (obrigatório)
- `room`: ObjectId válido (obrigatório)
- `isActive`: booleano (opcional, padrão: true)

**Obs:** O `apiKey` é gerado automaticamente no servidor

**Resposta (201 Created):**
```json
{
  "success": true,
  "message": "Totem criado com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "name": "Totem Entrada",
    "location": "Bloco A - Entrada",
    "room": "507f1f77bcf86cd799439013",
    "isActive": true,
    "apiKey": "totem_xyz123abc456def789",
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

---

### GET /api/totems

Listar todos os totens.

**Autenticação:** JWT - Role: `coordenador`

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "name": "Totem Entrada",
      "location": "Bloco A - Entrada",
      "room": "507f1f77bcf86cd799439013",
      "isActive": true,
      "createdAt": "2025-12-15T10:30:00Z",
      "updatedAt": "2025-12-15T10:30:00Z"
    }
  ]
}
```

---

### GET /api/totems/:id

Obter totem por ID.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId do totem

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "name": "Totem Entrada",
    "location": "Bloco A - Entrada",
    "room": "507f1f77bcf86cd799439013",
    "isActive": true,
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

---

### PATCH /api/totems/:id

Atualizar totem.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId do totem

**Request Body:**
```json
{
  "name": "Totem Entrada Principal",
  "location": "Bloco A - Entrada Principal",
  "room": "507f1f77bcf86cd799439013",
  "isActive": true
}
```

**Validação:**
- `name`: string, 3-80 caracteres (opcional)
- `location`: string, 3-120 caracteres (opcional)
- `room`: ObjectId válido (opcional)
- `isActive`: booleano (opcional)

**Obs:** A sala associada é validada antes de atualização

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Totem atualizado com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "name": "Totem Entrada Principal",
    "location": "Bloco A - Entrada Principal",
    "room": "507f1f77bcf86cd799439013",
    "isActive": true,
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

---

### PATCH /api/totems/:id/toggle-status

Ativar/Desativar totem.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId do totem

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Status do totem atualizado com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "name": "Totem Entrada",
    "location": "Bloco A - Entrada",
    "room": "507f1f77bcf86cd799439013",
    "isActive": false,
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

---

### GET /api/totems/:id/api-key

Obter chave da API do totem.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId do totem

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Chave do totem gerada com sucesso.",
  "data": {
    "apiKey": "totem_xyz123abc456def789"
  }
}
```

---

### POST /api/totems/:id/regenerate-api-key

Regenerar chave da API do totem.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId do totem

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Chave do totem regenerada com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "name": "Totem Entrada",
    "location": "Bloco A - Entrada",
    "room": "507f1f77bcf86cd799439013",
    "isActive": true,
    "apiKey": "totem_new123key456updated789",
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

---

### DELETE /api/totems/:id

Deletar totem.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId do totem

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Totem deletado com sucesso."
}
```

---

## Presença (Attendance)

### POST /api/attendances/facial

Registrar presença via reconhecimento facial (Totem).

**Autenticação:** Header `x-totem-api-key`

**Request Body (FormData):**
- `image`: arquivo de imagem (obrigatório)
- `room`: ObjectId da sala (obrigatório)

**Fluxo:**
1. Se há sessão aberta na sala: cria `Attendance` (presença)
2. Se não há sessão aberta: cria `PreAttendance` (presença temporária)

**Resposta (201 Created - Sessão Aberta):**
```json
{
  "success": true,
  "message": "Presença registrada com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439017",
    "sessionId": "507f1f77bcf86cd799439015",
    "student": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Aluno João",
      "registration": "2025001"
    },
    "status": "presente",
    "checkInTime": "2025-12-15T10:35:00Z",
    "viaFacial": true,
    "method": "facial",
    "type": "attendance",
    "createdAt": "2025-12-15T10:35:00Z"
  }
}
```

**Resposta (200 OK - Sem Sessão Aberta):**
```json
{
  "success": true,
  "message": "A aula ainda não começou. Presença armazenada temporariamente",
  "data": {
    "_id": "507f1f77bcf86cd799439018",
    "student": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Aluno João",
      "registration": "2025001"
    },
    "room": "507f1f77bcf86cd799439013",
    "checkInTime": "2025-12-15T10:20:00Z",
    "viaFacial": true,
    "method": "facial",
    "type": "pre_attendance",
    "createdAt": "2025-12-15T10:20:00Z"
  }
}
```

**Possíveis Erros:**
- `400 Bad Request` - Imagem não foi enviada ou sala não informada
- `404 Not Found` - Rosto não reconhecido ou aluno não cadastrado
- `409 Conflict` - Aluno já registrou presença nesta sessão
- `503 Service Unavailable` - API de reconhecimento facial não respondendo

---

### POST /api/attendances/manual

Registrar presença manualmente (Professor/Coordenador).

**Autenticação:** JWT - Role: `professor` ou `coordenador`

**Request Body:**
```json
{
  "classSessionId": "507f1f77bcf86cd799439015",
  "studentId": "507f1f77bcf86cd799439014",
  "status": "presente"
}
```

**Validação:**
- `classSessionId`: ObjectId válido (obrigatório)
- `studentId`: ObjectId válido (obrigatório)
- `status`: "presente", "atrasado" ou "ausente" (obrigatório)

**Resposta (201 Created):**
```json
{
  "success": true,
  "message": "Presença registrada com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439017",
    "sessionId": "507f1f77bcf86cd799439015",
    "student": "507f1f77bcf86cd799439014",
    "status": "presente",
    "checkInTime": "2025-12-15T10:35:00Z",
    "recordedBy": "507f1f77bcf86cd799439011",
    "viaFacial": false,
    "method": "manual",
    "createdAt": "2025-12-15T10:35:00Z",
    "updatedAt": "2025-12-15T10:35:00Z"
  }
}
```

**Possíveis Erros:**
- `400 Bad Request` - Campos obrigatórios faltando ou status inválido
- `409 Conflict` - Aluno já registrou presença nesta sessão

---

### GET /api/attendances/session/:sessionId

Listar presenças de uma sessão.

**Autenticação:** JWT

**Parâmetros:**
- `sessionId` - ObjectId da sessão

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "sessionId": "507f1f77bcf86cd799439015",
      "student": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Aluno João",
        "registration": "2025001"
      },
      "status": "presente",
      "checkInTime": "2025-12-15T10:35:00Z",
      "method": "facial",
      "viaFacial": true,
      "createdAt": "2025-12-15T10:35:00Z"
    }
  ]
}
```

---

### GET /api/attendances/student/:studentId

Listar presenças de um aluno.

**Autenticação:** JWT

**Parâmetros:**
- `studentId` - ObjectId do aluno

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "sessionId": "507f1f77bcf86cd799439015",
      "student": "507f1f77bcf86cd799439014",
      "status": "presente",
      "checkInTime": "2025-12-15T10:35:00Z",
      "method": "facial",
      "createdAt": "2025-12-15T10:35:00Z"
    }
  ]
}
```

---

### GET /api/attendances/class/:classId

Listar presenças de uma turma.

**Autenticação:** JWT

**Parâmetros:**
- `classId` - ObjectId da turma

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "sessionId": "507f1f77bcf86cd799439015",
      "student": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Aluno João"
      },
      "status": "presente",
      "checkInTime": "2025-12-15T10:35:00Z",
      "method": "facial"
    }
  ]
}
```

---

### GET /api/attendances/session/:sessionId/full-report

Obter relatório completo de uma sessão (presentes + ausentes calculados).

**Autenticação:** JWT

**Parâmetros:**
- `sessionId` - ObjectId da sessão

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": {
    "sessionId": "507f1f77bcf86cd799439015",
    "sessionName": "Aula 1 - Introdução",
    "classCode": "I2P4",
    "presentCount": 25,
    "lateCount": 3,
    "absentCount": 2,
    "attendances": [
      {
        "_id": "507f1f77bcf86cd799439017",
        "studentId": "507f1f77bcf86cd799439014",
        "studentName": "Aluno João",
        "status": "presente",
        "checkInTime": "2025-12-15T10:35:00Z",
        "method": "facial"
      },
      {
        "_id": "507f1f77bcf86cd799439019",
        "studentId": "507f1f77bcf86cd799439020",
        "studentName": "Aluno Maria",
        "status": "atrasado",
        "checkInTime": "2025-12-15T10:42:00Z",
        "method": "facial"
      }
    ],
    "absent": [
      {
        "_id": "507f1f77bcf86cd799439021",
        "studentName": "Aluno Pedro",
        "registration": "2025003"
      }
    ]
  }
}
```

---

### PATCH /api/attendances/:id

Atualizar presença.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId da presença

**Request Body:**
```json
{
  "status": "atrasado",
  "checkInTime": "2025-12-15T10:42:00Z"
}
```

**Validação:**
- `status`: "presente", "atrasado" ou "ausente" (opcional)
- `checkInTime`: data válida (opcional)

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Presença atualizada com sucesso.",
  "data": {
    "_id": "507f1f77bcf86cd799439017",
    "sessionId": "507f1f77bcf86cd799439015",
    "student": "507f1f77bcf86cd799439014",
    "status": "atrasado",
    "checkInTime": "2025-12-15T10:42:00Z",
    "method": "facial",
    "updatedAt": "2025-12-15T11:00:00Z"
  }
}
```

---

### DELETE /api/attendances/:id

Deletar presença.

**Autenticação:** JWT

**Parâmetros:**
- `id` - ObjectId da presença

**Resposta (204 No Content)**

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 204 | No Content - Recurso deletado com sucesso |
| 400 | Bad Request - Dados inválidos ou faltando |
| 401 | Unauthorized - Não autenticado ou token inválido |
| 403 | Forbidden - Acesso negado (autorização falhou) |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito na operação (ex: duplicata) |
| 500 | Internal Server Error - Erro no servidor |
| 503 | Service Unavailable - Serviço indisponível |

---

## Exemplos de Fluxo Completo

### Fluxo de Login e Criação de Turma

1. **Login:**
   ```bash
   POST /api/auth/login
   {
     "email": "coordenador@escola.edu",
     "password": "senha123"
   }
   ```
   Retorna: `token`

2. **Criar Turma:**
   ```bash
   POST /api/classes
   Authorization: <token>
   {
     "code": "I2P4",
     "course": "Informática",
     "shift": "manhã",
     "year": 2025
   }
   ```
   Retorna: Turma criada com `_id`

3. **Adicionar Sala à Turma:**
   ```bash
   POST /api/classes/:classId/rooms/:roomId
   Authorization: <token>
   ```

4. **Adicionar Professor à Turma:**
   ```bash
   POST /api/classes/:classId/teachers/:teacherId
   Authorization: <token>
   ```

### Fluxo de Presença via Facial Recognition

1. **Totem envia foto:**
   ```bash
   POST /api/attendances/facial
   x-totem-api-key: <apiKey>
   Content-Type: multipart/form-data
   
   room: <roomId>
   image: <arquivo>
   ```

2. **Sistema valida e:
   - Se há sessão aberta: registra `Attendance` (201)
   - Se não há sessão: registra `PreAttendance` (200)

3. **Professor pode consultar relatório:**
   ```bash
   GET /api/attendances/session/:sessionId/full-report
   Authorization: <token>
   ```

---

## Requisições de Acesso (Access Requests)

### POST /api/access-requests

Criar nova requisição de acesso ao sistema.

**Autenticação:** Nenhuma

**Request Body:**
```json
{
  "name": "José Edson",
  "cpf": "111.222.333-44",
  "email": "edson@gmail.com",
  "password": "edson123",
  "role": "coordenador"
}
```

**Validação:**
- `name`: string, 3-100 caracteres (obrigatório)
- `cpf`: string, formato válido de CPF com ou sem pontuação (obrigatório, único)
- `email`: email válido (obrigatório, único)
- `password`: string, 6-50 caracteres (obrigatório)
- `role`: "professor" ou "coordenador" (obrigatório)

**Resposta (201 Created):**
```json
{
  "success": true,
  "status": 201,
  "message": "Requisição de acesso criada com sucesso.",
  "data": {
    "_id": "696954181aa61dd5e8c26f4b",
    "name": "José Edson",
    "cpf": "111.222.333-44",
    "email": "edson@gmail.com",
    "role": "coordenador",
    "status": "pending",
    "createdAt": "2026-01-15T20:54:48.680Z",
    "updatedAt": "2026-01-15T20:54:48.680Z"
  }
}
```

**Possíveis Erros:**
- `400 Bad Request` - Dados inválidos ou campos faltando
- `409 Conflict` - CPF ou email já cadastrado

---

### GET /api/access-requests

Listar todas as requisições de acesso.

**Autenticação:** JWT - Role: `coordenador`

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": [
    {
      "_id": "696954181aa61dd5e8c26f4b",
      "name": "José Edson",
      "cpf": "111.222.333-44",
      "email": "edson@gmail.com",
      "role": "coordenador",
      "status": "pending",
      "createdAt": "2026-01-15T20:54:48.680Z",
      "updatedAt": "2026-01-15T20:54:48.680Z"
    },
    {
      "_id": "696954281aa61dd5e8c26f4c",
      "name": "Maria Silva",
      "cpf": "222.333.444-55",
      "email": "maria@gmail.com",
      "role": "professor",
      "status": "approved",
      "createdAt": "2026-01-15T21:00:00.000Z",
      "updatedAt": "2026-01-15T21:05:00.000Z"
    }
  ]
}
```

---

### GET /api/access-requests/:id

Obter requisição de acesso por ID.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId da requisição

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": {
    "_id": "696954181aa61dd5e8c26f4b",
    "name": "José Edson",
    "cpf": "111.222.333-44",
    "email": "edson@gmail.com",
    "role": "coordenador",
    "status": "pending",
    "createdAt": "2026-01-15T20:54:48.680Z",
    "updatedAt": "2026-01-15T20:54:48.680Z"
  }
}
```

**Possíveis Erros:**
- `404 Not Found` - Requisição não encontrada

---

### GET /api/access-requests/cpf/:cpf

Buscar requisição de acesso por CPF.

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `cpf` - CPF do solicitante (pode conter ou não pontuação)

**Exemplos de URLs válidas:**
- `/api/access-requests/cpf/111.222.333-44`
- `/api/access-requests/cpf/11122233344`

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "",
  "data": {
    "_id": "696954181aa61dd5e8c26f4b",
    "name": "José Edson",
    "cpf": "111.222.333-44",
    "email": "edson@gmail.com",
    "role": "coordenador",
    "status": "pending",
    "createdAt": "2026-01-15T20:54:48.680Z",
    "updatedAt": "2026-01-15T20:54:48.680Z"
  }
}
```

**Possíveis Erros:**
- `404 Not Found` - Requisição não encontrada para o CPF informado

---

### PATCH /api/access-requests/:id/status

Atualizar status de uma requisição de acesso (aprovar ou rejeitar).

**Autenticação:** JWT - Role: `coordenador`

**Parâmetros:**
- `id` - ObjectId da requisição

**Request Body:**
```json
{
  "status": "approved"
}
```

**Validação:**
- `status`: "approved" ou "rejected" (obrigatório)

**Comportamento:**
- **Se aprovado (`approved`)**: Cria automaticamente um usuário no sistema com os dados da requisição e marca a requisição como aprovada
- **Se rejeitado (`rejected`)**: Apenas atualiza o status da requisição para rejeitado

**Resposta (200 OK - Aprovado):**
```json
{
  "success": true,
  "message": "Requisição aprovada e usuário criado com sucesso.",
  "data": {
    "_id": "696954181aa61dd5e8c26f4b",
    "name": "José Edson",
    "cpf": "111.222.333-44",
    "email": "edson@gmail.com",
    "role": "coordenador",
    "status": "approved",
    "createdAt": "2026-01-15T20:54:48.680Z",
    "updatedAt": "2026-01-15T21:10:00.000Z"
  }
}
```

**Resposta (200 OK - Rejeitado):**
```json
{
  "success": true,
  "message": "Requisição rejeitada.",
  "data": {
    "_id": "696954181aa61dd5e8c26f4b",
    "name": "José Edson",
    "cpf": "111.222.333-44",
    "email": "edson@gmail.com",
    "role": "coordenador",
    "status": "rejected",
    "createdAt": "2026-01-15T20:54:48.680Z",
    "updatedAt": "2026-01-15T21:10:00.000Z"
  }
}
```

**Possíveis Erros:**
- `400 Bad Request` - Status inválido ou requisição já foi processada
- `404 Not Found` - Requisição não encontrada
- `409 Conflict` - Usuário com esse email ou CPF já existe (ao aprovar)

---

## Status de Requisições

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando aprovação do coordenador (padrão) |
| `approved` | Requisição aprovada e usuário criado |
| `rejected` | Requisição rejeitada pelo coordenador |

---

## Fluxo de Requisição de Acesso

### 1. Usuário Solicita Acesso
```bash
POST /api/access-requests
{
  "name": "José Edson",
  "cpf": "111.222.333-44",
  "email": "edson@gmail.com",
  "password": "edson123",
  "role": "professor"
}
```

### 2. Coordenador Lista Requisições Pendentes
```bash
GET /api/access-requests
Authorization: Bearer <token>
```

### 3. Coordenador Aprova ou Rejeita
```bash
PATCH /api/access-requests/:id/status
Authorization: Bearer <token>
{
  "status": "approved"
}
```

### 4. (Se aprovado) Usuário Pode Fazer Login
```bash
POST /api/auth/login
{
  "email": "edson@gmail.com",
  "password": "edson123"
}
```

---

## Notas Importantes

- ✅ A rota de criar requisição **não requer autenticação** (acesso público)
- ✅ Todas as outras rotas **exigem JWT com role `coordenador`**
- ✅ O CPF deve ser único no sistema (validado)
- ✅ O email deve ser único no sistema (validado)
- ✅ Ao aprovar, o sistema cria automaticamente um usuário com os dados da requisição
- ✅ A senha é armazenada com hash para segurança
- ✅ Uma requisição só pode ser aprovada/rejeitada uma vez (status é imutável após mudança)

## Dicas de Segurança

- ✅ Sempre envie o token JWT no header de Autorização
- ✅ Use HTTPS em produção
- ✅ Altere as senhas padrão
- ✅ Guarde a `apiKey` do totem com segurança
- ✅ Regenere a chave do totem se for comprometida
---

## Notas Gerais

- ObjectId: Identificador único no MongoDB, formato hexadecimal de 24 caracteres
- Timestamps: Incluídos em todos os documentos (`createdAt`, `updatedAt`)
- Soft Delete: Alguns recursos usam `isActive` ao invés de deletar
- Sorting: Não implementado ainda (em desenvolvimento)

---

**Última atualização:** 15 de Dezembro de 2025  
**Versão da API:** 1.0
