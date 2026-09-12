import React, { useState } from 'react'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useFarmSimulation } from '../simulation/SimulationContext'
import { buildSensorList } from './HomeScreen'
import DemoModeBadge from '../components/DemoModeBadge'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const timeLabels = {
  '1D': ['12 AM','3 AM','6 AM','9 AM','12 PM','3 PM','6 PM','9 PM','12 AM'],
  '1W': ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  '1M': ['W1','W2','W3','W4']
}

export default function SensorDetail({ sensor, onBack }) {
  const [activeRange, setActiveRange] = useState('1D')
  const { farmState } = useFarmSimulation()

  // Dynamically resolve the live sensor object from the centralized simulation state
  const liveSensorList = buildSensorList(farmState.sensors)
  const currentSensor = liveSensorList.find(s => s.id === sensor?.id) || sensor
  const Icon = currentSensor.icon

  // Generate data for different time ranges
  const getChartData = () => {
    const labels = timeLabels[activeRange]
    let data
    if (activeRange === '1D') {
      // Sample 9 points from 24-point time series data
      const chartArr = currentSensor.chartData || [65, 65, 65, 65, 65, 65, 65, 65, 65]
      const step = Math.max(1, Math.floor(chartArr.length / 9))
      data = labels.map((_, i) => chartArr[Math.min(i * step, chartArr.length - 1)])
    } else if (activeRange === '1W') {
      data = labels.map((_, i) => {
        const base = currentSensor.numValue || 50
        return +(base + (Math.sin(i) * 0.15 * base)).toFixed(1)
      })
    } else {
      data = labels.map((_, i) => {
        const base = currentSensor.numValue || 50
        return +(base + (Math.cos(i) * 0.1 * base)).toFixed(1)
      })
    }
    return {
      labels,
      datasets: [{
        data,
        borderColor: '#1B8C3D',
        backgroundColor: 'rgba(27, 140, 61, 0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#1B8C3D',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      }]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { family: 'Inter', size: 11 },
        bodyFont: { family: 'Inter', size: 13, weight: 'bold' },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y}${currentSensor.unit || ''}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'Inter', size: 10 },
          color: '#9ca3af'
        }
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: {
          font: { family: 'Inter', size: 10 },
          color: '#9ca3af'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="screen-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{currentSensor.name}</h1>
        <DemoModeBadge />
      </div>

      <div className="sensor-detail">
        {/* Current Value Hero */}
        <div className="sensor-detail-hero animate-in">
          <div className={`detail-icon sensor-icon ${currentSensor.iconClass}`}>
            <Icon />
          </div>
          <p className="current-label">Current {currentSensor.name.split(' ').pop()}</p>
          <p className="current-value">{currentSensor.value}</p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 6 }}>
            <span className={`sensor-status ${currentSensor.statusClass}`}>
              {currentSensor.status}
            </span>
            {currentSensor.tier && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#f3f4f6', color: '#374151' }}>
                {currentSensor.tier}
              </span>
            )}
          </div>
          {currentSensor.target && (
            <span style={{ fontSize: 11.5, color: '#166534', fontWeight: 600, marginTop: 4 }}>
              🎯 Target Benchmark: {currentSensor.target}
            </span>
          )}
        </div>

        {/* Time Range Tabs */}
        <div className="time-tabs animate-in">
          {['1D', '1W', '1M'].map(range => (
            <button
              key={range}
              className={`time-tab ${activeRange === range ? 'active' : ''}`}
              onClick={() => setActiveRange(range)}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="chart-container animate-in">
          <Line data={getChartData()} options={chartOptions} />
        </div>

        {/* Stats */}
        <div className="stats-row animate-in">
          <div className="stat-box">
            <p className="stat-label">Min</p>
            <p className="stat-value">{currentSensor.min?.value || currentSensor.value}</p>
            <p className="stat-time">{currentSensor.min?.time || 'Live'}</p>
          </div>
          <div className="stat-box">
            <p className="stat-label">Max</p>
            <p className="stat-value">{currentSensor.max?.value || currentSensor.value}</p>
            <p className="stat-time">{currentSensor.max?.time || 'Live'}</p>
          </div>
          <div className="stat-box">
            <p className="stat-label">Average</p>
            <p className="stat-value">{currentSensor.avg || currentSensor.value}</p>
          </div>
        </div>

        {/* Agronomic Decision Insights */}
        <div className="insights-card animate-in">
          <h4>
            <Lightbulb />
            Agronomic Decision Insights & Thresholds
          </h4>
          <p>{currentSensor.insight}</p>
          
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #e5e7eb', fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>
            💡 <em>AgriSense Decision Notice: Thresholds are stage-aware guidelines. Always verify values against specific sensor probe calibration and soil type.</em>
          </div>
        </div>
      </div>
    </div>
  )
}
