from typing import List
from fastapi import APIRouter
from app.schemas.heatmap import HeatmapResponse, HeatmapRegionResponse, HeatmapPointResponse
from app.services.heatmap_service import heatmap_service

router = APIRouter(prefix="/heatmap", tags=["Heatmap & Chokepoints"])


@router.get("/regions", response_model=HeatmapResponse, summary="Get maritime chokepoints and risk heatmap regions")
def get_heatmap_regions():
    return heatmap_service.get_heatmap_regions()


@router.get("/points", response_model=List[HeatmapPointResponse], summary="Get weighted coordinate points for map heatmap layer")
def get_heatmap_points():
    heatmap_data = heatmap_service.get_heatmap_regions()
    return heatmap_data.points
