import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import settings
from app.services.sync_service import sync_students
from app.state import STUDENTS
from app.routes.routes import router as api_router

app = FastAPI(
    title="Presença Facial SENAI - Facial API"
)

# =========================================================
# 🔐 CORS Configuration
# =========================================================

production = settings.PRODUCTION

if production:
    # Produção: apenas origens específicas
    allowed_origins = [
        "https://presenca-facial-senai.com",
        "https://www.presenca-facial-senai.com"
    ]
else:
    # Desenvolvimento: localhost e outras origens de teste
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5173",
        "http://localhost:8080",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "x-facial-api-key",
        "Accept",
        "Origin",
        "User-Agent"
    ],
    expose_headers=["*"],
    max_age=3600  # Cache preflight por 1 hora
)

# =========================================================
# 📌 ROTAS
# =========================================================
app.include_router(api_router)


# =========================================================
# 🔄 SYNC LOOP (cache de alunos)
# =========================================================
SYNC_INTERVAL_SECONDS = settings.SYNC_INTERVAL_SECONDS


@app.on_event("startup")
async def startup():
    asyncio.create_task(sync_loop())


async def sync_loop():
    while True:
        try:
            await sync_students()
            print("[SYNC] Students synchronized successfully")
            print(f"[SYNC] Next sync in {SYNC_INTERVAL_SECONDS} seconds")
            print(f"[SYNC] Total students cached: {len(STUDENTS)}")
        except Exception as e:
            print(f"[SYNC ERROR] {e}")

        await asyncio.sleep(SYNC_INTERVAL_SECONDS)


# =========================================================
# ❤️ HEALTHCHECK
# =========================================================
@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
