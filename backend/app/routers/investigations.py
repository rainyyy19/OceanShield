from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.timeline import TimelineItemResponse, InvestigationTimelineResponse
from app.services.timeline_service import timeline_service

router = APIRouter(prefix="/investigations", tags=["Investigations"])


@router.get("/timeline", response_model=List[TimelineItemResponse], summary="Get aggregated investigation timeline events across fleet")
def get_fleet_timeline(
    severity: Optional[str] = Query(None, description="Filter by event severity: CRITICAL, HIGH, MEDIUM, INFO, or ALL"),
    only_anomalies: bool = Query(False, description="Include only events from anomalous vessels"),
    limit: int = Query(50, ge=1, le=200, description="Max timeline events to return"),
):
    return timeline_service.get_fleet_investigation_timeline(
        severity=severity,
        only_anomalies=only_anomalies,
        limit=limit,
    )


@router.get("/timeline/{vessel_id}", response_model=InvestigationTimelineResponse, summary="Get forensic investigation timeline for a specific vessel")
def get_vessel_timeline(vessel_id: str):
    res = timeline_service.get_vessel_timeline(vessel_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Timeline for vessel '{vessel_id}' not found.")
    return res
