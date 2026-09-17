from typing import List, Optional
from pydantic import Field
try:
    from schemas.common import BaseSchema
    from schemas.timeline import TimelineItemResponse
except ImportError:
    from backend.schemas.common import BaseSchema
    from backend.schemas.timeline import TimelineItemResponse


class VesselResponse(BaseSchema):
    id: str
    name: str
    mmsi: int
    latitude: float
    longitude: float
    speed: float
    heading: float
    risk: str  # "Safe" | "Medium" | "High"
    destination: str
    vessel_type: Optional[str] = Field(default=None, alias="vesselType")
    flag: Optional[str] = None
    anomaly_type: Optional[str] = Field(default=None, alias="anomalyType")
    spoofing_confidence: Optional[float] = Field(default=0.0, alias="spoofingConfidence")
    dwt: Optional[str] = None
    last_contact: Optional[str] = Field(default="Just now", alias="lastContact")
    imo: Optional[int] = None
    callsign: Optional[str] = None
    dimensions: Optional[str] = None
    eta: Optional[str] = None
    nav_status: Optional[str] = Field(default="Underway using engine", alias="navStatus")
    photo_url: Optional[str] = Field(default=None, alias="photoUrl")
    ai_summary: Optional[str] = Field(default=None, alias="aiSummary")
    timeline: Optional[List[TimelineItemResponse]] = None


class VesselListResponse(BaseSchema):
    total: int
    filtered: int
    vessels: List[VesselResponse]
