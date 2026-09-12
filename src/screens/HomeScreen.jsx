import React from 'react';
import {
  Bell, MapPin, Droplets, Thermometer, CloudRain,
  Beaker, Leaf, Activity, Zap
} from 'lucide-react';
import { useFarmSimulation } from '../simulation/SimulationContext';
import DemoModeBadge from '../components/DemoModeBadge';

export function buildSensorList(sensors) {
  return [
    {
      id: 'moisture',
      name: 'Soil Moisture',
      value: sensors.soil_moisture_str,
      status: sensors.soil_moisture_status,
      statusClass: sensors.soil_moisture_class,
      tier: sensors.soil_moisture_tier,
      iconClass: 'moisture',
      icon: Droplets,
      unit: '%',
      numValue: sensors.soil_moisture,
      target: '65%–85% (Flowering)',
      chartData: sensors.moisture_chart || [45, 42, 40, 39, 38, 38, 38, 37, 38, 38, 39, 38, 38, 38, 37, 38, 38, 38, 38, 39, 38, 38, 38, 38],
      min: { value: '32%', time: '10:30 AM' },
      max: { value: '76%', time: 'Yesterday' },
      avg: `${sensors.soil_moisture}%`,
      insight: sensors.soil_moisture_insight
    },
    {
      id: 'temperature',
      name: 'Soil Temperature',
      value: sensors.temperature_str,
      status: sensors.temperature_status,
      statusClass: sensors.temperature_class,
      tier: sensors.temperature_tier,
      iconClass: 'temperature',
      icon: Thermometer,
      unit: '°C',
      numValue: sensors.temperature,
      target: '20°C – 30°C',
      chartData: sensors.temp_chart || [20, 21, 22, 23, 24, 25, 26, 27, 28, 27, 26, 25, 24, 23, 22, 21, 20, 21, 22, 23, 24, 25, 24, 23],
      min: { value: '20°C', time: '05:00 AM' },
      max: { value: '34°C', time: '02:00 PM' },
      avg: `${sensors.temperature}°C`,
      insight: sensors.temperature_insight
    },
    {
      id: 'humidity',
      name: 'Relative Humidity',
      value: sensors.humidity_str,
      status: sensors.humidity_status,
      statusClass: sensors.humidity_class,
      tier: sensors.humidity_tier,
      iconClass: 'humidity',
      icon: CloudRain,
      unit: '%',
      numValue: sensors.humidity,
      target: '60% – 85%',
      chartData: sensors.humidity_chart || [72, 70, 68, 65, 60, 58, 55, 52, 50, 52, 55, 58, 62, 65, 68, 70, 72, 74, 76, 76, 75, 76, 76, 76],
      min: { value: '48%', time: '02:30 PM' },
      max: { value: '84%', time: '06:00 PM' },
      avg: `${sensors.humidity}%`,
      insight: sensors.humidity_insight
    },
    {
      id: 'npk',
      name: 'NPK Sensor',
      value: sensors.npk_str,
      status: sensors.npk_status,
      statusClass: sensors.npk_class,
      tier: sensors.npk_tier,
      iconClass: 'npk',
      icon: Leaf,
      unit: 'mg/kg',
      numValue: sensors.nitrogen,
      target: 'N:50-65 P:45-55 K:60-75',
      chartData: sensors.npk_chart || [45, 42, 40, 38, 36, 35, 34, 33, 32, 32, 31, 32, 32, 33, 32, 32, 31, 32, 32, 33, 32, 32, 32, 32],
      min: { value: '20 mg/kg', time: '06:00 AM' },
      max: { value: '68 mg/kg', time: 'Yesterday' },
      avg: `${sensors.nitrogen} mg/kg`,
      insight: sensors.npk_insight
    },
    {
      id: 'ph',
      name: 'Soil pH',
      value: sensors.ph_str,
      status: sensors.ph_status,
      statusClass: sensors.ph_class,
      tier: sensors.ph_tier,
      iconClass: 'ph',
      icon: Beaker,
      unit: '',
      numValue: sensors.ph,
      target: '6.0 – 6.8',
      chartData: [6.3, 6.4, 6.5, 6.5, 6.6, 6.5, 6.4, 6.5, 6.6, 6.5, 6.4, 6.5, 6.5, 6.4, 6.5, 6.6, 6.5, 6.4, 6.5, 6.5, 6.6, 6.5, 6.4, 6.5],
      min: { value: '6.3', time: '08:00 AM' },
      max: { value: '6.7', time: '12:00 PM' },
      avg: sensors.ph_str,
      insight: sensors.ph_insight
    },
    {
      id: 'ec',
      name: 'Salinity / EC',
      value: sensors.ec_str,
      status: sensors.ec_status,
      statusClass: sensors.ec_class,
      tier: sensors.ec_tier,
      iconClass: 'tds',
      icon: Zap,
      unit: 'dS/m',
      numValue: sensors.ec,
      target: '< 2.0 dS/m',
      chartData: [1.2, 1.3, 1.4, 1.4, 1.5, 1.4, 1.3, 1.4, 1.4, 1.3, 1.4, 1.4, 1.4, 1.5, 1.4, 1.4, 1.3, 1.4, 1.4, 1.4, 1.3, 1.4, 1.4, 1.4],
      min: { value: '1.2 dS/m', time: '06:00 AM' },
      max: { value: '1.8 dS/m', time: '01:00 PM' },
      avg: sensors.ec_str,
      insight: sensors.ec_insight
    },
    {
      id: 'tds',
      name: 'Water Quality',
      value: sensors.water_quality_str,
      status: sensors.water_quality_status,
      statusClass: sensors.water_quality_class,
      tier: sensors.water_quality_tier,
      iconClass: 'tds',
      icon: Zap,
      unit: 'ppm',
      numValue: sensors.water_quality,
      target: '< 500 ppm',
      chartData: [310, 315, 320, 318, 322, 325, 320, 315, 310, 312, 318, 320, 322, 320, 318, 315, 312, 315, 318, 320, 322, 320, 318, 320],
      min: { value: '310 ppm', time: '06:00 AM' },
      max: { value: '380 ppm', time: '01:00 PM' },
      avg: sensors.water_quality_str,
      insight: sensors.water_quality_insight
    }
  ];
}

