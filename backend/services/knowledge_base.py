"""
AgriSense Tomato Agronomic Knowledge Base & Retrieval System (RAG)
Provides verified agricultural knowledge for tomato crop physiology, irrigation,
disease management, and environmental triggers.
"""

import re
from typing import List, Dict, Any

TOMATO_KNOWLEDGE_DOCS = [
    {
        "id": "stage_aware_thresholds",
        "topic": "Stage-Aware Tomato Sensor Decision Thresholds",
        "keywords": ["threshold", "sensor", "normal", "watch", "alert", "ec", "salinity", "ph", "stage", "calibration"],
        "content": (
            "Tomato crop requirements change dynamically with growth stage, soil type, and irrigation method. "
            "Decision Thresholds (for decision support, not universal agronomic laws): "
            "1. Soil Moisture: Normal ~60–85% (Seedling: 50–60%, Development: 60–85%, Fruit Set: 65–85%, Red-Fruit: 60–80%), Watch: 40–60%, Alert: <40% (irrigation check). Note: raw capacitive sensor % depends on calibration and soil type. "
            "2. Temperature: Normal: 20–30°C, Watch: 30–34°C, Alert: >34°C (heat stress, pollen sterility, flower drop). "
            "3. Humidity: Normal: 60–85%, Watch: 85–90%, Alert: >90% (high fungal/disease risk: Early Blight, Late Blight, Leaf Mold). "
            "4. Soil pH: Normal: 6.0–6.8, Watch: 5.5–6.0 or 6.8–7.5, Alert: <5.5 (P & Ca lockout) or >7.5 (Fe & Zn deficiency). "
            "5. Salinity / EC: Normal: <2 dS/m, Watch: 2–4 dS/m, Alert: >4 dS/m (osmotic root stress, leaf scorch). "
            "6. Rain Probability: Normal: <30%, Watch: 30–60%, Alert: >60% (suppress or postpone irrigation). "
            "7. Water Quality / TDS: Normal: <500 ppm, Watch: 500-800 ppm, Alert: >800 ppm (leaching required)."
        )
    },
    {
        "id": "npk_stage_management",
        "topic": "Stage-Specific NPK Targets & Interpretation",
        "keywords": ["npk", "nitrogen", "phosphorus", "potassium", "deficiency", "stage", "ppm", "mg/kg", "urea", "dap", "sop"],
        "content": (
            "NPK interpretation must follow: Sensor -> Check units/calibration -> Growth Stage -> Target Range -> Actual vs Target -> Action. "
            "Never use a single fixed threshold for the entire season: "
            "- Vegetative Stage: High Nitrogen demand (N: 60–75 mg/kg, P: 30–40 mg/kg, K: 40–50 mg/kg) for vegetative canopy and chlorophyll. "
            "- Flowering Stage: Balanced N with elevated Phosphorus (N: 45–55 mg/kg, P: 45–55 mg/kg, K: 55–65 mg/kg) for flower bud induction and pollen viability. "
            "- Fruiting / Ripening Stage: High Potassium demand (N: 35–45 mg/kg, P: 30–40 mg/kg, K: 70–85 mg/kg) for fruit expansion, brix sweetness, and firmness. "
            "Soil test interpretation depends on extraction method and units (ppm / mg/kg vs kg/ha). Guidance from UC IPM, TNAU, and Ontario emphasizes stage-specific tissue and soil sufficiency."
        )
    },
    {
        "id": "irrigation_multi_factor",
        "topic": "Multi-Factor Contextual Irrigation Decision Logic",
        "keywords": ["irrigation", "soil moisture", "rain probability", "smart irrigation", "delay", "motor", "waterlogging", "uga"],
        "content": (
            "AgriSense combines soil moisture, weather forecast, and temperature for intelligent irrigation decisions: "
            "Case A (Rain Expected): Soil Moisture 38% (Low) + Rain Probability 78% (High) -> RECOMMENDATION: Delay irrigation and recheck soil moisture after rainfall to prevent waterlogging and nutrient leaching. "
            "Case B (Immediate Need): Soil Moisture 32% (Low) + Rain Probability 12% (Low) + Temperature 31°C -> RECOMMENDATION: Irrigation required immediately. Motor: ON (auto mode). "
            "UGA and UC IPM guidelines emphasize avoiding both excessive depletion and root zone saturation."
        )
    },
    {
        "id": "late_blight",
        "topic": "Tomato Late Blight (Phytophthora infestans)",
        "keywords": ["late blight", "phytophthora", "dark lesions", "white mold", "water-soaked spots", "blight"],
        "content": (
            "Late Blight is a destructive water-mold disease that spreads rapidly in cool (15-22°C), highly humid (>85%), "
            "and rainy weather. Symptoms include dark, water-soaked lesions on leaves with white fungal growth on undersides. "
            "Treatment: Immediately apply protective copper-based fungicides or Mancozeb/Cymoxanil. Remove and destroy infected plant parts. "
            "Withhold overhead watering and increase airflow between rows."
        )
    },
    {
        "id": "early_blight",
        "topic": "Tomato Early Blight (Alternaria solani)",
        "keywords": ["early blight", "alternaria", "concentric rings", "target spot", "yellow halo", "leaf spots"],
        "content": (
            "Early Blight causes brown-to-black spots with characteristic concentric rings ('bullseye' or target pattern) surrounded by a yellow halo, "
            "starting on older lower leaves. Favored by warm temperatures (24-30°C) and frequent rainfall or heavy dew. "
            "Management: Prune lower leaves touching soil, apply mulch to prevent soil-splash, spray Chlorothalonil or Azoxystrobin, and practice crop rotation."
        )
    },
    {
        "id": "septoria_leaf_spot",
        "topic": "Tomato Septoria Leaf Spot",
        "keywords": ["septoria", "small spots", "circular lesions", "dark border", "defoliation"],
        "content": (
            "Septoria leaf spot creates numerous small (2-3mm) circular spots with gray/white centers and dark brown margins. "
            "It thrives in warm (20-25°C) wet conditions and causes rapid defoliation from bottom up. "
            "Management: Remove infected foliage, avoid working in wet fields, and apply copper fungicides or Daconil."
        )
    },
    {
        "id": "leaf_mold",
        "topic": "Tomato Leaf Mold (Passalora fulva)",
        "keywords": ["leaf mold", "pale green", "yellow spots", "velvety mold", "greenhouse"],
        "content": (
            "Leaf Mold produces pale green or yellow spots on the upper leaf surface with olive-green to brown velvety mold underneath. "
            "Common in high relative humidity (>85%) and poor ventilation. "
            "Management: Lower greenhouse humidity, increase plant spacing, and apply preventive bio-fungicides (Bacillus subtilis) or copper."
        )
    },
    {
        "id": "bacterial_spot",
        "topic": "Tomato Bacterial Spot (Xanthomonas spp.)",
        "keywords": ["bacterial spot", "xanthomonas", "scabby spots", "greasy spots", "black lesions"],
        "content": (
            "Bacterial spot appears as small, greasy, dark brown angular lesions on leaves and scabby raised spots on fruit. "
            "Spreads easily via rain splash and irrigation spray. "
            "Management: Use certified disease-free seeds, avoid overhead watering, apply fixed copper mixed with Mancozeb, and sanitize tools."
        )
    },
    {
        "id": "heat_salinity_stress",
        "topic": "Heat Stress & Salinity Management",
        "keywords": ["heat stress", "temperature", "hot", "salinity", "ec", "blossom drop", "wilting"],
        "content": (
            "Optimal temperature for tomato growth is 20-30°C. Temperature >34°C causes pollen sterility and blossom drop. "
            "Salinity (EC > 2.0 dS/m) causes osmotic stress, and EC > 4.0 dS/m causes severe yield decline. "
            "Management: Apply 30% shade netting during peak afternoon sun, flush root zones with low-salinity water, and apply straw mulch."
        )
    }
]

def query_knowledge_base(query: str, top_k: int = 2) -> List[Dict[str, Any]]:
    """
    Retrieves the most relevant agricultural knowledge documents for a query.
    Uses token matching, keyword scoring, and semantic text overlap.
    """
    query_lower = query.lower()
    query_words = set(re.findall(r'\w+', query_lower))

    scored_docs = []
    for doc in TOMATO_KNOWLEDGE_DOCS:
        score = 0
        # Keyword matching
        for kw in doc["keywords"]:
            if kw in query_lower:
                score += 3
            elif any(w in kw for w in query_words if len(w) > 3):
                score += 1
                
        # Content word overlap
        content_words = set(re.findall(r'\w+', doc["content"].lower()))
        overlap = len(query_words.intersection(content_words))
        score += overlap * 0.5

        if score > 0:
            scored_docs.append((score, doc))

    scored_docs.sort(key=lambda x: x[0], reverse=True)
    return [doc for _, doc in scored_docs[:top_k]]
