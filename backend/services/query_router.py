"""
AgriSense Intelligent Query Understanding & Intent + Source Router Layer
Performs semantic intent classification, entity extraction, and source selection.
Supports LLM-based understanding with a deterministic, typo-resilient semantic engine fallback.
"""

import os
import re
import json
from typing import Dict, Any, List, Optional
from services.domain_gate import check_domain_gate
from services.language_service import detect_language

# Supported Intents
INTENTS = [
    "GREETING",
    "WEATHER",
    "WEATHER_FORECAST",
    "SOIL_STATUS",
    "SENSOR_STATUS",
    "IRRIGATION",
    "IRRIGATION_DECISION",
    "DISEASE",
    "DISEASE_HISTORY",
    "DISEASE_RISK",
    "FERTILIZER",
    "FERTILIZER_RECOMMENDATION",
    "NUTRIENT_STATUS",
    "CROP_RISK",
    "CROP_STATUS",
    "WATER_QUALITY",
    "MOTOR_STATUS",
    "GENERAL_AGRICULTURE",
    "OUT_OF_DOMAIN"
]

def _llm_route_query(query: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> Optional[Dict[str, Any]]:
    """
    Optional LLM Router for advanced zero-shot intent and source classification.
    Runs if OPENAI_API_KEY is configured.
    """
    openai_key = os.environ.get("OPENAI_API_KEY")
    if not openai_key:
        return None

    try:
        import urllib.request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {openai_key}"
        }

        history_context = ""
        if conversation_history:
            last_turns = conversation_history[-3:]
            history_context = "RECENT CONVERSATION HISTORY:\n" + "\n".join([
                f"{turn.get('role', 'user')}: {turn.get('content', '')}" for turn in last_turns
            ]) + "\n\n"

        prompt = f"""You are the Query Router for AgriSense, an IoT and AI-driven precision tomato farming assistant.
Analyze the user's query and classify it into the exact intent and required data sources.

Available Intents:
- GREETING: Greetings, hello, introduction, capability inquiry.
- WEATHER: Inquiries about rain, rainfall chance, temperature, forecast, wind, humidity.
- SOIL_STATUS: Inquiries ONLY about current soil moisture or wetness telemetry.
- IRRIGATION: Inquiries asking whether to water, start irrigation, pump, or schedule watering.
- FERTILIZER: Inquiries about fertilizer, NPK, plant nutrients, feeding crops, Blossom End Rot, compost.
- DISEASE: Inquiries about tomato leaf spots, blights, mold, viruses, pests, sprays, fungicides.
- CROP_RISK: Inquiries about why the crop is at risk or overall health danger alerts.
- CROP_STATUS: Inquiries about overall crop health or summary of current status.
- SENSOR_STATUS: Inquiries about IoT hardware, water quality, or general sensor health.
- GENERAL_AGRICULTURE: Agricultural questions about tomato cultivation, soil prep, pruning, harvest that don't fit above.
- OUT_OF_DOMAIN: Questions completely unrelated to agriculture or farming (e.g. love, politics, movies, programming, philosophy, sports).

Available Data Sources:
- SENSOR (IoT soil moisture, ambient temp/humidity)
- WEATHER (Open-Meteo forecasts, rain probability)
- DISEASE_SCAN (Visual leaf scan result)
- CROP_HISTORY (Planting date, variety, spray history)
- RAG (Agronomic knowledge retrieval)

{history_context}USER QUERY: "{query}"

Respond strictly with valid JSON conforming to this schema:
{{
  "intent": "GREETING | WEATHER | SOIL_STATUS | IRRIGATION | DISEASE | FERTILIZER | CROP_RISK | CROP_STATUS | SENSOR_STATUS | GENERAL_AGRICULTURE | OUT_OF_DOMAIN",
  "domain": "AGRISENSE | AGRICULTURE | NON_AGRICULTURE",
  "confidence": 0.95,
  "entities": {{
    "crop": "tomato",
    "time": "today | tomorrow | upcoming | none",
    "weather_variable": "rain_probability | temperature | humidity | none",
    "topic": "string"
  }},
  "required_sources": ["WEATHER"],
  "optional_sources": [],
  "rag_required": false,
  "requires_decision_engine": false,
  "requires_clarification": false,
  "reason": "Short explanation"
}}
"""

        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are a precise JSON query router for an agricultural AI system."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.0,
            "response_format": {"type": "json_object"}
        }

        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=json.dumps(payload).encode(),
            headers=headers
        )
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            content = data["choices"][0]["message"]["content"]
            result = json.loads(content)
            # Normalize sources list
            if "sources" not in result:
                result["sources"] = result.get("required_sources", [])
            return result
    except Exception as e:
        print(f"[QueryRouter] LLM routing fallback to heuristic engine: {e}")
        return None

