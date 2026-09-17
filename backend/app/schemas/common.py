from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class BaseSchema(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class HealthResponse(BaseSchema):
    status: str
    version: str
    ais_records_loaded: int
    vessels_tracked: int
    active_threats: int


class FleetOverviewStats(BaseSchema):
    total_ships_count: int
    active_threats_count: int
    fleet_risk_score: float
    incidents_today_count: int
    high_risk_count: int
    medium_risk_count: int
    safe_count: int
    timestamp: str


class PaginatedResponse(BaseSchema, Generic[T]):
    items: List[T]
    total: int
    limit: int
    offset: int
