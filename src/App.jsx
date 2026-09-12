import React, { useState, useEffect } from 'react'
import SplashScreen from './screens/SplashScreen.jsx'
import LoginScreen from './screens/LoginScreen.jsx'
import HomeScreen from './screens/HomeScreen.jsx'
import SensorDetail from './screens/SensorDetail.jsx'
import ScanScreen from './screens/ScanScreen.jsx'
import AnalysisResult from './screens/AnalysisResult.jsx'
import WeatherScreen from './screens/WeatherScreen.jsx'
import AlertsScreen from './screens/AlertsScreen.jsx'
import RecommendScreen from './screens/RecommendScreen.jsx'
import IrrigationScreen from './screens/IrrigationScreen.jsx'
import ChatScreen from './screens/ChatScreen.jsx'
import BottomNav from './components/BottomNav.jsx'
import ControllerApp from './controller/ControllerApp.jsx'
import { SimulationProvider } from './simulation/SimulationContext.jsx'

function MainApp() {
  // Check if current URL is directly asking for controller
  const isControllerRoute = () => {
    const path = window.location.pathname.toLowerCase()
    const search = window.location.search.toLowerCase()
    return path.includes('/controller') || search.includes('controller') || search.includes('view=controller')
  }

  const [isController, setIsController] = useState(isControllerRoute())
  const [currentScreen, setCurrentScreen] = useState('splash')
  const [activeTab, setActiveTab] = useState('home')
  const [selectedSensor, setSelectedSensor] = useState(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [chatInitialQuery, setChatInitialQuery] = useState(null)
  const [recommendStage, setRecommendStage] = useState('Flowering')

  // Listen to popstate or direct URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      setIsController(isControllerRoute())
    }
    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  // If controller view is active, render ControllerApp
  if (isController) {
    return (
      <div className="mobile-frame">
        <ControllerApp onSwitchToDashboard={() => {
          window.history.pushState({}, '', '/')
          setIsController(false)
        }} />
      </div>
    )
  }

  // Splash -> Login transition
  const handleSplashEnd = () => setCurrentScreen('login')
  
  // Login -> App transition
  const handleLogin = () => {
    setCurrentScreen('app')
    setActiveTab('home')
  }

  // Open controller
  const handleOpenController = () => {
    window.history.pushState({}, '', '/controller')
    setIsController(true)
  }

  // Navigate to sensor detail
  const handleSensorClick = (sensor) => {
    if (sensor.id === 'npk') {
      setActiveTab('recommend')
      return
    }
    setSelectedSensor(sensor)
    setCurrentScreen('sensorDetail')
  }

  // Back from sensor detail
  const handleBackFromSensor = () => {
    setCurrentScreen('app')
    setSelectedSensor(null)
  }

  // Scan result navigation
  const handleShowAnalysis = (result) => {
    setScanResult(result)
    setShowAnalysis(true)
  }
  const handleBackFromAnalysis = () => {
    setShowAnalysis(false)
    setScanResult(null)
  }

  // Tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentScreen('app')
    setShowAnalysis(false)
    setSelectedSensor(null)
  }

  const handleNavigateToChat = (query) => {
    setChatInitialQuery(query)
    handleTabChange('chat')
  }

  const handleNavigateToRecommend = (stage) => {
    if (stage) setRecommendStage(stage)
    handleTabChange('recommend')
  }

  // Render splash
  if (currentScreen === 'splash') {
    return (
      <div className="mobile-frame">
        <SplashScreen onFinish={handleSplashEnd} />
      </div>
    )
  }

  // Render login
  if (currentScreen === 'login') {
    return (
      <div className="mobile-frame">
        <LoginScreen onLogin={handleLogin} />
      </div>
    )
  }

  // Render sensor detail
  if (currentScreen === 'sensorDetail' && selectedSensor) {
    return (
      <div className="mobile-frame">
        <div className="app-layout">
          <div className="app-content">
            <SensorDetail sensor={selectedSensor} onBack={handleBackFromSensor} />
          </div>
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>
    )
  }

  // Render main app screens
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onSensorClick={handleSensorClick}
            onWeatherClick={() => handleTabChange('weather')}
            onAlertsClick={() => handleTabChange('alerts')}
            onOpenController={handleOpenController}
          />
        )
      case 'scan':
        if (showAnalysis) {
          return <AnalysisResult result={scanResult} onBack={handleBackFromAnalysis} />
        }
        return <ScanScreen onAnalyze={handleShowAnalysis} />
      case 'chat':
        return (
          <ChatScreen
            initialQuery={chatInitialQuery}
            onClearInitialQuery={() => setChatInitialQuery(null)}
          />
        )
      case 'weather':
        return <WeatherScreen onBack={() => handleTabChange('home')} />
      case 'alerts':
        return (
          <AlertsScreen
            onBack={() => handleTabChange('home')}
            onNavigateToChat={handleNavigateToChat}
            onNavigateToRecommend={handleNavigateToRecommend}
          />
        )
      case 'recommend':
        return (
          <RecommendScreen
            initialStage={recommendStage}
            onNavigateToChat={handleNavigateToChat}
          />
        )
      case 'irrigation':
        return <IrrigationScreen />
      default:
        return (
          <HomeScreen
            onSensorClick={handleSensorClick}
            onWeatherClick={() => handleTabChange('weather')}
            onAlertsClick={() => handleTabChange('alerts')}
            onOpenController={handleOpenController}
          />
        )
    }
  }

  return (
    <div className="mobile-frame">
      <div className="app-layout">
        <div className="app-content">
          {renderScreen()}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <SimulationProvider>
      <MainApp />
    </SimulationProvider>
  )
}
