import React, { useState } from 'react';
import {
  Power, Droplets, Play, Square, Settings, CloudRain,
  Thermometer, AlertTriangle, CheckCircle2, Sparkles, RefreshCw, Info
} from 'lucide-react';
import { useFarmSimulation } from '../simulation/SimulationContext';
import DemoModeBadge from '../components/DemoModeBadge';

const historyItems = [
  { date: 'Today', detail: 'Precision Drip Cycle • Synced', duration: 'Just now' },
  { date: 'Sep 9, 2025', detail: 'Drip Irrigation Cycle • 30 min', duration: '6:00 AM' },
  { date: 'Sep 8, 2025', detail: 'Fertigation Cycle • 45 min', duration: '7:15 AM' },
  { date: 'Sep 6, 2025', detail: 'Drip Irrigation Cycle • 25 min', duration: '6:30 AM' },
];

export default function IrrigationScreen() {
  const { farmState, setFarmMode } = useFarmSimulation();
  
  const irr = farmState.irrigation;
  const sensors = farmState.sensors;
  const weather = farmState.weather;

  const [localMotorOverride, setLocalMotorOverride] = useState(null);
  const motorOn = localMotorOverride !== null ? localMotorOverride : irr.motor_on;

  const handleToggleMotor = (val) => {
    setLocalMotorOverride(val);
  };

  return (
    <div>
      <div className="screen-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
          Smart Irrigation Engine
        </h1>
        <DemoModeBadge />
      </div>

      <div className="irrigation-screen" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        
        {/* Multi-Sensor Telemetry Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }} className="animate-in">
          <div style={{ background: '#fff', padding: '10px 8px', borderRadius: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#0284c7', fontSize: 11, fontWeight: 600 }}>
              <Droplets size={14} /> Moisture
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: sensors.soil_moisture < 40 ? '#dc2626' : '#16a34a', marginTop: 2 }}>
              {sensors.soil_moisture}%
            </div>
            <span style={{ fontSize: 9.5, color: '#6b7280' }}>Target: 65%–85%</span>
          </div>

          <div style={{ background: '#fff', padding: '10px 8px', borderRadius: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#6366f1', fontSize: 11, fontWeight: 600 }}>
              <CloudRain size={14} /> Rain Prob
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: weather.rain_probability >= 50 ? '#2563eb' : '#475569', marginTop: 2 }}>
              {weather.rain_probability}%
            </div>
            <span style={{ fontSize: 9.5, color: '#6b7280' }}>Next 6–12h</span>
          </div>

          <div style={{ background: '#fff', padding: '10px 8px', borderRadius: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#ea580c', fontSize: 11, fontWeight: 600 }}>
              <Thermometer size={14} /> Temperature
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: sensors.temperature > 30 ? '#ea580c' : '#16a34a', marginTop: 2 }}>
              {sensors.temperature}°C
            </div>
            <span style={{ fontSize: 9.5, color: '#6b7280' }}>Canopy Temp</span>
          </div>
        </div>

        {/* CONTEXTUAL REASONING DECISION CARD */}
        <div style={{
          background: irr.badge_class === 'critical' ? '#fef2f2' : irr.badge_class === 'warning' ? '#fffbeb' : '#f0fdf4',
          border: `1.5px solid ${irr.badge_class === 'critical' ? '#fecaca' : irr.badge_class === 'warning' ? '#fde68a' : '#bbf7d0'}`,
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
              background: irr.badge_class === 'critical' ? '#fee2e2' : irr.badge_class === 'warning' ? '#fef3c7' : '#dcfce7',
              color: irr.badge_class === 'critical' ? '#991b1b' : irr.badge_class === 'warning' ? '#92400e' : '#166534'
            }}>
              {irr.badge}
            </span>
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
              🍅 Flowering Stage
            </span>
          </div>

          <h3 style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 800, color: '#111827' }}>
            {irr.decision_title}
          </h3>

          <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.45 }}>
            {irr.decision_desc}
          </p>

          <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#4b5563' }}>
            <Sparkles size={14} color="#16a34a" />
            <span><strong>Smart Action:</strong> {irr.action_note}</span>
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
            <div className="mm-value">{sensors.soil_moisture}%</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="animate-in" style={{ animationDelay: '0.1s' }}>
          {!motorOn ? (
            <button className="btn-irrigation btn-start" onClick={() => handleToggleMotor(true)}>
              <Play />
              Start Irrigation Cycle
            </button>
          ) : (
            <button className="btn-irrigation btn-stop" onClick={() => handleToggleMotor(false)}>
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
  );
}
