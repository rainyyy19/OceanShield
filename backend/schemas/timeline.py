from typing import List, Optional
from pydantic import Field
try:
    from schemas.common import BaseSchema
except ImportError:
    from backend.schemas.common import BaseSchema


class TimelineItemResponse(BaseSchema):
    id: str
    time: str
    title: str
    description: str
    severity: str  # "CRITICAL" | "HIGH" | "MEDIUM" | "INFO"
    source: str
    vessel_id: Optional[str] = Field(default=None, alias="vesselId")
    vessel_name: Optional[str] = Field(default=None, alias="vesselName")


class InvestigationTimelineResponse(BaseSchema):
    vessel_id: Optional[str] = Field(default=None, alias="vesselId")
    vessel_name: Optional[str] = Field(default=None, alias="vesselName")
    total_events: int = Field(alias="totalEvents")
    timeline: List[TimelineItemResponse]
