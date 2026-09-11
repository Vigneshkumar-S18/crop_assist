import React from 'react'
import {
  Bell, MapPin, Droplets, Thermometer, CloudRain,
  Beaker, Leaf, Activity, Zap
} from 'lucide-react'

const sensorData = [
  {
    id: 'moisture',
    name: 'Soil Moisture',
    value: '38%',
    status: 'Watch (Rain Delay)',
    statusClass: 'warning',
    tier: '🟡 Watch',
    iconClass: 'moisture',
    icon: Droplets,
    unit: '%',
    numValue: 38,
    target: '65%–85% (Flowering)',
    chartData: [45, 42, 40, 39, 38, 38, 38, 37, 38, 38, 39, 38, 38, 38, 37, 38, 38, 38, 38, 39, 38, 38, 38, 38],
    min: { value: '37%', time: '10:30 AM' },
    max: { value: '48%', time: 'Yesterday' },
    avg: '39%',
    insight: 'Soil moisture is 38% with 78% rain forecasted. Contextual decision engine recommends delaying irrigation to prevent root rot and nutrient runoff.'
  },
  {
    id: 'temperature',
    name: 'Soil Temperature',
    value: '26°C',
    status: 'Optimal',
    statusClass: 'optimal',
    tier: '🟢 Normal',
    iconClass: 'temperature',
    icon: Thermometer,
    unit: '°C',
    numValue: 26,
    target: '20°C – 30°C',
    chartData: [20, 21, 22, 23, 24, 25, 26, 27, 28, 27, 26, 25, 24, 23, 22, 21, 20, 21, 22, 23, 24, 25, 24, 23],
    min: { value: '20°C', time: '05:00 AM' },
    max: { value: '28°C', time: '02:00 PM' },
    avg: '24°C',
    insight: 'Temperature is within the optimal 20–30°C window for tomato root metabolism and pollination. Watch if >30°C; Alert if >34°C (heat stress).'
  },
  {
    id: 'humidity',
    name: 'Relative Humidity',
    value: '76%',
    status: 'Watch',
    statusClass: 'warning',
    tier: '🟡 Watch',
    iconClass: 'humidity',
    icon: CloudRain,
    unit: '%',
    numValue: 76,
    target: '60% – 85%',
    chartData: [72, 70, 68, 65, 60, 58, 55, 52, 50, 52, 55, 58, 62, 65, 68, 70, 72, 74, 76, 76, 75, 76, 76, 76],
    min: { value: '50%', time: '02:30 PM' },
    max: { value: '78%', time: '06:00 PM' },
    avg: '68%',
    insight: 'Humidity is in the 76% watch band with incoming rain. If humidity exceeds 90%, disease risk for Early/Late Blight increases significantly.'
  },
  {
    id: 'npk',
    name: 'NPK Sensor',
    value: 'N:32 P:24 K:36',
    status: 'Low N/P',
    statusClass: 'warning',
    tier: '🔴 Alert (Flowering Target)',
    iconClass: 'npk',
    icon: Leaf,
    unit: 'mg/kg',
    numValue: 32,
    target: 'N:50-65 P:45-55 K:60-75',
    chartData: [45, 42, 40, 38, 36, 35, 34, 33, 32, 32, 31, 32, 32, 33, 32, 32, 31, 32, 32, 33, 32, 32, 32, 32],
    min: { value: '24 mg/kg', time: '06:00 AM' },
    max: { value: '45 mg/kg', time: 'Yesterday' },
    avg: '32 mg/kg',
    insight: 'Nitrogen (32) and Phosphorus (24) are below stage targets for flowering bud induction. Tap to view AI Dual-Track Fertilizer & Organic prescription.'
  },
  {
    id: 'ph',
    name: 'Soil pH',
    value: '6.5',
    status: 'Optimal',
    statusClass: 'optimal',
    tier: '🟢 Normal',
    iconClass: 'ph',
    icon: Beaker,
    unit: '',
    numValue: 6.5,
    target: '6.0 – 6.8',
    chartData: [6.3, 6.4, 6.5, 6.5, 6.6, 6.5, 6.4, 6.5, 6.6, 6.5, 6.4, 6.5, 6.5, 6.4, 6.5, 6.6, 6.5, 6.4, 6.5, 6.5, 6.6, 6.5, 6.4, 6.5],
    min: { value: '6.3', time: '08:00 AM' },
    max: { value: '6.6', time: '12:00 PM' },
    avg: '6.5',
    insight: 'pH 6.5 is ideal for tomato cultivation (6.0–6.8 range). Nutrient lockout risk is minimal.'
  },
  {
    id: 'ec',
    name: 'Salinity / EC',
    value: '1.4 dS/m',
    status: 'Optimal',
    statusClass: 'optimal',
    tier: '🟢 Normal',
    iconClass: 'tds',
    icon: Zap,
    unit: 'dS/m',
    numValue: 1.4,
    target: '< 2.0 dS/m',
    chartData: [1.2, 1.3, 1.4, 1.4, 1.5, 1.4, 1.3, 1.4, 1.4, 1.3, 1.4, 1.4, 1.4, 1.5, 1.4, 1.4, 1.3, 1.4, 1.4, 1.4, 1.3, 1.4, 1.4, 1.4],
    min: { value: '1.2 dS/m', time: '06:00 AM' },
    max: { value: '1.5 dS/m', time: '01:00 PM' },
    avg: '1.4 dS/m',
    insight: 'EC is 1.4 dS/m (normal <2.0 dS/m). Root osmotic pressure is balanced. Watch band is 2–4 dS/m; Alert is >4 dS/m.'
  },
  {
    id: 'tds',
    name: 'Water Quality',
    value: '320 ppm',
    status: 'Good',
    statusClass: 'good',
    tier: '🟢 Normal',
    iconClass: 'tds',
    icon: Zap,
    unit: 'ppm',
    numValue: 320,
    target: '< 500 ppm',
    chartData: [310, 315, 320, 318, 322, 325, 320, 315, 310, 312, 318, 320, 322, 320, 318, 315, 312, 315, 318, 320, 322, 320, 318, 320],
    min: { value: '310 ppm', time: '06:00 AM' },
    max: { value: '325 ppm', time: '01:00 PM' },
    avg: '318 ppm',
    insight: 'Water quality is within safe irrigation limits. TDS < 500 ppm ensures no emitter clogging or salt accumulation.'
  }
]

