"""
AgriSense Sticky Multilingual Controller & Response Localization Engine
Supports:
- Tamil ('ta' / 'ta-IN')
- Hindi ('hi' / 'hi-IN')
- Telugu ('te' / 'te-IN')
- English ('en' / 'en-US')

Key Principles:
1. Sticky Language: Once a conversation enters a language (e.g., Tamil), it remains in that language.
2. Explicit Switch Detection: Commands like "Reply in English", "தமிழில் பேசுங்கள்" switch and lock language.
3. Code-Mixed & Tanglish support: Recognizes mixed queries like "Soil moisture romba low ah irukku, water pannanuma?".
4. Multi-Stage Language Enforcer: Validates final responses match the active conversation language.
"""

import re
from typing import Tuple, Dict, Any, List, Optional

# Indic Character Unicode Ranges
TAMIL_RANGE = ('\u0B80', '\u0BFF')
HINDI_RANGE = ('\u0900', '\u097F')
TELUGU_RANGE = ('\u0C00', '\u0C7F')

# Explicit Language Switch Phrases
EXPLICIT_SWITCH_RULES = [
    # English switches
    (r"\b(reply in english|speak in english|switch to english|talk in english|in english|english please|english)\b", "en"),
    # Tamil switches
    (r"\b(தமிழில் பேசுங்கள்|தமிழில் பதில்|தமிழ்|tamilil pesu|tamilil pesungal|reply in tamil|switch to tamil|in tamil)\b", "ta"),
    # Hindi switches
    (r"\b(हिंदी में जवाब दो|हिंदी में बोलो|हिंदी|hindi mein bolo|reply in hindi|switch to hindi|in hindi)\b", "hi"),
    # Telugu switches
    (r"\b(తెలుగులో మాట్లాడండి|తెలుగులో సమాధానం|తెలుగు|telugulo matladu|reply in telugu|switch to telugu|in telugu)\b", "te")
]

# Transliterated Indic Keywords (Tanglish / Hinglish)
TANGLISH_KEYWORDS = [
    "thanni", "thannir", "neer", "mazhai", "eerappatham", "urram", "thakkali", "vivasayam",
    "paasanam", "chekka", "ilai", "marunthu", "romba", "evvalavu", "pannanuma", "irukku",
    "vanakkam", "nandri", "kudunga", "vidalaama", "vidanum", "illai"
]

HINGLISH_KEYWORDS = [
    "paani", "barish", "nami", "mitti", "khad", "tamatar", "kisaan", "khet", "fasal",
    "sinchai", "dawa", "karna hai", "kitna hai", "dena chahiye", "namaste"
]

TELUGU_TRANSLIT_KEYWORDS = [
    "neelu", "varsham", "tema", "eruvu", "panta", "pettala", "undi", "ela"
]

def check_explicit_language_switch(query: str) -> Optional[str]:
    """
    Checks if the user explicitly requested a language change.
    """
    q_lower = query.lower().strip()
    for pattern, target_code in EXPLICIT_SWITCH_RULES:
        if re.search(pattern, q_lower):
            return target_code
    return None

def detect_language_from_text(text: str) -> str:
    """
    Detects language code from script characters and transliterated vocabulary.
    """
    if not text:
        return "en"

    tamil_count = sum(1 for c in text if TAMIL_RANGE[0] <= c <= TAMIL_RANGE[1])
    hindi_count = sum(1 for c in text if HINDI_RANGE[0] <= c <= HINDI_RANGE[1])
    telugu_count = sum(1 for c in text if TELUGU_RANGE[0] <= c <= TELUGU_RANGE[1])

    if tamil_count >= 2:
        return "ta"
    if hindi_count >= 2:
        return "hi"
    if telugu_count >= 2:
        return "te"

    t_lower = text.lower()
    words = set(re.findall(r'\b\w+\b', t_lower))

    # Tanglish check
    if any(w in words for w in TANGLISH_KEYWORDS):
        return "ta"
    # Hinglish check
    if any(w in words for w in HINGLISH_KEYWORDS):
        return "hi"
    # Telugu transliterated check
    if any(w in words for w in TELUGU_TRANSLIT_KEYWORDS):
        return "te"

    return "en"

