import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'
import WeatherAppV2 from './components/WeatherApp.tsx'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    {/* <WeatherApp /> */}
    <WeatherAppV2/>
  </React.StrictMode>,
)
