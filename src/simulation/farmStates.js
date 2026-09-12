/**
 * Centralized Predefined Farm States for Hackathon Demo Simulation
 * Contains:
 * 1. NORMAL_STATE (Initial baseline)
 * 2. DRY_STATE (Hot & dry conditions, low moisture, high temp, low rain, motor ON, irrigation required)
 * 3. WET_STATE (Rainy conditions, high moisture, moderate temp, high rain, motor OFF, rain delay active)
 */

export const FARM_STATES = {
  NORMAL: {
    mode: "NORMAL",
    timestamp: new Date().toLocaleTimeString(),
    sensors: {
      soil_moisture: 65,
      soil_moisture_str: "65%",
      soil_moisture_status: "Optimal",
      soil_moisture_tier: "🟢 Normal",
      soil_moisture_class: "optimal",
      soil_moisture_insight: "Soil moisture is at optimal 65% for the tomato flowering stage. Root hydration is balanced.",
      
      temperature: 28,
      temperature_str: "28°C",
      temperature_status: "Optimal",
      temperature_tier: "🟢 Normal",
      temperature_class: "optimal",
      temperature_insight: "Temperature (28°C) is ideal for tomato pollen viability and fruit setting.",

      humidity: 65,
      humidity_str: "65%",
      humidity_status: "Optimal",
      humidity_tier: "🟢 Normal",
      humidity_class: "optimal",
      humidity_insight: "Relative humidity is 65%. Transpiration and fungal pressure are well within safe thresholds.",

      nitrogen: 58,
      phosphorus: 48,
      potassium: 68,
      npk_str: "N:58 P:48 K:68",
      npk_status: "Optimal NPK",
      npk_tier: "🟢 Normal",
      npk_class: "optimal",
      npk_insight: "NPK levels (58-48-68 mg/kg) are fully sufficient for current tomato flower clusters.",

      ph: 6.5,
      ph_str: "6.5",
      ph_status: "Optimal",
      ph_tier: "🟢 Normal",
      ph_class: "optimal",
      ph_insight: "Soil pH 6.5 is ideal for tomato root nutrient uptake without chemical lockout.",

      ec: 1.4,
      ec_str: "1.4 dS/m",
      ec_status: "Optimal",
      ec_tier: "🟢 Normal",
      ec_class: "optimal",
      ec_insight: "Salinity / EC is 1.4 dS/m, well below the 2.0 dS/m threshold.",

      water_quality: 320,
      water_quality_str: "320 ppm",
      water_quality_status: "Good",
      water_quality_tier: "🟢 Normal",
      water_quality_class: "good",
      water_quality_insight: "Water TDS is 320 ppm, ensuring zero emitter clogging or salt accumulation.",

      growth_stage: "Flowering & Fruit Setting",
      moisture_chart: [62, 63, 64, 65, 66, 65, 64, 65, 66, 65, 64, 65, 66, 65, 64, 65, 66, 65, 64, 65, 65, 65, 65, 65],
      temp_chart: [22, 23, 24, 25, 26, 27, 28, 29, 28, 27, 26, 25, 24, 23, 22, 23, 24, 25, 26, 27, 28, 28, 28, 28],
      humidity_chart: [68, 67, 66, 65, 64, 63, 62, 63, 64, 65, 66, 67, 68, 67, 66, 65, 64, 65, 65, 65, 65, 65, 65, 65],
      npk_chart: [56, 56, 57, 57, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58]
    },

    weather: {
      temperature: 28,
      temperature_str: "28°C",
      humidity: 65,
      humidity_str: "65%",
      rain_probability: 25,
      rain_probability_6h: 20,
      rain_probability_24h: 30,
      forecast_desc: "Partly Cloudy • Optimal Conditions",
      rainfall: "0 mm",
      wind_speed: "12 km/h",
      location: "Coimbatore, Tamil Nadu"
    },

    irrigation: {
      required: false,
      motor_status: "OFF",
      motor_on: false,
      decision_title: "Root Hydration Optimal",
      decision_desc: "Soil moisture (65%) is optimal for tomato flowering. No irrigation needed.",
      action_note: "Motor on Standby • System monitoring transpiration.",
      badge: "🟢 Normal (Optimal)",
      badge_class: "optimal",
      target_range: "65% – 85%"
    },

    crop: {
      health_score: 92,
      health_label: "Healthy (92%)",
      health_class: "good",
      stress_level: "LOW",
      disease_risk: "LOW",
      disease_risk_class: "good",
      disease_name: "Healthy Foliage",
      confidence: 98.5
    },

    alerts: [
      {
        id: "alert_opt_1",
        type: "optimal",
        severity: "Low",
        tier: "🟢 Normal",
        title: "Soil Moisture & Nutrients Optimal",
        shortDesc: "All parameters are within stage-specific UGA target ranges.",
        time: "Active"
      }
    ],

    recommendation: {
      primary_nutrient: "K",
      n_status: "Optimal",
      p_status: "Optimal",
      k_status: "Optimal",
      prescription: "Maintain standard balanced irrigation and monitoring."
    }
  },

  DRY: {
    mode: "DRY",
    timestamp: new Date().toLocaleTimeString(),
    sensors: {
      soil_moisture: 32,
      soil_moisture_str: "32%",
      soil_moisture_status: "Critical Deficit (<40%)",
      soil_moisture_tier: "🔴 Alert",
      soil_moisture_class: "danger",
      soil_moisture_insight: "Soil moisture is in the critical deficit zone (32%). Active transpiration under 34°C demands immediate hydration.",
      
      temperature: 34,
      temperature_str: "34°C",
      temperature_status: "Heat Stress (>30°C)",
      temperature_tier: "🔴 Alert",
      temperature_class: "danger",
      temperature_insight: "Temperature (34°C) exceeds optimum. Heat stress can cause flower drop and reduced pollen viability.",

      humidity: 48,
      humidity_str: "48%",
      humidity_status: "Dry Atmosphere (<50%)",
      humidity_tier: "🟡 Watch",
      humidity_class: "warning",
      humidity_insight: "Relative humidity is low (48%), causing rapid vapor pressure deficit and soil moisture evaporation.",

      nitrogen: 22,
      phosphorus: 20,
      potassium: 28,
      npk_str: "N:22 P:20 K:28",
      npk_status: "Critical Low N/K",
      npk_tier: "🔴 Alert",
      npk_class: "danger",
      npk_insight: "Nitrogen (22 mg/kg) and Potassium (28 mg/kg) are severely depleted, causing leaf yellowing and nutrient stress.",

      ph: 6.7,
      ph_str: "6.7",
      ph_status: "Optimal",
      ph_tier: "🟢 Normal",
      ph_class: "optimal",
      ph_insight: "Soil pH 6.7 remains within acceptable limits.",

      ec: 1.8,
      ec_str: "1.8 dS/m",
      ec_status: "Watch",
      ec_tier: "🟡 Watch",
      ec_class: "warning",
      ec_insight: "Salinity / EC is elevated (1.8 dS/m) due to moisture deficit concentrating soil salts.",

      water_quality: 380,
      water_quality_str: "380 ppm",
      water_quality_status: "Good",
      water_quality_tier: "🟢 Normal",
      water_quality_class: "good",
      water_quality_insight: "Water TDS is 380 ppm.",

      growth_stage: "Flowering & Fruit Setting",
      moisture_chart: [60, 56, 52, 48, 45, 42, 40, 38, 36, 35, 34, 33, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32],
      temp_chart: [24, 25, 26, 28, 30, 32, 33, 34, 34, 34, 33, 32, 30, 28, 27, 28, 30, 32, 33, 34, 34, 34, 34, 34],
      humidity_chart: [65, 62, 58, 55, 52, 50, 48, 48, 48, 49, 50, 52, 55, 58, 60, 58, 55, 52, 50, 48, 48, 48, 48, 48],
      npk_chart: [42, 40, 38, 35, 32, 30, 28, 26, 24, 23, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22]
    },

    weather: {
      temperature: 34,
      temperature_str: "34°C",
      humidity: 48,
      humidity_str: "48%",
      rain_probability: 12,
      rain_probability_6h: 10,
      rain_probability_24h: 15,
      forecast_desc: "Sunny & Dry • High Evapotranspiration",
      rainfall: "0 mm",
      wind_speed: "18 km/h",
      location: "Coimbatore, Tamil Nadu"
    },

    irrigation: {
      required: true,
      motor_status: "ON",
      motor_on: true,
      decision_title: "Irrigation Required Immediately",
      decision_desc: "Soil moisture is in critical deficit (32%) with dry weather (12% rain) and 34°C heat. Precision drip cycle active.",
      action_note: "⚡ Motor ON • Running 35-minute drip cycle to restore root zone.",
      badge: "🔴 Alert (Irrigate Now)",
      badge_class: "critical",
      target_range: "65% – 85%"
    },

    crop: {
      health_score: 54,
      health_label: "Drought & Heat Stress (54%)",
      health_class: "danger",
      stress_level: "HIGH",
      disease_risk: "HIGH (Drought Stress & Chlorosis)",
      disease_risk_class: "danger",
      disease_name: "Nitrogen Chlorosis & Moisture Deficit",
      confidence: 94.2
    },

    alerts: [
      {
        id: "moisture_dry_alert",
        type: "critical",
        severity: "High",
        tier: "🔴 Alert",
        category: "Soil Moisture",
        title: "Soil Moisture Critical Deficit (32%)",
        shortDesc: "Zone 1 moisture dropped to 32%, below the 40% threshold. Precision drip cycle recommended.",
        time: "Just now"
      },
      {
        id: "n_low",
        type: "critical",
        severity: "High",
        tier: "🔴 Alert",
        category: "NPK Nutrition",
        title: "Nitrogen Level Below Target (N:22)",
        shortDesc: "NPK levels depleted. Older leaves show yellowing and reduced vigor.",
        time: "Just now"
      },
      {
        id: "heat_stress_alert",
        type: "critical",
        severity: "High",
        tier: "🔴 Alert",
        category: "Thermal Stress",
        title: "Severe Ambient Heat Stress (34°C)",
        shortDesc: "Canopy temperature reached 34°C. Severe flower drop risk.",
        time: "Just now"
      }
    ],

    recommendation: {
      primary_nutrient: "N",
      n_status: "Critical Low (22 mg/kg)",
      p_status: "Low (20 mg/kg)",
      k_status: "Low (28 mg/kg)",
      prescription: "Apply Urea (30 kg/ha) or FYM (5 t/ha) + restore moisture to 70%."
    }
  },

  WET: {
    mode: "WET",
    timestamp: new Date().toLocaleTimeString(),
    sensors: {
      soil_moisture: 76,
      soil_moisture_str: "76%",
      soil_moisture_status: "Well Hydrated (Rain Saturated)",
      soil_moisture_tier: "🟢 Normal",
      soil_moisture_class: "optimal",
      soil_moisture_insight: "Soil moisture is 76%, replenished by recent precipitation. No additional irrigation needed.",
      
      temperature: 26,
      temperature_str: "26°C",
      temperature_status: "Cool & Humid",
      temperature_tier: "🟢 Normal",
      temperature_class: "optimal",
      temperature_insight: "Temperature (26°C) is moderate. Evaporation demand is low.",

      humidity: 84,
      humidity_str: "84%",
      humidity_status: "High Humidity (>80%)",
      humidity_tier: "🟡 Watch",
      humidity_class: "warning",
      humidity_insight: "High atmospheric humidity (84%) increases fungal spore germination risk. Monitor leaf canopy wetness.",

      nitrogen: 52,
      phosphorus: 46,
      potassium: 64,
      npk_str: "N:52 P:46 K:64",
      npk_status: "Adequate NPK",
      npk_tier: "🟢 Normal",
      npk_class: "optimal",
      npk_insight: "NPK levels (52-46-64 mg/kg) are balanced and well-hydrated.",

      ph: 6.4,
      ph_str: "6.4",
      ph_status: "Optimal",
      ph_tier: "🟢 Normal",
      ph_class: "optimal",
      ph_insight: "Soil pH 6.4 is within the optimal 6.0–6.8 range.",

      ec: 1.3,
      ec_str: "1.3 dS/m",
      ec_status: "Optimal",
      ec_tier: "🟢 Normal",
      ec_class: "optimal",
      ec_insight: "EC is 1.3 dS/m, well balanced.",

      water_quality: 310,
      water_quality_str: "310 ppm",
      water_quality_status: "Good",
      water_quality_tier: "🟢 Normal",
      water_quality_class: "good",
      water_quality_insight: "Water TDS is 310 ppm.",

      growth_stage: "Flowering & Fruit Setting",
      moisture_chart: [32, 38, 45, 52, 60, 68, 72, 74, 75, 76, 76, 76, 76, 76, 76, 76, 76, 76, 76, 76, 76, 76, 76, 76],
      temp_chart: [28, 28, 27, 26, 25, 25, 26, 26, 26, 26, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26],
      humidity_chart: [65, 70, 75, 80, 82, 84, 84, 85, 84, 84, 83, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84],
      npk_chart: [48, 49, 50, 51, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52, 52]
    },

    weather: {
      temperature: 26,
      temperature_str: "26°C",
      humidity: 84,
      humidity_str: "84%",
      rain_probability: 78,
      rain_probability_6h: 82,
      rain_probability_24h: 91,
      forecast_desc: "Scattered Rain & Thunderstorms",
      rainfall: "8.5 mm",
      wind_speed: "14 km/h",
      location: "Coimbatore, Tamil Nadu"
    },

    irrigation: {
      required: false,
      motor_status: "OFF",
      motor_on: false,
      decision_title: "Delay Irrigation — Rain Forecasted",
      decision_desc: "Soil moisture is high (76%) with 78% rainfall probability. Motor held in standby to prevent root hypoxia.",
      action_note: "⏸️ Motor OFF • Standby for incoming rain event.",
      badge: "🟡 Watch (Rain Delay)",
      badge_class: "warning",
      target_range: "65% – 85%"
    },

    crop: {
      health_score: 88,
      health_label: "Hydrated • Spore Watch (88%)",
      health_class: "warning",
      stress_level: "LOW",
      disease_risk: "MODERATE (High Humidity Spore Index)",
      disease_risk_class: "warning",
      disease_name: "Early Blight Spore Watch (84% Humidity)",
      confidence: 89.0
    },

    alerts: [
      {
        id: "moisture_rain_delay",
        type: "warning",
        severity: "Medium",
        tier: "🟡 Watch",
        category: "Weather & Irrigation",
        title: "Rain Delay Active (Motor Suppressed)",
        shortDesc: "Rain probability is 78%. Irrigation withheld to prevent root saturation and nutrient leaching.",
        time: "Active"
      },
      {
        id: "humidity_disease_risk",
        type: "critical",
        severity: "High",
        tier: "🔴 Alert",
        category: "Disease Prevention",
        title: "High Humidity Spore Alert (84%)",
        shortDesc: "Avoid overhead watering; maintain tomato canopy airflow to deter fungal spore germination.",
        time: "Active"
      }
    ],

    recommendation: {
      primary_nutrient: "K",
      n_status: "Optimal (52 mg/kg)",
      p_status: "Optimal (46 mg/kg)",
      k_status: "Optimal (64 mg/kg)",
      prescription: "Postpone foliar applications during rainfall; schedule preventative copper/mancozeb spray if rain persists."
    }
  }
};
