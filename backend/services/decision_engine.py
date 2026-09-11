"""
AgriSense Agronomic Decision Engine
Implements stage-aware 3-tier decision thresholds (🟢 Normal, 🟡 Watch, 🔴 Alert),
multi-factor contextual irrigation reasoning (moisture + weather + temperature),
heat stress detection, salinity assessment, and disease pathology progression.
"""

from typing import Dict, Any, List, Optional

# Stage-specific optimal moisture benchmarks (from agronomic studies for tomato)
STAGE_MOISTURE_BENCHMARKS = {
    "Seedling": {"min": 50.0, "max": 60.0, "optimal": "50–60%"},
    "Vegetative": {"min": 60.0, "max": 85.0, "optimal": "60–85%"},
    "Flowering": {"min": 65.0, "max": 85.0, "optimal": "65–85%"},
    "Fruit Set": {"min": 65.0, "max": 85.0, "optimal": "65–85%"},
    "Fruiting": {"min": 65.0, "max": 85.0, "optimal": "65–85%"},
    "Red-Fruit": {"min": 60.0, "max": 80.0, "optimal": "60–80%"},
    "Harvesting": {"min": 60.0, "max": 80.0, "optimal": "60–80%"}
}

def evaluate_irrigation_decision(
    soil_moisture: Optional[float],
    rain_probability: Optional[float] = 0.0,
    temperature: Optional[float] = None,
    crop_stage: str = "Flowering"
) -> Dict[str, Any]:
    """
    Combines Soil Moisture + Rain Forecast + Temperature + Crop Stage for intelligent irrigation reasoning.
    """
    if soil_moisture is None:
        return {
            "status": "UNKNOWN",
            "recommendation": "Soil moisture sensor data unavailable. Verify sensor telemetry.",
            "motor_action": "HOLD",
            "reasoning": "Missing sensor data."
        }

    rain_prob = rain_probability if rain_probability is not None else 0.0
    stage_info = STAGE_MOISTURE_BENCHMARKS.get(crop_stage, STAGE_MOISTURE_BENCHMARKS["Flowering"])
    min_moisture = stage_info["min"]
    
    # 1. Moisture Low Alert (<40% or below stage minimum)
    if soil_moisture < 40.0 or soil_moisture < (min_moisture - 15.0):
        if rain_prob >= 60.0:
            return {
                "status": "WATCH_DELAY",
                "badge": "🟡 Watch (Rain Delay)",
                "action_title": "Delay Irrigation — Rain Forecasted",
                "motor_action": "OFF",
                "recommendation": f"Soil moisture is low ({soil_moisture}%), but rain probability is {rain_prob}%. Delay irrigation and recheck soil moisture after rainfall to prevent waterlogging and nitrate leaching.",
                "reasoning": f"Sensor: {soil_moisture}% 🔴 | Rain: {rain_prob}% 🌧️ | Strategy: Irrigation suppression to prevent root rot."
            }
        else:
            temp_str = f" at {temperature}°C" if temperature else ""
            return {
                "status": "ALERT_IRRIGATE",
                "badge": "🔴 Alert (Irrigate Now)",
                "action_title": "Irrigation Required",
                "motor_action": "ON",
                "recommendation": f"Soil moisture is critically low ({soil_moisture}%){temp_str} with low rain risk ({rain_prob}%). Precision drip irrigation cycle required.",
                "reasoning": f"Sensor: {soil_moisture}% 🔴 | Rain: {rain_prob}% ☀️ | Strategy: Root zone hydration activated."
            }

    # 2. Moisture in Watch Zone (40% to stage min)
    elif soil_moisture < min_moisture:
        if rain_prob >= 40.0:
            return {
                "status": "WATCH_STABLE",
                "badge": "🟡 Watch",
                "action_title": "Monitor Moisture",
                "motor_action": "OFF",
                "recommendation": f"Soil moisture ({soil_moisture}%) is slightly below optimal {stage_info['optimal']} for {crop_stage}. Upcoming rain ({rain_prob}%) will likely recharge moisture.",
                "reasoning": f"Moisture within watch band. Awaiting precipitation recharge."
            }
        else:
            return {
                "status": "WATCH_SCHEDULE",
                "badge": "🟡 Watch",
                "action_title": "Schedule Light Irrigation",
                "motor_action": "OPTIONAL",
                "recommendation": f"Soil moisture ({soil_moisture}%) approaching deficit for {crop_stage} ({stage_info['optimal']}). Schedule light drip cycle.",
                "reasoning": f"Dry forecast ({rain_prob}%). Maintain root hydration."
            }

    # 3. Moisture Saturated (>85%)
    elif soil_moisture > 85.0:
        return {
            "status": "ALERT_SATURATED",
            "badge": "🔴 Alert (Over-moisture)",
            "action_title": "Halt Irrigation & Inspect Drainage",
            "motor_action": "OFF",
            "recommendation": f"Soil moisture ({soil_moisture}%) is above 85%. Risk of root hypoxia and Pythium root rot. Ensure drainage ditches are clear.",
            "reasoning": "Excessive soil water content detected."
        }

    # 4. Optimal Normal Zone
    else:
        return {
            "status": "NORMAL",
            "badge": "🟢 Normal",
            "action_title": "Moisture Optimal",
            "motor_action": "OFF",
            "recommendation": f"Soil moisture ({soil_moisture}%) is optimal for tomato {crop_stage} stage ({stage_info['optimal']}).",
            "reasoning": "Root zone water balance is balanced."
        }