def normalize_text(text: str) -> str:
    """Normalize text and fix common typos in farmer queries."""
    t = text.lower().strip()
    
    # Common farmer spelling variations & typos
    typo_map = {
        r'\btommorow\b': 'tomorrow',
        r'\btmrw\b': 'tomorrow',
        r'\btomrow\b': 'tomorrow',
        r'\bfertizer\b': 'fertilizer',
        r'\bfertiser\b': 'fertilizer',
        r'\bfertiliser\b': 'fertilizer',
        r'\bfert\b': 'fertilizer',
        r'\bwatr\b': 'water',
        r'\bwaterin\b': 'watering',
        r'\bmsture\b': 'moisture',
        r'\bmoistr\b': 'moisture',
        r'\btemp\b': 'temperature',
        r'\bblite\b': 'blight',
        r'\bdisese\b': 'disease',
        r'\bdesease\b': 'disease',
        r'\birigate\b': 'irrigate',
        r'\birigation\b': 'irrigation'
    }
    for pattern, repl in typo_map.items():
        t = re.sub(pattern, repl, t)
    return t

def route_query(query: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
    """
    Understands the user query, determines intent, extracts temporal/agronomic entities,
    and selectively assigns required data sources.
    """
    # Try LLM-based routing first if available
    llm_result = _llm_route_query(query, conversation_history)
    if llm_result:
        return llm_result

    q = normalize_text(query)
    raw_q = query.strip()
    detected_lang = detect_language(raw_q)

    # 1. DOMAIN GATE CHECK
    is_agri, gate_reason = check_domain_gate(raw_q)
    if not is_agri and gate_reason in ["OUT_OF_DOMAIN_PATTERN", "NO_AGRICULTURAL_RELEVANCE"]:
        return {
            "intent": "OUT_OF_DOMAIN",
            "domain": "NON_AGRICULTURE",
            "confidence": 0.98,
            "entities": {"topic": "General / Non-agriculture"},
            "required_sources": [],
            "sources": [],
            "optional_sources": [],
            "rag_required": False,
            "requires_decision_engine": False,
            "requires_clarification": False,
            "detected_language": detected_lang,
            "reason": "Non-agricultural question rejected by Domain Gate."
        }

    # Analyze Conversation History for Context Carry-over
    last_user_query = ""
    last_bot_intent = ""
    if conversation_history and len(conversation_history) > 0:
        for turn in reversed(conversation_history):
            if turn.get("role") == "user" and not last_user_query:
                last_user_query = normalize_text(turn.get("content", ""))
            if turn.get("role") == "assistant" and not last_bot_intent:
                last_bot_intent = turn.get("intent", "")

    # Temporal Entity Detection
    time_ref = "today"
    if "tomorrow" in q or "next day" in q or "நாளை" in raw_q or "कल" in raw_q:
        time_ref = "tomorrow"
    elif "next week" in q or "upcoming" in q or "forecast" in q:
        time_ref = "upcoming"
    elif "yesterday" in q or "நேற்று" in raw_q or "कल" in raw_q:
        time_ref = "yesterday"

    # -------------------------------------------------------------------------
    # 2. GREETING INTENT (Zero data retrieval needed)
    # -------------------------------------------------------------------------
    greeting_exact = {
        "hi", "hello", "hey", "hii", "heyy", "good morning", "good evening",
        "good afternoon", "namaste", "vanakkam", "help", "who are you",
        "what can you do", "agrisense", "start"
    }
    if q in greeting_exact or (len(q.split()) <= 2 and any(q.startswith(g) for g in ["hi", "hello", "hey", "namaste", "vanakkam", "howdy"])):
        if not has_agri_word:
            return {
                "intent": "GREETING",
                "domain": "AGRISENSE",
                "confidence": 0.99,
                "entities": {},
                "required_sources": [],
                "sources": [],
                "optional_sources": [],
                "rag_required": False,
                "requires_decision_engine": False,
                "requires_clarification": False,
                "reason": "Greeting query requires no external telemetry or agronomic data retrieval."
            }

    # -------------------------------------------------------------------------
    # 3. WEATHER ONLY INTENT (Weather only, no sensor, no RAG)
    # -------------------------------------------------------------------------
    # e.g. "tommorow rain possibility?", "will it rain", "weather forecast", "temperature tomorrow"
    weather_inquiries = [
        "rain possibility", "chance of rain", "will it rain", "rain tomorrow", "rain today",
        "is it going to rain", "rain forecast", "weather forecast", "temperature today",
        "temperature tomorrow", "how hot", "how cold", "humidity forecast", "weather update",
        "precipitation", "wind speed", "is rain coming", "rain in next", "forecast"
    ]
    is_weather_inquiry = any(w in q for w in weather_inquiries) or (
        "rain" in q and not any(w in q for w in ["water", "irrigate", "watering", "pump", "turn on", "should i"])
    )

    if is_weather_inquiry and not any(w in q for w in ["water", "irrigate", "watering", "pump", "turn on", "should i water", "can i water"]):
        weather_var = "rain_probability" if "rain" in q else ("temperature" if "temp" in q or "hot" in q else "general")
        return {
            "intent": "WEATHER",
            "domain": "AGRISENSE",
            "confidence": 0.98,
            "entities": {
                "crop": "tomato",
                "time": time_ref,
                "weather_variable": weather_var
            },
            "required_sources": ["WEATHER"],
            "sources": ["WEATHER"],
            "optional_sources": [],
            "rag_required": False,
            "requires_decision_engine": False,
            "requires_clarification": False,
            "reason": f"Meteorological inquiry targeting {time_ref} weather forecast; requires Open-Meteo telemetry only."
        }

    # -------------------------------------------------------------------------
    # 4. SOIL MOISTURE / STATUS (Sensor only, no weather, no RAG)
    # -------------------------------------------------------------------------
    soil_keywords = [
        "soil moisture", "moisture level", "soil wet", "soil dry", "how wet is my soil",
        "moisture percentage", "current soil", "soil status", "moisture reading", "is soil dry",
        "moisture?", "current moisture"
    ]
    irrigation_action_words = ["water", "watering", "irrigate", "irrigation", "pump", "should i", "can i", "turn on", "when to", "apply water"]

    if any(k in q for k in soil_keywords) and not any(w in q for w in irrigation_action_words):
        return {
            "intent": "SOIL_STATUS",
            "domain": "AGRISENSE",
            "confidence": 0.97,
            "entities": {
                "crop": "tomato",
                "parameter": "soil_moisture"
            },
            "required_sources": ["SENSOR"],
            "sources": ["SENSOR"],
            "optional_sources": [],
            "rag_required": False,
            "requires_decision_engine": False,
            "requires_clarification": False,
            "reason": "Direct soil moisture telemetry inquiry requires IoT sensor readings only."
        }

    # -------------------------------------------------------------------------
    # 5. IRRIGATION DECISION (Sensor + Weather + Agronomic Knowledge + Decision Engine)
    # -------------------------------------------------------------------------
    # Handles: "Should I water tomorrow?", "Can I irrigate?", "Do I need to turn on pump?", "Should I water?"
    irrigation_inquiries = [
        "should i water", "can i water", "when to water", "need water", "turn on irrigation",
        "water my tomato", "water my plants", "start watering", "should i irrigate", "can i irrigate",
        "do i need to water", "is it safe to water", "switch on motor", "turn on pump",
        "irrigation needed", "water today", "water tomorrow"
    ]
    # Also check context carryover: if last query was weather ("rain tomorrow?") and user now says "should I water?"
    is_irrigation = any(k in q for k in irrigation_inquiries) or (
        any(w in q for w in ["water", "irrigate", "watering", "pump"]) and any(w in q for w in ["should", "can", "need", "do i", "when", "time", "now", "tomorrow"])
    )

    if is_irrigation:
        # If previous user query was about tomorrow's weather, inherit tomorrow time frame
        if "tomorrow" in last_user_query and time_ref == "today":
            time_ref = "tomorrow"

        return {
            "intent": "IRRIGATION",
            "domain": "AGRICULTURE",
            "confidence": 0.98,
            "entities": {
                "crop": "tomato",
                "time": time_ref,
                "topic": "irrigation_rules"
            },
            "required_sources": ["SENSOR", "WEATHER", "RAG"],
            "sources": ["SENSOR", "WEATHER", "RAG"],
            "optional_sources": ["CROP_HISTORY"],
            "rag_required": True,
            "requires_decision_engine": True,
            "requires_clarification": False,
            "reason": f"Irrigation decisions require correlating current soil moisture with upcoming {time_ref} rainfall forecast and agronomic thresholds."
        }

    # -------------------------------------------------------------------------
    # 6. FERTILIZER & NPK NUTRITION (RAG + Crop Stage)
    # -------------------------------------------------------------------------
    # Handles: "fertizer?", "fertilizer for tomato", "npk?", "food for plant", "which fertilizer"
    fertilizer_keywords = [
        "fertilizer", "fertiliser", "npk", "nutrient", "nitrogen", "phosphorus",
        "potassium", "calcium", "blossom end rot", "feed the crop", "urea", "dap",
        "micronutrient", "manure", "fertigation", "nutrient deficiency", "plant food",
        "what should i give my tomato", "which fertilizer", "what fertilizer"
    ]
    if any(k in q for k in fertilizer_keywords):
        return {
            "intent": "FERTILIZER",
            "domain": "AGRICULTURE",
            "confidence": 0.96,
            "entities": {
                "crop": "tomato",
                "topic": "fertilization_npk"
            },
            "required_sources": ["RAG"],
            "sources": ["RAG"],
            "optional_sources": ["SENSOR"],
            "rag_required": True,
            "requires_decision_engine": True,
            "requires_clarification": False,
            "reason": "Nutritional management requires tomato growth stage and NPK knowledge retrieval."
        }

    # -------------------------------------------------------------------------
    # 7. CROP RISK & MULTI-FACTOR ALERT (Sensors + Weather + Scan + RAG + Decision Engine)
    # -------------------------------------------------------------------------
    risk_keywords = [
        "crop risk", "danger", "crop health", "why high risk", "why is my crop at risk",
        "alert risk", "field risk", "is my crop safe", "crop in danger", "is my tomato safe",
        "overall risk", "why high disease risk", "risk score", "at risk", "in danger", "risk level"
    ]
    if any(k in q for k in risk_keywords) or ("risk" in q and any(w in q for w in ["why", "crop", "tomato", "high", "alert", "field", "level"])):
        return {
            "intent": "CROP_RISK",
            "domain": "AGRISENSE",
            "confidence": 0.95,
            "entities": {
                "crop": "tomato"
            },
            "required_sources": ["SENSOR", "WEATHER", "DISEASE_SCAN", "CROP_HISTORY", "RAG"],
            "sources": ["SENSOR", "WEATHER", "DISEASE_SCAN", "CROP_HISTORY", "RAG"],
            "optional_sources": [],
            "rag_required": True,
            "requires_decision_engine": True,
            "requires_clarification": False,
            "reason": "Comprehensive crop risk assessment synthesizes visual scan, humidity, and forecast rain."
        }

    # -------------------------------------------------------------------------
    # 8. CROP STATUS / GENERAL HEALTH OVERVIEW
    # -------------------------------------------------------------------------
    status_keywords = [
        "how is my crop doing", "crop status", "how is my plant", "field summary",
        "how are my tomatoes", "status update", "farm status"
    ]
    if any(k in q for k in status_keywords):
        return {
            "intent": "CROP_STATUS",
            "domain": "AGRISENSE",
            "confidence": 0.94,
            "entities": {
                "crop": "tomato"
            },
            "required_sources": ["SENSOR", "WEATHER", "DISEASE_SCAN", "CROP_HISTORY"],
            "sources": ["SENSOR", "WEATHER", "DISEASE_SCAN", "CROP_HISTORY"],
            "optional_sources": ["RAG"],
            "rag_required": False,
            "requires_decision_engine": True,
            "requires_clarification": False,
            "reason": "Holistic status summary combining live sensors, upcoming weather, and scan results."
        }

    # -------------------------------------------------------------------------
    # 9. DISEASE / SYMPTOMS / SPRAY (Disease Scan + RAG)
    # -------------------------------------------------------------------------
    disease_keywords = [
        "disease", "blight", "early blight", "late blight", "septoria", "leaf mold",
        "bacterial spot", "mosaic", "yellow leaf curl", "spider mites", "fungus",
        "spots on leaf", "white mold", "spray", "fungicide", "treatment", "cure",
        "infected", "infection", "pesticide", "leaf yellowing", "yellow leaves", "curl",
        "leaves turning yellow", "why are leaves yellow"
    ]
    if any(k in q for k in disease_keywords):
        return {
            "intent": "DISEASE",
            "domain": "AGRICULTURE",
            "confidence": 0.96,
            "entities": {
                "crop": "tomato",
                "topic": "disease_management"
            },
            "required_sources": ["DISEASE_SCAN", "RAG"],
            "sources": ["DISEASE_SCAN", "RAG"],
            "optional_sources": ["SENSOR"],
            "rag_required": True,
            "requires_decision_engine": False,
            "requires_clarification": False,
            "reason": "Pathology inquiry requires tomato disease RAG retrieval and scan history."
        }

    # -------------------------------------------------------------------------
    # 10. GENERAL AGRICULTURE (Legitimate farming questions falling back to RAG)
    # -------------------------------------------------------------------------
    return {
        "intent": "GENERAL_AGRICULTURE",
        "domain": "AGRICULTURE",
        "confidence": 0.85,
        "entities": {
            "crop": "tomato"
        },
        "required_sources": ["RAG"],
        "sources": ["RAG"],
        "optional_sources": [],
        "rag_required": True,
        "requires_decision_engine": False,
        "requires_clarification": False,
        "reason": "General agronomic question routed to domain knowledge base."
    }
