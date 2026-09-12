import React from 'react'
import ReactDOM from 'react-dom/client'
import ControllerApp from './ControllerApp.jsx'
import { SimulationProvider } from '../simulation/SimulationContext.jsx'
import '../index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SimulationProvider>
      <ControllerApp />
    </SimulationProvider>
  </React.StrictMode>
)
