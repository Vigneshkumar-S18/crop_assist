import React, { useState } from 'react';
import {
  Droplets,
  CloudRain,
  Thermometer,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FlaskConical,
  Activity,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
  ArrowDown
} from 'lucide-react';

export default function DecisionPipelineCard({ flow, language = 'en' }) {
  const [actionDone, setActionDone] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  if (!flow) return null;

  const lang = language === 'ta' ? 'ta' : 'en';
  const { title, telemetry, decision, action, verify } = flow;

  const handleExecuteAction = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setActionDone(true);
    }, 600);
  };

  return (
    <div
      style={{
        marginTop: 12,
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: 16,
        padding: '14px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        color: '#1e293b'
      }}
    >
      {/* 1. Header Badge: Pipeline Architecture Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: 8
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '2px 8px',
              borderRadius: 10,
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Sparkles size={11} color="#16a34a" />
            {lang === 'ta' ? 'தகவல் ஆய்வு & நடவடிக்கை' : 'Detect → Decide → Act → Verify'}
          </span>
        </div>
        <span style={{ fontSize: 11, fontWeight: '700', color: '#64748b' }}>
          📍 {telemetry?.zone || 'Zone 1'}
        </span>
      </div>

      {/* 2. DETECT: Data Used / Telemetry Grid */}
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: '#475569',
            textTransform: 'uppercase',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Activity size={12} color="#64748b" />
          <span>{lang === 'ta' ? 'பயன்படுத்தப்பட்ட களத் தரவுகள்:' : 'Telemetry & Context Used:'}</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 6
          }}
        >
          {telemetry.soil_moisture && (
            <div style={chipStyle('#f0fdf4', '#166534', '#bbf7d0')}>
              <Droplets size={13} color="#16a34a" />
              <span>Moisture: <strong>{telemetry.soil_moisture}</strong></span>
            </div>
          )}

          {telemetry.rain_probability && (
            <div style={chipStyle('#eff6ff', '#1e40af', '#bfdbfe')}>
              <CloudRain size={13} color="#3b82f6" />
              <span>Rain Forecast: <strong>{telemetry.rain_probability}</strong></span>
            </div>
          )}

          {telemetry.nitrogen && (
            <div style={chipStyle('#fffbeb', '#92400e', '#fde68a')}>
              <FlaskConical size={13} color="#d97706" />
              <span>Nitrogen (N): <strong>{telemetry.nitrogen}</strong></span>
            </div>
          )}

          {telemetry.phosphorus && (
            <div style={chipStyle('#f8fafc', '#334155', '#e2e8f0')}>
              <FlaskConical size={13} color="#64748b" />
              <span>Phosphorus: <strong>{telemetry.phosphorus}</strong></span>
            </div>
          )}

          {telemetry.potassium && (
            <div style={chipStyle('#f8fafc', '#334155', '#e2e8f0')}>
              <FlaskConical size={13} color="#64748b" />
              <span>Potassium: <strong>{telemetry.potassium}</strong></span>
            </div>
          )}

          {telemetry.scan_result && (
            <div style={{ ...chipStyle('#fef2f2', '#991b1b', '#fecaca'), gridColumn: '1 / -1' }}>
              <ShieldCheck size={13} color="#dc2626" />
              <span>Leaf Scan: <strong>{telemetry.scan_result}</strong></span>
            </div>
          )}

          {telemetry.humidity && (
            <div style={chipStyle('#f0fdfa', '#115e59', '#99f6e4')}>
              <Droplets size={13} color="#0d9488" />
              <span>Humidity: <strong>{telemetry.humidity}</strong></span>
            </div>
          )}

          {telemetry.temperature && (
            <div style={chipStyle('#fff7ed', '#9a3412', '#fed7aa')}>
              <Thermometer size={13} color="#ea580c" />
              <span>Temp: <strong>{telemetry.temperature}</strong></span>
            </div>
          )}

          {telemetry.crop_stage && (
            <div style={chipStyle('#f8fafc', '#334155', '#e2e8f0')}>
              <Layers size={13} color="#64748b" />
              <span>Stage: <strong>{telemetry.crop_stage}</strong></span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0' }}>
        <ArrowDown size={14} color="#94a3b8" />
      </div>

      {/* 3. EXPLAIN & RECOMMEND: Decision Engine Card */}
      <div
        style={{
          background: '#f8fafc',
          border: `1.5px solid ${decision?.statusColor || '#16a34a'}33`,
          borderRadius: 12,
          padding: '10px 12px',
          borderLeft: `4px solid ${decision?.statusColor || '#16a34a'}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 16 }}>{decision?.icon || '🤖'}</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: '800',
              color: decision?.statusColor || '#0f172a',
              letterSpacing: '0.3px',
              textTransform: 'uppercase'
            }}
          >
            {decision?.title?.[lang] || decision?.title?.en}
          </span>
        </div>

        <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.4, marginTop: 4 }}>
          <strong>{lang === 'ta' ? 'காரணம்:' : 'Reason:'}</strong>{' '}
          {decision?.reason?.[lang] || decision?.reason?.en}
        </div>

        {decision?.solutions && (
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #cbd5e1', fontSize: 11 }}>
            <div style={{ color: '#0f172a', fontWeight: '600' }}>
              ⚡ {decision.solutions.chemical?.[lang] || decision.solutions.chemical?.en}
            </div>
            <div style={{ color: '#166534', fontWeight: '600', marginTop: 2 }}>
              🌱 {decision.solutions.organic?.[lang] || decision.solutions.organic?.en}
            </div>
          </div>
        )}

        {decision?.management && (
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #cbd5e1', fontSize: 11 }}>
            <div style={{ color: '#b91c1c', fontWeight: '600' }}>
              ⚠️ {decision.management.cultural?.[lang] || decision.management.cultural?.en}
            </div>
            <div style={{ color: '#0369a1', fontWeight: '600', marginTop: 2 }}>
              🧪 {decision.management.treatment?.[lang] || decision.management.treatment?.en}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0' }}>
        <ArrowDown size={14} color="#94a3b8" />
      </div>

      {/* 4. ACT: Interactive Action Button & Confirmation */}
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: '#475569',
            textTransform: 'uppercase',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Zap size={12} color="#ea580c" />
          <span>{lang === 'ta' ? 'செயல்முறை நடவடிக்கை:' : 'Action Execution:'}</span>
        </div>

        {!actionDone ? (
          <button
            onClick={handleExecuteAction}
            disabled={isExecuting}
            style={{
              width: '100%',
              background: isExecuting ? '#cbd5e1' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '9px 14px',
              fontSize: 13,
              fontWeight: '700',
              cursor: isExecuting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {isExecuting ? (
              <span>{lang === 'ta' ? 'இயங்குகிறது...' : 'Executing...'}</span>
            ) : (
              <span>{action?.label?.[lang] || action?.label?.en}</span>
            )}
          </button>
        ) : (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: 10,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#166534',
              fontSize: 12,
              fontWeight: '600'
            }}
          >
            <CheckCircle2 size={16} color="#16a34a" />
            <span>{action?.successMessage?.[lang] || action?.successMessage?.en}</span>
          </div>
        )}
      </div>

      {/* 5. VERIFY: Closed-Loop Verification Indicator */}
      <div
        style={{
          background: '#f1f5f9',
          borderRadius: 10,
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Check size={14} color="#0f766e" />
          <span style={{ fontSize: 11, fontWeight: '800', color: '#0f766e', textTransform: 'uppercase' }}>
            {verify?.title?.[lang] || verify?.title?.en || '✓ VERIFY'}
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#334155', fontWeight: '500' }}>
          {verify?.instruction?.[lang] || verify?.instruction?.en}
        </div>
        {verify?.targetMetric && (
          <div style={{ fontSize: 10, color: '#64748b', fontWeight: '600', marginTop: 2 }}>
            📊 {verify.targetMetric?.[lang] || verify.targetMetric?.en}
          </div>
        )}
      </div>
    </div>
  );
}

const chipStyle = (bg, color, border) => ({
  background: bg,
  color: color,
  border: `1px solid ${border}`,
  borderRadius: 8,
  padding: '4px 8px',
  fontSize: 11,
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  gap: 6
});