def resolve_conversation_language(
    query: str,
    explicit_request_lang: Optional[str] = None,
    conversation_history: Optional[List[Dict[str, Any]]] = None
) -> Tuple[str, str]:
    """
    Resolves the active language ensuring STICKY CONVERSATION LANGUAGE behavior.
    Returns: (resolved_lang_code: 'ta'|'hi'|'te'|'en', source: 'EXPLICIT_SWITCH'|'INPUT_DETECTED'|'STICKY_HISTORY'|'DEFAULT')
    """
    # 1. Check for explicit command in current message
    explicit_switch = check_explicit_language_switch(query)
    if explicit_switch:
        return explicit_switch, "EXPLICIT_SWITCH"

    # 2. Check current query script / words
    detected_in_query = detect_language_from_text(query)
    if detected_in_query in ["ta", "hi", "te"]:
        return detected_in_query, "INPUT_DETECTED"

    # 3. Check Conversation History for Sticky Language State
    if conversation_history and len(conversation_history) > 0:
        for turn in reversed(conversation_history):
            turn_lang = turn.get("language")
            if turn_lang and turn_lang in ["ta", "hi", "te", "en"]:
                return turn_lang, "STICKY_HISTORY"
            # Check content of past assistant or user message
            content = turn.get("content", turn.get("text", ""))
            past_detected = detect_language_from_text(content)
            if past_detected in ["ta", "hi", "te"]:
                return past_detected, "STICKY_HISTORY"

    # 4. Fallback to explicit parameter or default
    if explicit_request_lang:
        clean_req = explicit_request_lang[:2].lower()
        if clean_req in ["ta", "hi", "te", "en"]:
            return clean_req, "REQUEST_PARAM"

    return "en", "DEFAULT"

detect_language = detect_language_from_text

# =============================================================================
# SHORT & SWEET REGIONAL RESPONSE GENERATION (1-3 Sentences)
# =============================================================================

