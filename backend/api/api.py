from fastapi import APIRouter

try:
    from routers.vessels import router as vessels_router
    from routers.anomalies import router as anomalies_router
    from routers.spoofing import router as spoofing_router
    from routers.investigations import router as investigations_router
    from routers.heatmap import router as heatmap_router
    from routers.ais import router as ais_router
    from routers.stats import router as stats_router
except ImportError:
    from backend.routers.vessels import router as vessels_router
    from backend.routers.anomalies import router as anomalies_router
    from backend.routers.spoofing import router as spoofing_router
    from backend.routers.investigations import router as investigations_router
    from backend.routers.heatmap import router as heatmap_router
    from backend.routers.ais import router as ais_router
    from backend.routers.stats import router as stats_router

api_router = APIRouter()

api_router.include_router(vessels_router)
api_router.include_router(anomalies_router)
api_router.include_router(spoofing_router)
api_router.include_router(investigations_router)
api_router.include_router(heatmap_router)
api_router.include_router(ais_router)
api_router.include_router(stats_router)
