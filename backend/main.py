import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Add backend directory to sys.path so top-level imports work seamlessly
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

try:
    from config import CORS_ORIGINS
    from api.api import api_router
    from services.ais_service import ais_service
except ImportError:
    from backend.config import CORS_ORIGINS
    from backend.api.api import api_router
    from backend.services.ais_service import ais_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    count = ais_service.reload()
    print(f"[OceanShield AI Backend] Startup: Ingested {count} vessels from {ais_service.last_loaded_source}")
    yield
    print("[OceanShield AI Backend] Shutting down...")


app = FastAPI(
    title="OceanShield AI - Maritime Threat Intelligence API",
    description=(
        "Production-grade FastAPI backend for OceanShield AI.\n\n"
        "Detects maritime GNSS/AIS electronic warfare attacks, kinematic coordinate discontinuities "
        "(teleportation jumps), circular multi-path spoofing drift, dark fleet transponder blanking, "
        "and multi-GNSS ephemeris parity drops across critical maritime chokepoints."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router under /api prefix
app.include_router(api_router, prefix="/api")


@app.get("/", include_in_schema=False)
def root_redirect():
    return RedirectResponse(url="/docs")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
