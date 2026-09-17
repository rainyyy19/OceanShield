from app.routers.vessels import router as vessels_router
from app.routers.anomalies import router as anomalies_router
from app.routers.spoofing import router as spoofing_router
from app.routers.investigations import router as investigations_router
from app.routers.heatmap import router as heatmap_router
from app.routers.ais import router as ais_router
from app.routers.stats import router as stats_router

__all__ = [
    "vessels_router",
    "anomalies_router",
    "spoofing_router",
    "investigations_router",
    "heatmap_router",
    "ais_router",
    "stats_router",
]
