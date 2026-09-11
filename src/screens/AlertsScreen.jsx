import React, { useState } from 'react'
import {
  AlertTriangle, Droplets, Thermometer, Leaf, 
  Shield, Beaker, ChevronRight, ArrowLeft,
  CheckCircle2, Sparkles, RefreshCw, MessageSquare, Clock,
  Info, ExternalLink, Flame, ShieldAlert, Cpu,
  ChevronDown, ChevronUp, Sliders
} from 'lucide-react'

const alertsData = [
  {
    id: 'n_low',
    type: 'critical',
    severity: 'High',
    tier: '🔴 Alert',
    icon: Leaf,
    category: 'NPK Nutrition',
    title: 'Nitrogen Level Below Target',
    shortDesc: 'Soil N is 32 mg/kg (target: 50–65 mg/kg for Flowering stage). Lower leaves show pale yellowing and reduced vegetative vigor.',
    time: 'Just now',
    currentVal: 'N: 32 mg/kg',
    targetVal: '50–65 mg/kg',
    growthStage: 'Flowering & Fruit Setting',
    whyHappened: [
      'Soil nitrogen level is below the stage-specific target required for balanced flower and shoot development.',
      'Active flower cluster induction demands balanced nitrogen without inducing excessive vegetative runaway.',
      'Recent irrigation has caused minor downward nitrate migration in light textured soil.'
    ],
    fastSolution: {
      name: 'Urea (46-0-0) or Ammonium Nitrate',
      grade: '46% Fast-Acting Bioavailable N',
      dosage: '20–25 kg/acre (or 3.5 g/plant)',
      method: 'Drip fertigation directly at root zone (or band placement 10 cm from stem)',
      whySelected: 'Urea rapidly hydrolyzes into bioavailable ammonium and nitrate ions to replenish chlorophyll synthesis and restore deep green foliage in 3–5 days.',
      speed: '3–5 Days',
      confidence: '96%'
    },
    organicSolution: {
      name: 'Well-Decomposed Farmyard Manure (FYM) + Neem Seed Cake',
      dosage: '4–5 tons FYM/acre + 100 kg Neem Cake',
      method: 'Soil trenching around drip circle followed by light irrigation',
      whySelected: 'Enriches soil organic matter, provides steady nitrogen release without chemical root scorch, and Neem Cake suppresses root nematodes.',
      speed: '7–14 Days (Gradual soil conditioning)',
      confidence: '92%'
    },
    precautions: [
      '🌧️ Rain Forecast Warning: Rain probability is currently high (78%). Delay surface broadcasting to prevent nitrate runoff.',
      '💧 Moisture Check: Ensure soil moisture is above 35% before applying concentrated fertilizer to prevent root scorch.'
    ],
    actionSteps: [
      '1. Select either Fast Chemical Correction (Urea) for rapid recovery or Organic Alternative (FYM + Neem Cake).',
      '2. Deliver fertilizer via drip fertigation 10 cm away from main stems.',
      '3. Re-test IoT NPK sensor probe in 3–5 days to verify recovery to target range.'
    ],
    verification: {
      metric: 'Nitrogen (N)',
      baseline: '32 mg/kg',
      target: '55 mg/kg',
      window: '3–5 days'
    }
  },
  {
    id: 'moisture_rain_delay',
    type: 'warning',
    severity: 'Moderate',
    tier: '🟡 Watch (Rain Delay)',
    icon: Droplets,
    category: 'Smart Irrigation',
    title: 'Soil Moisture Low — Rain Delay Advised',
    shortDesc: 'Soil moisture is 38% 🔴, but Rain Probability is 78% 🌧️. Delay irrigation and recheck moisture after rainfall.',
    time: '11:45 AM',
    currentVal: '38% (Rain: 78%)',
    targetVal: '65% – 85% (Flowering)',
    growthStage: 'Flowering & Fruit Setting',
    whyHappened: [
      'Soil moisture has dropped to 38%, which is below the optimal 65%–85% range for tomato flowering.',
      'Incoming precipitation (78% rain probability) is forecasted to naturally replenish root moisture within 6–12 hours.',
      'Irrigating immediately before heavy rain risks root waterlogging, oxygen deprivation, and fungicide wash-off.'
    ],
    fastSolution: {
      name: 'Smart Irrigation Suppression & Drainage Clearance',
      grade: 'Contextual Multi-Sensor Logic',
      dosage: 'Motor: OFF (Standby Mode)',
      method: 'Hold irrigation; inspect drainage furrows to prevent water pooling',
      whySelected: 'Combining soil moisture + weather forecast prevents over-saturation, Pythium root rot, and wasted energy.',
      speed: 'Immediate Hold',
      confidence: '98%'
    },
    organicSolution: {
      name: 'Paddy Straw / Coconut Coir Mulching (2-inch layer)',
      dosage: '1.5 tons dry straw/acre',
      method: 'Spread around beds leaving 5 cm collar space around stems',
      whySelected: 'Mulch absorbs incoming rain impact, prevents soil splash on lower leaves, and retains moisture long-term.',
      speed: 'Preventive Soil Shield',
      confidence: '95%'
    },
    precautions: [
      'Check field drainage channels to ensure storm runoff flows smoothly away from root zones.',
      'Re-scan soil moisture telemetry 3 hours post-rainfall to verify if target 65%–85% is reached.'
    ],
    actionSteps: [
      '1. Keep automated irrigation pump in Standby / Suppressed mode.',
      '2. Allow incoming rainfall to naturally recharge root zone.',
      '3. Re-evaluate soil moisture telemetry after precipitation event.'
    ],
    verification: {
      metric: 'Soil Moisture Post-Rain',
      baseline: '38%',
      target: '65% – 80%',
      window: 'Post-Rain (6–12h)'
    }
  },
  {
    id: 'moisture_dry_alert',
    type: 'critical',
    severity: 'Critical',
    tier: '🔴 Alert (Irrigate Now)',
    icon: Droplets,
    category: 'Smart Irrigation',
    title: 'Soil Moisture Low — Irrigation Required',
    shortDesc: 'Soil moisture is 32% 🔴, Rain Probability is 12% ☀️, Temperature is 31°C. Precision drip irrigation cycle required immediately.',
    time: '10:30 AM',
    currentVal: '32% (Rain: 12%, Temp: 31°C)',
    targetVal: '65% – 85%',
    growthStage: 'Flowering & Fruit Setting',
    whyHappened: [
      'Soil moisture is in the critical deficit zone (<40%) with dry weather (12% rain risk) and elevated ambient temperature (31°C).',
      'Intense plant transpiration under warm sunny conditions causes rapid flower drop and blossom abortion if not rehydrated.'
    ],
    fastSolution: {
      name: 'Precision Drip Irrigation Cycle (35–45 min)',
      grade: 'Root-Targeted Hydration',
      dosage: '4–6 Liters per plant',
      method: 'Drip emitters directly at root zone (avoid wetting foliage)',
      whySelected: 'Quickly elevates root zone moisture to optimal 70% without creating humid canopy microclimates for fungal spores.',
      speed: '2–4 Hours',
      confidence: '98%'
    },
    organicSolution: {
      name: 'Paddy Straw Mulching + Deep Organic Compost Trench',
      dosage: '2 tons dry straw/acre',
      method: 'Spread around beds around plant drip line',
      whySelected: 'Reduces soil surface evaporation by 60% and moderates root temperature during hot midday sun.',
      speed: 'Long-term moisture buffering',
      confidence: '94%'
    },
    precautions: [
      'Deliver water directly at root level via drip; never use overhead sprinklers during flowering.',
      'Irrigate during early morning or late afternoon to minimize evaporative loss.'
    ],
    actionSteps: [
      '1. Start drip irrigation motor for 35 minutes.',
      '2. Monitor moisture telemetry reaching target 65%–75%.',
      '3. Maintain mulch cover to sustain hydration.'
    ],
    verification: {
      metric: 'Soil Moisture',
      baseline: '32%',
      target: '70%',
      window: '2 hours'
    }
  },
  {
    id: 'humidity_disease_risk',
    type: 'critical',
    severity: 'High',
    tier: '🔴 Alert (>90% RH)',
    icon: ShieldAlert,
    category: 'Crop Pathology',
    title: 'High Humidity & Fungal Disease Risk',
    shortDesc: 'Relative Humidity is 92% 🔴 with rain forecast. Extreme microclimate risk for Early Blight and Late Blight sporulation.',
    time: '09:30 AM',
    currentVal: '92% RH',
    targetVal: '60% – 85% RH',
    growthStage: 'Flowering & Fruit Setting',
    whyHappened: [
      'Prolonged relative humidity (>90%) provides the exact film of moisture needed for fungal spores (Alternaria, Phytophthora) to germinate.',
      'Incoming rain will cause water splashing that transfers pathogen innoculum from soil to lower tomato leaves.'
    ],
    fastSolution: {
      name: 'Protective Copper Oxychloride (50% WP) or Mancozeb (75% WP)',
      grade: 'Broad-Spectrum Contact Fungicide',
      dosage: '2.5 g / Liter water foliar spray',
      method: 'Fine mist spray covering upper and under leaf surfaces before rain',
      whySelected: 'Forms a protective chemical barrier that prevents fungal spore penetration into tomato leaf tissue.',
      speed: '24 Hours Protective Shield',
      confidence: '95%'
    },
    organicSolution: {
      name: 'Trichoderma harzianum + Cold-Pressed Neem Oil (10,000 ppm)',
      dosage: '5 g Trichoderma/L + 5 ml Neem Oil/L emulsified with organic soap',
      method: 'Foliar and root drench spray',
      whySelected: 'Beneficial bio-fungus Trichoderma parasitizes pathogen mycelium, while Neem oil strengthens plant cuticular wax.',
      speed: '48–72 Hours Bio-Colonization',
      confidence: '91%'
    },
    precautions: [
      'Apply preventive spray during clear morning window before rainfall begins.',
      'Prune lower 15 cm leaves touching soil to enhance airflow and prevent soil splash.'
    ],
    actionSteps: [
      '1. Prune yellowed bottom leaves touching the ground.',
      '2. Apply preventive Copper Oxychloride or Trichoderma bio-spray.',
      '3. Re-scan leaves using AgriSense AI Scanner in 3 days.'
    ],
    verification: {
      metric: 'Leaf Pathology Scan',
      baseline: 'High Fungal Risk (92% RH)',
      target: 'Protected / Lesion Free',
      window: '3 days'
    }
  },
  {
    id: 'ec_salinity_alert',
    type: 'warning',
    severity: 'Moderate',
    tier: '🟡 Watch (2–4 dS/m)',
    icon: Flame,
    category: 'Soil Salinity',
    title: 'Elevated Soil Salinity / High EC',
    shortDesc: 'Soil EC is 3.4 dS/m (normal: <2.0 dS/m). Osmotic root stress risk and impaired calcium transport.',
    time: '08:45 AM',
    currentVal: 'EC: 3.4 dS/m',
    targetVal: '< 2.0 dS/m',
    growthStage: 'All Stages',
    whyHappened: [
      'Accumulation of soluble salts in the root zone from continuous mineral fertigation or high-salinity groundwater.',
      'EC between 2–4 dS/m induces osmotic pressure, restricting tomato root water absorption even when soil is moist.'
    ],
    fastSolution: {
      name: 'Freshwater Soil Profile Leaching + Agricultural Gypsum',
      grade: 'Salinity Mitigation & Calcium Buffer',
      dosage: '50–75 kg Agricultural Gypsum/acre + freshwater flush',
      method: 'Broadcast gypsum and perform deep flushing irrigation',
      whySelected: 'Calcium from gypsum displaces excess sodium and chloride ions, moving them below the active root zone.',
      speed: '3–5 Days',
      confidence: '93%'
    },
    organicSolution: {
      name: 'Humic Acid (12% Liquid) + Enriched Farmyard Compost',
      dosage: '2.5 Liters Humic Acid/acre via drip + 2 tons compost',
      method: 'Drip fertigation during regular watering',
      whySelected: 'Humic substances buffer osmotic shock, chelate free mineral salts, and protect root hair membranes.',
      speed: '7–10 Days',
      confidence: '90%'
    },
    precautions: [
      'Avoid high-chloride fertilizers such as MOP (0-0-60); use Sulfate of Potash (SOP 0-0-50) instead.',
      'Ensure field drainage allows leached saline water to exit the root zone.'
    ],
    actionSteps: [
      '1. Apply gypsum or humic acid via irrigation.',
      '2. Flush root zone with low-EC irrigation water.',
      '3. Re-test EC sensor probe in 5 days.'
    ],
    verification: {
      metric: 'Electrical Conductivity (EC)',
      baseline: '3.4 dS/m',
      target: '< 2.0 dS/m',
      window: '5 days'
    }
  },
  {
    id: 'heat_stress_alert',
    type: 'critical',
    severity: 'High',
    tier: '🔴 Alert (>34°C)',
    icon: Thermometer,
    category: 'Thermal Stress',
    title: 'Severe Ambient Heat Stress Warning',
    shortDesc: 'Canopy temperature reached 35.5°C 🔴. Severe risk of pollen sterility, blossom abortion, and poor fruit set.',
    time: '01:15 PM',
    currentVal: '35.5°C',
    targetVal: '20°C – 30°C',
    growthStage: 'Flowering & Fruit Setting',
    whyHappened: [
      'Midday solar radiation and ambient temperature exceeding 34°C impairs tomato pollen viability.',
      'Temperatures above 34°C trigger flower drop and prevent normal fruit set.'
    ],
    fastSolution: {
      name: '30–35% Agri Shade Net Deployment + Micro-Sprinkler Cooling',
      grade: 'Physical Thermal Barrier',
      dosage: 'Deploy overhead 35% green shade net',
      method: 'Erect over plant trellis during 11:00 AM – 3:30 PM peak window',
      whySelected: 'Reduces direct canopy temperature by 4–6°C, protecting delicate flower reproductive structures.',
      speed: 'Immediate Thermal Relief',
      confidence: '97%'
    },
    organicSolution: {
      name: 'Reflective Kaolin Clay Spray (Surround WP) + Root Mulch',
      dosage: '30 g Kaolin Clay / Liter water foliar spray',
      method: 'Spray fine reflective particle film over foliage',
      whySelected: 'Kaolin clay reflects infrared solar radiation, keeping leaves and flowers 3°C cooler without hindering photosynthesis.',
      speed: '2–3 Days Protective Coat',
      confidence: '92%'
    },
    precautions: [
      'Maintain adequate root moisture to support natural evaporative cooling through transpiration.',
      'Avoid heavy nitrogen applications during heat waves which exacerbate thermal stress.'
    ],
    actionSteps: [
      '1. Deploy shade net over tomato rows.',
      '2. Apply kaolin clay or ensure soil moisture remains near 65%–75%.',
      '3. Re-check flower retention in 4 days.'
    ],
    verification: {
      metric: 'Canopy Temperature',
      baseline: '35.5°C',
      target: '< 30°C',
      window: 'Immediate'
    }
  },
  {
    id: 'ph_acidic_watch',
    type: 'warning',
    severity: 'Moderate',
    tier: '🟡 Watch (5.5–6.0)',
    icon: Beaker,
    category: 'Soil Chemistry',
    title: 'Soil pH Suboptimal / Acidic',
    shortDesc: 'Soil pH is 5.6 (optimal: 6.0–6.8). Risk of Phosphorus and Calcium nutrient lockout.',
    time: '08:00 AM',
    currentVal: 'pH: 5.6',
    targetVal: '6.0 – 6.8',
    growthStage: 'All Stages',
    whyHappened: [
      'Soil pH dropped into the acidic watch zone (5.5–6.0), binding bioavailable phosphate ions into insoluble mineral complexes.',
      'Acidic conditions also reduce root calcium uptake, increasing Blossom End Rot vulnerability.'
    ],
    fastSolution: {
      name: 'Agricultural Dolomite Lime (CaCO₃ + MgCO₃)',
      grade: 'Soil pH Neutralizer & Calcium-Magnesium Booster',
      dosage: '75–100 kg/acre broadcast',
      method: 'Broadcast into moist soil around root zone',
      whySelected: 'Gradually neutralizes active soil acidity, bringing pH back into the 6.2–6.8 sweet spot for maximum nutrient uptake.',
      speed: '7–14 Days',
      confidence: '94%'
    },
    organicSolution: {
      name: 'Wood Ash (Hardwood Ash) + Crushed Eggshell Compost',
      dosage: '50 kg Sifted Wood Ash/acre',
      method: 'Incorporate into topsoil around drip circle',
      whySelected: 'Wood ash contains natural potassium carbonate and calcium oxide that gently raises soil pH organically.',
      speed: '10–14 Days',
      confidence: '89%'
    },
    precautions: [
      'Do not apply lime simultaneously with ammonium fertilizers to prevent ammonia gas volatilization.',
      'Verify pH in 10 days using calibrated soil probe.'
    ],
    actionSteps: [
      '1. Apply dolomite lime or wood ash at root perimeter.',
      '2. Lightly irrigate to integrate into soil solution.',
      '3. Re-test pH in 10 days.'
    ],
    verification: {
      metric: 'Soil pH',
      baseline: '5.6',
      target: '6.2 – 6.6',
      window: '10 days'
    }
  }
]

