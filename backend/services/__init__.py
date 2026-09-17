try:
    from services.ais_service import AisService, ais_service
    from services.anomaly_service import AnomalyService, anomaly_service
    from services.spoofing_service import SpoofingService, spoofing_service
    from services.timeline_service import TimelineService, timeline_service
    from services.heatmap_service import HeatmapService, heatmap_service
except ImportError:
    from backend.services.ais_service import AisService, ais_service
    from backend.services.anomaly_service import AnomalyService, anomaly_service
    from backend.services.spoofing_service import SpoofingService, spoofing_service
    from backend.services.timeline_service import TimelineService, timeline_service
    from backend.services.heatmap_service import HeatmapService, heatmap_service

__all__ = [
    "AisService",
    "ais_service",
    "AnomalyService",
    "anomaly_service",
    "SpoofingService",
    "spoofing_service",
    "TimelineService",
    "timeline_service",
    "HeatmapService",
    "heatmap_service",
]
