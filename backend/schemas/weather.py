from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class WeatherCurrentResponse(BaseModel):
    location: str = "Coimbatore, Tamil Nadu"
    temperature: float = 31.0
    humidity: float = 76.0
    rain_probability: float = 78.0
    precipitation: float = 0.0
    wind_speed: float = 12.0
    weather_code: int = 61
    et0: float = 4.2
    forecast_desc: str = "Scattered showers expected"
    timestamp: str

class DailyForecastItem(BaseModel):
    date: str
    day_name: str
    temp_max: float
    temp_min: float
    rain_probability: float
    weather_desc: str

class WeatherForecastResponse(BaseModel):
    location: str = "Coimbatore, Tamil Nadu"
    rain_probability_6h: float = 78.0
    rain_probability_24h: float = 85.0
    current: WeatherCurrentResponse
    daily: List[DailyForecastItem] = Field(default_factory=list)
    forecast: List[DailyForecastItem] = Field(default_factory=list)