export default function AlertsScreen({ onBack, onNavigateToChat, onNavigateToRecommend }) {
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [treatmentStatus, setTreatmentStatus] = useState({}) // { [alertId]: 'applied' | 'verified' | 'resolved' }
  const [isVerifying, setIsVerifying] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  
  // Clean click-to-reveal state in alert detail
  const [hasRevealedPlan, setHasRevealedPlan] = useState(false)
  const [activeSolutionTab, setActiveSolutionTab] = useState('chemical') // 'chemical' | 'organic'
  const [expandedSection, setExpandedSection] = useState(null) // 'why' | 'precautions' | 'protocol' | 'verification'

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleApplyTreatment = (alertId) => {
    setTreatmentStatus(prev => ({ ...prev, [alertId]: 'applied' }))
    showToast('🚀 Treatment scheduled & marked as In Progress!')
  }

  const handleVerifySensors = (alertId) => {
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      setTreatmentStatus(prev => ({ ...prev, [alertId]: 'verified' }))
      showToast('✅ IoT Sensors Verified: Nutrient levels moving back to optimal range!')
    }, 1400)
  }

  const handleMarkResolved = (alertId) => {
    setTreatmentStatus(prev => ({ ...prev, [alertId]: 'resolved' }))
    showToast('✨ Alert marked as Resolved!')
    setTimeout(() => {
      setSelectedAlert(null)
      setHasRevealedPlan(false)
    }, 1200)
  }

  const toggleAccordion = (key) => {
    setExpandedSection(prev => (prev === key ? null : key))
  }

  const handleAskAdvisor = (alert) => {
    if (onNavigateToChat) {
      onNavigateToChat(`I received an alert for ${alert.title}. How should I apply the recommended fertilizer and organic treatment?`)
    }
  }

  // =========================================================================
  // VIEW 1: Detailed Actionable Recommendation View (When an alert is clicked)
  // =========================================================================
  if (selectedAlert) {
    const alert = selectedAlert
    const status = treatmentStatus[alert.id]
    const Icon = alert.icon

    return (
      <div className="recommendation-detail-page">
        {/* Header */}
        <div className="screen-header" style={{ position: 'sticky', top: 0, zIndex: 30, background: '#fff' }}>
          <button
            className="back-btn"
            onClick={() => { setSelectedAlert(null); setHasRevealedPlan(false); setExpandedSection(null); }}
            aria-label="Back to Alert List"
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--gray-900)' }}>
              Actionable Alert Advisor
            </h1>
            <span style={{ fontSize: 11, color: 'var(--green-600)', fontWeight: 600 }}>
              AgriSense Recommendation Engine
            </span>
          </div>
          <div style={{ width: 32 }} />
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="alert-action-toast animate-in">
            {toastMessage}
          </div>
        )}

        <div className="recommendation-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Problem Header Banner */}
          <div className={`recommend-problem-banner ${alert.type} animate-in`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div className={`alert-indicator ${alert.type}`}>
                <Icon />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="rec-badge-category">{alert.category}</span>
                  <span className={`rec-badge-severity ${alert.type}`}>{alert.severity} Priority</span>
                </div>
                <h3 style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 800, color: 'var(--gray-900)' }}>
                  {alert.title}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--gray-700)', lineHeight: 1.45, margin: 0 }}>
              {alert.shortDesc}
            </p>

            <div className="rec-metrics-row">
              <div className="rec-metric-box">
                <span className="label">Current Sensor Reading</span>
                <span className="val current">{alert.currentVal}</span>
              </div>
              <div className="rec-metric-box">
                <span className="label">Optimal Target Range</span>
                <span className="val target">{alert.targetVal}</span>
              </div>
              <div className="rec-metric-box">
                <span className="label">Crop Phase</span>
                <span className="val stage">🍅 Fruiting Stage</span>
              </div>
            </div>
          </div>

          {/* Model Attribution Badge */}
          <div className="model-tag-bar animate-in" style={{ animationDelay: '0.05s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={14} color="#16a34a" />
              <span>Candidate ML: <strong>Poshan-fertilizer-recommendation</strong> (94.7% Acc)</span>
            </div>
            <span className="deficiency-pill">{alert.severity} Deficit</span>
          </div>

          {/* PROMINENT RECOMMENDATION TRIGGER BUTTON */}
          <div className="generate-action-box animate-in" style={{ animationDelay: '0.1s' }}>
            <button
              className="btn-generate-rec"
              onClick={() => setHasRevealedPlan(true)}
            >
              <Sparkles size={18} />
              <span>{hasRevealedPlan ? 'Remediation Plan Active' : 'Suggest Fertilizer & Organic Solution'}</span>
            </button>
            {!hasRevealedPlan && (
              <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 11, color: 'var(--gray-500)' }}>
                ⚡ Tap to generate targeted chemical and organic treatments to cure this alert.
              </p>
            )}
          </div>

          {/* REVEALED RESULTS: DUAL-TRACK SOLUTION (Clean Tab Switcher) */}
          {hasRevealedPlan && (
            <div className="recommendation-results-clean animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              {/* TAB SELECTOR */}
              <div className="solution-tabs-nav">
                <button
                  className={`sol-tab-btn ${activeSolutionTab === 'chemical' ? 'active chemical' : ''}`}
                  onClick={() => setActiveSolutionTab('chemical')}
                >
                  🚀 Fast Chemical Fertilizer
                </button>
                <button
                  className={`sol-tab-btn ${activeSolutionTab === 'organic' ? 'active organic' : ''}`}
                  onClick={() => setActiveSolutionTab('organic')}
                >
                  🌿 Natural / Organic Alternative
                </button>
              </div>

              {/* ACTIVE SOLUTION CARD */}
              {activeSolutionTab === 'chemical' ? (
                <div className="solution-card chemical animate-in">
                  <div className="solution-badge chemical">
                    <span>🚀 FAST CHEMICAL CORRECTION</span>
                    <span className="speed-pill">Response: {alert.fastSolution.speed}</span>
                  </div>
                  <h4 className="sol-name">{alert.fastSolution.name}</h4>
                  <div className="sol-grade">{alert.fastSolution.grade}</div>
                  
                  <div className="sol-meta-grid">
                    <div>
                      <span className="sol-meta-label">Prescription Dosage:</span>
                      <p className="sol-meta-val">{alert.fastSolution.dosage}</p>
                    </div>
                    <div>
                      <span className="sol-meta-label">Application Method:</span>
                      <p className="sol-meta-val">{alert.fastSolution.method}</p>
                    </div>
                  </div>

                  <div className="sol-why-box">
                    <strong>Why this was selected:</strong> {alert.fastSolution.whySelected}
                  </div>
                </div>
              ) : (
                <div className="solution-card organic animate-in">
                  <div className="solution-badge organic">
                    <span>🌿 NATURAL / LOW-COST ALTERNATIVE</span>
                    <span className="speed-pill">Sustainable Release</span>
                  </div>
                  <h4 className="sol-name">{alert.organicSolution.name}</h4>

                  <div className="sol-meta-grid">
                    <div>
                      <span className="sol-meta-label">Organic Dosage:</span>
                      <p className="sol-meta-val">{alert.organicSolution.dosage}</p>
                    </div>
                    <div>
                      <span className="sol-meta-label">Application Method:</span>
                      <p className="sol-meta-val">{alert.organicSolution.method}</p>
                    </div>
                  </div>

                  <div className="sol-why-box organic">
                    <strong>Soil Health Benefit:</strong> {alert.organicSolution.whySelected}
                  </div>
                </div>
              )}

              {/* CLEAN EXPANDABLE ACCORDIONS */}
              <div className="accordion-group">
                
                {/* Accordion 1: Why this happened */}
                <div className="accordion-item">
                  <button
                    className="accordion-header"
                    onClick={() => toggleAccordion('why')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Info size={15} color="var(--green-600)" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-900)' }}>
                        Why this happened (Root Cause Analysis)
                      </span>
                    </div>
                    {expandedSection === 'why' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {expandedSection === 'why' && (
                    <div className="accordion-content animate-in">
                      <ul className="rec-bullet-list">
                        {alert.whyHappened.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Field & Weather Precautions */}
                {alert.precautions && alert.precautions.length > 0 && (
                  <div className="accordion-item">
                    <button
                      className="accordion-header"
                      onClick={() => toggleAccordion('precautions')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={15} color="#ea580c" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#9a3412' }}>
                          Field & Weather Precautions (Rain Warning)
                        </span>
                      </div>
                      {expandedSection === 'precautions' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {expandedSection === 'precautions' && (
                      <div className="accordion-content precaution animate-in">
                        <ul className="rec-bullet-list precaution">
                          {alert.precautions.map((prec, idx) => (
                            <li key={idx}>{prec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Accordion 3: What to do (Protocol Checklist) */}
                <div className="accordion-item">
                  <button
                    className="accordion-header"
                    onClick={() => toggleAccordion('protocol')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={15} color="var(--green-600)" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-900)' }}>
                        What to Do (Step-by-Step Protocol)
                      </span>
                    </div>
                    {expandedSection === 'protocol' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {expandedSection === 'protocol' && (
                    <div className="accordion-content animate-in">
                      <div className="action-checklist">
                        {alert.actionSteps.map((step, idx) => (
                          <div key={idx} className="action-check-item">
                            <div className="check-number">{idx + 1}</div>
                            <p>{step.replace(/^\d+\.\s*/, '')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 4: Closed-Loop Sensor Verification */}
                <div className="accordion-item">
                  <button
                    className="accordion-header"
                    onClick={() => toggleAccordion('verification')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <RefreshCw size={15} color="var(--green-600)" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-900)' }}>
                        Closed-Loop IoT Verification ({alert.verification.window})
                      </span>
                    </div>
                    {expandedSection === 'verification' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {expandedSection === 'verification' && (
                    <div className="accordion-content animate-in">
                      <p style={{ fontSize: 12, color: 'var(--gray-600)', margin: '0 0 8px', lineHeight: 1.4 }}>
                        AgriSense monitors your field sensors to verify that treatment cures the deficiency.
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f0fdf4', padding: '8px 10px', borderRadius: 6, fontSize: 11, color: '#166534', fontWeight: 600 }}>
                        <span>Target: <strong>{alert.verification.target}</strong></span>
                        <span>Re-test: <strong>{alert.verification.window}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Buttons Bar */}
              <div className="rec-action-buttons animate-in" style={{ marginTop: 4 }}>
                <button
                  className={`btn-rec-action apply ${status === 'applied' ? 'in-progress' : ''}`}
                  onClick={() => handleApplyTreatment(alert.id)}
                >
                  <Flame size={16} />
                  {status === 'applied' ? 'Treatment in Progress' : 'Apply / Schedule Treatment'}
                </button>

                <button
                  className="btn-rec-action verify"
                  onClick={() => handleVerifySensors(alert.id)}
                  disabled={isVerifying}
                >
                  <RefreshCw size={16} className={isVerifying ? 'spin' : ''} />
                  {isVerifying ? 'Scanning IoT Sensors...' : 'Verify with IoT Sensors'}
                </button>

                <button
                  className="btn-rec-action advisor"
                  onClick={() => handleAskAdvisor(alert)}
                >
                  <MessageSquare size={16} />
                  Ask AgriSense Chat Advisor
                </button>

                <button
                  className="btn-rec-action resolve"
                  onClick={() => handleMarkResolved(alert.id)}
                >
                  <CheckCircle2 size={16} />
                  Mark Alert as Resolved
                </button>
              </div>

            </div>
          )}

          <div style={{ height: 20 }} />
        </div>
      </div>
    )
  }


  // =========================================================================
  // VIEW 2: Alert List Screen (Default View)
  // =========================================================================
  const [stageFilter, setStageFilter] = useState('All')
  const [showThresholdsGuide, setShowThresholdsGuide] = useState(false)

  const filteredAlerts = stageFilter === 'All'
    ? alertsData
    : alertsData.filter(a => a.growthStage === stageFilter || a.growthStage === 'All Stages')

  const highPriorityCount = filteredAlerts.filter(a => a.severity === 'High' || a.severity === 'Critical').length

  return (
    <div>
      <div className="screen-header">
        {onBack && (
          <button
            className="back-btn"
            onClick={onBack}
            aria-label="Back to Home"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: 18, fontWeight: 700 }}>
          Alerts & Recommendations
        </h1>
        <button
          onClick={() => setShowThresholdsGuide(true)}
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 12,
            fontWeight: 700,
            color: '#166534',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
          title="View Agronomic Decision Thresholds"
        >
          <Sliders size={14} />
          <span>Thresholds</span>
        </button>
      </div>

      <div className="alerts-screen">
        {/* Stage Filter Selector */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }} className="animate-in">
          {['All', 'Flowering & Fruit Setting', 'Vegetative', 'Seedling', 'Fruiting'].map(stg => (
            <button
              key={stg}
              onClick={() => setStageFilter(stg)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                border: 'none',
                fontSize: 11.5,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                background: stageFilter === stg ? '#16a34a' : '#f3f4f6',
                color: stageFilter === stg ? '#fff' : '#4b5563',
                transition: 'all 0.2s ease'
              }}
            >
              {stg === 'All' ? '🌱 All Stages' : `🍅 ${stg}`}
            </button>
          ))}
        </div>

        {/* Summary Card */}
        <div className="alert-summary animate-in" style={{ marginTop: 8 }}>
          <AlertTriangle />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>
              {highPriorityCount} priority alerts for {stageFilter === 'All' ? 'current crop cycle' : stageFilter}.
            </p>
            <span style={{ fontSize: 11, color: 'var(--gray-600)' }}>
              Stage-aware thresholds combined with live IoT telemetry & weather reasoning.
            </span>
          </div>
        </div>

        {/* Live Alert List */}
        <div className="alert-list">
          {filteredAlerts.map((alert, i) => {
            const Icon = alert.icon
            const status = treatmentStatus[alert.id]
            return (
              <div 
                className={`alert-card interactive animate-in ${alert.type}`} 
                key={alert.id}
                style={{ 
                  animationDelay: `${0.05 + i * 0.05}s`, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className={`alert-indicator ${alert.type}`}>
                  <Icon />
                </div>
                <div className="alert-content" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="alert-category-tag">{alert.category}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: alert.type === 'critical' ? '#fee2e2' : '#fef3c7', color: alert.type === 'critical' ? '#991b1b' : '#92400e' }}>
                        {alert.tier}
                      </span>
                      {status && (
                        <span className={`status-pill-small ${status}`}>
                          {status === 'applied' ? 'Applied' : status === 'verified' ? 'Verified' : 'Resolved'}
                        </span>
                      )}
                    </div>
                    <span className="alert-time">{alert.time}</span>
                  </div>

                  <h4 style={{ margin: '2px 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>
                    {alert.title}
                  </h4>
                  
                  <p style={{ margin: 0, fontSize: '12px', color: '#555', lineHeight: '1.4' }}>
                    {alert.shortDesc}
                  </p>

                  <div className="alert-tap-hint">
                    <span>💡 Tap for Fertilizer & Organic Recommendation</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* DECISION THRESHOLDS GUIDE MODAL */}
      {showThresholdsGuide && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 14,
            maxWidth: 520,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 20,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }} className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 10, marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#111827' }}>
                  🌱 AgriSense Sensor Decision Thresholds
                </h3>
                <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                  Stage-Aware Operational Decision Engine
                </span>
              </div>
              <button
                onClick={() => setShowThresholdsGuide(false)}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            {/* Thresholds Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '8px 6px', fontWeight: 700 }}>Parameter</th>
                    <th style={{ padding: '8px 6px', color: '#166534', fontWeight: 700 }}>🟢 Normal</th>
                    <th style={{ padding: '8px 6px', color: '#92400e', fontWeight: 700 }}>🟡 Watch</th>
                    <th style={{ padding: '8px 6px', color: '#991b1b', fontWeight: 700 }}>🔴 Alert / Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px', fontWeight: 600 }}>Soil Moisture*</td>
                    <td style={{ padding: '6px' }}>~60–85%</td>
                    <td style={{ padding: '6px' }}>40–60%</td>
                    <td style={{ padding: '6px', color: '#dc2626' }}>&lt;40% → Irrigation Check</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px', fontWeight: 600 }}>Temperature</td>
                    <td style={{ padding: '6px' }}>20–30°C</td>
                    <td style={{ padding: '6px' }}>30–34°C</td>
                    <td style={{ padding: '6px', color: '#dc2626' }}>&gt;34°C → Heat Stress</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px', fontWeight: 600 }}>Humidity</td>
                    <td style={{ padding: '6px' }}>60–85%</td>
                    <td style={{ padding: '6px' }}>85–90%</td>
                    <td style={{ padding: '6px', color: '#dc2626' }}>&gt;90% → Disease Risk</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px', fontWeight: 600 }}>Nitrogen (N)</td>
                    <td style={{ padding: '6px' }}>Stage Target (50-70)</td>
                    <td style={{ padding: '6px' }}>Below Target</td>
                    <td style={{ padding: '6px', color: '#dc2626' }}>Deficiency Alert</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px', fontWeight: 600 }}>Phosphorus (P)</td>
                    <td style={{ padding: '6px' }}>Stage Target (45-55)</td>
                    <td style={{ padding: '6px' }}>Below Target</td>
                    <td style={{ padding: '6px', color: '#dc2626' }}>Deficiency Alert</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px', fontWeight: 600 }}>Potassium (K)</td>
                    <td style={{ padding: '6px' }}>Stage Target (60-80)</td>
                    <td style={{ padding: '6px' }}>Below Target</td>
                    <td style={{ padding: '6px', color: '#dc2626' }}>Deficiency Alert</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px', fontWeight: 600 }}>Soil pH</td>
                    <td style={{ padding: '6px' }}>6.0–6.8</td>
                    <td style={{ padding: '6px' }}>5.5–6.0 / 6.8–7.5</td>
                    <td style={{ padding: '6px', color: '#dc2626' }}>&lt;5.5 or &gt;7.5 → Lockout</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px', fontWeight: 600 }}>EC / Salinity</td>
                    <td style={{ padding: '6px' }}>&lt;2 dS/m</td>
                    <td style={{ padding: '6px' }}>2–4 dS/m</td>
                    <td style={{ padding: '6px', color: '#dc2626' }}>&gt;4 dS/m → Salt Scorch</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px', fontWeight: 600 }}>Rain Probability</td>
                    <td style={{ padding: '6px' }}>&lt;30%</td>
                    <td style={{ padding: '6px' }}>30–60%</td>
                    <td style={{ padding: '6px', color: '#dc2626' }}>&gt;60% → Rain Delay</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Stage-Aware Moisture Ranges */}
            <div style={{ marginTop: 14, background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#334155' }}>
                🍅 Stage-Specific Optimal Soil Moisture Ranges:
              </h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                <li><strong>Seedling Stage:</strong> 50%–60% (avoid damping off)</li>
                <li><strong>Vegetative Development:</strong> 60%–85% (support vine growth)</li>
                <li><strong>Flowering & Fruit Set:</strong> 65%–85% (prevent blossom abortion)</li>
                <li><strong>Red-Fruit / Ripening:</strong> 60%–80% (prevent fruit cracking)</li>
              </ul>
            </div>

            {/* Calibration & Disclaimer Note */}
            <div style={{ marginTop: 12, background: '#fffbeb', padding: 10, borderRadius: 8, border: '1px solid #fef3c7', fontSize: 11, color: '#92400e', lineHeight: 1.45 }}>
              <strong>⚠️ Calibration & Prototype Notice:</strong>
              <p style={{ margin: '4px 0 0' }}>
                These are operational decision thresholds tailored for prototype decision support, not universal agronomic laws. 
                Exact soil moisture and NPK percentages depend on sensor model calibration (e.g. raw capacitive % vs volumetric water content) and extraction units (ppm / mg/kg vs kg/ha).
              </p>
            </div>

            <button
              onClick={() => setShowThresholdsGuide(false)}
              style={{
                marginTop: 14,
                width: '100%',
                padding: '10px',
                borderRadius: 8,
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              Got It, Close Reference
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

