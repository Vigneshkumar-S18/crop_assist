"""
AgriSense Disease Pathology & Visual Diagnosis Service
Integrates leaf image validation, ViT disease model prediction, and historical progression.
"""

from typing import Dict, Any, List, Optional
from PIL import Image
import datetime
import uuid
import io
from schemas.disease import DiseaseScanResponse, DiseaseInfo, DiseaseRisk, DiseaseHistoryItem, DiseaseHistoryResponse

# Historical scans list
_DISEASE_SCAN_HISTORY = [
    DiseaseHistoryItem(
        scan_id="scan-001",
        date="Sep 11, 2025",
        disease_name="Tomato Early Blight",
        confidence=94.7,
        severity="Moderate",
        stage="Flowering & Fruit Setting"
    ),
    DiseaseHistoryItem(
        scan_id="scan-002",
        date="Sep 08, 2025",
        disease_name="Tomato Early Blight",
        confidence=91.2,
        severity="Mild",
        stage="Flowering Stage"
    ),
    DiseaseHistoryItem(
        scan_id="scan-003",
        date="Sep 02, 2025",
        disease_name="Healthy Tomato Leaf",
        confidence=98.4,
        severity="None",
        stage="Vegetative Stage"
    )
]

def scan_crop_image(
    image_bytes: bytes,
    filename: str = "leaf.jpg",
    crop_type: Optional[str] = "tomato",
    field_id: Optional[str] = "field-001",
    language: Optional[str] = "en"
) -> DiseaseScanResponse:
    """
    Executes leaf validation + ViT prediction + decision engine severity/risk analysis from image bytes.
    """
    image = Image.open(io.BytesIO(image_bytes))
    from services.crop_validator import validate_tomato_image
    from services.disease_model import predict_disease
    from services.decision_engine import analyze_crop_state

    # 1. Validation
    validation = validate_tomato_image(image)
    if not validation["is_valid_crop"]:
        return DiseaseScanResponse(
            scan_id=f"scan-{uuid.uuid4().hex[:6]}",
            valid_image=False,
            crop="unknown",
            disease=DiseaseInfo(name="Unrecognized image or non-tomato crop", confidence=0.0, raw_label="Invalid"),
            severity="None",
            risk=DiseaseRisk(next_24_hours="LOW", next_3_days="LOW", risk_score=0),
            recommendations=[
                "Ensure you photograph a tomato plant or leaf.",
                "Capture the photo under clear, natural lighting.",
                "Keep the camera focused on the leaf surface (15-25 cm away)."
            ],
            timestamp=datetime.datetime.now().isoformat()
        )

    # 2. Disease ViT Prediction
    predictions = predict_disease(image)
    top_pred = predictions[0]
    disease_raw = top_pred["label"]
    confidence = top_pred["confidence"]
    clean_name = disease_raw.replace("Tomato___", "").replace("_", " ")

    # 3. Decision Engine Agronomic Assessment
    analysis = analyze_crop_state(
        disease=disease_raw,
        confidence=confidence,
        crop_stage="Flowering"
    )

    scan_id = f"scan-{uuid.uuid4().hex[:6]}"
    
    # Store in history
    item = DiseaseHistoryItem(
        scan_id=scan_id,
        date=datetime.date.today().strftime("%b %d, %Y"),
        disease_name=clean_name,
        confidence=confidence,
        severity=analysis["severity"],
        stage="Flowering"
    )
    _DISEASE_SCAN_HISTORY.insert(0, item)

    return DiseaseScanResponse(
        scan_id=scan_id,
        valid_image=True,
        crop="tomato",
        disease=DiseaseInfo(name=clean_name, confidence=confidence, raw_label=disease_raw),
        severity=analysis["severity"],
        risk=DiseaseRisk(
            next_24_hours=analysis["future_risk"],
            next_3_days="HIGH" if analysis["risk_score"] > 60 else "MODERATE",
            risk_score=analysis["risk_score"]
        ),
        recommendations=analysis["recommendations"],
        recommendation_id=f"rec-{scan_id}",
        timestamp=datetime.datetime.now().isoformat()
    )

def get_field_disease_history(field_id: str = "field-001", limit: int = 10) -> DiseaseHistoryResponse:
    """
    Returns scan history for tracking disease progression over time.
    """
    return DiseaseHistoryResponse(field_id=field_id, history=_DISEASE_SCAN_HISTORY[:limit])

def get_disease_history(field_id: str = "field-001") -> List[DiseaseHistoryItem]:
    return _DISEASE_SCAN_HISTORY
