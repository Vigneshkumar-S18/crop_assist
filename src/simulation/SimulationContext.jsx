import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { FARM_STATES } from './farmStates';

const SimulationContext = createContext(null);

export const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8000`;
  }
  return 'http://localhost:8000';
};

export function SimulationProvider({ children }) {
  const [mode, setModeState] = useState('NORMAL');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const eventSourceRef = useRef(null);
  const isMountedRef = useRef(true);

  // Animated telemetry state for smooth, gradual rising/falling transitions
  const initialBase = FARM_STATES.NORMAL;
  const [animatedValues, setAnimatedValues] = useState({
    soil_moisture: initialBase.sensors.soil_moisture,
    temperature: initialBase.sensors.temperature,
    humidity: initialBase.sensors.humidity,
    nitrogen: initialBase.sensors.nitrogen,
    phosphorus: initialBase.sensors.phosphorus,
    potassium: initialBase.sensors.potassium,
    rain_probability: initialBase.weather.rain_probability,
    health_score: initialBase.crop.health_score
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentValuesRef = useRef({ ...animatedValues });

  // Smooth gradual rise/fall animation engine whenever mode changes
  useEffect(() => {
    const target = FARM_STATES[mode] || FARM_STATES.NORMAL;
    const startValues = { ...currentValuesRef.current };
    const targetValues = {
      soil_moisture: target.sensors.soil_moisture,
      temperature: target.sensors.temperature,
      humidity: target.sensors.humidity,
      nitrogen: target.sensors.nitrogen,
      phosphorus: target.sensors.phosphorus,
      potassium: target.sensors.potassium,
      rain_probability: target.weather.rain_probability,
      health_score: target.crop.health_score
    };

    const startTime = performance.now();
    // 2.8 seconds natural physical transition for gradual rise/fall
    const duration = 2800;
    setIsTransitioning(true);

    let animFrame;
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth ease-out cubic curve for natural physical moisture absorption
      const ease = 1 - Math.pow(1 - progress, 3);

      const nextValues = {
        soil_moisture: Math.round(startValues.soil_moisture + (targetValues.soil_moisture - startValues.soil_moisture) * ease),
        temperature: Math.round(startValues.temperature + (targetValues.temperature - startValues.temperature) * ease),
        humidity: Math.round(startValues.humidity + (targetValues.humidity - startValues.humidity) * ease),
        nitrogen: Math.round(startValues.nitrogen + (targetValues.nitrogen - startValues.nitrogen) * ease),
        phosphorus: Math.round(startValues.phosphorus + (targetValues.phosphorus - startValues.phosphorus) * ease),
        potassium: Math.round(startValues.potassium + (targetValues.potassium - startValues.potassium) * ease),
        rain_probability: Math.round(startValues.rain_probability + (targetValues.rain_probability - startValues.rain_probability) * ease),
        health_score: Math.round(startValues.health_score + (targetValues.health_score - startValues.health_score) * ease)
      };

      currentValuesRef.current = nextValues;
      setAnimatedValues(nextValues);

      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      } else {
        setIsTransitioning(false);
      }
    };

    animFrame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animFrame);
      setIsTransitioning(false);
    };
  }, [mode]);

  // Derive dynamic status & classes based on the current live animated telemetry
  const rawState = FARM_STATES[mode] || FARM_STATES.NORMAL;
  
  const curMoisture = animatedValues.soil_moisture;
  let moistureStatus = rawState.sensors.soil_moisture_status;
  let moistureClass = rawState.sensors.soil_moisture_class;
  let moistureTier = rawState.sensors.soil_moisture_tier;
  let moistureInsight = rawState.sensors.soil_moisture_insight;

  if (curMoisture < 40) {
    moistureStatus = `Critical Deficit (${curMoisture}%)`;
    moistureClass = 'danger';
    moistureTier = '🔴 Alert';
    moistureInsight = `Soil moisture is in the critical deficit zone (${curMoisture}%). Immediate hydration required.`;
  } else if (curMoisture < 60) {
    moistureStatus = `Moisture Rising (${curMoisture}%)`;
    moistureClass = 'warning';
    moistureTier = '🟡 Watch';
    moistureInsight = `Moisture is actively rising (${curMoisture}%). Soil absorption is in progress across root zone.`;
  } else if (curMoisture <= 70) {
    moistureStatus = `Optimal Hydration (${curMoisture}%)`;
    moistureClass = 'optimal';
    moistureTier = '🟢 Normal';
    moistureInsight = `Soil moisture is at optimal ${curMoisture}% for tomato flowering stage.`;
  } else {
    moistureStatus = `Well Hydrated (${curMoisture}%)`;
    moistureClass = 'optimal';
    moistureTier = '🟢 Normal';
    moistureInsight = `Soil moisture is ${curMoisture}%, replenished by recent precipitation. No additional irrigation needed.`;
  }

  const curTemp = animatedValues.temperature;
  let tempStatus = rawState.sensors.temperature_status;
  let tempClass = rawState.sensors.temperature_class;
  let tempTier = rawState.sensors.temperature_tier;
  if (curTemp > 31) {
    tempStatus = `Heat Stress (${curTemp}°C)`;
    tempClass = 'danger';
    tempTier = '🔴 Alert';
  } else if (curTemp > 28) {
    tempStatus = `Moderating (${curTemp}°C)`;
    tempClass = 'warning';
    tempTier = '🟡 Watch';
  } else {
    tempStatus = mode === 'WET' ? `Cool & Humid (${curTemp}°C)` : `Optimal (${curTemp}°C)`;
    tempClass = 'optimal';
    tempTier = '🟢 Normal';
  }

  const curHumidity = animatedValues.humidity;
  let humidityStatus = rawState.sensors.humidity_status;
  let humidityClass = rawState.sensors.humidity_class;
  let humidityTier = rawState.sensors.humidity_tier;
  if (curHumidity < 50) {
    humidityStatus = `Dry Atmosphere (${curHumidity}%)`;
    humidityClass = 'warning';
    humidityTier = '🟡 Watch';
  } else if (curHumidity <= 75) {
    humidityStatus = `Optimal (${curHumidity}%)`;
    humidityClass = 'optimal';
    humidityTier = '🟢 Normal';
  } else {
    humidityStatus = `High Humidity (${curHumidity}%)`;
    humidityClass = 'warning';
    humidityTier = '🟡 Watch';
  }

  const curN = animatedValues.nitrogen;
  let npkStatus = rawState.sensors.npk_status;
  let npkClass = rawState.sensors.npk_class;
  let npkTier = rawState.sensors.npk_tier;
  if (curN < 35) {
    npkStatus = 'Critical Low N/K';
    npkClass = 'danger';
    npkTier = '🔴 Alert';
  } else if (curN < 50) {
    npkStatus = 'Replenishing NPK...';
    npkClass = 'warning';
    npkTier = '🟡 Watch';
  } else {
    npkStatus = 'Optimal NPK';
    npkClass = 'optimal';
    npkTier = '🟢 Normal';
  }

  const curHealth = animatedValues.health_score;
  let healthLabel = rawState.crop.health_label;
  let stressLevel = rawState.crop.stress_level;
  if (curHealth < 60) {
    healthLabel = `Drought Stress (${curHealth}%)`;
    stressLevel = 'HIGH';
  } else if (curHealth < 80) {
    healthLabel = `Recovering (${curHealth}%)`;
    stressLevel = 'MODERATE';
  } else {
    healthLabel = mode === 'WET' ? `Hydrated • Spore Watch (${curHealth}%)` : `Healthy (${curHealth}%)`;
    stressLevel = 'LOW';
  }

  // Derive the full state snapshot merged with smooth animated telemetry values
  const farmState = {
    ...rawState,
    sensors: {
      ...rawState.sensors,
      soil_moisture: curMoisture,
      soil_moisture_str: `${curMoisture}%`,
      soil_moisture_status: moistureStatus,
      soil_moisture_class: moistureClass,
      soil_moisture_tier: moistureTier,
      soil_moisture_insight: moistureInsight,

      temperature: curTemp,
      temperature_str: `${curTemp}°C`,
      temperature_status: tempStatus,
      temperature_class: tempClass,
      temperature_tier: tempTier,

      humidity: curHumidity,
      humidity_str: `${curHumidity}%`,
      humidity_status: humidityStatus,
      humidity_class: humidityClass,
      humidity_tier: humidityTier,

      nitrogen: curN,
      phosphorus: animatedValues.phosphorus,
      potassium: animatedValues.potassium,
      npk_str: `N:${curN} P:${animatedValues.phosphorus} K:${animatedValues.potassium}`,
      npk_status: npkStatus,
      npk_class: npkClass,
      npk_tier: npkTier
    },
    weather: {
      ...rawState.weather,
      temperature: curTemp,
      temperature_str: `${curTemp}°C`,
      humidity: curHumidity,
      humidity_str: `${curHumidity}%`,
      rain_probability: animatedValues.rain_probability
    },
    crop: {
      ...rawState.crop,
      health_score: curHealth,
      health_label: healthLabel,
      stress_level: stressLevel
    },
    isTransitioning
  };

  // Change state handler (Optimistic local update + Broadcast to Sync Server)
  const setFarmMode = useCallback(async (newMode) => {
    const validMode = (newMode || '').toUpperCase().trim();
    if (!['NORMAL', 'DRY', 'WET'].includes(validMode)) return;

    // Optimistic local update
    setModeState(validMode);
    const nowTime = new Date().toLocaleTimeString();
    setLastUpdated(nowTime);

    const baseUrl = getApiBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/api/farm-state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: validMode })
      });
      if (response.ok) {
        setIsConnected(true);
      }
    } catch (err) {
      console.warn('[Simulation] Backend POST sync error:', err);
    }
  }, []);

  // Sync state from server on mount & listen to real-time SSE stream + polling fallback
  useEffect(() => {
    isMountedRef.current = true;
    const baseUrl = getApiBaseUrl();

    const fetchCurrentState = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/farm-state`);
        if (res.ok) {
          const data = await res.json();
          if (isMountedRef.current && data.mode && FARM_STATES[data.mode]) {
            setModeState(data.mode);
            if (data.last_updated) setLastUpdated(data.last_updated);
            setIsConnected(true);
          }
        }
      } catch (e) {
        // Backend not reachable yet
        if (isMountedRef.current) setIsConnected(false);
      }
    };

    fetchCurrentState();

    // 1. Establish SSE Stream for sub-10ms real-time multi-device sync
    const connectSSE = () => {
      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        const es = new EventSource(`${baseUrl}/api/farm-state/stream`);
        eventSourceRef.current = es;

        es.onopen = () => {
          if (isMountedRef.current) setIsConnected(true);
        };

        es.onmessage = (event) => {
          if (!event.data || event.data.startsWith(':')) return;
          try {
            const data = JSON.parse(event.data);
            if (isMountedRef.current && data.mode && FARM_STATES[data.mode]) {
              setModeState(data.mode);
              if (data.last_updated) setLastUpdated(data.last_updated);
              setIsConnected(true);
            }
          } catch (err) {
            // Ignore parse errors on keepalive
          }
        };

        es.onerror = () => {
          if (isMountedRef.current) setIsConnected(false);
          es.close();
        };
      } catch (err) {
        console.warn('[Simulation] SSE connection error:', err);
      }
    };

    connectSSE();

    // 2. Continuous Polling Fallback (every 800ms) for 100% resilient cross-phone sync
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${baseUrl}/api/farm-state`);
        if (res.ok) {
          const data = await res.json();
          if (isMountedRef.current && data.mode && FARM_STATES[data.mode]) {
            setModeState(data.mode);
            if (data.last_updated) setLastUpdated(data.last_updated);
            setIsConnected(true);
          }
        }
      } catch (err) {
        if (isMountedRef.current) setIsConnected(false);
      }
    }, 800);

    return () => {
      isMountedRef.current = false;
      clearInterval(pollInterval);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        mode,
        farmState,
        setFarmMode,
        isConnected,
        lastUpdated
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useFarmSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useFarmSimulation must be used within a SimulationProvider');
  }
  return context;
}
