"""
AgriSense Sensor Telemetry & Ingestion Service
Manages live readings from IoT ESP32 nodes and generates historical telemetry points.
"""

from typing import Dict, Any, List, Optional
import datetime
import random
from schemas.sensor import CurrentSensorsResponse, SensorValue, NPKValues, TelemetryPayload, SensorHistoryPoint, SensorHistoryResponse

# In-memory live telemetry state
_LIVE_SENSOR_STATE = {
    "field_id": "field-001",
    "timestamp": datetime.datetime.now().isoformat(),
    "stale": False,
    "soil_moisture": 38.0,
    "temperature": 26.0,
    "humidity": 76.0,
    "nitrogen": 32.0,
    "phosphorus": 24.0,
    "potassium": 36.0,
    "soil_ph": 6.5,
    "ec_salinity": 1.4,
    "water_quality": {"tds": 320, "status": "GOOD"}
}

def get_current_sensors(field_id: str = "field-001", device_id: Optional[str] = None) -> CurrentSensorsResponse:
    """
    Returns structured sensor telemetry according to the API v1 contract.
    """
    return CurrentSensorsResponse(
        field_id=field_id,
        timestamp=_LIVE_SENSOR_STATE["timestamp"],
        stale=_LIVE_SENSOR_STATE["stale"],
        soil_moisture=SensorValue(value=_LIVE_SENSOR_STATE["soil_moisture"], unit="%"),
        temperature=SensorValue(value=_LIVE_SENSOR_STATE["temperature"], unit="°C"),
        humidity=SensorValue(value=_LIVE_SENSOR_STATE["humidity"], unit="%"),
        npk=NPKValues(
            nitrogen=_LIVE_SENSOR_STATE["nitrogen"],
            phosphorus=_LIVE_SENSOR_STATE["phosphorus"],
            potassium=_LIVE_SENSOR_STATE["potassium"]
        ),
        soil_ph=_LIVE_SENSOR_STATE["soil_ph"],
        ec_salinity=_LIVE_SENSOR_STATE["ec_salinity"],
        water_quality=_LIVE_SENSOR_STATE["water_quality"]
    )

get_latest_sensor_data = get_current_sensors

def update_device_telemetry(device_id: str, payload: TelemetryPayload) -> Dict[str, Any]:
    """
    Validates and updates live state from incoming ESP32 telemetry packet.
    """
    _LIVE_SENSOR_STATE["soil_moisture"] = float(payload.soil_moisture)
    _LIVE_SENSOR_STATE["temperature"] = float(payload.temperature)
    _LIVE_SENSOR_STATE["humidity"] = float(payload.humidity)
    if payload.nitrogen is not None:
        _LIVE_SENSOR_STATE["nitrogen"] = float(payload.nitrogen)
    if payload.phosphorus is not None:
        _LIVE_SENSOR_STATE["phosphorus"] = float(payload.phosphorus)
    if payload.potassium is not None:
        _LIVE_SENSOR_STATE["potassium"] = float(payload.potassium)
    if payload.soil_ph is not None:
        _LIVE_SENSOR_STATE["soil_ph"] = float(payload.soil_ph)
    if payload.ec_salinity is not None:
        _LIVE_SENSOR_STATE["ec_salinity"] = float(payload.ec_salinity)
    if payload.water_quality is not None:
        _LIVE_SENSOR_STATE["water_quality"] = payload.water_quality
        
    _LIVE_SENSOR_STATE["timestamp"] = datetime.datetime.now().isoformat()
    _LIVE_SENSOR_STATE["stale"] = False
    
    return {"status": "success", "device_id": device_id, "message": "Telemetry ingested successfully"}

def update_telemetry(payload: Dict[str, Any]) -> Dict[str, Any]:
    return update_device_telemetry(payload.get("device_id", "ESP32-001"), TelemetryPayload(**payload))

def get_sensor_history(field_id: str = "field-001", range_str: str = "1d", interval_str: str = "1h") -> SensorHistoryResponse:
    """
    Generates time-series data for frontend graphs.
    """
    points = 12 if "d" in range_str or "24h" in range_str else (7 if "w" in range_str or "7d" in range_str else 30)
    base_m = _LIVE_SENSOR_STATE["soil_moisture"]
    base_t = _LIVE_SENSOR_STATE["temperature"]
    base_h = _LIVE_SENSOR_STATE["humidity"]
    
    data_list = []
    now = datetime.datetime.now()
    
    for i in range(points):
        offset = points - 1 - i
        if "d" in range_str or "24h" in range_str:
            t_stamp = (now - datetime.timedelta(hours=offset * 2)).strftime("%I:%M %p")
        else:
            t_stamp = (now - datetime.timedelta(days=offset)).strftime("%b %d")
            
        data_list.append(SensorHistoryPoint(
            timestamp=t_stamp,
            soil_moisture=round(base_m + random.uniform(-4.0, 4.0), 1),
            temperature=round(base_t + random.uniform(-2.0, 2.5), 1),
            humidity=round(base_h + random.uniform(-5.0, 5.0), 1),
            nitrogen=round(_LIVE_SENSOR_STATE["nitrogen"] + random.uniform(-2.0, 2.0), 1),
            phosphorus=round(_LIVE_SENSOR_STATE["phosphorus"] + random.uniform(-1.0, 1.0), 1),
            potassium=round(_LIVE_SENSOR_STATE["potassium"] + random.uniform(-2.0, 2.0), 1)
        ))
        
    return SensorHistoryResponse(field_id=field_id, range=range_str, data=data_list)
