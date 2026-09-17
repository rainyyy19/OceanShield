from dataclasses import dataclass
from enum import Enum


class TimelineSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    INFO = "INFO"


@dataclass
class TimelineItemModel:
    id: str
    time: str
    title: str
    description: str
    severity: TimelineSeverity
    source: str
    vessel_id: str = ""
    vessel_name: str = ""
