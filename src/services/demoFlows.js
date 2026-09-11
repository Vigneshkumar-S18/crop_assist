/**
 * AgriSense 3 High-Value Structured Demo Flows
 * Detect → Explain → Recommend → Act → Verify
 * 
 * Flow 1: Irrigation (Soil Moisture + Rain Forecast -> Motor Action -> Verify)
 * Flow 2: Nutrient Deficiency (NPK Sensor -> Nitrogen Chlorosis -> Fertilizer Advisory -> Verify)
 * Flow 3: Disease Risk + Weather (Leaf Scan + Humidity/Rain Risk -> Cultural/Chemical Management -> Verify)
 */

export const SUGGESTED_DEMO_QUESTIONS = {
  en: [
    "Should I irrigate my tomato field now?",
    "Why is my tomato plant showing yellow leaves?",
    "Is my tomato crop at risk of disease?"
  ],
  ta: [
    "இப்போது தக்காளி வயலுக்கு நீர் பாய்ச்ச வேண்டுமா?",
    "என் தக்காளி செடியின் இலைகள் ஏன் மஞ்சளாகின்றன?",
    "என் தக்காளி பயிருக்கு நோய் வரும் அபாயம் உள்ளதா?"
  ]
};

export const DEMO_FLOWS = {
  IRRIGATION: {
    id: "irrigation",
    intent: "IRRIGATION_FLOW",
    title: {
      en: "Intelligent Irrigation Flow",
      ta: "நுண்ணறிவு நீர்ப்பாசன செயல்முறை"
    },
    answer: {
      en: "Your soil moisture is low and no significant rainfall is expected. Irrigation is recommended for Zone 1. After watering, the system will recheck soil moisture to verify the improvement.",
      ta: "மண்ணின் ஈரப்பதம் குறைவாக உள்ளது, மேலும் குறிப்பிடத்தக்க மழை எதிர்பார்க்கப்படவில்லை. Zone 1-க்கு நீர்ப்பாசனம் பரிந்துரைக்கப்படுகிறது. நீர் பாய்ச்சிய பிறகு மண்ணின் ஈரப்பதத்தை மீண்டும் சரிபார்த்து மாற்றத்தை உறுதி செய்வோம்."
    },
    telemetry: {
      soil_moisture: "34%",
      soil_moisture_status: "Low Deficit (< 40%)",
      rain_probability: "18%",
      rain_status: "No rain expected",
      temperature: "31°C",
      crop_stage: "Flowering (Day 42)",
      zone: "Zone 1 - North Plot"
    },
    decision: {
      title: {
        en: "IRRIGATION RECOMMENDED",
        ta: "நீர்ப்பாசனம் பரிந்துரைக்கப்படுகிறது"
      },
      statusColor: "#0284c7",
      icon: "💧",
      reason: {
        en: "Low moisture (34%) + low rainfall probability (18%)",
        ta: "குறைந்த ஈரப்பதம் (34%) + குறைந்த மழை வாய்ப்பு (18%)"
      },
      recommendationDetail: {
        en: "Deliver precision drip irrigation for 35–45 minutes to restore root zone moisture.",
        ta: "வேர் மண்டல ஈரப்பதத்தை மீட்டெடுக்க 35–45 நிமிடங்கள் சொட்டு நீர் பாசனம் செய்யவும்."
      }
    },
    action: {
      label: {
        en: "⚡ Start Motor (Zone 1)",
        ta: "⚡ மோட்டாரை இயக்கு (Zone 1)"
      },
      actionType: "MOTOR_START",
      successMessage: {
        en: "✅ Motor 1 Activated for Zone 1 • Drip running for 35 minutes",
        ta: "✅ Zone 1-க்கான மோட்டார் இயக்கப்பட்டது • 35 நிமிடங்கள் இயங்கும்"
      }
    },
    verify: {
      title: {
        en: "✓ VERIFY",
        ta: "✓ சரிபார்ப்பு"
      },
      instruction: {
        en: "Recheck soil moisture after watering to verify the improvement.",
        ta: "நீர் பாய்ச்சிய பிறகு மண்ணின் ஈரப்பதத்தை மீண்டும் சரிபார்த்து மாற்றத்தை உறுதி செய்யவும்."
      },
      targetMetric: {
        en: "Target: 65% – 75% | Check window: 45 min",
        ta: "இலக்கு: 65% – 75% | சரிபார்ப்பு நேரம்: 45 நிமிடம்"
      }
    }
  },

  NUTRIENT: {
    id: "nutrient",
    intent: "NUTRIENT_FLOW",
    title: {
      en: "Nutrient Deficiency & NPK Advisory",
      ta: "ஊட்டச்சத்து குறைபாடு & NPK ஆலோசனை"
    },
    answer: {
      en: "The NPK sensor indicates low nitrogen in this zone. Nitrogen deficiency can cause older leaves to turn yellow. The system recommends a suitable nitrogen fertilizer, with compost/FYM as a natural alternative. Recheck NPK after treatment to verify the improvement.",
      ta: "இந்த Zone-ல் நைட்ரஜன் அளவு குறைவாக இருப்பதை NPK sensor காட்டுகிறது. நைட்ரஜன் குறைபாட்டால் பழைய இலைகள் மஞ்சளாகலாம். பொருத்தமான நைட்ரஜன் உரம் பரிந்துரைக்கப்படுகிறது; இயற்கை மாற்றாக கம்போஸ்ட் அல்லது தொழு உரம் பயன்படுத்தலாம். சிகிச்சைக்குப் பிறகு NPK அளவை மீண்டும் சரிபார்த்து முன்னேற்றத்தை உறுதி செய்வோம்."
    },
    telemetry: {
      nitrogen: "18 mg/kg",
      nitrogen_status: "Deficient (< 35 mg/kg)",
      phosphorus: "32 mg/kg",
      potassium: "42 mg/kg",
      chlorosis_index: "High (Older Leaves)",
      temperature: "31°C",
      crop_stage: "Flowering & Vegetative",
      zone: "Zone 1 - North Plot"
    },
    decision: {
      title: {
        en: "NITROGEN DEFICIENCY DETECTED",
        ta: "நைட்ரஜன் குறைபாடு கண்டறியப்பட்டது"
      },
      statusColor: "#d97706",
      icon: "🌿",
      reason: {
        en: "NPK sensor indicates low nitrogen (18 mg/kg) causing older leaves to turn yellow",
        ta: "NPK sensor குறைந்த நைட்ரஜனைக் (18 mg/kg) காட்டுகிறது, இது பழைய இலைகளை மஞ்சளாக்குகிறது"
      },
      solutions: {
        chemical: {
          en: "Chemical: Urea / Ammonium Sulphate (30 kg/ha)",
          ta: "வேதியியல் உரம்: யூரியா / அம்மோனியம் சல்பேட் (30 கிலோ/ஹெக்டேர்)"
        },
        organic: {
          en: "Natural Alternative: Well-decomposed Compost / FYM (5 tonnes/ha)",
          ta: "இயற்கை மாற்று: மக்கிய கம்போஸ்ட் / தொழு உரம் (5 டன்/ஹெக்டேர்)"
        }
      }
    },
    action: {
      label: {
        en: "📦 Order Nitrogen Fertilizer & Log Advisory",
        ta: "📦 நைட்ரஜன் உரத்தைப் பதிவு செய்"
      },
      actionType: "FERTILIZER_LOG",
      successMessage: {
        en: "✅ Fertilizer Advisory Logged • Application scheduled for tomorrow morning",
        ta: "✅ உர ஆலோசனை பதிவு செய்யப்பட்டது • நாளை காலை இட திட்டமிடப்பட்டுள்ளது"
      }
    },
    verify: {
      title: {
        en: "✓ VERIFY",
        ta: "✓ சரிபார்ப்பு"
      },
      instruction: {
        en: "Recheck NPK sensor values in 5–7 days to verify nutrient restoration.",
        ta: "சிகிச்சைக்குப் பிறகு NPK அளவை 5–7 நாட்களில் மீண்டும் சரிபார்த்து முன்னேற்றத்தை உறுதி செய்யவும்."
      },
      targetMetric: {
        en: "Target N: > 35 mg/kg | Verification cycle: 5–7 days",
        ta: "இலக்கு நைட்ரஜன்: > 35 mg/kg | சரிபார்ப்பு சுழற்சி: 5–7 நாட்கள்"
      }
    }
  },

  DISEASE: {
    id: "disease",
    intent: "DISEASE_FLOW",
    title: {
      en: "Disease Diagnosis & Microclimate Risk",
      ta: "நோய் கண்டறிதல் & நுண் வானிலை அபாயம்"
    },
    answer: {
      en: "The leaf scan indicates a possible fungal disease, and the current high humidity and rain probability increase the risk. Avoid unnecessary leaf wetting, improve airflow, and follow the recommended disease-management treatment. The system will continue monitoring the conditions.",
      ta: "இலை scan-ல் பூஞ்சை நோய்க்கான அறிகுறிகள் காணப்படுகின்றன. அதிக ஈரப்பதம் மற்றும் மழைக்கான வாய்ப்பு காரணமாக நோய் பரவும் அபாயம் அதிகமாக உள்ளது. தேவையில்லாமல் இலைகளை நனைப்பதைத் தவிர்த்து, காற்றோட்டத்தை மேம்படுத்தி, பரிந்துரைக்கப்பட்ட நோய் மேலாண்மை முறையை பின்பற்றுங்கள். இந்த நிலையை system தொடர்ந்து கண்காணிக்கும்."
    },
    telemetry: {
      scan_result: "Possible Fungal Disease (Early Blight - 94.2%)",
      humidity: "84%",
      humidity_status: "High Fungal Spore Index (> 80%)",
      rain_probability: "76%",
      temperature: "28°C",
      crop_stage: "Flowering & Fruit Setting",
      zone: "Zone 1 - North Plot"
    },
    decision: {
      title: {
        en: "HIGH FUNGAL SPREAD RISK",
        ta: "பூஞ்சை நோய் பரவும் அதிக அபாயம்"
      },
      statusColor: "#dc2626",
      icon: "🛡️",
      reason: {
        en: "Fungal leaf symptoms + high humidity (84%) + rain probability (76%)",
        ta: "பூஞ்சை அறிகுறிகள் + அதிக ஈரப்பதம் (84%) + மழை வாய்ப்பு (76%)"
      },
      management: {
        cultural: {
          en: "Cultural: Avoid leaf wetting & prune lower infected leaves to improve airflow",
          ta: "மேலாண்மை: இலைகளை நனைப்பதைத் தவிர்க்கவும், காற்றோட்டத்தை அதிகரிக்கவும்"
        },
        treatment: {
          en: "Treatment: Apply Mancozeb (2.5g/L) or Copper Oxychloride spray",
          ta: "சிகிச்சை: மேன்கோசெப் அல்லது காப்பர் ஆக்ஸிகுளோரைடு தெளிக்கவும்"
        }
      }
    },
    action: {
      label: {
        en: "🛡️ Schedule Preventive Spray Treatment",
        ta: "🛡️ தடுப்பு தெளிப்பு முறையைத் திட்டமிடு"
      },
      actionType: "SPRAY_SCHEDULE",
      successMessage: {
        en: "✅ Preventive Spray Schedule Activated • Weather window alerts on",
        ta: "✅ தடுப்பு தெளிப்பு அட்டவணை செயல்படுத்தப்பட்டது • வானிலை எச்சரிக்கை செயலில் உள்ளது"
      }
    },
    verify: {
      title: {
        en: "✓ VERIFY",
        ta: "✓ சரிபார்ப்பு"
      },
      instruction: {
        en: "The system will continue monitoring the conditions. Perform follow-up leaf scan in 3 days.",
        ta: "இந்த நிலையை system தொடர்ந்து கண்காணிக்கும். 3 நாட்களில் மீண்டும் இலை scan செய்யவும்."
      },
      targetMetric: {
        en: "24/7 Humidity Tracking • 3-Day Follow-up Visual Scan",
        ta: "24/7 ஈரப்பதம் கண்காணிப்பு • 3 நாள் மறு ஸ்கேன்"
      }
    }
  }
};

