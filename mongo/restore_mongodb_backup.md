# 🔄 Restore do MongoDB a partir de um backup .gz

Este guia explica como restaurar o banco de dados MongoDB usando um arquivo de backup gerado com `mongodump --archive --gzip`.

---

## 📌 Pré-requisitos

- Docker em execução
- Container do Mongo ativo: `presenca_mongodb`
- Arquivo de backup localizado em: `backups/<nome do backup.gz>`

---

# 1️⃣ Copiar o backup para dentro do container

Execute o comando abaixo no terminal:

```bash
docker cp backups/<nome do backup.gz> presenca_mongodb:/backup.gz
```

Isso copia o arquivo para dentro do container MongoDB.

---

# 2️⃣ Restaurar o backup em um banco de teste

Execute:

```bash
docker exec presenca_mongodb mongorestore --gzip --archive=/backup.gz -u admin -p <SENHA DO BANCO DE DADOS> --authenticationDatabase admin --nsFrom="presenca_facial_senai.*" --nsTo="presenca_facial_senai_test.*"
```

### O que este comando faz:

- `--gzip` → informa que o arquivo está compactado
- `--archive=/backup.gz` → indica o caminho do backup dentro do container
- `-u admin -p senha` → autenticação no MongoDB
- `--authenticationDatabase admin` → banco onde o usuário foi criado
- `--nsFrom` → banco original presente no backup
- `--nsTo` → banco de destino (teste, para não sobrescrever produção)

O banco `presenca_facial_senai_test` será criado automaticamente.

---

# 3️⃣ Acessar o MongoDB para validar

```bash
docker exec -it presenca_mongodb mongosh -u admin -p <SENHA DO BANCO DE DADOS> --authenticationDatabase admin
```

Dentro do Mongo, execute:

```javascript
show dbs
use presenca_facial_senai_test
show collections
```

Você pode validar com:

```javascript
db.students.countDocuments()
```

Se retornar um número maior que 0, o restore foi realizado com sucesso.

---

# ✅ Resultado Esperado

- Banco restaurado em ambiente de teste
- Nenhum impacto no banco de produção
- Backup validado com sucesso

---

# 🚀 Observação

Para restaurar sobrescrevendo o banco original, utilize a flag `--drop` (apaga a coleção antes de restaurar).

Exemplo:

```bash
mongorestore --drop ...
```

Use com cuidado em ambiente de produção.

