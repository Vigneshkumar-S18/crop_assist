from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class FertilizerRequest(BaseModel):
    field_id: Optional[str] = "field-001"
    crop: Optional[str] = "tomato"
    crop_stage: Optional[str] = "Flowering"
    growth_stage: Optional[str] = "Flowering"
    nitrogen: Optional[float] = 32.0
    phosphorus: Optional[float] = 28.0
    potassium: Optional[float] = 35.0
    soil_moisture: Optional[float] = 28.0
    temperature: Optional[float] = 31.0
    humidity: Optional[float] = 76.0
    soil_type: Optional[str] = "Loamy"
    soil_ph: Optional[float] = 6.5
    rain_probability: Optional[float] = 82.0

class SolutionDetails(BaseModel):
    name: str
    grade: Optional[str] = None
    dosage: Optional[str] = None
    application_method: Optional[str] = None
    why_selected: str
    speed: Optional[str] = None
    expected_response_time: Optional[str] = None
    confidence: Optional[str] = "95%"

class WeatherPrecaution(BaseModel):
    type: str
    icon: str
    title: str
    description: str

class VerificationProtocol(BaseModel):
    recheck_window: str
    target_sensor: str
    expected_improvement: str

class FertilizerResponse(BaseModel):
    recommendation_id: Optional[str] = "rec-001"
    status: str = "success"
    crop: str = "Tomato"
    growth_stage: str
    soil_type: str
    soil_ph: float
    primary_focus: str
    diagnosed_deficiencies: List[Dict[str, Any]]
    has_deficiency: bool
    primary_deficiency: str
    chemical_solution: SolutionDetails
    organic_solution: SolutionDetails
    weather_precautions: List[WeatherPrecaution]
    action_steps: List[str]
    verification_protocol: VerificationProtocol
    telemetry_used: Dict[str, Any]
    nutrient_status_map: Dict[str, Any]
    calibration_notice: str
