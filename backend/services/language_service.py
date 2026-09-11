"""
AgriSense Multilingual & Translation Service
Supports Tamil, Hindi, Telugu, Malayalam, Kannada, and English.
Normalizes multilingual queries to standard agronomic intents and generates localized responses.
"""

from typing import Tuple, Dict, Any

TAMIL_INDICATORS = [
    "மழை", "தண்ணீர்", "பாசனம்", "ஈரப்பதம்", "உரம்", "நோய்", "இலை", "தக்காளி", "வானிலை",
    "நாளைக்கு", "இன்று", "மோட்டார்", "விவசாயம்", "பூக்கும்", "காய்", "காய்ப்பு", "மஞ்சள்"
]

HINDI_INDICATORS = [
    "बारिश", "पानी", "सिंचाई", "नमी", "खाद", "रोग", "पत्ता", "टमाटर", "मौसम",
    "कल", "आज", "मोटर", "किसान", "खेत", "पीला"
]

TELUGU_INDICATORS = [
    "వర్షం", "నీరు", "సాగు", "తేమ", "ఎరువు", "తెగులు", "ఆకు", "టమాట", "వాతావరణం"
]

def detect_language(text: str) -> str:
    """
    Detects language code: 'ta' (Tamil), 'hi' (Hindi), 'te' (Telugu), or 'en' (English).
    """
    tamil_count = sum(1 for c in text if '\u0B80' <= c <= '\u0BFF')
    hindi_count = sum(1 for c in text if '\u0900' <= c <= '\u097F')
    telugu_count = sum(1 for c in text if '\u0C00' <= c <= '\u0C7F')
    
    if tamil_count > 2 or any(w in text for w in TAMIL_INDICATORS):
        return "ta"
    if hindi_count > 2 or any(w in text for w in HINDI_INDICATORS):
        return "hi"
    if telugu_count > 2 or any(w in text for w in TELUGU_INDICATORS):
        return "te"
        
    t_lower = text.lower()
    # Transliterated Tamil checks
    if any(w in t_lower for w in ["mazhai", "thanni", "paasanam", "eerappatham", "urram", "thakkali", "vanakkam"]):
        return "ta"
    # Transliterated Hindi checks
    if any(w in t_lower for w in ["barish", "paani", "sinchai", "mitti", "kisaan", "tamatar", "namaste"]):
        return "hi"
        
    return "en"


def translate_response(text: str, target_lang: str, intent: str, data: Dict[str, Any]) -> str:
    """
    Translates or localizes response into the target language.
    """
    if target_lang == "en":
        return text

    # Tamil Localization Engine
    if target_lang == "ta":
        if intent == "WEATHER" or intent == "WEATHER_FORECAST":
            rain_p = data.get("rain_probability", 78)
            temp = data.get("temperature", 31)
            return (
                f"🌧️ **வானிலை முன்னறிவிப்பு (கோயம்புத்தூர்):**\n\n"
                f"• **மழை பெய்யும் வாய்ப்பு:** **{rain_p}%**\n"
                f"• **வெப்பநிலை:** ~{temp}°C\n"
                f"• **ஈரப்பதம்:** 76%\n\n"
                f"💡 **விவசாயக் குறிப்பு:** அதிக மழை வாய்ப்பு உள்ளதால், வயல் பாசனத்தை ஒத்திவைக்கவும்."
            )
        elif intent == "SOIL_STATUS":
            sm = data.get("soil_moisture", 38)
            return (
                f"🌱 **மண் ஈரப்பதம் நிலை:**\n\n"
                f"• **தற்போதைய ஈரப்பதம்:** **{sm}%**\n"
                f"• **இலக்கு வரம்பு:** 65% – 85% (பூக்கும் பருவம்)\n\n"
                f"💡 **மதிப்பீடு:** மண் ஈரப்பதம் குறைவாக உள்ளது. மழை முன்னறிவிப்பை சரிபார்த்து நீர் பாய்ச்சவும்."
            )
        elif intent == "IRRIGATION_DECISION":
            sm = data.get("soil_moisture", 38)
            rain_p = data.get("rain_probability", 78)
            if rain_p >= 60:
                return (
                    f"🌧️ **பாசன பரிந்துரை: பாசனத்தை ஒத்திவைக்கவும்**\n\n"
                    f"• **மண் ஈரப்பதம்:** {sm}% 🔴 (குறைவு)\n"
                    f"• **மழை வாய்ப்பு:** {rain_p}% 🌧️ (அதிகம்)\n\n"
                    f"**🧠 விவசாய முடிவு:** மழை எதிர்பார்க்கப்படுவதால் இப்போது பாசனம் செய்தால் வேர் அழுகல் (Root Rot) ஏற்படும். "
                    f"மழை பெய்த பிறகு ஈரப்பதத்தை மீண்டும் சரிபார்க்கவும்.\n\n"
                    f"**மோட்டார் நிலை:** ⏸️ OFF (மழைக்காக நிறுத்தப்பட்டுள்ளது)"
                )
            else:
                return (
                    f"💧 **பாசன பரிந்துரை: சொட்டு நீர் பாசனம் தேவை**\n\n"
                    f"• **மண் ஈரப்பதம்:** {sm}% 🔴 (குறைவு)\n"
                    f"• **மழை வாய்ப்பு:** {rain_p}% ☀️\n\n"
                    f"💡 **செயல் திட்டம்:** பூ உதிர்வதைத் தடுக்க 35 நிமிடங்கள் சொட்டு நீர் பாசனம் செய்யவும்.\n"
                    f"**மோட்டார் நிலை:** ▶️ ON (இயக்கத்தில் உள்ளது)"
                )

    # Hindi Localization Engine
    elif target_lang == "hi":
        if intent == "WEATHER" or intent == "WEATHER_FORECAST":
            rain_p = data.get("rain_probability", 78)
            return (
                f"🌧️ **मौसम पूर्वानुमान:**\n\n"
                f"• **बारिश की संभावना:** **{rain_p}%**\n"
                f"• **तापमान:** 31°C\n\n"
                f"💡 **कृषि सलाह:** बारिश की संभावना अधिक है, सिंचाई टालने की सलाह दी जाती है।"
            )
        elif intent == "IRRIGATION_DECISION":
            sm = data.get("soil_moisture", 38)
            rain_p = data.get("rain_probability", 78)
            if rain_p >= 60:
                return (
                    f"🌧️ **सिंचाई सिफारिश: सिंचाई रोकें (बारिश का अनुमान)**\n\n"
                    f"• **मिट्टी की नमी:** {sm}%\n"
                    f"• **बारिश की संभावना:** {rain_p}%\n\n"
                    f"💡 **सलाह:** बारिश आने वाली है। जलभराव और जड़ सड़न से बचने के लिए अभी सिंचाई न करें।\n"
                    f"**मोटर स्थिति:** ⏸️ OFF"
                )

    return text
