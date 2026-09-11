from fastapi import APIRouter
from schemas.fertilizer import FertilizerRequest, FertilizerResponse
from services.fertilizer_service import recommend_fertilizer
from services.sensor_service import get_latest_sensor_data

router = APIRouter(prefix="/fertilizer", tags=["Fertilizer"])

@router.post("/recommend", response_model=FertilizerResponse)
async def recommend_fertilizer_plan(req: FertilizerRequest) -> FertilizerResponse:
    """
    Deterministic Nutrient & Fertilizer Recommendation Engine.
    Calculates stage-aware NPK targets, deficits, chemical solutions (Urea, DAP, MOP, etc.),
    organic alternatives (FYM, Vermicompost, Neem Cake), and closed-loop verification protocols.
    """
    n_val = req.nitrogen
    p_val = req.phosphorus
    k_val = req.potassium
    moist_val = req.soil_moisture
    temp_val = req.temperature
    hum_val = req.humidity
    ph_val = req.soil_ph
    rain_val = req.rain_probability
    
    # If field_id is provided and values were left as None, fill from live sensors
    if req.field_id:
        sens = get_latest_sensor_data(field_id=req.field_id)
        if n_val is None: n_val = sens.npk.nitrogen
        if p_val is None: p_val = sens.npk.phosphorus
        if k_val is None: k_val = sens.npk.potassium
        if moist_val is None: moist_val = sens.soil_moisture.value
        if temp_val is None: temp_val = sens.temperature.value
        if hum_val is None: hum_val = sens.humidity.value
        if ph_val is None: ph_val = sens.soil_ph or 6.5
        
    n_val = n_val if n_val is not None else 32.0
    p_val = p_val if p_val is not None else 28.0
    k_val = k_val if k_val is not None else 35.0
    moist_val = moist_val if moist_val is not None else 28.0
    temp_val = temp_val if temp_val is not None else 31.0
    hum_val = hum_val if hum_val is not None else 76.0
    ph_val = ph_val if ph_val is not None else 6.5
    rain_val = rain_val if rain_val is not None else 82.0
    
    stage = req.growth_stage or req.crop_stage or "Flowering"
    soil_type = req.soil_type or "Loamy"
    
    result = recommend_fertilizer(
        nitrogen=n_val,
        phosphorus=p_val,
        potassium=k_val,
        soil_moisture=moist_val,
        temperature=temp_val,
        humidity=hum_val,
        soil_type=soil_type,
        crop_stage=stage,
        soil_ph=ph_val,
        rain_probability=rain_val
    )
    
    return FertilizerResponse(**result)
