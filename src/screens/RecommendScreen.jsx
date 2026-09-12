import React, { useState, useEffect } from 'react'
import {
  ArrowLeft, Share2, ChevronRight, CheckCircle2, Droplets,
  Thermometer, CloudRain, Sparkles, AlertTriangle, ShieldCheck,
  ShieldAlert, Leaf, Beaker, Zap, Clock
} from 'lucide-react'
import { useFarmSimulation } from '../simulation/SimulationContext'
import DemoModeBadge from '../components/DemoModeBadge'
import FertilizerGraphic from '../components/FertilizerGraphic'

export default function RecommendScreen({ onBack, onNavigateToChat, initialStage }) {
  const { farmState, mode } = useFarmSimulation();
  
  // Track default nutrient / recommendation tab based on active farm state
  const getDefaultNutrient = (currentMode) => {
    if (currentMode === 'DRY') return 'N';
    if (currentMode === 'WET') return 'PROTECT';
    return 'BALANCED';
  };

  const getTopicFromStage = (stage) => {
    if (!stage) return getDefaultNutrient(mode);
    const s = String(stage).toUpperCase();
    if (s === 'N' || s.includes('NITROGEN') || s === 'DRY') return 'N';
    if (s === 'P' || s.includes('PHOSPHORUS')) return 'P';
    if (s === 'K' || s.includes('POTASSIUM')) return 'K';
    if (s === 'PROTECT' || s === 'WET' || s.includes('DISEASE') || s.includes('HUMIDITY') || s.includes('SPORE')) return 'PROTECT';
    if (s === 'BALANCED' || s === 'NORMAL' || s.includes('FLOWER') || s.includes('FRUIT') || s.includes('VEGETATIVE') || s.includes('SEEDLING')) return 'BALANCED';
    return getDefaultNutrient(mode);
  };

  const [selectedTopic, setSelectedTopic] = useState(() => initialStage ? getTopicFromStage(initialStage) : getDefaultNutrient(mode));
  const [activeTab, setActiveTab] = useState('Overview');
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Auto-sync active topic whenever initialStage or farm state changes
  useEffect(() => {
    if (initialStage) {
      setSelectedTopic(getTopicFromStage(initialStage));
    } else {
      setSelectedTopic(getDefaultNutrient(mode));
    }
  }, [initialStage, mode]);

  // Live telemetry readings derived directly from centralized farm simulation
  const telemetry = {
    n: farmState.sensors.nitrogen,
    p: farmState.sensors.phosphorus,
    k: farmState.sensors.potassium,
    moisture: farmState.sensors.soil_moisture,
    temp: farmState.sensors.temperature,
    rain: farmState.weather.rain_probability
  };

  // Comprehensive state-driven recommendation knowledge engine
  const getRecommendationData = () => {
    // -------------------------------------------------------------
    // TOPIC / STATE: PHOSPHORUS (P) DEFICIT
    // -------------------------------------------------------------
    if (selectedTopic === 'P') {
      return {
        key: 'P',
        title: 'Phosphorus Boost & Root Development',
        subtitle: 'Flowering & Cluster Initiation Protocol',
        severity: telemetry.p < 30 ? 'Moderate Deficit' : 'Optimal (Target Zone)',
        badgeClass: telemetry.p < 30 ? 'warning' : 'success',
        iconBg: '#d97706',
        summary: (
          <>
            Phosphorus level is at <strong>{telemetry.p} mg/kg</strong> (optimal target 45–55 mg/kg).
            Adequate phosphorus is vital for ATP energy transfer, flower bud initiation, and robust root branching.
          </>
        ),
        fertilizer: {
          name: 'Single Super Phosphate (SSP 16% P₂O₅ + 11% S)',
          image: 'ssp',
          desc: 'High-solubility granular phosphate fortified with active sulfur for root vigor and early bloom.',
          rateMain: '40 – 50 kg per acre side-banded or 3.0 g/plant',
          rateSub: 'Incorporate into top 5 cm root zone soil during active flowering',
          reasons: [
            'Directly fuels floral cluster initiation and prevents premature bud abortion',
            '11% elemental sulfur enhances nutrient uptake and balances root zone pH',
            'Strengthens fine feeder roots against soil compaction'
          ]
        },
        organic: {
          name: 'Phosphate Rich Organic Manure (PROM) + Bone Meal Powder',
          image: 'compost',
          points: [
            'Fermented rock phosphate with organic matter provides slow, continuous phosphorus release',
            'Improves soil biological activity without chemical fixation',
            'Apply 250 g per plant around drip zone perimeter'
          ],
          otherOptions: 'Steamed bone meal (50 kg/acre), Vesicular Arbuscular Mycorrhizae (VAM 5 kg/acre)'
        },
        tips: [
          'Band phosphorus close to active root zones as phosphorus has low mobility in soil.',
          'Maintain soil pH between 6.2 and 6.8 to maximize phosphorus availability.',
          'Re-test soil phosphorus telemetry in 14 days to monitor uptake.'
        ]
      };
    }

    // -------------------------------------------------------------
    // TOPIC / STATE: POTASSIUM (K) DEFICIT
    // -------------------------------------------------------------
    if (selectedTopic === 'K') {
      return {
        key: 'K',
        title: 'Potassium (K) Sizing & Osmotic Defense',
        subtitle: 'Fruit Expansion & Heat Shield Protocol',
        severity: telemetry.k < 40 ? 'Critical Deficit' : 'Optimal (Target Zone)',
        badgeClass: telemetry.k < 40 ? 'danger' : 'success',
        iconBg: '#ea580c',
        summary: (
          <>
            Potassium is at <strong>{telemetry.k} mg/kg</strong> (optimal target 60–75 mg/kg).
            Potassium regulates stomatal conductance, prevents blossom-end rot, and drives sugar translocation into developing tomato fruit.
          </>
        ),
        fertilizer: {
          name: 'Potassium Nitrate (13:0:45) / Sulphate of Potash (SOP 0:0:50)',
          image: 'potassium',
          desc: '100% water-soluble chloride-free potassium formulation for rapid cell enlargement and drought tolerance.',
          rateMain: '3.0 – 4.0 g per Litre of irrigation water via drip',
          rateSub: 'Apply during early morning irrigation cycle every 4 days during fruit swell',
          reasons: [
            'Prevents blossom-end rot, fruit cracking, and uneven ripening (yellow shoulders)',
            'Regulates leaf stomata to reduce transpirational water loss under heat',
            'Elevates fruit brix (sweetness) and wall firmness for premium market grade'
          ]
        },
        organic: {
          name: 'Fermented Banana Peel Extract + Hardwood Ash Solution',
          image: 'banana',
          points: [
            'Rich in organic potassium and micronutrients (silica, magnesium)',
            'Dilute fermented extract 1:10 with water and drench around root zones',
            'Mulch with shredded dry banana leaves for extended potassium leaching'
          ],
          otherOptions: 'Wood ash (150 kg/acre broadcast), Bio-potash liquid microbial culture (1 L/acre)'
        },
        tips: [
          'Deliver potassium during fruit set to prevent blossom abortion.',
          'Avoid excess calcium competition by maintaining balanced fertigation intervals.',
          'Monitor fruit skin luster and firmness 5 days post-application.'
        ]
      };
    }

    // -------------------------------------------------------------
    // STATE 1: NORMAL (Mid-Stage Flowering & Fruit Setting Baseline)
    // -------------------------------------------------------------
    if (mode === 'NORMAL' && (selectedTopic === 'BALANCED' || selectedTopic === 'NORMAL')) {
      return {
        key: 'NORMAL',
        title: 'Balanced Stage Nutrition (Flowering & Fruit Setting)',
        subtitle: 'Mid-Stage UGA Agronomic Protocol',
        severity: 'Optimal (Target Zone)',
        badgeClass: 'success',
        iconBg: '#16a34a',
        summary: (
          <>
            Soil moisture is at an <strong>optimal 65%</strong> and NPK nutrient levels (<strong>N: {telemetry.n}, P: {telemetry.p}, K: {telemetry.k} mg/kg</strong>)
            are fully aligned with UGA target benchmarks for the tomato flowering and early fruit-setting stage. No emergency chemical correction is required.
          </>
        ),
        fertilizer: {
          name: 'Balanced NPK Fertigation (19:19:19 or 13:0:45 Maintenance)',
          image: 'npk',
          desc: 'High-purity 100% water-soluble nutrient formulation to sustain continuous flowering and fruit sizing.',
          rateMain: '2.0 – 2.5 g per Litre of irrigation water',
          rateSub: 'Apply via drip fertigation once every 4–5 days during morning cycle',
          reasons: [
            'Provides equal 1:1:1 NPK balance to support both root vigor and flower set',
            'Completely chloride-free and sodium-free to prevent root zone salinity',
            'Prevents early flower drop and supports uniform cluster development',
            'Maintains electrical conductivity (EC) safely at 1.4 dS/m'
          ]
        },
        organic: {
          name: 'Enriched Compost Tea + Cold-Pressed Humic Acid (12%)',
          image: 'compost',
          points: [
            'Supplies organic carbon and unlocks bound micronutrients in the root zone',
            'Stimulates beneficial rhizosphere mycorrhizal fungi',
            'Drench 2.5 Liters humic extract per acre with regular watering'
          ],
          otherOptions: 'Vermicompost (2 t/ha), Seaweed extract, Neem cake'
        },
        tips: [
          'Maintain steady soil moisture between 65% – 80% to ensure continuous nutrient uptake.',
          'Avoid heavy single doses of nitrogen that can trigger excessive vegetative runaway over flowering.',
          'Check drip emitters weekly for uniform flow rate and pressure.',
          'Monitor flower clusters for successful pollination and fruit setting.',
          'Re-test IoT telemetry every 24 hours to confirm values remain in the optimal band.'
        ]
      };
    }

    // -------------------------------------------------------------
    // STATE 2: DRY (Low Moisture 32%, Heat 34°C, Critical Low N & K)
    // -------------------------------------------------------------
    if (mode === 'DRY' || selectedTopic === 'N' || selectedTopic === 'DRY') {
      return {
        key: 'DRY',
        title: 'Critical Moisture & Nitrogen Deficiency',
        subtitle: 'Urgent Rehydration & Drip Fertigation Protocol',
        severity: 'Critical Deficit',
        badgeClass: 'danger',
        iconBg: '#dc2626',
        summary: (
          <>
            Soil moisture has dropped to a <strong>critical deficit (32%)</strong> under <strong>34°C ambient heat</strong> with
            severe depletion of Nitrogen (<strong>{telemetry.n} mg/kg</strong>) and Potassium (<strong>{telemetry.k} mg/kg</strong>).
            Active plant transpiration demands immediate rehydration and rapid-acting fertigation to prevent flower drop and chlorosis.
          </>
        ),
        fertilizer: {
          name: 'Fast-Acting Urea (46-0-0) + Potassium Nitrate (13:0:45)',
          image: 'urea',
          desc: 'Rapid bioavailable nitrogen and potassium for instant chlorophyll recovery and fruit retention.',
          rateMain: '25 – 30 kg Urea per acre (or 4.0 g/plant) via drip',
          rateSub: 'Combine with 5.0 g Potassium Nitrate/L water in 35-minute precision drip cycle',
          reasons: [
            'Rapidly restores leaf chlorophyll synthesis and halts lower leaf yellowing within 3–5 days',
            'Potassium replenishment prevents heat-induced flower abortion and fruit cracking',
            'Root-targeted drip fertigation delivers nutrients directly without foliage evaporative loss',
            'Relieves thermal stress on the tomato vascular xylem stream'
          ]
        },
        organic: {
          name: '2-Inch Paddy Straw Mulching + Fermented Banana Peel & Wood Ash Extract',
          image: 'banana',
          points: [
            'Straw mulch reduces soil evaporation by 60% and moderates root temperature by 4°C',
            'Fermented banana peel and wood ash provide rich bioavailable organic potassium',
            'Drench 250 ml diluted extract per plant directly at the drip perimeter'
          ],
          otherOptions: 'Neem cake (100 kg/acre), Well-cured FYM (4 t/acre), Humic acid drench'
        },
        tips: [
          'Hydrate root zone to >60% moisture via drip before applying concentrated fertilizer to prevent root scorch.',
          'Deliver irrigation during early morning (06:00 – 08:30 AM) to maximize transpirational efficiency.',
          'Deploy 30–35% overhead green shade nets during peak 11:00 AM – 3:30 PM heat hours.',
          'Recheck IoT moisture telemetry 2 hours post-cycle to confirm target 65%–75% is reached.',
          'Monitor newly emerging leaves for greening within 72 hours.'
        ]
      };
    }

    // -------------------------------------------------------------
    // STATE 3: WET (High Moisture 76%, Rain 78%, Fungal Spore Alert)
    // -------------------------------------------------------------
    if (mode === 'WET' || selectedTopic === 'PROTECT' || selectedTopic === 'WET') {
      return {
        key: 'WET',
        title: 'Rain Delay & Fungal Spore Prevention',
        subtitle: 'Disease Shield & Rain Suppression Protocol',
        severity: 'Watch (Rain Delay Active)',
        badgeClass: 'warning',
        iconBg: '#0284c7',
        summary: (
          <>
            Soil moisture is saturated at <strong>76%</strong> with <strong>78% rainfall probability (8.5 mm)</strong> and <strong>84% relative humidity</strong>.
            Do <strong>NOT</strong> apply soil fertilizers or run irrigation pumps now—excessive water will leach nitrates and cause root hypoxia.
            Prioritize preventative disease defense against Early Blight spores.
          </>
        ),
        fertilizer: {
          name: 'Preventative Copper Oxychloride (50% WP) / Mancozeb (75% WP)',
          image: 'copper',
          desc: 'Broad-spectrum contact protective foliar barrier against rain-splashed fungal spores.',
          rateMain: '2.5 g per Litre of water foliar mist',
          rateSub: 'Apply as a fine spray covering upper and lower leaf surfaces before heavy rain',
          reasons: [
            'Forms a protective chemical barrier that prevents Alternaria and Phytophthora spore penetration',
            'Rain suppression holds motor OFF to avoid root saturation and disease spread',
            'Zero nitrate runoff into field waterways during storm precipitation',
            'Maintains leaf canopy protection during prolonged 84% atmospheric humidity'
          ]
        },
        organic: {
          name: 'Trichoderma harzianum Bio-Fungicide + Cold-Pressed Neem Oil (10,000 ppm)',
          image: 'trichoderma',
          points: [
            'Beneficial fungus Trichoderma actively parasitizes and consumes pathogenic fungal spores',
            'Neem oil strengthens plant cuticular wax against moisture invasion',
            'Spray 5 g Trichoderma + 5 ml Neem Oil per Litre water emulsified with organic soap'
          ],
          otherOptions: 'Pseudomonas fluorescens (5 g/L), Panchagavya foliar spray (3%)'
        },
        tips: [
          'Keep irrigation pump in Standby / Suppressed mode during rainfall.',
          'Clear field drainage furrows to ensure excess surface water drains away from stem collars.',
          'Prune lower 15 cm leaves touching wet soil to eliminate splash transmission of pathogens.',
          'Postpone all solid/granule fertilizer broadcasting until rainfall event concludes.',
          'Re-scan foliage with AgriSense AI Scanner 48 hours post-rainfall to verify zero lesion spread.'
        ]
      };
    }

    // Default Fallback
    return {
      key: 'DEFAULT',
      title: 'Balanced Nutrition & Soil Management',
      subtitle: 'Standard Tomato Flowering Protocol',
      severity: 'Standard Mode',
      badgeClass: 'success',
      iconBg: '#16a34a',
      summary: <>Maintain balanced irrigation and stage-appropriate nutrient monitoring.</>,
      fertilizer: {
        name: 'Balanced NPK (19:19:19)',
        image: 'npk',
        desc: 'Balanced soluble fertilizer.',
        rateMain: '2.5 g / Litre',
        rateSub: 'Apply via drip',
        reasons: ['Balanced nutrition for tomato crops']
      },
      organic: {
        name: 'Farmyard Manure (FYM)',
        image: 'compost',
        points: ['Improves soil health'],
        otherOptions: 'Compost'
      },
      tips: ['Maintain soil moisture.']
    };
  };

  const current = getRecommendationData();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `AgriSense - ${current.title}`,
        text: `AgriSense Recommendation for Tomato (${mode} State):\n• ${current.title} (${current.severity})\n• Recommended: ${current.fertilizer.name}\n• Organic: ${current.organic.name}`
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(
        `AgriSense Recommendation (${mode} State) - ${current.title}\n• Recommended: ${current.fertilizer.name}\n• Organic: ${current.organic.name}`
      );
      alert('Prescription copied to clipboard!');
    }
  };

  return (
    <div className="recommend-view-wrapper">
      {/* 1. TOP HEADER */}
      <div className="recommend-top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        {onBack ? (
          <button className="top-icon-btn" onClick={onBack} aria-label="Go Back">
            <ArrowLeft size={22} color="#111827" />
          </button>
        ) : <div style={{ width: 32 }} />}
        
        <div style={{ textAlign: 'center' }}>
          <h1 className="top-title" style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Agronomic Recommendation</h1>
          <DemoModeBadge />
        </div>

        <button className="top-icon-btn" onClick={handleShare} aria-label="Share">
          <Share2 size={20} color="#111827" />
        </button>
      </div>

      {/* SCROLLABLE MAIN CONTENT */}
      <div className="recommend-content-body">
        
        {/* LIVE TELEMETRY & NPK SELECTOR CARD */}
        <div className="live-telemetry-panel">
          <div className="telemetry-header-row">
            <h3 className="telemetry-panel-title">Live Field Telemetry &amp; Nutrients</h3>
            <div className="source-toggle-group">
              <button
                className={`src-toggle-btn ${!isManualEntry ? 'active' : ''}`}
                onClick={() => setIsManualEntry(false)}
              >
                📡 IoT Sensors
              </button>
              <button
                className={`src-toggle-btn ${isManualEntry ? 'active' : ''}`}
                onClick={() => setIsManualEntry(true)}
              >
                ✍️ Soil Lab Test
              </button>
            </div>
          </div>

          {/* Interactive 3-Card NPK Row */}
          <div className="npk-cards-grid">
            
            {/* Nitrogen Card */}
            <div
              className={`npk-card-item n ${selectedTopic === 'N' || (mode === 'DRY' && selectedTopic === 'DRY') ? 'selected' : ''}`}
              onClick={() => setSelectedTopic('N')}
            >
              <div className="npk-avatar n">N</div>
              {isManualEntry ? (
                <input
                  type="number"
                  value={telemetry.n}
                  onChange={(e) => setTelemetry({ ...telemetry, n: Number(e.target.value) })}
                  className="npk-input-mini"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="npk-reading">
                  <strong>{telemetry.n}</strong> <span className="unit">mg/kg</span>
                </div>
              )}
              <div className={`npk-pill-tag ${telemetry.n < 30 ? 'danger' : 'optimal'}`}>
                {telemetry.n < 30 ? '🔴 Low N' : '🟢 Optimal N'}
              </div>
            </div>

            {/* Phosphorus Card */}
            <div
              className={`npk-card-item p ${selectedTopic === 'P' ? 'selected' : ''}`}
              onClick={() => setSelectedTopic('P')}
            >
              <div className="npk-avatar p">P</div>
              {isManualEntry ? (
                <input
                  type="number"
                  value={telemetry.p}
                  onChange={(e) => setTelemetry({ ...telemetry, p: Number(e.target.value) })}
                  className="npk-input-mini"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="npk-reading">
                  <strong>{telemetry.p}</strong> <span className="unit">mg/kg</span>
                </div>
              )}
              <div className={`npk-pill-tag ${telemetry.p < 30 ? 'warning' : 'optimal'}`}>
                {telemetry.p < 30 ? '🟡 Watch P' : '🟢 Optimal P'}
              </div>
            </div>

            {/* Potassium Card */}
            <div
              className={`npk-card-item k ${selectedTopic === 'K' ? 'selected' : ''}`}
              onClick={() => setSelectedTopic('K')}
            >
              <div className="npk-avatar k">K</div>
              {isManualEntry ? (
                <input
                  type="number"
                  value={telemetry.k}
                  onChange={(e) => setTelemetry({ ...telemetry, k: Number(e.target.value) })}
                  className="npk-input-mini"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="npk-reading">
                  <strong>{telemetry.k}</strong> <span className="unit">mg/kg</span>
                </div>
              )}
              <div className={`npk-pill-tag ${telemetry.k < 40 ? 'danger' : 'optimal'}`}>
                {telemetry.k < 40 ? '🔴 Low K' : '🟢 Optimal K'}
              </div>
            </div>

          </div>

          {/* Environmental Telemetry Bottom Chips */}
          <div className="telemetry-env-chips-row">
            <span className="telemetry-chip">
              <Droplets size={13} color={telemetry.moisture < 40 ? '#ef4444' : '#3b82f6'} />
              Moisture: <strong style={{ color: telemetry.moisture < 40 ? '#dc2626' : '#166534' }}>{telemetry.moisture}%</strong>
            </span>
            <span className="telemetry-chip">
              <Thermometer size={13} color={telemetry.temp > 30 ? '#ea580c' : '#16a34a'} />
              Temp: <strong>{telemetry.temp}°C</strong>
            </span>
            <span className="telemetry-chip">
              <CloudRain size={13} color="#0284c7" />
              Rain (6h): <strong style={{ color: telemetry.rain > 50 ? '#0284c7' : '#475569' }}>{telemetry.rain}%</strong>
            </span>
          </div>
        </div>

        {/* 2. DYNAMIC STATE DEFICIENCY / MAINTENANCE HERO BANNER */}
        <div className="deficiency-banner-card animate-fade" key={current.key}>
          <div className="deficiency-icon-box" style={{ background: current.iconBg }}>
            {mode === 'WET' ? (
              <CloudRain size={22} color="#ffffff" />
            ) : mode === 'DRY' ? (
              <Thermometer size={22} color="#ffffff" />
            ) : (
              <Leaf size={22} color="#ffffff" />
            )}
          </div>
          <div className="deficiency-meta">
            <h2 className="deficiency-title">{current.title}</h2>
            <p className="deficiency-sub">{current.subtitle}</p>
          </div>
          <div className={`deficiency-status-badge ${current.badgeClass}`}>
            <span className="bar-icon">
              <span className="b1"></span>
              <span className="b2"></span>
              <span className="b3"></span>
            </span>
            <span>{current.severity}</span>
          </div>
        </div>

        {/* 3. HORIZONTAL SEGMENTED TABS */}
        <div className="recommend-tabs-row">
          {['Overview', 'Fertilizer / Plan', 'Natural Methods', 'Protocol Steps'].map(tab => (
            <button
              key={tab}
              className={`rec-tab-pill ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 4. SECTION 1: PROBLEM / STATE SUMMARY */}
        <div className="rec-section-item">
          <div className="rec-section-heading-row">
            <div className={`rec-heading-icon ${mode === 'DRY' ? 'red-circle' : mode === 'WET' ? 'blue-circle' : 'green-circle'}`}>
              <Sparkles size={14} color="#ffffff" />
            </div>
            <h3 className="rec-section-title">1. Current Farm Condition &amp; Diagnosis</h3>
          </div>
          <p className="rec-summary-paragraph">
            {current.summary}
          </p>
        </div>

        {/* 5. SECTION 2: PRIMARY RECOMMENDED SOLUTION */}
        <div className="rec-section-item">
          <div className="rec-section-heading-row justify-between">
            <div className="flex-align-center">
              <div className="rec-heading-icon green-circle">
                <CheckCircle2 size={14} color="#ffffff" />
              </div>
              <h3 className="rec-section-title">2. Recommended Primary Action</h3>
            </div>
            <span className="primary-solution-tag">
              {mode === 'WET' ? '🛡️ Preventative Shield' : mode === 'DRY' ? '⚡ Emergency Drip Action' : '🌿 Maintenance Plan'}
            </span>
          </div>

          {/* Fertilizer / Chemical / Prescription Card */}
          <div className="rec-card-box animate-fade" key={`sol-${current.key}`}>
            <div className="card-top-row">
              <div className="card-img-container">
                <FertilizerGraphic
                  type={current.fertilizer.image || current.fertilizer.name}
                  className="fertilizer-bag-image animate-fade"
                />
              </div>
              <div className="card-top-info">
                <h4 className="product-title">{current.fertilizer.name}</h4>
                <p className="product-desc">{current.fertilizer.desc}</p>
              </div>
            </div>

            {/* Inner Box 1: Application Rate */}
            <div className="inner-green-box">
              <h5 className="inner-box-green-title">Application Rate &amp; Method</h5>
              <div className="rate-row main">
                <span>• {current.fertilizer.rateMain}</span>
                <ChevronRight size={16} color="#15803d" />
              </div>
              {current.fertilizer.rateSub && (
                <div className="rate-row sub">
                  <span>• {current.fertilizer.rateSub}</span>
                </div>
              )}
            </div>

            {/* Inner Box 2: Why this solution? */}
            <div className="inner-amber-box">
              <h5 className="inner-box-amber-title">Why this prescription was selected:</h5>
              <ul className="why-check-list">
                {current.fertilizer.reasons.map((reason, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={15} color="#16a34a" className="check-icon" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 6. SECTION 3: NATURAL / ORGANIC ALTERNATIVES */}
        <div className="rec-section-item">
          <div className="rec-section-heading-row justify-between">
            <div className="flex-align-center">
              <div className="rec-heading-icon darkgreen-circle">
                <Leaf size={14} color="#ffffff" />
              </div>
              <h3 className="rec-section-title">3. Natural &amp; Organic Sustainable Alternative</h3>
            </div>
            <span className="eco-friendly-tag">Eco-Friendly Option</span>
          </div>

          {/* Organic Card */}
          <div className="rec-card-box animate-fade" key={`org-${current.key}`}>
            <div className="card-top-row organic">
              <div className="compost-img-container">
                <FertilizerGraphic
                  type={current.organic.image || current.organic.name}
                  className="compost-image animate-fade"
                />
              </div>
              <div className="card-top-info">
                <h4 className="product-title organic">{current.organic.name}</h4>
                <ul className="organic-bullet-list">
                  {current.organic.points.map((pt, idx) => (
                    <li key={idx}>• {pt}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="other-options-text">
              <strong>Additional low-cost options:</strong> {current.organic.otherOptions}
            </div>
          </div>
        </div>

        {/* 7. SECTION 4: ACTIONABLE TIPS */}
        <div className="rec-section-item">
          <div className="rec-section-heading-row">
            <div className="rec-heading-icon blue-circle">
              <Clock size={14} color="#ffffff" />
            </div>
            <h3 className="rec-section-title">4. Agronomic Best Practices &amp; Next Steps</h3>
          </div>

          <div className="additional-tips-box">
            <ol className="tips-ordered-list">
              {current.tips.map((tip, idx) => (
                <li key={idx}>
                  <span className="tip-num">{idx + 1}.</span>
                  <span className="tip-text">{tip}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Consult AgriSense Chat Assistant Button */}
        {onNavigateToChat && (
          <div style={{ marginTop: 8, padding: '0 4px' }}>
            <button
              onClick={() => onNavigateToChat(`I am viewing the ${mode} farm state recommendation for ${current.title}. Please provide step-by-step guidance on how to apply ${current.fertilizer.name}.`)}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)'
              }}
            >
              <Sparkles size={16} />
              <span>Ask AgriSense Copilot About This Prescription</span>
            </button>
          </div>
        )}

        <div style={{ height: 32 }}></div>
      </div>
    </div>
  )
}
