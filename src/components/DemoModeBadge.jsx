import React from 'react';
import { Sparkles, Sliders, RefreshCw } from 'lucide-react';
import { useFarmSimulation } from '../simulation/SimulationContext';

export default function DemoModeBadge({ onOpenController }) {
  const { mode, isConnected } = useFarmSimulation();

  const getBadgeStyle = () => {
    if (mode === 'DRY') {
      return {
        bg: '#fef3c7',
        border: '#fde68a',
        text: '#92400e',
        dot: '#d97706',
        label: '☀️ DRY STATE'
      };
    }
    if (mode === 'WET') {
      return {
        bg: '#e0f2fe',
        border: '#bae6fd',
        text: '#075985',
        dot: '#0284c7',
        label: '💧 WET STATE'
      };
    }
    return {
      bg: '#f0fdf4',
      border: '#bbf7d0',
      text: '#166534',
      dot: '#16a34a',
      label: '🌿 BASELINE (NORMAL)'
    };
  };

  const style = getBadgeStyle();

  return (
    <div
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
        padding: '3px 8px',
        borderRadius: 12,
        fontSize: 10.5,
        fontWeight: '700',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        cursor: onOpenController ? 'pointer' : 'default',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        userSelect: 'none'
      }}
      onClick={onOpenController}
      title="Click to open Farm Demo Controller"
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: style.dot,
          display: 'inline-block'
        }}
      />
      <span>{style.label}</span>
      {onOpenController && (
        <Sliders size={11} style={{ opacity: 0.7, marginLeft: 2 }} />
      )}
    </div>
  );
}