def evaluate_sensor_telemetry(
    sensors: Dict[str, Any],
    crop_stage: str = "Flowering",
    rain_probability: float = 0.0
) -> Dict[str, Any]:
    """
    Evaluates all field sensors against the 3-tier stage-aware decision thresholds:
    🟢 Normal | 🟡 Watch | 🔴 Alert
    """
    results = {}
    
    # Soil Moisture
    sm = sensors.get("soil_moisture")
    results["soil_moisture"] = evaluate_irrigation_decision(sm, rain_probability, sensors.get("temperature"), crop_stage)
    
    # Temperature (20-30 Normal, 30-34 Watch, >34 Alert)
    temp = sensors.get("temperature")
    if temp is not None:
        if temp > 34.0:
            results["temperature"] = {
                "tier": "ALERT",
                "badge": "🔴 Alert (>34°C)",
                "issue": "Heat Stress Risk",
                "recommendation": "High temperature causes pollen sterility and blossom drop. Deploy 30% shade nets and apply organic straw mulch."
            }
        elif temp >= 30.0:
            results["temperature"] = {
                "tier": "WATCH",
                "badge": "🟡 Watch (30–34°C)",
                "issue": "Elevated Temperature",
                "recommendation": "Maintain optimal root zone moisture to support transpiration cooling."
            }
        elif temp < 15.0:
            results["temperature"] = {
                "tier": "ALERT",
                "badge": "🔴 Alert (<15°C)",
                "issue": "Chilling / Stunted Growth Risk",
                "recommendation": "Cold temperatures slow nutrient uptake. Protect seedlings from nocturnal drafts."
            }
        else:
            results["temperature"] = {
                "tier": "NORMAL",
                "badge": "🟢 Normal (20–30°C)",
                "issue": "Optimal Temperature",
                "recommendation": "Ideal temperature range for tomato metabolic and photosynthetic activity."
            }

    # Humidity (60-85 Normal, 85-90 Watch, >90 Alert)
    hum = sensors.get("humidity")
    if hum is not None:
        if hum > 90.0:
            results["humidity"] = {
                "tier": "ALERT",
                "badge": "🔴 Alert (>90%)",
                "issue": "Severe Fungal / Disease Risk",
                "recommendation": "Excessive humidity accelerates Early & Late Blight spore germination. Apply preventive bio/copper spray and withhold canopy wetting."
            }
        elif hum > 85.0:
            results["humidity"] = {
                "tier": "WATCH",
                "badge": "🟡 Watch (85–90%)",
                "issue": "Elevated Humidity",
                "recommendation": "Inspect lower leaves for initial fungal lesions. Improve row airflow."
            }
        elif hum < 50.0:
            results["humidity"] = {
                "tier": "WATCH",
                "badge": "🟡 Watch (<50%)",
                "issue": "Dry Canopy",
                "recommendation": "Low humidity increases spider mite proliferation risk."
            }
        else:
            results["humidity"] = {
                "tier": "NORMAL",
                "badge": "🟢 Normal (60–85%)",
                "issue": "Healthy Relative Humidity",
                "recommendation": "Within safe microclimate threshold for tomatoes."
            }

    # Soil pH (6.0-6.8 Normal, 5.5-6.0 / 6.8-7.5 Watch, <5.5 / >7.5 Alert)
    ph = sensors.get("soil_ph") or sensors.get("ph")
    if ph is not None:
        if ph < 5.5:
            results["soil_ph"] = {
                "tier": "ALERT",
                "badge": "🔴 Alert (<5.5)",
                "issue": "Severe Acidic Lockout",
                "recommendation": "Phosphorus and Calcium availability severely locked. Apply agricultural lime (Dolomite CaCO₃ 100 kg/acre)."
            }
        elif ph > 7.5:
            results["soil_ph"] = {
                "tier": "ALERT",
                "badge": "🔴 Alert (>7.5)",
                "issue": "Severe Alkaline Lockout",
                "recommendation": "Iron, Zinc, and Manganese locked. Apply agricultural gypsum or elemental sulfur."
            }
        elif 5.5 <= ph < 6.0 or 6.8 < ph <= 7.5:
            results["soil_ph"] = {
                "tier": "WATCH",
                "badge": "🟡 Watch (5.5–6.0 / 6.8–7.5)",
                "issue": "Marginal pH Deviation",
                "recommendation": "Monitor nutrient uptake efficiency."
            }
        else:
            results["soil_ph"] = {
                "tier": "NORMAL",
                "badge": "🟢 Normal (6.0–6.8)",
                "issue": "Optimal pH Range",
                "recommendation": "Maximum macro and micronutrient bio-availability for tomatoes."
            }

    # Salinity / EC (<2 Normal, 2-4 Watch, >4 Alert)
    ec = sensors.get("ec") or sensors.get("salinity")
    if ec is not None:
        if ec > 4.0:
            results["ec"] = {
                "tier": "ALERT",
                "badge": "🔴 Alert (>4 dS/m)",
                "issue": "Severe Salinity / Salt Scorch",
                "recommendation": "High electrical conductivity induces osmotic drought. Flush soil profile with clean irrigation water."
            }
        elif ec >= 2.0:
            results["ec"] = {
                "tier": "WATCH",
                "badge": "🟡 Watch (2–4 dS/m)",
                "issue": "Elevated Salinity",
                "recommendation": "Avoid high-chloride fertilizers; prefer SOP over MOP."
            }
        else:
            results["ec"] = {
                "tier": "NORMAL",
                "badge": "🟢 Normal (<2 dS/m)",
                "issue": "Safe Salinity Level",
                "recommendation": "Low electrical conductivity ensures smooth water and nutrient intake."
            }

    return results


