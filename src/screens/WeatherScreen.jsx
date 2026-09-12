import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Droplets, Wind, Eye, Thermometer, Search, Navigation, X, Check, ChevronDown, ArrowLeft, CloudRain } from 'lucide-react'
import { getWeather, getWeatherMapping, searchLocations } from '../services/weatherService'
import { useFarmSimulation } from '../simulation/SimulationContext'

const POPULAR_HUBS = [
  { name: 'My Tomato Farm • Zone 1', lat: 11.0168, lon: 76.9558 },
  { name: 'Coimbatore, Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  { name: 'Nashik, Maharashtra', lat: 19.9975, lon: 73.7898 },
  { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad, Telangana', lat: 17.3850, lon: 78.4867 },
  { name: 'Pune, Maharashtra', lat: 18.5204, lon: 73.8567 },
  { name: 'Guntur, Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { name: 'Shimla, Himachal Pradesh', lat: 31.1048, lon: 77.1734 }
]

export default function WeatherScreen({ onBack }) {
  const { farmState, mode } = useFarmSimulation()
  const simWeather = farmState.weather
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState(POPULAR_HUBS[0])

  // Location search modal / dropdown state
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [locatingUser, setLocatingUser] = useState(false)
  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true)
        setError(null)
        const data = await getWeather(location.lat, location.lon)
        setWeatherData(data)
      } catch (err) {
        console.error("Failed to fetch weather:", err)
        setError("Could not load weather data.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchWeather()
  }, [location])

  // Debounced search
  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchQuery(val)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (val.trim().length >= 2) {
      setSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocations(val)
        setSearchResults(results)
        setSearching(false)
      }, 350)
    } else {
      setSearchResults([])
      setSearching(false)
    }
  }

  const handleSelectLocation = (loc) => {
    setLocation(loc)
    setShowLocationPicker(false)
    setSearchQuery('')
    setSearchResults([])
  }

  // Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }

    setLocatingUser(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setLocation({
          name: `Current Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
          lat: latitude,
          lon: longitude
        })
        setLocatingUser(false)
        setShowLocationPicker(false)
      },
      (err) => {
        console.error("Geolocation error:", err)
        alert("Unable to retrieve location. Please check browser permissions or select a city manually.")
        setLocatingUser(false)
      },
      { timeout: 10000 }
    )
  }

  const current = weatherData?.current || {
    temperature_2m: simWeather?.temperature || 29,
    relative_humidity_2m: simWeather?.humidity || 65,
    wind_speed_10m: 12,
    visibility: 10000,
    apparent_temperature: (simWeather?.temperature || 29) + 2,
    weather_code: simWeather?.rain_probability > 50 ? 61 : 1
  }

  const hourly = weatherData?.hourly || {
    time: Array.from({ length: 24 }, (_, i) => new Date(Date.now() + i * 3600000).toISOString()),
    temperature_2m: Array.from({ length: 24 }, (_, i) => (simWeather?.temperature || 29) - 4 + Math.sin(i / 3) * 5),
    precipitation_probability: Array.from({ length: 24 }, () => simWeather?.rain_probability || 20),
    weather_code: Array.from({ length: 24 }, () => (simWeather?.rain_probability > 50 ? 61 : 1))
  }

  const daily = weatherData?.daily || {
    time: Array.from({ length: 7 }, (_, i) => new Date(Date.now() + i * 86400000).toISOString()),
    temperature_2m_max: [simWeather?.temperature || 29, 30, 31, 29, 28, 29, 30],
    temperature_2m_min: [(simWeather?.temperature || 29) - 8, 21, 22, 20, 19, 20, 21],
    weather_code: [simWeather?.rain_probability > 50 ? 61 : 1, 1, 2, 3, 1, 0, 1]
  }

  const currentMapping = getWeatherMapping(current.weather_code)

  // Format hourly data (next 12 hours)
  const currentHourIndex = hourly.time.findIndex(t => new Date(t) > new Date())
  const displayHours = []
  const startIndex = currentHourIndex === -1 ? 0 : Math.max(0, currentHourIndex - 1)
  
  for (let i = 0; i < 12; i++) {
    const idx = startIndex + i;
    if (idx >= hourly.time.length) break;
    
    const time = new Date(hourly.time[idx]);
    const isNow = i === 0;
    
    displayHours.push({
      time: isNow ? 'Now' : time.toLocaleTimeString([], { hour: 'numeric' }),
      icon: getWeatherMapping(hourly.weather_code[idx]).icon,
      temp: Math.round(hourly.temperature_2m[idx]) + '°'
    })
  }

  // Format daily data
  const displayDays = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(daily.time[i]);
    const isToday = i === 0;
    
    displayDays.push({
      day: isToday ? 'Today' : date.toLocaleDateString([], { weekday: 'short' }),
      icon: getWeatherMapping(daily.weather_code[i]).icon,
      desc: getWeatherMapping(daily.weather_code[i]).desc,
      high: Math.round(daily.temperature_2m_max[i]) + '°',
      low: Math.round(daily.temperature_2m_min[i]) + '°'
    })
  }

  // Agrisense Insight Logic
  const next12HoursRainProb = hourly.precipitation_probability.slice(startIndex, startIndex + 12);
  const maxRainProb = Math.max(...next12HoursRainProb);
  
  let insightTitle = "🌱 AGRISENSE INSIGHT";
  let insightText = "Weather conditions are optimal. Standard irrigation schedule can be maintained.";
  
  if (maxRainProb > 70) {
    insightText = `High probability of rain (${maxRainProb}%) in the coming hours. Postpone irrigation to avoid unnecessary watering and waterlogging.`;
  } else if (current.temperature_2m > 35) {
    insightText = `High temperatures detected (${Math.round(current.temperature_2m)}°C). Ensure adequate soil moisture to prevent heat stress on crops.`;
  } else if (current.relative_humidity_2m > 85 && maxRainProb > 30) {
    insightText = "High humidity and potential rain detected. Conditions are favorable for fungal diseases. Monitor crops closely.";
  }

  return (
    <div>
      <div className="screen-header">
        {onBack && (
          <button
            className="back-btn"
            onClick={onBack}
            aria-label="Back to Home"
            style={{
              background: 'none',
              border: 'none',
              padding: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              color: 'var(--gray-700)'
            }}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: 18, fontWeight: 700 }}>Weather</h1>
        {onBack && <div style={{ width: 32 }} />}
      </div>

      <div className="weather-screen">
        {/* Interactive Location Selector Bar */}
        <div
          className="weather-location animate-in"
          onClick={() => setShowLocationPicker(true)}
          style={{
            cursor: 'pointer',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 16,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            marginBottom: 16
          }}
        >
          <div className="loc-name" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#111827', fontWeight: '600' }}>
            <MapPin size={18} color="#16a34a" />
            <span style={{ fontSize: 14 }}>{location.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontSize: 12, fontWeight: '600' }}>
            <span>Change</span>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Location Picker Modal / Overlay */}
        {showLocationPicker && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}>
            <div className="animate-in" style={{
              background: '#fff',
              width: '100%',
              maxWidth: 480,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: '20px 20px 32px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.15)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: '700', color: '#111827' }}>
                  Select Location
                </h3>
                <button
                  onClick={() => setShowLocationPicker(false)}
                  style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={18} color="#4b5563" />
                </button>
              </div>

              {/* Search Bar */}
              <div style={{
                position: 'relative',
                marginBottom: 16
              }}>
                <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search city, district, or region..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: 12,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Detect GPS Location Button */}
              <button
                onClick={handleDetectLocation}
                disabled={locatingUser}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  fontSize: 14,
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  marginBottom: 16
                }}
              >
                <Navigation size={16} />
                {locatingUser ? "Detecting GPS location..." : "Use My Current Location"}
              </button>

              {/* Search Results List */}
              {searching ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                  Searching locations...
                </div>
              ) : searchResults.length > 0 ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                    Search Results
                  </div>
                  {searchResults.map((res, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectLocation(res)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        borderBottom: '1px solid #f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontSize: 14,
                        color: '#1f2937'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <MapPin size={16} color="#16a34a" />
                        <span>{res.name}</span>
                      </div>
                      {location.lat === res.lat && location.lon === res.lon && (
                        <Check size={16} color="#16a34a" />
                      )}
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim().length >= 2 ? (
                <div style={{ padding: '12px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                  No locations found matching "{searchQuery}"
                </div>
              ) : null}

              {/* Popular Agricultural Hubs */}
              <div>
                <div style={{ fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                  Popular Farming Hubs
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {POPULAR_HUBS.map((hub, i) => {
                    const isSelected = location.name === hub.name
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectLocation(hub)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: isSelected ? '700' : '500',
                          background: isSelected ? '#16a34a' : '#f3f4f6',
                          color: isSelected ? '#fff' : '#374151',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {hub.name.split(',')[0]}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Weather */}
        <div className="weather-current animate-in" style={{ animationDelay: '0.05s' }}>
          <div style={{ fontSize: 48, marginBottom: 4 }}>{currentMapping.icon}</div>
          <div className="weather-temp-main">{Math.round(current.temperature_2m)}°C</div>
          <div className="weather-desc">{currentMapping.desc}</div>
        </div>

        {/* Weather Stats */}
        <div className="weather-stats animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="weather-stat">
            <div className="ws-icon"><Droplets /></div>
            <div className="ws-value">{Math.round(current.relative_humidity_2m)}%</div>
            <div className="ws-label">Humidity</div>
          </div>
          <div className="weather-stat">
            <div className="ws-icon"><Wind /></div>
            <div className="ws-value">{Math.round(current.wind_speed_10m)} km/h</div>
            <div className="ws-label">Wind</div>
          </div>
          <div className="weather-stat">
            <div className="ws-icon"><Eye /></div>
            <div className="ws-value">{(current.visibility / 1000).toFixed(1)} km</div>
            <div className="ws-label">Visibility</div>
          </div>
          <div className="weather-stat">
            <div className="ws-icon"><Thermometer /></div>
            <div className="ws-value">{Math.round(current.apparent_temperature)}°C</div>
            <div className="ws-label">Feels Like</div>
          </div>
        </div>
        
        {/* Agrisense Insight */}
        <div className="animate-in" style={{ animationDelay: '0.12s', marginTop: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.2) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '16px',
            padding: '16px',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {insightTitle}
            </h4>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', opacity: 0.9 }}>
              {insightText}
            </p>
          </div>
        </div>

        {/* Hourly Forecast */}
        <div className="animate-in" style={{ animationDelay: '0.15s' }}>
          <h3 className="weather-section-title">Hourly Forecast</h3>
          <div className="hourly-scroll">
            {displayHours.map((item, i) => (
              <div className="hourly-item" key={i}>
                <div className="h-time">{item.time}</div>
                <div className="h-icon">{item.icon}</div>
                <div className="h-temp">{item.temp}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="animate-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="weather-section-title">7-Day Forecast</h3>
          <div className="daily-list">
            {displayDays.map((item, i) => (
              <div className="daily-item" key={i}>
                <span className="d-day">{item.day}</span>
                <span className="d-icon">{item.icon}</span>
                <span className="d-desc">{item.desc}</span>
                <div className="d-temps">
                  <span className="d-high">{item.high}</span>
                  <span className="d-low">{item.low}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
