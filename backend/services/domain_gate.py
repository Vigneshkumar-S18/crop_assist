"""
AgriSense Domain Gate
Classifies whether a user's query belongs to the Agricultural & Farm Management domain
prior to executing costly RAG or sensor retrieval pipelines.
"""

import re
from typing import Tuple

AGRI_KEYWORDS = [
    "crop", "tomato", "plant", "leaf", "leaves", "soil", "moisture", "water", "irrigate", "irrigation",
    "motor", "pump", "fertilizer", "nutrient", "npk", "nitrogen", "phosphorus", "potassium", "urea", "dap", "sop",
    "disease", "blight", "spot", "mold", "pest", "fungus", "weather", "rain", "temperature", "temp", "humidity",
    "field", "farm", "farmer", "harvest", "flower", "fruiting", "seedling", "stage", "ph", "salinity", "ec",
    "organic", "compost", "manure", "neem", "spray", "fungicide", "yield", "thanni", "mazhai", "maram", "vivasayam",
    "paasanam", "chekka", "pani", "barish", "kisaan", "khet", "fasal", "mitti", "khad", "paani"
]

OUT_OF_DOMAIN_PATTERNS = [
    r"\b(what is love|who is elon musk|write a python game|who is president|write code|crypto|bitcoin|stock market)\b",
    r"\b(capital of france|who is messi|who is ronaldo|tell me a movie|sing a song|generate essay)\b"
]

def check_domain_gate(query: str) -> Tuple[bool, str]:
    """
    Returns (is_agriculture: bool, reason: str)
    """
    q_lower = query.lower().strip()
    
    # Empty query check
    if not q_lower:
        return True, "EMPTY_INPUT"
        
    # Check explicit out of domain patterns
    for pat in OUT_OF_DOMAIN_PATTERNS:
        if re.search(pat, q_lower):
            return False, "OUT_OF_DOMAIN_PATTERN"
            
    # Check if common conversational greeting
    greetings = ["hi", "hello", "hey", "vanakkam", "namaste", "good morning", "good evening", "agrisense", "who are you"]
    if any(q_lower == g or q_lower.startswith(g + " ") for g in greetings):
        return True, "CONVERSATIONAL_GREETING"
        
    # Check if query contains agricultural concepts
    for kw in AGRI_KEYWORDS:
        if kw in q_lower:
            return True, "AGRICULTURE_KEYWORD_MATCH"
            
    # Check Indic / Multilingual script presence (Tamil, Devanagari, Telugu)
    indic_chars = sum(1 for c in query if '\u0B80' <= c <= '\u0BFF' or '\u0900' <= c <= '\u097F' or '\u0C00' <= c <= '\u0C7F')
    if indic_chars > 3:
        # Indic queries default to agriculture intent analysis in language_service
        return True, "MULTILINGUAL_AGRI_INPUT"
        
    # If short and ambiguous, allow router to evaluate with conversation context
    if len(q_lower.split()) <= 4:
        return True, "SHORT_AMBIGUOUS"

    return False, "NO_AGRICULTURAL_RELEVANCE"
