from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from schemas.sensor import TelemetryPayload
from services.sensor_service import update_device_telemetry

router = APIRouter(prefix="/devices", tags=["Devices & Telemetry"])

class MotorControlRequest(BaseModel):
    state: str = Field(..., description="Target state: 'ON' or 'OFF'")
    duration_minutes: Optional[int] = Field(None, description="Auto turn-off duration in minutes")
    source: Optional[str] = Field("manual", description="Trigger source: 'manual', 'agent', 'schedule'")

class MotorControlResponse(BaseModel):
    status: str
    device_id: str
    state: str
    triggered_at: datetime
    message: str

# In-memory motor relay state tracker
_MOTOR_STATES: Dict[str, Dict[str, Any]] = {}

@router.post("/{device_id}/telemetry")
async def ingest_telemetry(device_id: str, payload: TelemetryPayload):
    """
    Ingest real-time IoT node sensor telemetry.
    Stores and validates incoming metrics against physiological crop safety thresholds.
    """
    result = update_device_telemetry(device_id=device_id, payload=payload)
    return result

@router.post("/{device_id}/motor", response_model=MotorControlResponse)
async def control_motor(device_id: str, req: MotorControlRequest):
    """
    Actuate or trigger field motor/pump relays.
    (LLM acts as decision support; actuation is routed through this explicit deterministic endpoint).
    """
    state_upper = req.state.upper()
    if state_upper not in ["ON", "OFF"]:
        raise HTTPException(status_code=400, detail="Invalid motor state. Allowed values: 'ON', 'OFF'")
    
    now = datetime.now(timezone.utc)
    _MOTOR_STATES[device_id] = {
        "state": state_upper,
        "updated_at": now.isoformat(),
        "duration_minutes": req.duration_minutes,
        "source": req.source
    }
    
    msg = f"Motor for device {device_id} turned {state_upper}"
    if req.duration_minutes and state_upper == "ON":
        msg += f" for {req.duration_minutes} minutes"
        
    return MotorControlResponse(
        status="success",
        device_id=device_id,
        state=state_upper,
        triggered_at=now,
        message=msg
    )

@router.get("/{device_id}/motor")
async def get_motor_status(device_id: str):
    """
    Get current motor relay state for a device.
    """
    return _MOTOR_STATES.get(device_id, {
        "state": "OFF",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "duration_minutes": None,
        "source": "default"
    })