def analyze_crop_state(
    disease: str,
    confidence: float,
    soil_moisture: Optional[float] = None,
    temperature: Optional[float] = None,
    humidity: Optional[float] = None,
    rain_probability: Optional[float] = None,
    crop_stage: str = "Flowering"
) -> Dict[str, Any]:
    disease_lower = disease.lower()
    
    # -----------------------------
    # Current state & Severity
    # -----------------------------
    if "healthy" in disease_lower:
        current_state = "Healthy tomato leaf"
        severity = "Low"
    elif confidence >= 85:
        current_state = f"Strong visual evidence of {disease.replace('Tomato___', '').replace('_', ' ')}"
        severity = "High"
    elif confidence >= 60:
        current_state = f"Possible {disease.replace('Tomato___', '').replace('_', ' ')}"
        severity = "Moderate"
    else:
        current_state = "Uncertain crop condition"
        severity = "Unknown"

    # -----------------------------
    # Multi-Factor Agronomic Risk Score
    # -----------------------------
    risk_score = 0
    if confidence >= 80 and "healthy" not in disease_lower:
        risk_score += 40
    elif confidence >= 60 and "healthy" not in disease_lower:
        risk_score += 25
        
    if humidity is not None:
        if humidity >= 90:
            risk_score += 30  # High fungal alert threshold
        elif humidity >= 85:
            risk_score += 20
        elif humidity >= 75:
            risk_score += 10
            
    if rain_probability is not None:
        if rain_probability >= 70:
            risk_score += 20
        elif rain_probability >= 40:
            risk_score += 10
            
    if temperature is not None:
        if 20 <= temperature <= 30:
            risk_score += 10
        elif temperature > 34:
            risk_score += 15  # Heat stress compound risk

    # Risk level classification
    if risk_score >= 70:
        future_risk = "HIGH"
    elif risk_score >= 40:
        future_risk = "MODERATE"
    else:
        future_risk = "LOW"

    # -----------------------------
    # Stage-Aware Recommendations
    # -----------------------------
    recommendations = []
    
    if "healthy" in disease_lower:
        recommendations.append("Continue regular crop monitoring and maintain stage-appropriate moisture balance.")
    else:
        disease_clean = disease.replace('Tomato___', '').replace('_', ' ')
        recommendations.append(f"Monitor the crop for progression of {disease_clean}.")
        recommendations.append("Inspect nearby tomato plants for similar lesions or foliar discoloration.")
        
    if humidity is not None and humidity >= 85:
        recommendations.append(
            f"High humidity ({humidity}%) detected. Increase row aeration and avoid sprinkler or foliage wetting to suppress fungal sporulation."
        )
        
    # Multi-factor irrigation advice
    if soil_moisture is not None or rain_probability is not None:
        irr_eval = evaluate_irrigation_decision(soil_moisture, rain_probability, temperature, crop_stage)
        recommendations.append(f"Irrigation Logic: {irr_eval['recommendation']}")

    if temperature is not None and temperature > 34:
        recommendations.append("Heat Alert (>34°C): Mitigate pollen sterility by applying light shade and mulching.")

    is_uncertain = confidence < 60.0
    if is_uncertain and "healthy" not in disease_lower:
        recommendations.insert(0, "Diagnosis confidence is low (< 60%). For higher accuracy, capture a well-lit close-up of a single leaf avoiding shadows and blur.")

    return {
        "current_state": current_state,
        "disease": disease.replace('Tomato___', '').replace('_', ' '),
        "confidence": confidence,
        "severity": severity,
        "is_uncertain": is_uncertain,
        "future_risk": future_risk,
        "risk_score": min(risk_score, 100),
        "crop_stage": crop_stage,
        "recommendations": recommendations,
        "threshold_notice": "Decision thresholds are calibrated for prototype decision-support; exact responses depend on sensor calibration and soil type."
    }