/**
 * Intelligent Keyword & Regex Matcher for Voice and Text
 * Matches variations in English and Tamil
 */
export function matchDemoFlow(query, fallbackLang = "en") {
  if (!query || typeof query !== "string") return null;

  const raw = query.trim();
  const q = raw.toLowerCase();

  // 1. Language detection: Check for Tamil Unicode characters
  const hasTamilChars = /[\u0B80-\u0BFF]/.test(raw);
  const detectedLang = hasTamilChars ? "ta" : (fallbackLang === "ta" ? "ta" : "en");

  // =========================================================================
  // FLOW 1: IRRIGATION
  // =========================================================================
  const irrigationEnglish = [
    "irrigate", "irrigation", "water", "watering", "should i irrigate",
    "should i water", "when to water", "water my tomato", "water field",
    "need water", "soil dry", "dry soil", "pump", "motor", "water now"
  ];
  const irrigationTamil = [
    "நீர்", "தண்ணீர்", "பாய்ச்ச", "பாசனம்", "ஈரப்பதம்", "தண்ணீர் பாய்ச்ச",
    "நீர் பாய்ச்ச", "விடலாமா", "விடணுமா", "பாய்ச்சலாமா", "மோட்டார்",
    "தண்ணி", "தண்ணி விடலாமா"
  ];

  const matchesIrrigation = 
    irrigationEnglish.some(k => q.includes(k)) ||
    irrigationTamil.some(k => raw.includes(k));

  // =========================================================================
  // FLOW 2: NUTRIENT DEFICIENCY (Yellow Leaves / Nitrogen / NPK)
  // =========================================================================
  const nutrientEnglish = [
    "yellow", "yellow leaves", "leaves yellow", "yellowing", "nitrogen",
    "npk", "nutrient", "deficiency", "fertilizer", "fertiliser", "older leaves",
    "pale leaves", "chlorosis", "compost", "urea", "manure"
  ];
  const nutrientTamil = [
    "மஞ்சள்", "இலைகள்", "மஞ்சளாக", "நைட்ரஜன்", "உரம்", "சத்து", "மஞ்சள் இலை",
    "இலை மஞ்சள்", "இலைகள் ஏன் மஞ்சளாகின்றன", "யூரியா"
  ];

  const matchesNutrient = 
    nutrientEnglish.some(k => q.includes(k)) ||
    nutrientTamil.some(k => raw.includes(k));

  // =========================================================================
  // FLOW 3: DISEASE RISK + WEATHER
  // =========================================================================
  const diseaseEnglish = [
    "disease", "risk", "fungal", "fungus", "leaf scan", "blight", "infection",
    "crop at risk", "crop risk", "disease risk", "humidity risk", "spores",
    "risk of disease", "at risk"
  ];
  const diseaseTamil = [
    "நோய்", "அபாயம்", "பூஞ்சை", "பாதிப்பு", "ஸ்கேன்", "நோய் வரும் அபாயம்",
    "நோய் அபாயம்", "பயிருக்கு நோய்"
  ];

  const matchesDisease = 
    diseaseEnglish.some(k => q.includes(k)) ||
    diseaseTamil.some(k => raw.includes(k));

  // Precedence matching
  if (matchesNutrient && (q.includes("yellow") || q.includes("nitrogen") || q.includes("npk") || raw.includes("மஞ்சள்") || raw.includes("நைட்ரஜன்") || raw.includes("உரம்"))) {
    return {
      flow: DEMO_FLOWS.NUTRIENT,
      flowKey: "NUTRIENT",
      language: detectedLang,
      reply: DEMO_FLOWS.NUTRIENT.answer[detectedLang] || DEMO_FLOWS.NUTRIENT.answer.en
    };
  }

  if (matchesDisease && (q.includes("disease") || q.includes("risk") || q.includes("fungal") || q.includes("fungus") || raw.includes("நோய்") || raw.includes("அபாயம்") || raw.includes("பூஞ்சை"))) {
    return {
      flow: DEMO_FLOWS.DISEASE,
      flowKey: "DISEASE",
      language: detectedLang,
      reply: DEMO_FLOWS.DISEASE.answer[detectedLang] || DEMO_FLOWS.DISEASE.answer.en
    };
  }

  if (matchesIrrigation) {
    return {
      flow: DEMO_FLOWS.IRRIGATION,
      flowKey: "IRRIGATION",
      language: detectedLang,
      reply: DEMO_FLOWS.IRRIGATION.answer[detectedLang] || DEMO_FLOWS.IRRIGATION.answer.en
    };
  }

  return null;
}
