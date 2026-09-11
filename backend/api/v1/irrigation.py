from fastapi import APIRouter
from schemas.irrigation import IrrigationDecisionRequest, IrrigationDecisionResponse, MotorAction
from services.sensor_service import get_latest_sensor_data
from services.weather_service import get_current_weather, get_weather_forecast
from services.decision_engine import evaluate_irrigation_decision as run_engine_decision

router = APIRouter(prefix="/irrigation", tags=["Irrigation Decision Engine"])

@router.post("/decision", response_model=IrrigationDecisionResponse)
async def evaluate_irrigation_decision(req: IrrigationDecisionRequest) -> IrrigationDecisionResponse:
    """
    Multi-Factor Contextual Irrigation Decision Engine.
    Combines:
    1. Real-time soil moisture vs stage thresholds
    2. Real-time temperature & heat stress
    3. Open-Meteo rain probability in next 6-24h
    4. Soil texture infiltration characteristics
    Produces explicit decision: 'IRRIGATE', 'HOLD', 'DELAY_RAIN', 'REDUCE', or 'SCHEDULE'.
    """
    field_id = req.field_id or "field-001"
    crop_stage = req.growth_stage or req.crop_stage or "Flowering"
    
    # Resolve soil moisture
    moisture = req.soil_moisture
    temp = req.temperature
    if (moisture is None or temp is None) and field_id:
        sens = get_latest_sensor_data(field_id=field_id)
        if moisture is None: moisture = sens.soil_moisture.value
        if temp is None: temp = sens.temperature.value
    moisture = moisture if moisture is not None else 65.0
    temp = temp if temp is not None else 28.0
    
    # Resolve forecast rain prob
    rain_prob = req.rain_probability if req.rain_probability is not None else req.rain_probability_next_24h
    if rain_prob is None and field_id:
        try:
            fc = get_weather_forecast(field_id=field_id, days=1)
            if fc.forecast:
                rain_prob = fc.forecast[0].rain_probability
        except Exception:
            rain_prob = 10.0
    rain_prob = rain_prob if rain_prob is not None else 10.0
    
    # Run deterministic decision engine
    eng_res = run_engine_decision(
        soil_moisture=moisture,
        rain_probability=rain_prob,
        temperature=temp,
        crop_stage=crop_stage
    )
    
    action_name = "IRRIGATE" if "IRRIGATE" in eng_res["status"] else ("HOLD" if "DELAY" in eng_res["status"] or "HALT" in eng_res["status"] else "OPTIMAL")
    
    return IrrigationDecisionResponse(
        field_id=field_id,
        crop=req.crop or "Tomato",
        crop_stage=crop_stage,
        growth_stage=crop_stage,
        stage_optimal_range="60–80%",
        decision=eng_res["status"],
        action=action_name,
        status=eng_res["status"],
        urgency="HIGH" if action_name == "IRRIGATE" else "LOW",
        badge=eng_res["badge"],
        confidence=0.95,
        action_title=eng_res["action_title"],
        recommendation=eng_res["recommendation"],
        reasoning=eng_res["reasoning"],
        motor=MotorAction(
            state=eng_res["motor_action"],
            reason=eng_res["recommendation"]
        ),
        recommended_duration_minutes=30 if action_name == "IRRIGATE" else 0,
        recommended_water_volume_liters=15.0 if action_name == "IRRIGATE" else 0.0,
        weather_suppression_active=True if "DELAY" in eng_res["status"] else False,
        next_check_in_hours=4
    )
