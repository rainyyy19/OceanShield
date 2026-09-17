from typing import List, Tuple
from pydantic import Field
try:
    from schemas.common import BaseSchema
except ImportError:
    from backend.schemas.common import BaseSchema


class ThreatAlertResponse(BaseSchema):
    id: str
    vessel_id: str = Field(alias="vesselId")
    vessel_name: str = Field(alias="vesselName")
    mmsi: int
    type: str
    severity: str  # "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    region: str
    timestamp: str
    confidence: float
    description: str
    coordinates: Tuple[float, float]  # [longitude, latitude]


class AnomalyListResponse(BaseSchema):
    total: int
    critical_count: int = Field(alias="criticalCount")
    high_count: int = Field(alias="highCount")
    medium_count: int = Field(alias="mediumCount")
    low_count: int = Field(alias="lowCount")
    anomalies: List[ThreatAlertResponse]
