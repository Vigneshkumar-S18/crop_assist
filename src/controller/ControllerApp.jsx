import React from 'react';
import { Sun, Droplets, RotateCcw, Activity, Wifi, Zap, Thermometer, CloudRain, CheckCircle2 } from 'lucide-react';
import { useFarmSimulation } from '../simulation/SimulationContext';

export default function ControllerApp({ onSwitchToDashboard }) {
  const { mode, farmState, setFarmMode, isConnected, lastUpdated } = useFarmSimulation();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: '#f8fafc',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18
        }}
      >
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Activity size={24} color="#22c55e" />
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: '900', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              FARM SIMULATOR
            </h1>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8', fontWeight: '500' }}>
            AgriSense Hackathon Presentation Controller
          </p>
        </div>

        {/* Connection Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: isConnected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: isConnected ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
            padding: '6px 16px',
            borderRadius: 20,
            fontSize: 12.5,
            fontWeight: '700',
            color: isConnected ? '#4ade80' : '#f87171'
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isConnected ? '#22c55e' : '#ef4444',
              boxShadow: isConnected ? '0 0 10px #22c55e' : 'none'
            }}
          />
          <span>Connected: {isConnected ? '● ONLINE' : '○ CONNECTING...'}</span>
        </div>

        {/* Main Action Buttons Grid */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14, marginTop: 6 }}>
          {/* DRY BUTTON */}
          <button
            id="btn-dry-state"
            onClick={() => setFarmMode('DRY')}
            style={{
              width: '100%',
              padding: '22px 20px',
              borderRadius: 18,
              border: mode === 'DRY' ? '3px solid #f59e0b' : '2px solid #334155',
              background: mode === 'DRY'
                ? 'linear-gradient(135deg, #b45309 0%, #d97706 100%)'
                : '#1e293b',
              color: '#ffffff',
              fontSize: 20,
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              boxShadow: mode === 'DRY'
                ? '0 0 28px rgba(245, 158, 11, 0.55), inset 0 0 12px rgba(255, 255, 255, 0.25)'
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
              transform: mode === 'DRY' ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Sun size={30} color={mode === 'DRY' ? '#fef08a' : '#fbbf24'} />
            <span>☀️ DRY STATE</span>
            {mode === 'DRY' && <CheckCircle2 size={20} color="#fef08a" style={{ marginLeft: 'auto' }} />}
          </button>

          {/* WET BUTTON */}
          <button
            id="btn-wet-state"
            onClick={() => setFarmMode('WET')}
            style={{
              width: '100%',
              padding: '22px 20px',
              borderRadius: 18,
              border: mode === 'WET' ? '3px solid #38bdf8' : '2px solid #334155',
              background: mode === 'WET'
                ? 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)'
                : '#1e293b',
              color: '#ffffff',
              fontSize: 20,
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              boxShadow: mode === 'WET'
                ? '0 0 28px rgba(56, 189, 248, 0.55), inset 0 0 12px rgba(255, 255, 255, 0.25)'
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
              transform: mode === 'WET' ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Droplets size={30} color={mode === 'WET' ? '#bae6fd' : '#38bdf8'} />
            <span>💧 WET STATE</span>
            {mode === 'WET' && <CheckCircle2 size={20} color="#bae6fd" style={{ marginLeft: 'auto' }} />}
          </button>

          {/* NORMAL / RESET BUTTON */}
          <button
            id="btn-normal-state"
            onClick={() => setFarmMode('NORMAL')}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 14,
              border: mode === 'NORMAL' ? '2px solid #22c55e' : '1px solid #334155',
              background: mode === 'NORMAL'
                ? 'rgba(34, 197, 94, 0.18)'
                : 'transparent',
              color: mode === 'NORMAL' ? '#4ade80' : '#94a3b8',
              fontSize: 14,
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <RotateCcw size={16} />
            <span>Reset to Baseline (NORMAL)</span>
          </button>
        </div>

        {/* Current State & Telemetry Info Box */}
        <div
          style={{
            width: '100%',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 18,
            padding: '18px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: '600' }}>Current State:</span>
            <span
              style={{
                fontSize: 14,
                fontWeight: '900',
                padding: '5px 12px',
                borderRadius: 10,
                letterSpacing: '0.5px',
                background: mode === 'DRY' ? '#78350f' : mode === 'WET' ? '#0c4a6e' : '#14532d',
                color: mode === 'DRY' ? '#fde68a' : mode === 'WET' ? '#bae6fd' : '#bbf7d0',
                border: `1px solid ${mode === 'DRY' ? '#f59e0b' : mode === 'WET' ? '#38bdf8' : '#22c55e'}`
              }}
            >
              {mode}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: '600' }}>Last Updated:</span>
            <span style={{ fontSize: 13, color: '#f8fafc', fontWeight: '700', fontFamily: 'monospace' }}>
              {lastUpdated}
            </span>
          </div>

          <div style={{ borderTop: '1px solid #334155', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🌱 Soil Moisture:</span>
              <strong style={{ color: farmState.sensors.soil_moisture < 40 ? '#f87171' : '#4ade80' }}>
                {farmState.sensors.soil_moisture_str}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🌡️ Temperature:</span>
              <strong style={{ color: farmState.sensors.temperature > 30 ? '#fb923c' : '#4ade80' }}>
                {farmState.sensors.temperature_str}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>💧 Humidity:</span>
              <strong>{farmState.sensors.humidity_str}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🌧️ Rain Probability:</span>
              <strong style={{ color: farmState.weather.rain_probability > 50 ? '#38bdf8' : '#94a3b8' }}>
                {farmState.weather.rain_probability}%
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⚡ Irrigation Motor:</span>
              <strong style={{ color: farmState.irrigation.motor_status === 'ON' ? '#fbbf24' : '#22c55e' }}>
                {farmState.irrigation.motor_status === 'ON' ? '⚡ RUNNING (ON)' : '⏸️ OFF / STANDBY'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🧪 NPK Levels:</span>
              <strong>{farmState.sensors.npk_str}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🛡️ Crop Stress:</span>
              <strong style={{ color: farmState.crop.stress_level === 'HIGH' ? '#f87171' : '#4ade80' }}>
                {farmState.crop.stress_level}
              </strong>
            </div>
          </div>
        </div>

        {/* Switch to Farmer Dashboard Link (if running on single device or iframe) */}
        {onSwitchToDashboard && (
          <button
            onClick={onSwitchToDashboard}
            style={{
              background: 'transparent',
              border: '1px dashed #475569',
              color: '#94a3b8',
              padding: '8px 16px',
              borderRadius: 12,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            ← View Farmer Dashboard
          </button>
        )}

        {/* Instructions Footer */}
        <p style={{ fontSize: 11, color: '#64748b', textAlign: 'center', margin: '4px 0 0', lineHeight: 1.4 }}>
          Tap <strong>DRY</strong> or <strong>WET</strong> to broadcast the complete simulated farm state in real time to all connected Farmer Dashboards.
        </p>
      </div>
    </div>
  );
}
