from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.vessel import VesselModel
from app.schemas.vessel import VesselResponse, VesselListResponse
from app.schemas.timeline import TimelineItemResponse
from app.services.ais_service import ais_service

router = APIRouter(prefix="/vessels", tags=["Vessels"])


def _model_to_response(v: VesselModel) -> VesselResponse:
    timeline_responses = [
        TimelineItemResponse(
            id=t.id,
            time=t.time,
            title=t.title,
            description=t.description,
            severity=t.severity.value,
            source=t.source,
            vessel_id=v.id,
            vessel_name=v.name,
        )
        for t in v.timeline
    ]
    return VesselResponse(
        id=v.id,
        name=v.name,
        mmsi=v.mmsi,
        latitude=v.latitude,
        longitude=v.longitude,
        speed=v.speed,
        heading=v.heading,
        risk=v.risk.value,
        destination=v.destination,
        vessel_type=v.vessel_type,
        flag=v.flag,
        anomaly_type=v.anomaly_type,
        spoofing_confidence=v.spoofing_confidence,
        dwt=v.dwt,
        last_contact=v.last_contact,
        imo=v.imo,
        callsign=v.callsign,
        dimensions=v.dimensions,
        eta=v.eta,
        nav_status=v.nav_status,
        photo_url=v.photo_url,
        ai_summary=v.ai_summary,
        timeline=timeline_responses,
    )


@router.get("", response_model=VesselListResponse, summary="List vessels with optional filters")
def list_vessels(
    risk: Optional[str] = Query(None, description="Filter by risk level: Safe, Medium, High, or All"),
    search: Optional[str] = Query(None, description="Search by vessel name, MMSI, callsign, or destination"),
    has_anomaly: Optional[bool] = Query(None, description="Filter vessels with or without active anomalies"),
    vessel_type: Optional[str] = Query(None, description="Filter by vessel category (e.g. Tanker, Container)"),
    limit: int = Query(100, ge=1, le=500, description="Max vessels to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
):
    total = len(ais_service.get_all_vessels())
    filtered_models = ais_service.filter_vessels(
        risk=risk,
        search=search,
        has_anomaly=has_anomaly,
        vessel_type=vessel_type,
        limit=limit,
        offset=offset,
    )
    vessel_responses = [_model_to_response(v) for v in filtered_models]
    return VesselListResponse(
        total=total,
        filtered=len(vessel_responses),
        vessels=vessel_responses,
    )


@router.get("/{vessel_id}", response_model=VesselResponse, summary="Get single vessel by ID or MMSI")
def get_vessel(vessel_id: str):
    v = ais_service.get_vessel_by_id_or_mmsi(vessel_id)
    if not v:
        raise HTTPException(status_code=404, detail=f"Vessel with ID/MMSI '{vessel_id}' not found.")
    return _model_to_response(v)
