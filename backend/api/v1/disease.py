from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from typing import Optional, List
from schemas.disease import DiseaseScanResponse, DiseaseHistoryResponse
from services.disease_service import scan_crop_image, get_field_disease_history

router = APIRouter(tags=["Disease Diagnosis"])

@router.post("/disease/scan", response_model=DiseaseScanResponse)
async def scan_disease(
    file: UploadFile = File(...),
    crop_type: Optional[str] = Form(None),
    field_id: Optional[str] = Form(None),
    language: Optional[str] = Form("en")
) -> DiseaseScanResponse:
    """
    Diagnose crop leaf diseases using Vision Transformer (ViT) with image quality gating.
    Returns disease classification, confidence, treatments (organic & chemical), and follow-up guidance.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image (JPEG/PNG/WEBP).")
    
    image_bytes = await file.read()
    return scan_crop_image(
        image_bytes=image_bytes,
        filename=file.filename or "leaf.jpg",
        crop_type=crop_type,
        field_id=field_id,
        language=language
    )

@router.get("/fields/{field_id}/disease-scans", response_model=DiseaseHistoryResponse)
async def get_disease_scans(
    field_id: str,
    limit: int = Query(10, ge=1, le=50)
) -> DiseaseHistoryResponse:
    """
    Retrieve historical disease diagnoses and scans for a field.
    """
    return get_field_disease_history(field_id=field_id, limit=limit)
