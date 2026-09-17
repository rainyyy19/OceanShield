from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ais_service import ais_service

router = APIRouter(prefix="/ais", tags=["AIS CSV Telemetry"])


@router.post("/upload", summary="Upload and ingest a custom AIS CSV file")
async def upload_ais_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are supported.")
    
    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode("utf-8", errors="replace")
        count = ais_service.load_from_csv_content(content_str, source_name=file.filename)
        return {
            "status": "success",
            "message": f"Successfully ingested {count} AIS vessel records from '{file.filename}'.",
            "records_ingested": count,
            "filename": file.filename,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AIS CSV: {str(e)}")


@router.post("/reload", summary="Reload baseline AIS CSV dataset")
def reload_ais_csv():
    count = ais_service.reload()
    return {
        "status": "success",
        "message": f"Reloaded baseline AIS dataset with {count} vessel records.",
        "records_ingested": count,
        "source": ais_service.last_loaded_source,
    }


@router.get("/status", summary="Get current AIS telemetry ingestion status")
def get_ais_status():
    vessels = ais_service.get_all_vessels()
    return {
        "status": "active",
        "last_source": ais_service.last_loaded_source,
        "total_records_ingested": ais_service.total_records_ingested,
        "vessels_tracked": len(vessels),
    }
