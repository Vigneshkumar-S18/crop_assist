from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class IrrigationDecisionRequest(BaseModel):
    field_id: Optional[str] = "field-001"
    crop: Optional[str] = "tomato"
    crop_stage: Optional[str] = "Flowering"
    growth_stage: Optional[str] = "Flowering"
    soil_moisture: Optional[float] = None
    rain_probability: Optional[float] = None
    rain_probability_next_24h: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None

class MotorAction(BaseModel):
    state: str = "OFF"  # "ON" | "OFF" | "STANDBY"
    reason: str = "Soil moisture balanced"

class IrrigationDecisionResponse(BaseModel):
    field_id: Optional[str] = "field-001"
    crop: str = "Tomato"
    crop_stage: str = "Flowering"
    growth_stage: Optional[str] = "Flowering"
    stage_optimal_range: Optional[str] = "60-80%"
    decision: str = "OPTIMAL_STANDBY"  # "DELAY_IRRIGATION" | "IRRIGATE_NOW" | "OPTIMAL_STANDBY" | "IRRIGATE" | "HOLD"
    action: str = "HOLD"
    status: str = "NORMAL"
    urgency: str = "LOW"
    badge: str = "🟢 Normal"
    confidence: float = 0.95
    action_title: str = "Moisture Optimal"
    recommendation: str = "Soil moisture is optimal."
    reasoning: str = "Root zone moisture is balanced."
    motor: MotorAction = Field(default_factory=MotorAction)
    recommended_duration_minutes: Optional[int] = 0
    recommended_water_volume_liters: Optional[float] = 0.0
    weather_suppression_active: bool = False
    next_check_in_hours: int = 4
