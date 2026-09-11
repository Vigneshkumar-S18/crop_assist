from fastapi import APIRouter, Query
from schemas.weather import WeatherCurrentResponse, WeatherForecastResponse
from services.weather_service import get_current_weather, get_weather_forecast

router = APIRouter(prefix="/fields", tags=["Weather"])

@router.get("/{field_id}/weather/current", response_model=WeatherCurrentResponse)
async def get_field_current_weather(
    field_id: str,
    latitude: float = Query(13.0827, description="Latitude of the field (default Chennai)"),
    longitude: float = Query(80.2707, description="Longitude of the field (default Chennai)")
) -> WeatherCurrentResponse:
    """
    Get live real-time agro-meteorological weather data for a field via Open-Meteo.
    """
    return get_current_weather(latitude=latitude, longitude=longitude, field_id=field_id)

@router.get("/{field_id}/weather/forecast", response_model=WeatherForecastResponse)
async def get_field_weather_forecast(
    field_id: str,
    days: int = Query(7, ge=1, le=16, description="Forecast horizon in days"),
    latitude: float = Query(13.0827, description="Latitude"),
    longitude: float = Query(80.2707, description="Longitude")
) -> WeatherForecastResponse:
    """
    Get 7-to-14 day weather forecasts including rain probability and agricultural spraying/irrigation advisories.
    """
    return get_weather_forecast(latitude=latitude, longitude=longitude, days=days, field_id=field_id)
