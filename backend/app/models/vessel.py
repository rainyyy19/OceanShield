from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional
from app.models.timeline import TimelineItemModel


class RiskLevel(str, Enum):
    SAFE = "Safe"
    MEDIUM = "Medium"
    HIGH = "High"


@dataclass
class VesselModel:
    id: str
    name: str
    mmsi: int
    latitude: float
    longitude: float
    speed: float
    heading: float
    risk: RiskLevel
    destination: str
    vessel_type: Optional[str] = None
    flag: Optional[str] = None
    anomaly_type: Optional[str] = None
    spoofing_confidence: float = 0.0
    dwt: Optional[str] = None
    last_contact: Optional[str] = "Just now"
    imo: Optional[int] = None
    callsign: Optional[str] = None
    dimensions: Optional[str] = None
    eta: Optional[str] = None
    nav_status: Optional[str] = "Underway using engine"
    photo_url: Optional[str] = None
    ai_summary: Optional[str] = None
    timeline: List[TimelineItemModel] = field(default_factory=list)
    carrier_c_n0_db: Optional[float] = None
    gps_altitude_m: Optional[float] = None
