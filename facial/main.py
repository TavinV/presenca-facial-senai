import asyncio
from fastapi import FastAPI

from app.core.settings import settings
from app.services.sync_service import sync_students
from app.state import STUDENTS
from app.routes.routes import router as api_router

app = FastAPI(
    title="Presença Facial SENAI - Facial API"
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
