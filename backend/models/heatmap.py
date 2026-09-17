from dataclasses import dataclass
from typing import Tuple, Optional


@dataclass
class HeatmapPointModel:
    latitude: float
    longitude: float
    intensity: float  # 0.0 to 1.0
    vessel_id: Optional[str] = None
    risk: str = "Safe"
    threat_type: Optional[str] = None


@dataclass
class HeatmapRegionModel:
    id: str
    name: str
    risk_level: str  # "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    risk_score: float  # 0 - 100
    vessel_count: int
    threat_count: int
    center: Tuple[float, float]  # (latitude, longitude)
    bounds: Tuple[float, float, float, float]  # (min_lat, min_lng, max_lat, max_lng)
    primary_threat: str
    description: str
