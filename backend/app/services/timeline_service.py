from typing import List, Optional
from app.models.timeline import TimelineSeverity
from app.models.vessel import RiskLevel
from app.schemas.timeline import TimelineItemResponse, InvestigationTimelineResponse
from app.services.ais_service import AisService, ais_service


class TimelineService:
    """Service to assemble forensic investigation timelines."""

    def __init__(self, ais_svc: AisService = ais_service):
        self.ais_svc = ais_svc

    def get_vessel_timeline(self, identifier: str) -> Optional[InvestigationTimelineResponse]:
        """Returns the chronological forensic event sequence for a specific vessel."""
        vessel = self.ais_svc.get_vessel_by_id_or_mmsi(identifier)
        if not vessel:
            return None

        items: List[TimelineItemResponse] = []
        for t in vessel.timeline:
            items.append(
                TimelineItemResponse(
                    id=t.id,
                    time=t.time,
                    title=t.title,
                    description=t.description,
                    severity=t.severity.value,
                    source=t.source,
                    vessel_id=vessel.id,
                    vessel_name=vessel.name,
                )
            )

        return InvestigationTimelineResponse(
            vessel_id=vessel.id,
            vessel_name=vessel.name,
            total_events=len(items),
            timeline=items,
        )

    def get_fleet_investigation_timeline(
        self,
        severity: Optional[str] = None,
        only_anomalies: bool = False,
        limit: int = 50,
    ) -> List[TimelineItemResponse]:
        """Returns aggregated forensic timeline events across all vessels."""
        vessels = self.ais_svc.get_all_vessels()
        all_events: List[TimelineItemResponse] = []

        for v in vessels:
            if only_anomalies and v.risk == RiskLevel.SAFE:
                continue

            for t in v.timeline:
                all_events.append(
                    TimelineItemResponse(
                        id=f"{v.id}-{t.id}",
                        time=t.time,
                        title=f"{v.name}: {t.title}",
                        description=t.description,
                        severity=t.severity.value,
                        source=t.source,
                        vessel_id=v.id,
                        vessel_name=v.name,
                    )
                )

        if severity and severity.upper() != "ALL":
            all_events = [e for e in all_events if e.severity.upper() == severity.upper()]

        # Sort with CRITICAL first, then HIGH, MEDIUM, INFO
        severity_rank = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "INFO": 3}
        all_events.sort(key=lambda e: severity_rank.get(e.severity.upper(), 4))

        return all_events[:limit]


timeline_service = TimelineService()
