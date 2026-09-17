from typing import Optional
from fastapi import APIRouter, HTTPException, Query

try:
    from schemas.anomaly import ThreatAlertResponse, AnomalyListResponse
    from services.anomaly_service import anomaly_service
except ImportError:
    from backend.schemas.anomaly import ThreatAlertResponse, AnomalyListResponse
    from backend.services.anomaly_service import anomaly_service

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])


@router.get("", response_model=AnomalyListResponse, summary="List active anomalies and threat alerts")
def list_anomalies(
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, HIGH, MEDIUM, LOW, or ALL"),
    region: Optional[str] = Query(None, description="Filter by geographical region"),
    min_confidence: Optional[float] = Query(None, ge=0.0, le=100.0, description="Minimum confidence threshold"),
):
    alerts = anomaly_service.get_all_anomalies(
        severity=severity,
        region=region,
        min_confidence=min_confidence,
    )

    alert_responses = [
        ThreatAlertResponse(
            id=a.id,
            vessel_id=a.vessel_id,
            vessel_name=a.vessel_name,
            mmsi=a.mmsi,
            type=a.anomaly_type,
            severity=a.severity.value,
            region=a.region,
            timestamp=a.timestamp,
            confidence=a.confidence,
            description=a.description,
            coordinates=a.coordinates,
        )
        for a in alerts
    ]

    crit = sum(1 for a in alert_responses if a.severity == "CRITICAL")
    high = sum(1 for a in alert_responses if a.severity == "HIGH")
    med = sum(1 for a in alert_responses if a.severity == "MEDIUM")
    low = sum(1 for a in alert_responses if a.severity == "LOW")

    return AnomalyListResponse(
        total=len(alert_responses),
        critical_count=crit,
        high_count=high,
        medium_count=med,
        low_count=low,
        anomalies=alert_responses,
    )


@router.get("/{anomaly_id}", response_model=ThreatAlertResponse, summary="Get threat alert detail by ID")
def get_anomaly(anomaly_id: str):
    alert = anomaly_service.get_anomaly_by_id(anomaly_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Anomaly alert '{anomaly_id}' not found.")
    return ThreatAlertResponse(
        id=alert.id,
        vessel_id=alert.vessel_id,
        vessel_name=alert.vessel_name,
        mmsi=alert.mmsi,
        type=alert.anomaly_type,
        severity=alert.severity.value,
        region=alert.region,
        timestamp=alert.timestamp,
        confidence=alert.confidence,
        description=alert.description,
        coordinates=alert.coordinates,
    )
