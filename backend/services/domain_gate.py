"""
AgriSense Hard Domain Gate
Enforces strict domain boundaries before any RAG, context retrieval, or LLM reasoning.
Allowed domains:
- TOMATO_CROP, SOIL, NPK, IRRIGATION, WATER_QUALITY, WEATHER, DISEASE, PEST,
  FERTILIZER, CROP_HEALTH, SENSORS, FIELD_STATUS, FARM_HISTORY, GENERAL_TOMATO_AGRONOMY

Any other topic is immediately rejected with a polite localized boundary response.
"""

import re
from typing import Dict, Any, Tuple

# Comprehensive Agricultural Keywords Whitelist (English, Tamil, Hindi, Telugu, Tanglish)
AGRI_WHITELIST_KEYWORDS = [
    # English
    "crop", "tomato", "plant", "leaf", "leaves", "stem", "root", "soil", "moisture", "water",
    "irrigate", "irrigation", "motor", "pump", "valve", "drip", "sprinkler", "fertigation",
    "fertilizer", "nutrient", "npk", "nitrogen", "phosphorus", "potassium", "urea", "dap", "mop", "sop",
    "fym", "compost", "manure", "neem", "zinc", "calcium", "magnesium", "boron", "ph", "ec", "salinity",
    "disease", "blight", "early blight", "late blight", "leaf curl", "yellow leaf", "septoria", "bacterial spot",
    "wilt", "fusarium", "canker", "mosaic", "pest", "whitefly", "aphid", "thrips", "caterpillar", "worm",
    "fungus", "fungicide", "spray", "pesticide", "organic", "trichoderma", "copper", "mancozeb",
    "weather", "rain", "rainfall", "temperature", "temp", "humidity", "heat", "sun", "cloud", "wind",
    "forecast", "et0", "evapotranspiration", "field", "farm", "farmer", "agriculture", "agronomy", "agrisense",
    "yield", "harvest", "seedling", "vegetative", "flowering", "fruit", "fruiting", "bloom", "ripening",
    "sensor", "probe", "telemetry", "battery", "node", "esp32", "tank", "borewell", "alert", "threshold",
    
    # Tamil & Tanglish
    "தக்காளி", "பயிர்", "மண்", "ஈரப்பதம்", "தண்ணீர்", "நீர்", "பாசனம்", "சொட்டுநீர்", "மோட்டார்", "பம்ப்",
    "உரம்", "யூரியா", "டிஏபி", "பொட்டாஷ்", "இயற்கை", "சாணம்", "மண்புழு", "வேப்பங்கொட்டை", "தொழுவுரம்",
    "நோய்", "பிளைட்", "இலை", "புள்ளி", "மஞ்சள்", "சுருட்டை", "பூச்சி", "வெள்ளை ஈ", "புழு", "மருந்து",
    "தெளிப்பு", "பூஞ்சாணம்", "வானிலை", "மழை", "வெயில்", "வெப்பநிலை", "காற்றழுத்தம்", "விவசாயம்", "விவசாயி",
    "வயல்", "தோட்டம்", "பூ", "காய்", "பழம்", "அறுவடை", "செடி", "கிணறு", "போர்", "நாற்று",
    "thakkali", "thanni", "neer", "paasanam", "eerappatham", "urram", "noi", "marunthu", "mazhai", "vivasayam",
    "kaai", "poo", "ilai", "sethi", "man", "chettu", "thottam",
    
    # Hindi
    "टमाटर", "फसल", "पौधा", "मिट्टी", "नमी", "पानी", "सिंचाई", "मोटर", "पंप", "खाद", "उर्वरक", "यूरिया",
    "रोग", "पत्ता", "पीला", "कीट", "दवा", "छिड़काव", "मौसम", "बारिश", "तापमान", "खेत", "किसान", "उपज",
    "tamatar", "fasal", "mitti", "nami", "paani", "sinchai", "khad", "khet", "kisaan", "barish",
    
    # Telugu
    "టమాట", "పంట", "మొక్క", "నేల", "తేమ", "నీరు", "సాగునీరు", "మోటారు", "ఎరువు", "తెగులు", "ఆకు",
    "పురుగు", "మందు", "వాతావరణం", "వర్షం", "ఉష్ణోగ్రత", "పొలం", "రైతు", "దిగుబడి",
    "tamata", "neelu", "eruvulu", "tevalu"
]

