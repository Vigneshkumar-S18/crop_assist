from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

# Legacy services for backward compatibility
from services.crop_validator import validate_tomato_image
from services.disease_model import predict_disease
from services.decision_engine import analyze_crop_state
from services.query_router import route_query
from services.context_manager import build_scoped_context
from services.chat_agent import generate_agricultural_response
from services.fertilizer_service import recommend_fertilizer

# API v1 Routers
from api.v1.chat import router as v1_chat_router
from api.v1.sensors import router as v1_sensors_router
from api.v1.devices import router as v1_devices_router
from api.v1.weather import router as v1_weather_router
from api.v1.disease import router as v1_disease_router
from api.v1.fertilizer import router as v1_fertilizer_router
from api.v1.irrigation import router as v1_irrigation_router
from api.v1.alerts import router as v1_alerts_router
from api.v1.voice import router as v1_voice_router

class LegacyChatRequest(BaseModel):
    message: str
    sensor_data: Optional[Dict[str, Any]] = None
    weather_data: Optional[Dict[str, Any]] = None
    latest_scan: Optional[Dict[str, Any]] = None
    crop_history: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, Any]]] = None

class LegacyFertilizerRequest(BaseModel):
    nitrogen: Optional[float] = 32.0
    phosphorus: Optional[float] = 28.0
    potassium: Optional[float] = 35.0
    soil_moisture: Optional[float] = 28.0
    temperature: Optional[float] = 31.0
    humidity: Optional[float] = 76.0
    soil_type: Optional[str] = "Loamy"
    crop_stage: Optional[str] = "Flowering"
    soil_ph: Optional[float] = 6.5
    rain_probability: Optional[float] = 82.0

app = FastAPI(
    title="AgriSense / CropPilot AI Engine & API",
    description="Query-Aware Agricultural Agent, IoT Telemetry Ingest, ViT Disease Diagnosis, Multi-factor Irrigation & Regional Agronomy Decision Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# MOUNT API V1 ROUTERS
# -----------------------------------------------------------------------------
app.include_router(v1_chat_router, prefix="/api/v1")
app.include_router(v1_sensors_router, prefix="/api/v1")
app.include_router(v1_devices_router, prefix="/api/v1")
app.include_router(v1_weather_router, prefix="/api/v1")
app.include_router(v1_disease_router, prefix="/api/v1")
app.include_router(v1_fertilizer_router, prefix="/api/v1")
app.include_router(v1_irrigation_router, prefix="/api/v1")
app.include_router(v1_alerts_router, prefix="/api/v1")
app.include_router(v1_voice_router, prefix="/api/v1")

# -----------------------------------------------------------------------------
# ROOT & HEALTH CHECK
# -----------------------------------------------------------------------------
@app.get("/")
def root():
    return {
        "service": "AgriSense / CropPilot Engine",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "api_v1_docs": "/docs",
            "chat": "/api/v1/chat",
            "sensors": "/api/v1/fields/{field_id}/sensors/current",
            "weather": "/api/v1/fields/{field_id}/weather/current",
            "disease_scan": "/api/v1/disease/scan",
            "fertilizer": "/api/v1/fertilizer/recommend",
            "irrigation": "/api/v1/irrigation/decision",
            "alerts": "/api/v1/fields/{field_id}/alerts",
            "voice": "/api/v1/voice/transcribe"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "croppilot_backend"}

# -----------------------------------------------------------------------------
# LEGACY ENDPOINTS (Preserved for 100% Frontend Backward Compatibility)
# -----------------------------------------------------------------------------
@app.post("/chat")
async def chat_with_agrisense(req: LegacyChatRequest):
    route = route_query(req.message, req.conversation_history)
    sources = route.get("required_sources") or route.get("sources") or []
    
    context = build_scoped_context(
        user_query=req.message,
        route=route,
        sensor_data=req.sensor_data,
        weather_data=req.weather_data,
        latest_scan=req.latest_scan,
        crop_history=req.crop_history,
        conversation_history=req.conversation_history
    )
    
    result = generate_agricultural_response(req.message, route, context)
    
    return {
        "success": True,
        "reply": result["reply"],
        "intent": result["intent"],
        "sources_used": result["sources_used"],
        "routing_reason": result["routing_reason"],
        "telemetry_used": result["telemetry_used"],
        "cited_topics": result["cited_topics"]
    }

@app.post("/analyze")
async def analyze_crop(
    file: UploadFile = File(...),
    soil_moisture: Optional[float] = Form(None),
    temperature: Optional[float] = Form(None),
    humidity: Optional[float] = Form(None),
    rain_probability: Optional[float] = Form(None)
):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    
    validation = validate_tomato_image(image)
    if not validation["is_valid_crop"]:
        return {
            "success": False,
            "is_valid_crop": False,
            "error_type": "IRRELEVANT_IMAGE",
            "title": "Image Not Suitable",
            "message": "This image does not appear to contain a tomato leaf or tomato plant.",
            "detected_category": validation.get("detected_category", "Non-crop object"),
            "guidance": [
                "Ensure you photograph a tomato plant or leaf.",
                "Capture the photo under clear, natural lighting.",
                "Keep the camera focused on the leaf surface (15–25 cm away).",
                "Avoid blurry shots, hands, animals, screens, or non-crop objects."
            ]
        }
    
    predictions = predict_disease(image)
    top_prediction = predictions[0]
    
    analysis = analyze_crop_state(
        disease=top_prediction["label"],
        confidence=top_prediction["confidence"],
        soil_moisture=soil_moisture,
        temperature=temperature,
        humidity=humidity,
        rain_probability=rain_probability
    )
    
    return {
        "success": True,
        "is_valid_crop": True,
        "validation": validation,
        "predictions": predictions,
        "analysis": analysis
    }

@app.post("/recommend-fertilizer")
async def get_fertilizer_recommendation(req: LegacyFertilizerRequest):
    result = recommend_fertilizer(
        nitrogen=req.nitrogen,
        phosphorus=req.phosphorus,
        potassium=req.potassium,
        soil_moisture=req.soil_moisture,
        temperature=req.temperature,
        humidity=req.humidity,
        soil_type=req.soil_type,
        crop_stage=req.crop_stage,
        soil_ph=req.soil_ph,
        rain_probability=req.rain_probability
    )
    return result
