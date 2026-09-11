import React, { useState } from 'react'
import {
  Power, Droplets, Play, Square, Settings, CloudRain,
  Thermometer, AlertTriangle, CheckCircle2, Sparkles, RefreshCw, Info
} from 'lucide-react'

const historyItems = [
  { date: 'Today', detail: 'Rain Delay Activated • Standby', duration: '11:45 AM' },
  { date: 'Sep 9, 2025', detail: 'Auto Drip Cycle • 30 min', duration: '6:00 AM' },
  { date: 'Sep 8, 2025', detail: 'Manual Fertigation • 45 min', duration: '7:15 AM' },
  { date: 'Sep 6, 2025', detail: 'Auto Drip Cycle • 25 min', duration: '6:30 AM' },
]

export default function IrrigationScreen() {
  const [mode, setMode] = useState('auto')
  const [selectedCropStage, setSelectedCropStage] = useState('Flowering & Fruit Setting')
  
  // Scenarios for testing and demonstration
  const [activeScenario, setActiveScenario] = useState('rain_delay') // 'rain_delay' | 'dry_heat' | 'optimal'

  const scenarioData = {
    rain_delay: {
      soilMoisture: 38,
      rainProb: 78,
      temperature: 29,
      motorStatus: false,
      badge: '🟡 Watch (Rain Delay)',
      badgeClass: 'warning',
      decisionTitle: 'Delay Irrigation — Rain Expected',
      decisionDesc: 'Soil moisture is low (38%), but rain probability is 78%. Incoming precipitation will naturally recharge root moisture. Delaying irrigation prevents root waterlogging and fertilizer leaching.',
      actionNote: 'Motor auto-suppressed for precipitation.'
    },
    dry_heat: {
      soilMoisture: 32,
      rainProb: 12,
      temperature: 31,
      motorStatus: true,
      badge: '🔴 Alert (Irrigate Now)',
      badgeClass: 'critical',
      decisionTitle: 'Irrigation Required Immediately',
      decisionDesc: 'Soil moisture is in the critical deficit band (32%) with dry weather (12% rain) and 31°C heat. Precision drip cycle active to prevent blossom abortion.',
      actionNote: 'Automated 35-minute drip cycle in progress.'
    },
    optimal: {
      soilMoisture: 72,
      rainProb: 20,
      temperature: 26,
      motorStatus: false,
      badge: '🟢 Normal (Optimal)',
      badgeClass: 'optimal',
      decisionTitle: 'Root Hydration Optimal',
      decisionDesc: 'Soil moisture (72%) is within the optimal 65%–85% target range for tomato flowering. No additional water required.',
      actionNote: 'Standby mode; monitoring transpiration.'
    }
  }

  const current = scenarioData[activeScenario]
  const [motorOn, setMotorOn] = useState(current.motorStatus)

  const handleScenarioChange = (scen) => {
    setActiveScenario(scen)
    setMotorOn(scenarioData[scen].motorStatus)
  }

  return (
    <div>
      <div className="screen-header">
        <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: 18, fontWeight: 700 }}>
          Smart Contextual Irrigation
        </h1>
      </div>

      <div className="irrigation-screen" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        
        {/* Scenario Switcher for Agronomic Demonstration */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }} className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
              🧪 Multi-Sensor Decision Scenarios:
            </span>
            <span style={{ fontSize: 10.5, color: '#16a34a', fontWeight: 600 }}>
              UGA & UC IPM Logic
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => handleScenarioChange('rain_delay')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                border: activeScenario === 'rain_delay' ? '1.5px solid #d97706' : '1px solid #e2e8f0',
                background: activeScenario === 'rain_delay' ? '#fef3c7' : '#fff',
                color: activeScenario === 'rain_delay' ? '#92400e' : '#475569',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🌧️ Rain Delay (38% + 78%)
            </button>
            <button
              onClick={() => handleScenarioChange('dry_heat')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                border: activeScenario === 'dry_heat' ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                background: activeScenario === 'dry_heat' ? '#fee2e2' : '#fff',
                color: activeScenario === 'dry_heat' ? '#991b1b' : '#475569',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ☀️ Dry Deficit (32% + 12%)
            </button>
            <button
              onClick={() => handleScenarioChange('optimal')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                border: activeScenario === 'optimal' ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                background: activeScenario === 'optimal' ? '#dcfce7' : '#fff',
                color: activeScenario === 'optimal' ? '#166534' : '#475569',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🟢 Optimal (72%)
            </button>
          </div>
        </div>

        {/* Multi-Sensor Telemetry Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }} className="animate-in">
          <div style={{ background: '#fff', padding: '10px 8px', borderRadius: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#0284c7', fontSize: 11, fontWeight: 600 }}>
              <Droplets size={14} /> Moisture
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: current.soilMoisture < 40 ? '#dc2626' : '#16a34a', marginTop: 2 }}>
              {current.soilMoisture}%
            </div>
            <span style={{ fontSize: 9.5, color: '#6b7280' }}>Target: 65%–85%</span>
          </div>

          <div style={{ background: '#fff', padding: '10px 8px', borderRadius: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#6366f1', fontSize: 11, fontWeight: 600 }}>
              <CloudRain size={14} /> Rain Prob
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: current.rainProb >= 60 ? '#2563eb' : '#475569', marginTop: 2 }}>
              {current.rainProb}%
            </div>
            <span style={{ fontSize: 9.5, color: '#6b7280' }}>Next 6–12h</span>
          </div>

          <div style={{ background: '#fff', padding: '10px 8px', borderRadius: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#ea580c', fontSize: 11, fontWeight: 600 }}>
              <Thermometer size={14} /> Temperature
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: current.temperature > 30 ? '#ea580c' : '#16a34a', marginTop: 2 }}>
              {current.temperature}°C
            </div>
            <span style={{ fontSize: 9.5, color: '#6b7280' }}>Canopy Temp</span>
          </div>
        </div>

        {/* CONTEXTUAL REASONING DECISION CARD */}
        <div style={{
          background: activeScenario === 'dry_heat' ? '#fef2f2' : activeScenario === 'rain_delay' ? '#fffbeb' : '#f0fdf4',
          border: `1.5px solid ${activeScenario === 'dry_heat' ? '#fecaca' : activeScenario === 'rain_delay' ? '#fde68a' : '#bbf7d0'}`,
          borderRadius: 12,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }} className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 6,
              background: activeScenario === 'dry_heat' ? '#fee2e2' : activeScenario === 'rain_delay' ? '#fef3c7' : '#dcfce7',
              color: activeScenario === 'dry_heat' ? '#991b1b' : activeScenario === 'rain_delay' ? '#92400e' : '#166534'
            }}>
              {current.badge}
            </span>
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
              🍅 Flowering Stage
            </span>
          </div>

          <h3 style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 800, color: '#111827' }}>
            {current.decisionTitle}
          </h3>

          <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.45 }}>
            {current.decisionDesc}
          </p>

          <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#4b5563' }}>
            <Sparkles size={14} color="#16a34a" />
            <span><strong>Smart Action:</strong> {current.actionNote}</span>
          </div>
        </div>

        {/* Motor Status Card */}
        <div className="motor-status-card animate-in" style={{ animationDelay: '0.05s' }}>
          <div className={`motor-indicator ${motorOn ? 'on' : 'off'}`}>
            <Power />
          </div>
          <div className="motor-info">
            <h4 style={{ margin: 0, fontSize: 13, color: 'var(--gray-600)' }}>Irrigation Pump</h4>
            <div className={`motor-state ${motorOn ? 'on' : 'off'}`} style={{ fontSize: 16, fontWeight: 800 }}>
              {motorOn ? '● RUNNING' : '● STANDBY / OFF'}
            </div>
          </div>
          <div className="motor-moisture">
            <div className="mm-label">Live Moisture</div>
            <div className="mm-value">{current.soilMoisture}%</div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="mode-section animate-in" style={{ animationDelay: '0.1s' }}>
          <div 
            className={`mode-option ${mode === 'auto' ? 'active' : ''}`}
            onClick={() => setMode('auto')}
          >
            <div className="mode-radio"></div>
            <div className="mode-label">
              <h5>Auto Reasoning Mode</h5>
              <p>Automatic multi-sensor correlation (Moisture + Rain + Temp)</p>
            </div>
          </div>
          <div 
            className={`mode-option ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => setMode('manual')}
          >
            <div className="mode-radio"></div>
            <div className="mode-label">
              <h5>Manual Override</h5>
              <p>Manually toggle irrigation motor on/off</p>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="animate-in" style={{ animationDelay: '0.15s' }}>
          {!motorOn ? (
            <button className="btn-irrigation btn-start" onClick={() => setMotorOn(true)}>
              <Play />
              Start Irrigation Cycle
            </button>
          ) : (
            <button className="btn-irrigation btn-stop" onClick={() => setMotorOn(false)}>
              <Square />
              Halt Irrigation
            </button>
          )}
        </div>

        {/* Irrigation History */}
        <div className="history-section animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="history-header">
            <h4>Decision & Cycle History</h4>
            <a href="#">View Logs</a>
          </div>
          {historyItems.map((item, i) => (
            <div className="history-item" key={i}>
              <div className="history-dot"></div>
              <div className="history-info">
                <span className="hi-date">{item.date}</span>
                <span className="hi-detail">{item.detail}</span>
              </div>
              <span className="history-duration">{item.duration}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
