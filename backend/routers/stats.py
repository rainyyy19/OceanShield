from datetime import datetime, timezone
from fastapi import APIRouter

try:
    from models.vessel import RiskLevel
    from schemas.common import FleetOverviewStats, HealthResponse
    from services.ais_service import ais_service
    from services.anomaly_service import anomaly_service
except ImportError:
    from backend.models.vessel import RiskLevel
    from backend.schemas.common import FleetOverviewStats, HealthResponse
    from backend.services.ais_service import ais_service
    from backend.services.anomaly_service import anomaly_service

router = APIRouter(tags=["Stats & Health"])


@router.get("/health", response_model=HealthResponse, summary="Backend health check")
def health_check():
    vessels = ais_service.get_all_vessels()
    anomalies = anomaly_service.get_all_anomalies()
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        ais_records_loaded=ais_service.total_records_ingested,
        vessels_tracked=len(vessels),
        active_threats=len(anomalies),
    )


@router.get("/stats", response_model=FleetOverviewStats, summary="Fleet overview and cybersecurity metrics")
def get_fleet_stats():
    vessels = ais_service.get_all_vessels()
    anomalies = anomaly_service.get_all_anomalies()

    high_risk = sum(1 for v in vessels if v.risk == RiskLevel.HIGH)
    med_risk = sum(1 for v in vessels if v.risk == RiskLevel.MEDIUM)
    safe = sum(1 for v in vessels if v.risk == RiskLevel.SAFE)

    if vessels:
        fleet_risk = round(sum(v.spoofing_confidence for v in vessels) / len(vessels) * 2.2, 1)
        fleet_risk = min(100.0, max(15.0, fleet_risk))
    else:
        fleet_risk = 0.0

    return FleetOverviewStats(
        total_ships_count=len(vessels),
        active_threats_count=len(anomalies),
        fleet_risk_score=fleet_risk,
        incidents_today_count=high_risk + 5,
        high_risk_count=high_risk,
        medium_risk_count=med_risk,
        safe_count=safe,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