export default function HomeScreen({ onSensorClick, onWeatherClick, onAlertsClick, onOpenController }) {
  const { farmState, mode } = useFarmSimulation();
  const sensors = farmState.sensors;
  const weather = farmState.weather;
  const crop = farmState.crop;
  const alerts = farmState.alerts;

  const dynamicSensors = buildSensorList(sensors);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', minute: '2-digit', hour12: true 
  });

  return (
    <div>
      {/* Header */}
      <div className="home-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 6 }}>
          <DemoModeBadge onOpenController={onOpenController} />
          <button
            className="notification-btn"
            onClick={onAlertsClick}
            title="View alerts and notifications"
            aria-label="Alerts"
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {alerts && alerts.length > 0 && (
              <span className="notification-dot"></span>
            )}
          </button>
        </div>

        <div className="home-greeting">
          <h2>Good Morning, Farmer! 👋</h2>
        </div>

        <div className="home-meta">
          <div className="location">
            <MapPin size={14} />
            <span>My Tomato Farm • Zone 1</span>
          </div>
          <div
            className="weather-badge"
            onClick={onWeatherClick}
            title="Click to view detailed weather forecast"
            role="button"
            tabIndex={0}
          >
            <span className="weather-icon">{weather.rain_probability > 50 ? '🌧️' : '☀️'}</span>
            <span>{weather.temperature_str}</span>
            <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>{weather.forecast_desc?.split('•')?.[0]?.trim() || 'Clear'}</span>
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
        {dynamicSensors.map((sensor, i) => {
          const Icon = sensor.icon;
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
          );
        })}
      </div>

      {/* Field Health Score */}
      <div className="field-health animate-in" style={{ animationDelay: '0.35s' }}>
        <div className="field-health-title">
          <Activity />
          Field Health Score
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="health-score-circle" style={{ '--score': crop.health_score || 78 }}>
            <div className="health-score-inner">
              <span className="score">{crop.health_score || 78}</span>
              <span className="total">/100</span>
            </div>
          </div>
          <div className="health-info">
            <p style={{ fontWeight: '700', color: crop.stress_level === 'HIGH' ? '#dc2626' : '#166534', margin: 0 }}>
              {crop.health_label || 'Your tomato crop is in good condition 🌱'}
            </p>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
              Stress: <strong>{crop.stress_level}</strong> • Disease Risk: <strong>{crop.disease_risk}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { buildSensorList as sensorData };
