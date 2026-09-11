from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class DiseaseInfo(BaseModel):
    name: str
    confidence: float
    raw_label: Optional[str] = None

class DiseaseRisk(BaseModel):
    next_24_hours: str
    next_3_days: str
    risk_score: int

class DiseaseScanResponse(BaseModel):
    scan_id: str
    valid_image: bool = True
    crop: str = "tomato"
    disease: DiseaseInfo
    severity: str
    risk: DiseaseRisk
    context: Optional[Dict[str, Any]] = None
    recommendations: List[str]
    recommendation_id: Optional[str] = None
    timestamp: str

class DiseaseHistoryItem(BaseModel):
    scan_id: str
    date: str
    disease_name: str
    confidence: float
    severity: str
    stage: str

class DiseaseHistoryResponse(BaseModel):
    field_id: str = "field-001"
    history: List[DiseaseHistoryItem]

