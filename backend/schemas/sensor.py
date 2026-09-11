from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class SensorValue(BaseModel):
    value: float
    unit: str

class NPKValues(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float

class CurrentSensorsResponse(BaseModel):
    field_id: str = "field-001"
    timestamp: str
    stale: bool = False
    soil_moisture: SensorValue
    temperature: SensorValue
    humidity: SensorValue
    npk: NPKValues
    soil_ph: Optional[float] = 6.5
    ec_salinity: Optional[float] = 1.4
    water_quality: Optional[Dict[str, Any]] = None

class TelemetryPayload(BaseModel):
    device_id: Optional[str] = "ESP32-001"
    timestamp: Optional[str] = None
    soil_moisture: float
    temperature: float
    humidity: float
    nitrogen: Optional[float] = 32.0
    phosphorus: Optional[float] = 28.0
    potassium: Optional[float] = 35.0
    soil_ph: Optional[float] = 6.5
    ec_salinity: Optional[float] = 1.4
    water_quality: Optional[Dict[str, Any]] = None

class SensorHistoryPoint(BaseModel):
    timestamp: str
    soil_moisture: float
    temperature: float
    humidity: float
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None

class SensorHistoryResponse(BaseModel):
    field_id: str = "field-001"
    range: str = "1d"
    data: List[SensorHistoryPoint]