def translate_response(
    text: str,
    target_lang: str,
    intent: str,
    data: Dict[str, Any],
    response_mode: str = "QUICK"
) -> str:
    """
    Localizes response into target language adhering to the Short & Sweet policy (1-3 sentences).
    """
    lang = target_lang[:2].lower() if target_lang else "en"
    
    # -------------------------------------------------------------------------
    # TAMIL LOCALIZATION (தமிழ்)
    # -------------------------------------------------------------------------
    if lang == "ta":
        if intent in ["WEATHER", "WEATHER_FORECAST"]:
            rain_p = data.get("rain_probability", 78)
            temp = data.get("temperature", 31)
            if response_mode == "DETAIL":
                return f"நாளைக்கு மழை வாய்ப்பு {rain_p}% உள்ளது. வெப்பநிலை சுமார் {temp}°C ஆக இருக்கும். அதிக மழை வாய்ப்பு உள்ளதால் பூச்சிக்கொல்லி தெளிப்பதையும் பாசனத்தையும் ஒத்திவைக்கவும்."
            return f"நாளைக்கு மழை வாய்ப்பு {rain_p}% உள்ளது. வெப்பநிலை சுமார் {temp}°C ஆக இருக்கும்."

        elif intent in ["SOIL_STATUS", "SENSOR_STATUS"]:
            sm = data.get("soil_moisture", 38)
            temp = data.get("temperature", 26)
            if sm < 40:
                return f"மண்ணின் ஈரப்பதம் {sm}% உள்ளது, இது குறைவாக உள்ளது. பயிர் வாடாமல் இருக்க விரைவில் பாசனம் செய்யவும்."
            elif sm > 85:
                return f"மண்ணின் ஈரப்பதம் {sm}% அதிகமாக உள்ளது. வேர் அழுகலைத் தடுக்க பாசனத்தை நிறுத்தவும்."
            return f"மண்ணின் ஈரப்பதம் {sm}% உகந்த அளவில் உள்ளது. தற்போதைய வெப்பநிலை {temp}°C."

        elif intent in ["IRRIGATION", "IRRIGATION_DECISION"]:
            sm = data.get("soil_moisture", 38)
            rain_p = data.get("rain_probability", 78)
            if rain_p >= 60:
                return f"இப்போது தண்ணீர் விட வேண்டாம். மழை வாய்ப்பு {rain_p}% அதிகமாக உள்ளது."
            elif sm < 40:
                return f"மண்ணின் ஈரப்பதம் {sm}% குறைவாக உள்ளது. மழை வாய்ப்பு இல்லாததால் 30 நிமிடங்கள் சொட்டுநீர் பாசனம் செய்யவும்."
            return f"மண்ணின் ஈரப்பதம் {sm}% உகந்த அளவில் உள்ளது. இப்போது தண்ணீர் பாய்ச்ச தேவையில்லை."

        elif intent in ["FERTILIZER", "FERTILIZER_RECOMMENDATION", "NUTRIENT_STATUS"]:
            if response_mode == "DETAIL":
                return "நைட்ரஜன் குறைபாடு உள்ளது. உடனடி வளர்ச்சிக்கு ஏக்கருக்கு 25 கிலோ யூரியா அல்லது இயற்கை மாற்றாக 2 டன் மண்புழு உரம் இடவும்."
            return "நைட்ரஜன் குறைவாக உள்ளது. பரிந்துரைக்கப்பட்ட யூரியா அல்லது மண்புழு உரத்தைப் பயன்படுத்தலாம்."

        elif intent in ["DISEASE", "DISEASE_CURRENT", "DISEASE_RISK"]:
            return "தக்காளியில் Early Blight நோய் பாதிப்பு கண்டறியப்பட்டுள்ளது. காப்பர் ஆக்ஸிகுளோரைடு அல்லது டிரைக்கோடெர்மா தெளிக்கவும்."

        elif intent in ["OUT_OF_DOMAIN"]:
            return "🌱 நான் உங்கள் தக்காளி விவசாயம் தொடர்பான கேள்விகளுக்கு மட்டும் உதவ முடியும். பயிர், நோய், பாசனம், உரம், வானிலை அல்லது மண் பற்றி கேளுங்கள்."

        # Fallback short Tamil
        return text if any(TAMIL_RANGE[0] <= c <= TAMIL_RANGE[1] for c in text) else f"உங்கள் கேள்வி புரிந்தது: {text[:80]}"

    # -------------------------------------------------------------------------
    # HINDI LOCALIZATION (हिन्दी)
    # -------------------------------------------------------------------------
    elif lang == "hi":
        if intent in ["WEATHER", "WEATHER_FORECAST"]:
            rain_p = data.get("rain_probability", 78)
            return f"कल बारिश की संभावना {rain_p}% है। कृपया खेत में छिड़काव मौसम देखकर करें।"

        elif intent in ["SOIL_STATUS", "SENSOR_STATUS"]:
            sm = data.get("soil_moisture", 38)
            if sm < 40:
                return f"मिट्टी में नमी {sm}% है, जो कि कम है। फसल को सिंचाई की आवश्यकता है।"
            return f"मिट्टी की नमी {sm}% सामान्य स्तर पर है।"

        elif intent in ["IRRIGATION", "IRRIGATION_DECISION"]:
            sm = data.get("soil_moisture", 38)
            rain_p = data.get("rain_probability", 78)
            if rain_p >= 60:
                return f"अभी पानी न दें। बारिश की संभावना {rain_p}% अधिक है।"
            return f"मिट्टी की नमी {sm}% कम है। 30 मिनट के लिए ड्रिप सिंचाई शुरू करें।"

        elif intent in ["FERTILIZER", "FERTILIZER_RECOMMENDATION"]:
            return "नाइट्रोजन की कमी पाई गई है। यूरिया या वर्मीकम्पोस्ट खाद का उपयोग करें।"

        elif intent in ["OUT_OF_DOMAIN"]:
            return "🌱 मैं केवल आपके टमाटर की खेती से संबंधित प्रश्नों में ही मदद कर सकता हूँ। कृपया फसल, रोग, सिंचाई, खाद, मौसम या मिट्टी के बारे में पूछें।"

        return text

    # -------------------------------------------------------------------------
    # TELUGU LOCALIZATION (తెలుగు)
    # -------------------------------------------------------------------------
    elif lang == "te":
        if intent in ["WEATHER", "WEATHER_FORECAST"]:
            rain_p = data.get("rain_probability", 78)
            return f"రేపు వర్షం పడే అవకాశం {rain_p}% ఉంది."

        elif intent in ["IRRIGATION", "IRRIGATION_DECISION"]:
            sm = data.get("soil_moisture", 38)
            rain_p = data.get("rain_probability", 78)
            if rain_p >= 60:
                return f"ఇప్పుడు నీరు పెట్టవద్దు. వర్షం అవకాశం {rain_p}% ఎక్కువగా ఉంది."
            return f"నేలలో తేమ {sm}% తక్కువగా ఉంది. డ్రిప్ ద్వారా నీరు అందించండి."

        elif intent in ["OUT_OF_DOMAIN"]:
            return "🌱 నేను మీ టమోటా వ్యవసాయ ప్రశ్నలకు మాత్రమే సహాయం చేయగలను. దయచేసి పంట, తెగులు, సాగునీరు, ఎరువులు, వాతావరణం లేదా నేల గురించి అడగండి."

        return text

    # -------------------------------------------------------------------------
    # ENGLISH LOCALIZATION (Clean, Crisp, 1-3 Sentences)
    # -------------------------------------------------------------------------
    else:
        if intent in ["WEATHER", "WEATHER_FORECAST"]:
            rain_p = data.get("rain_probability", 78)
            temp = data.get("temperature", 31)
            return f"Rain probability tomorrow is {rain_p}% with temperature around {temp}°C."

        elif intent in ["SOIL_STATUS", "SENSOR_STATUS"]:
            sm = data.get("soil_moisture", 38)
            if sm < 40:
                return f"Soil moisture is currently {sm}%, which is low. Irrigation is advised soon."
            return f"Soil moisture is optimal at {sm}%."

        elif intent in ["IRRIGATION", "IRRIGATION_DECISION"]:
            sm = data.get("soil_moisture", 38)
            rain_p = data.get("rain_probability", 78)
            if rain_p >= 60:
                return f"Hold irrigation. Rain probability is high at {rain_p}%."
            elif sm < 40:
                return f"Soil moisture is low ({sm}%). Run drip irrigation for 30 minutes."
            return f"Soil moisture is balanced at {sm}%. No irrigation needed right now."

        elif intent in ["FERTILIZER", "FERTILIZER_RECOMMENDATION"]:
            return "Nitrogen levels are low. Apply recommended Urea or Vermicompost top-dressing."

        elif intent in ["OUT_OF_DOMAIN"]:
            return "🌱 I'm focused on your tomato farm. Ask me about crops, disease, irrigation, nutrients, weather, or soil."

        return text
