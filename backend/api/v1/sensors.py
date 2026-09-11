from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from schemas.sensor import CurrentSensorsResponse, SensorHistoryResponse
from services.sensor_service import get_latest_sensor_data, get_sensor_history

router = APIRouter(prefix="/fields", tags=["Sensors"])

@router.get("/{field_id}/sensors/current", response_model=CurrentSensorsResponse)
async def get_current_sensors(
    field_id: str,
    device_id: Optional[str] = Query(None, description="Optional specific device ID filter")
) -> CurrentSensorsResponse:
    """
    Get the latest validated sensor telemetry and threshold status for a field/device.
    """
    data = get_latest_sensor_data(field_id=field_id, device_id=device_id)
    return data

@router.get("/{field_id}/sensors/history", response_model=SensorHistoryResponse)
async def get_sensors_history(
    field_id: str,
    range: str = Query("24h", description="Time range: 6h, 24h, 7d, 30d"),
    interval: str = Query("1h", description="Sampling interval: 15m, 1h, 1d")
) -> SensorHistoryResponse:
    """
    Get historical time-series sensor telemetry data for a field.
    """
    return get_sensor_history(field_id=field_id, range_str=range, interval_str=interval)
