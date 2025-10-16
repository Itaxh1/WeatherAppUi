import React from 'react'
import ReactDOM from 'react-dom/client'
import WeatherApp from './WeatherApp.tsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <WeatherApp />
  </React.StrictMode>,
)
