from fastapi import APIRouter, HTTPException
from app.schemas.spoofing import SpoofingConfidenceResponse, FleetConfidenceSummary
from app.services.spoofing_service import spoofing_service

router = APIRouter(prefix="/spoofing", tags=["Spoofing Analysis"])


@router.get("/confidence", response_model=FleetConfidenceSummary, summary="Get fleet-wide spoofing confidence analysis")
def get_fleet_confidence():
    return spoofing_service.get_fleet_confidence_summary()


@router.get("/confidence/{vessel_id}", response_model=SpoofingConfidenceResponse, summary="Get granular spoofing confidence breakdown for a vessel")
def get_vessel_confidence(vessel_id: str):
    res = spoofing_service.get_vessel_spoofing_confidence(vessel_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Vessel with ID/MMSI '{vessel_id}' not found.")
    return res