export default function HomeScreen({ onSensorClick, onWeatherClick, onAlertsClick }) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  })
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', minute: '2-digit', hour12: true 
  })

  return (
    <div>
      {/* Header */}
      <div className="home-header">
        <div className="home-greeting">
          <h2>Good Morning, Farmer! 👋</h2>
          <button
            className="notification-btn"
            onClick={onAlertsClick}
            title="View alerts and notifications"
            aria-label="Alerts"
          >
            <Bell />
            <span className="notification-dot"></span>
          </button>
        </div>
        <div className="home-meta">
          <div className="location">
            <MapPin />
            <span>My Tomato Farm ▾</span>
          </div>
          <div
            className="weather-badge"
            onClick={onWeatherClick}
            title="Click to view detailed weather forecast"
            role="button"
            tabIndex={0}
          >
            <span className="weather-icon">⛅</span>
            <span>28°C</span>
            <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>Partly Cloudy</span>
          </div>
        </div>
        <p className="home-date">📅 {dateStr} • {timeStr}</p>
      </div>

      {/* Hero Banner */}
      <div className="hero-banner animate-in">
        <div className="hero-banner-content">
          <h3>Healthy Crops<br/>Brighter Tomorrow</h3>
          <p>Monitor • Predict • Grow</p>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="sensor-grid">
        {sensorData.map((sensor, i) => {
          const Icon = sensor.icon
          return (
            <div
              key={sensor.id}
              className="sensor-card animate-in"
              style={{ animationDelay: `${0.05 + i * 0.05}s` }}
              onClick={() => onSensorClick(sensor)}
            >
              <div className="sensor-card-header">
                <div className={`sensor-icon ${sensor.iconClass}`}>
                  <Icon />
                </div>
                <span>{sensor.name}</span>
              </div>
              <div className="sensor-value">{sensor.value}</div>
              <span className={`sensor-status ${sensor.statusClass}`}>
                {sensor.status}
              </span>
            </div>
          )
        })}
      </div>

      {/* Field Health Score */}
      <div className="field-health animate-in" style={{ animationDelay: '0.35s' }}>
        <div className="field-health-title">
          <Activity />
          Field Health Score
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="health-score-circle" style={{ '--score': 78 }}>
            <div className="health-score-inner">
              <span className="score">78</span>
              <span className="total">/100</span>
            </div>
          </div>
          <div className="health-info">
            <p>Your tomato crop is in good condition 🌱</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export { sensorData }
