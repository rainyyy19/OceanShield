from dataclasses import dataclass
from enum import Enum
from typing import Tuple


class AnomalySeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


@dataclass
class ThreatAlertModel:
    id: str
    vessel_id: str
    vessel_name: str
    mmsi: int
    anomaly_type: str
    severity: AnomalySeverity
    region: str
    timestamp: str
    confidence: float
    description: str
    coordinates: Tuple[float, float]  # (longitude, latitude)
