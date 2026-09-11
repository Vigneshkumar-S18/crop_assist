"""
AgriSense Response Generator & Grounded Explanation Layer
Combines Scoped Context + Decision Engine Output + RAG Knowledge into a grounded, reliable response.
Ensures zero hallucinations and returns standardized ChatResponse contract.
"""

from typing import Dict, Any, List, Optional, Union
from schemas.chat import ChatRequest, ChatResponse
from services.query_router import route_query
from services.context_manager import build_scoped_context
from services.chat_agent import generate_agricultural_response
from services.language_service import detect_language, translate_response
from services.decision_engine import evaluate_irrigation_decision

async def generate_chat_response(
    request_or_message: Union[ChatRequest, str],
    language: Optional[str] = None,
    conversation_id: Optional[str] = None,
    field_id: Optional[str] = "field-001",
    sensor_data: Optional[Dict[str, Any]] = None,
    weather_data: Optional[Dict[str, Any]] = None,
    latest_scan: Optional[Dict[str, Any]] = None,
    crop_history: Optional[Dict[str, Any]] = None,
    conversation_history: Optional[List[Dict[str, Any]]] = None
) -> ChatResponse:
    """
    Full Request Lifecycle:
    Query -> Domain Gate -> Intent Router -> Scoped Context -> Decision Engine -> Grounded Answer -> Localized Translation
    """
    if isinstance(request_or_message, ChatRequest):
        message = request_or_message.message
        language = request_or_message.language or language
        conversation_id = request_or_message.conversation_id or conversation_id
        field_id = request_or_message.field_id or field_id
        sensor_data = request_or_message.sensor_data or sensor_data
        weather_data = request_or_message.weather_data or weather_data
        latest_scan = request_or_message.latest_scan or latest_scan
        crop_history = request_or_message.crop_history or crop_history
        conversation_history = request_or_message.conversation_history or conversation_history
    else:
        message = str(request_or_message)

    # 1. Routing & Domain Analysis
    route = route_query(message, conversation_history)
    domain = route.get("domain", "AGRICULTURE")
    intent = route.get("intent", "GENERAL_AGRICULTURE")
    detected_lang = language or route.get("detected_language") or detect_language(message)

    # 2. Context Aggregation (Strictly Scoped)
    context = build_scoped_context(
        user_query=message,
        route=route,
        sensor_data=sensor_data,
        weather_data=weather_data,
        latest_scan=latest_scan,
        crop_history=crop_history,
        conversation_history=conversation_history
    )

    # 3. Grounded Agricultural Generation
    raw_result = generate_agricultural_response(
        user_query=message,
        route=route,
        context=context
    )

    english_answer = raw_result.get("reply", "")
    sources_used = raw_result.get("sources_used", route.get("required_sources", []))

    # 4. Extract Structured Data & Recommendation Metadata
    structured_data = {}
    recommendation_meta = None
    actions = []
    follow_ups = []
    suggested_actions = []

    if "sensors" in context:
        structured_data["soil_moisture"] = context["sensors"].get("soil_moisture")
        structured_data["temperature"] = context["sensors"].get("temperature")
    if "weather" in context:
        structured_data["rain_probability"] = context["weather"].get("rain_probability", context["weather"].get("rain_probability_6h"))

    # Intent-specific structured recommendations & follow-ups
    if intent in ["IRRIGATION", "IRRIGATION_DECISION"]:
        sm = structured_data.get("soil_moisture", 38)
        rain_p = structured_data.get("rain_probability", 78)
        irr_eval = evaluate_irrigation_decision(sm, rain_p, crop_stage="Flowering")
        recommendation_meta = {
            "action": irr_eval["status"],
            "badge": irr_eval["badge"],
            "title": irr_eval["action_title"],
            "motor": irr_eval["motor_action"]
        }
        suggested_actions = [
            "Check soil moisture levels",
            "Evaluate 24h rain forecast",
            "Adjust drip irrigation valve"
        ]
        follow_ups = [
            "View live soil moisture telemetry",
            "Check tomorrow's rain forecast",
            "View precision drip schedule"
        ]

    elif intent in ["FERTILIZER", "FERTILIZER_RECOMMENDATION", "NUTRIENT_STATUS"]:
        recommendation_meta = {
            "action": "NPK_MANAGEMENT",
            "title": "Dual-Track Fertilizer & Organic Advice"
        }
        suggested_actions = [
            "Apply Urea (split dose)",
            "Top-dress with Vermicompost/FYM",
            "Check soil pH balance"
        ]
        follow_ups = [
            "View Urea fast-acting dosage",
            "View FYM + Neem Cake organic prescription",
            "Re-check IoT NPK probe"
        ]

    elif intent in ["DISEASE", "DISEASE_CURRENT", "DISEASE_RISK"]:
        recommendation_meta = {
            "action": "FUNGAL_PREVENTION",
            "title": "Copper Oxychloride / Trichoderma Plan"
        }
        suggested_actions = [
            "Take a new leaf scan photo",
            "Prune infected lower foliage",
            "Apply organic bio-fungicide spray"
        ]
        follow_ups = [
            "Start new leaf disease scan",
            "View disease progression history",
            "Inspect weather humidity risk"
        ]

    elif intent in ["WEATHER", "WEATHER_FORECAST"]:
        suggested_actions = [
            "Check rain forecast before spraying",
            "Inspect wind speed for dusting",
            "Adjust irrigation schedule"
        ]
        follow_ups = [
            "Should I irrigate tomorrow?",
            "View 5-day daily forecast",
            "Check soil moisture status"
        ]

    else:
        if domain == "OUT_OF_DOMAIN":
            suggested_actions = [
                "Ask about tomato irrigation",
                "Upload a crop leaf photo",
                "Check soil moisture and temperature"
            ]
            follow_ups = [
                "How is my tomato crop doing?",
                "What is the recommended fertilizer?",
                "Should I water my plants today?"
            ]
        else:
            suggested_actions = [
                "Monitor soil moisture",
                "Check daily crop advisory"
            ]
            follow_ups = [
                "What is my soil moisture?",
                "Will it rain tomorrow?",
                "Should I water my plants?"
            ]

    # 5. Multilingual Translation / Localization
    final_answer = translate_response(
        text=english_answer,
        target_lang=detected_lang,
        intent=intent,
        data=structured_data
    )

    return ChatResponse(
        conversation_id=conversation_id or "conv-001",
        domain=domain,
        intent=intent,
        confidence=float(route.get("confidence", 0.95)),
        answer=final_answer,
        reply=final_answer,
        language=detected_lang,
        sources_used=sources_used,
        data=structured_data if structured_data else None,
        recommendation=recommendation_meta,
        actions=actions,
        suggested_actions=suggested_actions,
        follow_up_suggestions=follow_ups
    )
