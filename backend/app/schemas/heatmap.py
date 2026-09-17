from typing import List, Optional, Tuple
from pydantic import Field
from app.schemas.common import BaseSchema


class HeatmapRegionResponse(BaseSchema):
    id: str
    name: str
    risk_level: str = Field(alias="riskLevel")
    risk_score: float = Field(alias="riskScore")
    vessel_count: int = Field(alias="vesselCount")
    threat_count: int = Field(alias="threatCount")
    center: Tuple[float, float]
    bounds: Tuple[float, float, float, float]  # (min_lat, min_lng, max_lat, max_lng)
    primary_threat: str = Field(alias="primaryThreat")
    description: str


class HeatmapPointResponse(BaseSchema):
    lat: float
    lng: float
    intensity: float
    vessel_id: Optional[str] = Field(default=None, alias="vesselId")
    risk: str = "Safe"
    threat_type: Optional[str] = Field(default=None, alias="threatType")


class HeatmapResponse(BaseSchema):
    total_regions: int = Field(alias="totalRegions")
    regions: List[HeatmapRegionResponse]
    points: List[HeatmapPointResponse]
