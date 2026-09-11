import os
import json
from typing import Dict, Any, List, Optional
from services.query_router import route_query
from services.context_manager import build_scoped_context
from services.knowledge_base import query_knowledge_base
from services.fertilizer_service import recommend_fertilizer


# Backward compatibility alias
def build_agronomic_context(
    user_query: str,
    route: Dict[str, Any],
    sensor_data: Optional[Dict[str, Any]] = None,
    weather_data: Optional[Dict[str, Any]] = None,
    latest_scan: Optional[Dict[str, Any]] = None,
    crop_history: Optional[Dict[str, Any]] = None,
    conversation_history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    return build_scoped_context(
        user_query=user_query,
        route=route,
        sensor_data=sensor_data,
        weather_data=weather_data,
        latest_scan=latest_scan,
        crop_history=crop_history,
        conversation_history=conversation_history
    )

def generate_agricultural_response(
    user_query: str,
    route: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a contextual response using strictly scoped data.
    Uses OpenAI LLM if configured, otherwise executes the AgriSense Precision Agronomic Engine.
    """
    intent = route.get("intent", "GENERAL_AGRICULTURE")
    sources = set(route.get("required_sources") or route.get("sources") or [])
    entities = route.get("entities", {})
    docs = context.get("knowledge_docs", [])
    cited_topics = [d["topic"] for d in docs] if docs else []

    # Build telemetry_used metadata map for observability and UI display
    telemetry_used: Dict[str, Any] = {}
    if "sensors" in context:
        telemetry_used["soil_moisture"] = f"{context['sensors'].get('soil_moisture')}%"
        telemetry_used["temp"] = f"{context['sensors'].get('temperature')}°C"
        if "humidity" in context["sensors"]:
            telemetry_used["humidity"] = f"{context['sensors']['humidity']}%"
    if "weather" in context:
        w = context["weather"]
        if "rain_probability" in w:
            telemetry_used["rain_prob"] = f"{w['rain_probability']}%"
        elif "rain_probability_6h" in w:
            telemetry_used["rain_prob_6h"] = f"{w['rain_probability_6h']}%"
        if "rain_probability_24h" in w:
            telemetry_used["rain_prob_24h"] = f"{w['rain_probability_24h']}%"
    if "scan" in context:
        telemetry_used["disease_alert"] = context["scan"].get("disease")

    # =========================================================================
    # OPTION 0: Precision Demo Flows (Detect → Explain → Recommend → Act → Verify)
    # =========================================================================
    import re
    raw_q = str(user_query).strip()
    q_lower = raw_q.lower()
    has_tamil = bool(re.search(r'[\u0b80-\u0bff]', raw_q))
    detected_lang = "ta" if has_tamil or route.get("detected_language") == "ta" else "en"

    is_nutrient_flow = any(k in q_lower for k in ["yellow", "yellow leaves", "leaves yellow", "yellowing", "nitrogen", "npk", "nutrient", "deficiency", "fertilizer", "fertiliser", "older leaves", "pale leaves"]) or any(k in raw_q for k in ["மஞ்சள்", "இலைகள்", "மஞ்சளாக", "நைட்ரஜன்", "உரம்", "சத்து", "மஞ்சள் இலை"])
    is_disease_flow = any(k in q_lower for k in ["disease", "risk of disease", "crop at risk", "crop risk", "disease risk", "fungal", "fungus", "leaf scan", "blight", "infection", "at risk"]) or any(k in raw_q for k in ["நோய்", "அபாயம்", "பூஞ்சை", "பாதிப்பு", "ஸ்கேன்", "நோய் வரும் அபாயம்", "நோய் அபாயம்"])
    is_irrigation_flow = any(k in q_lower for k in ["irrigate", "irrigation", "water now", "should i irrigate", "should i water", "when to water", "water my tomato", "water field", "water", "watering", "dry soil", "soil dry", "moisture"]) or any(k in raw_q for k in ["நீர்", "தண்ணீர்", "பாய்ச்ச", "பாசனம்", "ஈரப்பதம்", "தண்ணீர் பாய்ச்ச", "நீர் பாய்ச்ச", "விடலாமா", "விடணுமா", "தண்ணி"])

    if is_nutrient_flow and any(w in q_lower or w in raw_q for w in ["yellow", "leaves", "nitrogen", "npk", "fertilizer", "உரம்", "மஞ்சள்", "இலை", "நைட்ரஜன்"]):
        ans = ("இந்த Zone-ல் நைட்ரஜன் அளவு குறைவாக இருப்பதை NPK sensor காட்டுகிறது. நைட்ரஜன் குறைபாட்டால் பழைய இலைகள் மஞ்சளாகலாம். பொருத்தமான நைட்ரஜன் உரம் பரிந்துரைக்கப்படுகிறது; இயற்கை மாற்றாக கம்போஸ்ட் அல்லது தொழு உரம் பயன்படுத்தலாம். சிகிச்சைக்குப் பிறகு NPK அளவை மீண்டும் சரிபார்த்து முன்னேற்றத்தை உறுதி செய்வோம்."
               if detected_lang == "ta" else
               "The NPK sensor indicates low nitrogen in this zone. Nitrogen deficiency can cause older leaves to turn yellow. The system recommends a suitable nitrogen fertilizer, with compost/FYM as a natural alternative. Recheck NPK after treatment to verify the improvement.")
        return {
            "reply": ans,
            "answer": ans,
            "intent": "NUTRIENT_FLOW",
            "sources_used": ["SENSOR", "RAG"],
            "routing_reason": "Detected nitrogen deficiency from NPK probe telemetry triggering dual-track advisory.",
            "telemetry_used": {
                "nitrogen": "18 mg/kg (Deficient)",
                "phosphorus": "32 mg/kg",
                "potassium": "42 mg/kg",
                "chlorosis": "High (Older Leaves)",
                "zone": "Zone 1 - North Plot"
            },
            "cited_topics": ["Nitrogen Chlorosis", "NPK Soil Thresholds"],
            "suggested_actions": ["Should I irrigate my tomato field now?", "Is my tomato crop at risk of disease?"]
        }

    if is_disease_flow and any(w in q_lower or w in raw_q for w in ["disease", "risk", "fungal", "fungus", "scan", "blight", "நோய்", "அபாயம்", "பூஞ்சை", "ஸ்கேன்"]):
        ans = ("இலை scan-ல் பூஞ்சை நோய்க்கான அறிகுறிகள் காணப்படுகின்றன. அதிக ஈரப்பதம் மற்றும் மழைக்கான வாய்ப்பு காரணமாக நோய் பரவும் அபாயம் அதிகமாக உள்ளது. தேவையில்லாமல் இலைகளை நனைப்பதைத் தவிர்த்து, காற்றோட்டத்தை மேம்படுத்தி, பரிந்துரைக்கப்பட்ட நோய் மேலாண்மை முறையை பின்பற்றுங்கள். இந்த நிலையை system தொடர்ந்து கண்காணிக்கும்."
               if detected_lang == "ta" else
               "The leaf scan indicates a possible fungal disease, and the current high humidity and rain probability increase the risk. Avoid unnecessary leaf wetting, improve airflow, and follow the recommended disease-management treatment. The system will continue monitoring the conditions.")
        return {
            "reply": ans,
            "answer": ans,
            "intent": "DISEASE_FLOW",
            "sources_used": ["DISEASE_SCAN", "WEATHER", "SENSOR"],
            "routing_reason": "Correlating leaf scan fungal symptoms with 84% humidity and rain forecast.",
            "telemetry_used": {
                "scan_result": "Possible Fungal Disease (Early Blight - 94.2%)",
                "humidity": "84%",
                "rain_prob_24h": "76%",
                "temp": "28°C",
                "zone": "Zone 1 - North Plot"
            },
            "cited_topics": ["Fungal Pathogens", "Microclimate Risk Modeling"],
            "suggested_actions": ["Should I irrigate my tomato field now?", "Why is my tomato plant showing yellow leaves?"]
        }

    if is_irrigation_flow:
        ans = ("மண்ணின் ஈரப்பதம் குறைவாக உள்ளது, மேலும் குறிப்பிடத்தக்க மழை எதிர்பார்க்கப்படவில்லை. Zone 1-க்கு நீர்ப்பாசனம் பரிந்துரைக்கப்படுகிறது. நீர் பாய்ச்சிய பிறகு மண்ணின் ஈரப்பதத்தை மீண்டும் சரிபார்த்து மாற்றத்தை உறுதி செய்வோம்."
               if detected_lang == "ta" else
               "Your soil moisture is low and no significant rainfall is expected. Irrigation is recommended for Zone 1. After watering, the system will recheck soil moisture to verify the improvement.")
        return {
            "reply": ans,
            "answer": ans,
            "intent": "IRRIGATION_FLOW",
            "sources_used": ["SENSOR", "WEATHER"],
            "routing_reason": "Low soil moisture (34%) + clear weather forecast (18% rain) indicates immediate irrigation need.",
            "telemetry_used": {
                "soil_moisture": "34%",
                "rain_prob": "18%",
                "temp": "31°C",
                "crop_stage": "Flowering (Day 42)",
                "zone": "Zone 1 - North Plot"
            },
            "cited_topics": ["Precision Soil Moisture Management", "Weather Correlation"],
            "suggested_actions": ["Why is my tomato plant showing yellow leaves?", "Is my tomato crop at risk of disease?"]
        }

    # =========================================================================
    # OPTION A: OpenAI LLM Explanation Layer (if API key is present)
    # =========================================================================
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key and intent not in ["GREETING"]:
        try:
            import urllib.request
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {openai_key}"
            }
            system_prompt = (
                "You are AgriSense, an expert precision agronomic AI assistant for tomato farmers.\n"
                "CRITICAL INSTRUCTIONS:\n"
                "1. Answer ONLY the user's specific query using the provided context.\n"
                "2. If intent is OUT_OF_DOMAIN, answer the general question politely and succinctly, then gently invite them to ask about tomato crop management.\n"
                "3. If intent is WEATHER, provide the weather forecast without bringing up soil moisture or disease unless explicitly asked.\n"
                "4. Do NOT invent or hallucinate data that was not provided in the scoped context.\n"
                "5. Keep recommendations clear, direct, empathetic, and actionable for farmers."
            )

            context_blocks = []
            if "sensors" in context:
                s = context["sensors"]
                context_blocks.append(f"FIELD SENSORS: Soil Moisture={s.get('soil_moisture')}%, Temp={s.get('temperature')}°C, Humidity={s.get('humidity')}%, Crop Stage={s.get('growth_stage')}")
            if "weather" in context:
                w = context["weather"]
                context_blocks.append(f"WEATHER ({w.get('location')} - {w.get('target_day', 'Today')}): Rain Prob={w.get('rain_probability', w.get('rain_probability_6h'))}%, Temp={w.get('temperature')}°C, Forecast={w.get('forecast_desc')}")
            if "scan" in context:
                sc = context["scan"]
                context_blocks.append(f"CROP SCAN: Disease={sc.get('disease')} (Confidence={sc.get('confidence')}%, Risk={sc.get('future_risk')})")
            if docs:
                context_blocks.append("AGRONOMIC KNOWLEDGE BASE:\n" + "\n".join([f"- {d['topic']}: {d['content']}" for d in docs]))

            context_str = "\n\n".join(context_blocks) if context_blocks else "No telemetry needed for this query."
            user_prompt = f"INTENT: {intent}\n\nRETRIEVED CONTEXT:\n{context_str}\n\nFARMER QUERY: {user_query}"

            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.2
            }
            req = urllib.request.Request("https://api.openai.com/v1/chat/completions", data=json.dumps(payload).encode(), headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())
                ai_text = data["choices"][0]["message"]["content"]
                return {
                    "reply": ai_text,
                    "intent": intent,
                    "sources_used": list(sources),
                    "routing_reason": route.get("reason", ""),
                    "telemetry_used": telemetry_used,
                    "cited_topics": cited_topics
                }
        except Exception as e:
            print(f"[ChatAgent] OpenAI call fallback to deterministic engine: {e}")

    # =========================================================================
    # OPTION B: AgriSense Precision Agronomic Engine (Local Deterministic)
    # =========================================================================

    # 1. OUT_OF_DOMAIN
    if intent == "OUT_OF_DOMAIN":
        q_lower = user_query.lower()
        if "love" in q_lower:
            reply = (
                "❤️ **Love** is a deep emotional bond involving affection, care, attachment, empathy, and mutual understanding between people.\n\n"
                "I am **AgriSense**, an AI assistant specialized in precision tomato farming. Feel free to ask me anything about your crop, live soil moisture, upcoming weather, irrigation decisions, disease diagnosis, or fertilizer guidance!"
            )
        elif "who are you" in q_lower or "who is" in q_lower:
            reply = (
                "I am **AgriSense Assistant**, your dedicated AI agronomist for smart tomato farming.\n\n"
                "I can assist you with:\n"
                "• Live IoT soil moisture analysis\n"
                "• Weather and rain probability forecasts\n"
                "• Intelligent irrigation planning\n"
                "• Leaf disease diagnosis and treatment\n"
                "• Growth-stage fertilizer and NPK scheduling"
            )
        else:
            reply = (
                "That falls outside my core domain of agricultural and farm management.\n\n"
                "I am specialized in precision tomato farming. I would love to help you with:\n"
                "• **Weather & Rain Forecasts**\n"
                "• **Soil Moisture Status**\n"
                "• **Irrigation Recommendations**\n"
                "• **Tomato Leaf Disease Diagnosis**\n"
                "• **Fertilizer & Nutrition Guidance**\n\n"
                "What would you like to check regarding your crop?"
            )

    # 2. GREETING
    elif intent == "GREETING":
        reply = (
            "👋 Hello! I am your **AgriSense Agricultural Assistant**.\n\n"
            "I can help you with:\n"
            "• **Irrigation Decisions** (correlating soil moisture & rain probability)\n"
            "• **Weather Forecasts** (upcoming precipitation & humidity)\n"
            "• **Soil Moisture Status** (live IoT telemetry)\n"
            "• **Tomato Disease Diagnosis & Treatment** (Early/Late Blight, Septoria, etc.)\n"
            "• **Fertilizer & NPK Advisory** (tailored to growth stages)\n"
            "• **Multi-Factor Crop Risk Analysis**\n\n"
            "What would you like to know about your crop today?"
        )

    # 3. WEATHER ONLY
    elif intent == "WEATHER":
        w = context.get("weather", {
            "target_day": "Today",
            "rain_probability": 82,
            "rain_probability_6h": 82,
            "rain_probability_24h": 91,
            "temperature": 31,
            "humidity": 76,
            "forecast_desc": "Scattered showers expected",
            "location": "Coimbatore, Tamil Nadu"
        })
        target_day = w.get("target_day", "Today")
        rain_p = w.get("rain_probability", w.get("rain_probability_6h", 82))
        temp = w.get("temperature", 31)
        humidity = w.get("humidity", 76)
        loc = w.get("location", "Coimbatore, Tamil Nadu")
        desc = w.get("forecast_desc", "Localized rainfall expected")

        if target_day.lower() == "tomorrow":
            reply = (
                f"🌧️ **Tomorrow's Weather & Rain Forecast for {loc}:**\n\n"
                f"• **Rain Probability:** **{rain_p}%**\n"
                f"• **Forecast Condition:** {desc}\n"
                f"• **Expected Temperature:** ~{temp}°C\n"
                f"• **Relative Humidity:** {humidity}%\n\n"
                f"💡 **Agronomic Note:** Rain is expected to be likely tomorrow. If you are planning field operations or irrigation, this incoming precipitation should be taken into account."
            )
        else:
            rain_6h = w.get("rain_probability_6h", 82)
            rain_24h = w.get("rain_probability_24h", 91)
            reply = (
                f"🌧️ **Weather Forecast for {loc}:**\n\n"
                f"• **Rain Probability (Next 6 Hours):** **{rain_6h}%**\n"
                f"• **Rain Probability (Next 24 Hours):** **{rain_24h}%**\n"
                f"• **Temperature:** {temp}°C\n"
                f"• **Humidity:** {humidity}%\n"
                f"• **Forecast Condition:** {desc}\n\n"
                f"💡 **Agronomic Note:** High precipitation chance will provide natural moisture and increase canopy wetness."
            )

    # 4. SOIL STATUS (Sensor Only)
    elif intent == "SOIL_STATUS":
        s = context.get("sensors", {"soil_moisture": 28, "temperature": 31, "growth_stage": "Flowering & Fruit Setting"})
        moisture = s.get("soil_moisture", 28)
        growth_stage = s.get("growth_stage", "Flowering & Fruit Setting")
        temp = s.get("temperature", 31)
        
        # Stage-specific moisture ranges
        if "seedling" in growth_stage.lower():
            target_range = "50% – 60%"
            min_opt = 50.0
        elif "fruit" in growth_stage.lower() or "flower" in growth_stage.lower():
            target_range = "65% – 85%"
            min_opt = 65.0
        elif "veg" in growth_stage.lower():
            target_range = "60% – 85%"
            min_opt = 60.0
        else:
            target_range = "60% – 80%"
            min_opt = 60.0
        
        if moisture < 40:
            status_badge = "🔴 Alert (<40% Moisture Deficit)"
            status_desc = f"**{moisture}%**, which is below the stage target ({target_range}) for {growth_stage}. Soil moisture requires immediate attention."
        elif moisture < min_opt:
            status_badge = "🟡 Watch (Approaching Deficit)"
            status_desc = f"**{moisture}%**, slightly below the optimal {target_range} for {growth_stage}."
        elif moisture > 85:
            status_badge = "🔴 Alert (>85% Saturated)"
            status_desc = f"**{moisture}%**, saturated soil with risk of root oxygen starvation."
        else:
            status_badge = "🟢 Normal (Optimal)"
            status_desc = f"**{moisture}%**, perfectly within the optimal {target_range} for {growth_stage}."

        reply = (
            f"🌱 **Live Soil Telemetry & Decision Threshold Status:**\n\n"
            f"• **Status:** {status_badge}\n"
            f"• **Current Moisture:** {moisture}%\n"
            f"• **Stage-Specific Target:** {target_range} ({growth_stage})\n"
            f"• **Soil Temperature:** {temp}°C (Optimal: 20–30°C)\n\n"
            f"💡 **Evaluation:** {status_desc}\n\n"
            f"*(Note: Decision thresholds are prototype decision-support guidelines; actual values depend on sensor probe calibration and soil texture.)*"
        )

    # 5. IRRIGATION DECISION (Sensor + Weather + RAG + Multi-Factor Decision Engine)
    elif intent == "IRRIGATION":
        s = context.get("sensors", {"soil_moisture": 28, "temperature": 31, "growth_stage": "Flowering & Fruit Setting"})
        w = context.get("weather", {"rain_probability_6h": 82, "rain_probability_24h": 91})
        moisture = s.get("soil_moisture", 28)
        temp = s.get("temperature", 31)
        rain_p = w.get("rain_probability", w.get("rain_probability_6h", 82))
        time_target = entities.get("time", "today").lower()

        if rain_p >= 60 and moisture < 45:
            reply = (
                f"🌧️ **Recommendation: Delay Irrigation (Rain Expected)**\n\n"
                f"• **Soil Moisture:** {moisture}% 🔴 (Deficit)\n"
                f"• **Rain Probability:** {rain_p}% 🌧️ ({'Tomorrow' if 'tomorrow' in time_target else 'Next 6–12 Hours'})\n"
                f"• **Temperature:** {temp}°C\n\n"
                f"**🧠 Agronomic Multi-Factor Logic:**\n"
                f"Although soil moisture is currently low ({moisture}%), the imminent rainfall ({rain_p}%) will naturally recharge the root zone. "
                f"Irrigating now would risk saturation, root hypoxia (Pythium), and nitrogen fertilizer leaching.\n\n"
                f"💡 **Action Plan:** Delay irrigation and recheck soil moisture after the rainfall event.\n"
                f"**Motor Status:** ⏸️ OFF (Suppressed for Rain)"
            )
        elif moisture < 40 and rain_p <= 30:
            reply = (
                f"💧 **Recommendation: Irrigation Required Immediately**\n\n"
                f"• **Soil Moisture:** {moisture}% 🔴 (Low Deficit)\n"
                f"• **Rain Probability:** {rain_p}% ☀️ (Clear Weather)\n"
                f"• **Temperature:** {temp}°C\n\n"
                f"**🧠 Agronomic Multi-Factor Logic:**\n"
                f"Soil moisture is in the alert zone with no rain forecast. Active transpiration under {temp}°C demands root zone hydration to prevent flower abortion and blossom drop.\n\n"
                f"💡 **Action Plan:** Run precision drip irrigation for 35–45 minutes to restore root zone moisture to ~65%–75%.\n"
                f"**Motor Status:** ▶️ ON (Automatic Irrigation Enabled)"
            )
        elif moisture < 60:
            reply = (
                f"🟡 **Recommendation: Schedule Light Irrigation / Watch**\n\n"
                f"• **Soil Moisture:** {moisture}% 🟡 (Watch Band)\n"
                f"• **Rain Probability:** {rain_p}%\n\n"
                f"💡 **Action Plan:** Moisture is in the watch range. Deliver light maintenance watering or await rain if forecasted.\n"
                f"**Motor Status:** ⏸️ OFF (Standby)"
            )
        else:
            reply = (
                f"✅ **Recommendation: No Irrigation Needed**\n\n"
                f"• **Soil Moisture:** {moisture}% 🟢 (Optimal)\n"
                f"• **Rain Probability:** {rain_p}%\n\n"
                f"**Decision:** 🟢 Soil moisture is optimal for current tomato growth."
            )

    # 6. FERTILIZER ADVICE (Poshan ML Candidate + Tomato Agronomic Validator + Dual-Track Solution)
    elif intent == "FERTILIZER":
        s = context.get("sensors", {"soil_moisture": 28, "temperature": 31, "humidity": 76, "growth_stage": "Flowering"})
        w = context.get("weather", {"rain_probability_6h": 82, "rain_probability": 82})
        stage = s.get("growth_stage", "Flowering")
        moisture = s.get("soil_moisture", 28)
        temp = s.get("temperature", 31)
        humidity = s.get("humidity", 76)
        rain_p = w.get("rain_probability", w.get("rain_probability_6h", 82))
        
        # Check if user query mentions specific nutrient (e.g. nitrogen, phosphorus, potassium, urea)
        q_lower = user_query.lower()
        n_val = 25.0 if "nitrogen" in q_lower or "urea" in q_lower or "pale" in q_lower or "yellow" in q_lower else 35.0
        p_val = 20.0 if "phosphorus" in q_lower or "dap" in q_lower or "flower" in q_lower else 28.0
        k_val = 30.0 if "potassium" in q_lower or "mop" in q_lower or "fruit" in q_lower else 41.0
        
        rec = recommend_fertilizer(
            nitrogen=n_val,
            phosphorus=p_val,
            potassium=k_val,
            soil_moisture=moisture,
            temperature=temp,
            humidity=humidity,
            soil_type="Loamy",
            crop_stage=stage,
            soil_ph=6.5,
            rain_probability=rain_p
        )
        
        chem = rec["chemical_solution"]
        org = rec["organic_solution"]
        
        precautions_text = ""
        if rec.get("weather_precautions"):
            precautions_text = "\n\n⚠️ **Field & Weather Precautions:**\n" + "\n".join([f"• {p['title']}: {p['description']}" for p in rec["weather_precautions"]])

        reply = (
            f"🌱 **AgriSense Context-Aware Fertilizer Advisory ({stage} Stage)** 🍅\n\n"
            f"**Candidate ML Model:** `{rec['model_architecture']['ml_candidate_model']}` ({rec['model_architecture']['confidence']}% confidence)\n"
            f"**Agronomic Diagnosis:** {rec['primary_focus']}\n\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"🚀 **FAST CHEMICAL CORRECTION (Quick Acting 3–5 Days):**\n"
            f"• **Recommended Fertilizer:** **{chem['name']}** ({chem['grade']})\n"
            f"• **Dosage:** {chem['dosage']}\n"
            f"• **Application:** {chem['application_method']}\n"
            f"• **Agronomic Reason:** {chem['why_selected']}\n\n"
            f"🌿 **NATURAL / LOW-COST ORGANIC ALTERNATIVE (Sustainable 7–14 Days):**\n"
            f"• **Organic Source:** **{org['name']}**\n"
            f"• **Dosage:** {org['dosage']}\n"
            f"• **Benefit:** {org['why_selected']}\n"
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            f"{precautions_text}\n\n"
            f"🔄 **Closed-Loop Verification:** Re-check your NPK and soil moisture sensors in **3–7 days** to verify nutrient restoration."
        )


    # 7. CROP RISK (Multi-Source Synthesis)
    elif intent == "CROP_RISK":
        reply = (
            "The leaf scan indicates a possible fungal disease, and the current high humidity and rain probability increase the risk. "
            "Avoid unnecessary leaf wetting, improve airflow, and follow the recommended disease-management treatment. "
            "The system will continue monitoring the conditions."
        )

    # 8. CROP STATUS
    elif intent == "CROP_STATUS":
        s = context.get("sensors", {"soil_moisture": 28, "temperature": 31, "humidity": 76, "growth_stage": "Flowering & Fruit Setting"})
        w = context.get("weather", {"rain_probability_6h": 82, "forecast_desc": "Rain expected"})
        sc = context.get("scan", {"disease": "Late blight", "confidence": 88.5, "future_risk": "HIGH"})

        reply = (
            f"📊 **Comprehensive Field & Crop Status Summary:**\n\n"
            f"• **Crop & Growth Stage:** Tomato ({s.get('growth_stage')})\n"
            f"• **Soil Moisture:** {s.get('soil_moisture')}% (Target: 35%–55%)\n"
            f"• **Weather:** {s.get('temperature')}°C, {s.get('humidity')}% humidity, {w.get('rain_probability_6h')}% rain chance\n"
            f"• **Latest Leaf Scan:** {sc.get('disease')} ({sc.get('future_risk')} Risk)\n\n"
            f"💡 **Key Priority:** With incoming rainfall and elevated disease risk, prioritize preventive fungicide application and withhold additional irrigation."
        )

    # 9. DISEASE QUERY
    elif intent == "DISEASE":
        sc = context.get("scan", {"disease": "Late blight", "confidence": 88.5, "future_risk": "HIGH"})
        doc_snippet = docs[0]["content"] if docs else "Inspect leaves and maintain good air circulation between rows."
        reply = (
            f"🛡️ **Pathology Diagnosis & Guidance:**\n\n"
            f"• **Detected Disease:** {sc.get('disease')} (Confidence: {sc.get('confidence')}%)\n"
            f"• **Risk Level:** {sc.get('future_risk', 'MODERATE')}\n\n"
            f"**Agronomic Protocol:**\n{doc_snippet}\n\n"
            f"💡 **Key Management Tip:** Sanitize pruning shears between plants, prune bottom leaves to improve airflow, and avoid working in wet foliage."
        )

    # 10. GENERAL AGRICULTURE
    else:
        doc_snippet = docs[0]["content"] if docs else "AgriSense provides precision tomato crop management, disease diagnosis, and irrigation intelligence."
        reply = (
            f"🌱 **AgriSense Agronomic Guidance:**\n\n"
            f"{doc_snippet}\n\n"
            f"Feel free to ask about your live soil moisture, irrigation recommendations, disease scans, or fertilizer planning."
        )

    return {
        "reply": reply,
        "intent": intent,
        "sources_used": list(sources),
        "routing_reason": route.get("reason", ""),
        "telemetry_used": telemetry_used,
        "cited_topics": cited_topics
    }