# Explicit Non-Agricultural / Out-of-Bound Triggers
OUT_OF_BOUND_PATTERNS = [
    r"\b(who is elon musk|who is president|who is prime minister|who won|election|cricket|football|messi|ronaldo)\b",
    r"\b(write a python|write code|java program|c\+\+|javascript code|debug this code|generate html|sql query)\b",
    r"\b(what is love|meaning of life|tell me a joke|sing a song|movie review|capital of france|who is)\b",
    r"\b(bitcoin|crypto|stock market|shares|forex|invest money|credit card|loan)\b",
    r"\b(translate to french|recipe for pizza|how to make biryani|cook pasta|car engine|fix windows)\b"
]

# Standard Localized Out-of-Domain Boundary Responses
OOD_RESPONSES = {
    "en": "🌱 I'm focused on your tomato farm. Ask me about crops, disease, irrigation, nutrients, weather, or soil.",
    "ta": "🌱 நான் உங்கள் தக்காளி விவசாயம் தொடர்பான கேள்விகளுக்கு மட்டும் உதவ முடியும். பயிர், நோய், பாசனம், உரம், வானிலை அல்லது மண் பற்றி கேளுங்கள்.",
    "hi": "🌱 मैं केवल आपके टमाटर की खेती से संबंधित प्रश्नों में ही मदद कर सकता हूँ। कृपया फसल, रोग, सिंचाई, खाद, मौसम या मिट्टी के बारे में पूछें।",
    "te": "🌱 నేను మీ టమోటా వ్యవసాయ ప్రశ్నలకు మాత్రమే సహాయం చేయగలను. దయచేసి పంట, తెగులు, సాగునీరు, ఎరువులు, వాతావరణం లేదా నేల గురించి అడగండి."
}

def evaluate_domain_gate(query: str, active_language: str = "en") -> Dict[str, Any]:
    """
    Hard Domain Gate Evaluator.
    Returns:
    {
        "allowed": bool,
        "domain": "AGRICULTURE" | "OUT_OF_DOMAIN",
        "confidence": float,
        "boundary_response": Optional[str],
        "reason": str
    }
    """
    q_clean = query.strip()
    q_lower = q_clean.lower()
    lang = active_language[:2].lower() if active_language else "en"

    if not q_clean:
        return {
            "allowed": True,
            "domain": "AGRICULTURE",
            "confidence": 1.0,
            "boundary_response": None,
            "reason": "EMPTY_INPUT"
        }

    # 1. Check for explicit Out-of-Domain patterns
    for pat in OUT_OF_BOUND_PATTERNS:
        if re.search(pat, q_lower):
            return {
                "allowed": False,
                "domain": "OUT_OF_DOMAIN",
                "confidence": 0.99,
                "boundary_response": OOD_RESPONSES.get(lang, OOD_RESPONSES["en"]),
                "reason": f"Explicit OOD pattern matched: {pat}"
            }

    # 2. Conversational greetings and bot identity questions (Always allowed within agricultural assistant scope)
    greetings = [
        "hi", "hello", "hey", "vanakkam", "namaste", "namaskaram",
        "good morning", "good evening", "agrisense", "who are you",
        "வணக்கம்", "नमस्ते", "నమస్కారం"
    ]
    if any(q_lower == g or q_lower.startswith(g + " ") or q_lower.startswith(g + ",") for g in greetings):
        return {
            "allowed": True,
            "domain": "AGRICULTURE",
            "confidence": 0.98,
            "boundary_response": None,
            "reason": "CONVERSATIONAL_GREETING"
        }

    # 3. Check for whitelist agricultural keyword match
    for kw in AGRI_WHITELIST_KEYWORDS:
        if kw in q_lower:
            return {
                "allowed": True,
                "domain": "AGRICULTURE",
                "confidence": 0.95,
                "boundary_response": None,
                "reason": f"Agricultural keyword matched: {kw}"
            }

    # 4. Indic Script Check (Tamil / Devanagari / Telugu characters)
    indic_chars = sum(1 for c in q_clean if '\u0B80' <= c <= '\u0BFF' or '\u0900' <= c <= '\u097F' or '\u0C00' <= c <= '\u0C7F')
    if indic_chars >= 2:
        for kw in AGRI_WHITELIST_KEYWORDS:
            if kw in q_clean:
                return {
                    "allowed": True,
                    "domain": "AGRICULTURE",
                    "confidence": 0.95,
                    "boundary_response": None,
                    "reason": "Indic script agricultural keyword match"
                }

    # 5. Non-agricultural query rejected
    return {
        "allowed": False,
        "domain": "OUT_OF_DOMAIN",
        "confidence": 0.99,
        "boundary_response": OOD_RESPONSES.get(lang, OOD_RESPONSES["en"]),
        "reason": "No agricultural relevance found"
    }

# Backward compatibility alias
def check_domain_gate(query: str) -> Tuple[bool, str]:
    res = evaluate_domain_gate(query)
    return res["allowed"], res["reason"]
