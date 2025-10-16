import React, { useState, useEffect } from 'react';
import {
  Cloud, MapPin, Wind, Droplets, Thermometer, Search,
  Navigation, Loader, AlertCircle, Eye, Gauge, Sunrise, Sunset,
  Linkedin, Globe
} from 'lucide-react';

const API_KEY = import.meta.env.VITE_API_KEY;
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const ICON_URL = 'https://openweathermap.org/img/wn/';

const WeatherApp = () => {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  const fetchWeatherByCoords = async (lat, lon, locationName) => {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        appid: API_KEY,
        units: 'metric'
      });

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`${WEATHER_URL}?${params}`),
        fetch(`${FORECAST_URL}?${params}`)
      ]);

      if (!weatherRes.ok || !forecastRes.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weather = await weatherRes.json();
      const forecast = await forecastRes.json();

      const weatherObj = {
        locationName: locationName || `${weather.name}, ${weather.sys.country}`,
        temp: weather.main.temp,
        feelsLike: weather.main.feels_like,
        tempMin: weather.main.temp_min,
        tempMax: weather.main.temp_max,
        humidity: weather.main.humidity,
        pressure: weather.main.pressure,
        windSpeed: weather.wind.speed,
        visibility: weather.visibility / 1000,
        description: weather.weather[0].description,
        icon: weather.weather[0].icon,
        sunrise: weather.sys.sunrise,
        sunset: weather.sys.sunset,
        isToday: true
      };

      setCurrentWeather(weatherObj);

      const dailyForecasts = processForecast(forecast.list);
      setForecastData(dailyForecasts);
      setSelectedDay(null);
      setError('');
      setAnimate(true);
      setTimeout(() => setAnimate(false), 600);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processForecast = (forecastList) => {
    const daily = {};
    const today = new Date().toDateString();

    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toDateString();
      
      if (dateStr === today) return;

      if (!daily[dateStr]) {
        daily[dateStr] = {
          date: dateStr,
          temps: [],
          feelsLike: [],
          humidity: [],
          windSpeed: [],
          visibility: [],
          pressure: [],
          icons: [],
          descriptions: [],
          timestamps: []
        };
      }

      daily[dateStr].temps.push(item.main.temp);
      daily[dateStr].feelsLike.push(item.main.feels_like);
      daily[dateStr].humidity.push(item.main.humidity);
      daily[dateStr].windSpeed.push(item.wind.speed);
      daily[dateStr].visibility.push((item.visibility || 10000) / 1000);
      daily[dateStr].pressure.push(item.main.pressure);
      daily[dateStr].icons.push(item.weather[0].icon);
      daily[dateStr].descriptions.push(item.weather[0].description);
      daily[dateStr].timestamps.push(item.dt);
    });

    return Object.values(daily).slice(0, 5).map(day => {
      const avgIdx = Math.floor(day.temps.length / 2);
      return {
        date: day.date,
        temp: Math.round(day.temps[avgIdx]),
        maxTemp: Math.round(Math.max(...day.temps)),
        minTemp: Math.round(Math.min(...day.temps)),
        feelsLike: Math.round(day.feelsLike[avgIdx]),
        humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
        windSpeed: (day.windSpeed.reduce((a, b) => a + b) / day.windSpeed.length).toFixed(1),
        visibility: Math.round(day.visibility.reduce((a, b) => a + b) / day.visibility.length),
        pressure: Math.round(day.pressure.reduce((a, b) => a + b) / day.pressure.length),
        icon: day.icons[avgIdx],
        description: day.descriptions[avgIdx],
        sunrise: day.timestamps[0],
        sunset: day.timestamps[day.timestamps.length - 1]
      };
    });
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');
    setSearchSuggestions([]);

    try {
      const params = new URLSearchParams({
        q: location.trim(),
        limit: 5,
        appid: API_KEY
      });

      const response = await fetch(`${GEO_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to geocode location');
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error('Location not found. Please try a different search term.');
      }

      if (data.length === 1) {
        const { lat, lon, name, country, state } = data[0];
        const locationName = state 
          ? `${name}, ${state}, ${country}`
          : `${name}, ${country}`;
        await fetchWeatherByCoords(lat, lon, locationName);
      } else {
        setSearchSuggestions(data);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to find location');
      setLoading(false);
    }
  };

  const handleCurrentLocation = () => {
    setLoading(true);
    setError('');
    setLocation('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude, 'Your Location');
      },
      (err) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setLoading(false);
        console.error(err);
      }
    );
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setAnimate(true);
    setTimeout(() => setAnimate(false), 600);
  };

  const handleSuggestionClick = async (suggestion) => {
    const { lat, lon, name, country, state } = suggestion;
    const locationName = state 
      ? `${name}, ${state}, ${country}`
      : `${name}, ${country}`;
    setLocation(locationName);
    setSearchSuggestions([]);
    setLoading(true);
    await fetchWeatherByCoords(lat, lon, locationName);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const displayWeather = selectedDay || currentWeather;

  return (
    <div className="weather-container">
      <div className="weather-content">
        {/* Header */}
        <div className="header">
          <div className="header-title">
            <Cloud size={40} className="icon-primary" />
            <h1>Weather Dashboard</h1>
          </div>
          <p className="header-subtitle">Real-time weather data powered by OpenWeather API</p>
        </div>

        {/* Search Section */}
        <div className="search-card">
          <div className="search-input-group">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Enter city, zip code, coordinates, or landmark..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>
          <div className="button-group">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn btn-primary"
            >
              <Search size={18} />
              {loading ? 'Searching...' : 'Get Weather'}
            </button>
            <button
              onClick={handleCurrentLocation}
              disabled={loading}
              className="btn btn-secondary"
            >
              <Navigation size={18} />
              Use My Location
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader className="loader-spin" size={48} />
            <p>Fetching weather data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Search Suggestions */}
        {searchSuggestions.length > 0 && !loading && (
          <div className="suggestions-card">
            <h3>Multiple locations found. Please select one:</h3>
            <div className="suggestions-list">
              {searchSuggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <MapPin size={18} className="icon-primary" />
                  <div className="suggestion-info">
                    <div className="suggestion-name">
                      {suggestion.name}
                      {suggestion.state && `, ${suggestion.state}`}
                    </div>
                    <div className="suggestion-country">{suggestion.country}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weather Data */}
        {displayWeather && !loading && (
          <>
            {/* Current Weather */}
            <div className={`weather-card ${animate ? 'animate-in' : ''}`}>
              <div className="location-header">
                <MapPin size={20} className="icon-primary" />
                <h2>{currentWeather.locationName}</h2>
                {selectedDay && (
                  <button 
                    className="back-btn"
                    onClick={() => {
                      setSelectedDay(null);
                      setAnimate(true);
                      setTimeout(() => setAnimate(false), 600);
                    }}
                  >
                    ← Back to Today
                  </button>
                )}
              </div>

              {selectedDay && (
                <div className="forecast-date">
                  {formatDate(selectedDay.date)}
                </div>
              )}

              <div className="weather-main">
                <img
                  src={`${ICON_URL}${displayWeather.icon}@4x.png`}
                  alt={displayWeather.description}
                  className="weather-icon"
                />
                <div className="temperature">
                  {Math.round(displayWeather.temp)}°C
                </div>
                <p className="description">
                  {displayWeather.description}
                </p>
                {!selectedDay && (
                  <p className="temp-range">
                    H: {Math.round(displayWeather.tempMax)}° L: {Math.round(displayWeather.tempMin)}°
                  </p>
                )}
              </div>

              {/* Weather Details Grid */}
              <div className="details-grid">
                <div className="detail-card">
                  <Thermometer size={24} className="icon-primary" />
                  <div className="detail-value">{Math.round(displayWeather.feelsLike)}°C</div>
                  <div className="detail-label">Feels Like</div>
                </div>
                <div className="detail-card">
                  <Droplets size={24} className="icon-primary" />
                  <div className="detail-value">{displayWeather.humidity}%</div>
                  <div className="detail-label">Humidity</div>
                </div>
                <div className="detail-card">
                  <Wind size={24} className="icon-primary" />
                  <div className="detail-value">{displayWeather.windSpeed} m/s</div>
                  <div className="detail-label">Wind Speed</div>
                </div>
                <div className="detail-card">
                  <Eye size={24} className="icon-primary" />
                  <div className="detail-value">{displayWeather.visibility} km</div>
                  <div className="detail-label">Visibility</div>
                </div>
                <div className="detail-card">
                  <Gauge size={24} className="icon-primary" />
                  <div className="detail-value">{displayWeather.pressure} hPa</div>
                  <div className="detail-label">Pressure</div>
                </div>
                <div className="detail-card">
                  <Sunrise size={24} className="icon-primary" />
                  <div className="detail-value">{formatTime(displayWeather.sunrise)}</div>
                  <div className="detail-label">Sunrise</div>
                </div>
                <div className="detail-card">
                  <Sunset size={24} className="icon-primary" />
                  <div className="detail-value">{formatTime(displayWeather.sunset)}</div>
                  <div className="detail-label">Sunset</div>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            {forecastData.length > 0 && !selectedDay && (
              <div className="forecast-card">
                <h3>5-Day Forecast</h3>
                <div className="forecast-grid">
                  {forecastData.map((day, index) => (
                    <div 
                      key={index} 
                      className="forecast-item"
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="forecast-date-small">
                        {formatDate(day.date)}
                      </div>
                      <img
                        src={`${ICON_URL}${day.icon}@2x.png`}
                        alt={day.description}
                        className="forecast-icon"
                      />
                      <div className="forecast-temp">
                        {day.maxTemp}° / {day.minTemp}°
                      </div>
                      <div className="forecast-desc">
                        {day.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Initial State */}
        {!currentWeather && !loading && !error && searchSuggestions.length === 0 && (
          <div className="empty-state">
            <Cloud size={64} className="empty-icon" />
            <h3>Search for a location to get started</h3>
            <p>Try searching for a city, zip code, or use your current location</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">
            Built by <strong>Ashwin Kumar Uma Sankar</strong>
          </p>
          <div className="footer-links">
            <a 
              href="https://www.ashxinkumar.me/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              <Globe size={18} />
              Portfolio
            </a>
            <a 
              href="https://www.linkedin.com/in/ashwinkumar99/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              <Linkedin size={18} />
              LinkedIn
            </a>
          </div>
        </div>
      </footer>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .weather-container {
          min-height: 100vh;
          background: black;
          padding: 2rem 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          color: #e8f5e9;
        }

        .weather-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .header-title h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #4ade80;
        }

        .header-subtitle {
          color: #86efac;
          font-size: 0.875rem;
        }

        .icon-primary {
          color: #4ade80;
        }

        .search-card {
          background: rgba(26, 61, 46, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .search-input-group {
          position: relative;
          margin-bottom: 1rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #4ade80;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          background: rgba(10, 31, 15, 0.5);
          border: 1px solid rgba(74, 222, 128, 0.3);
          border-radius: 0.5rem;
          color: #e8f5e9;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #4ade80;
          box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
        }

        .search-input::placeholder {
          color: #86efac;
          opacity: 0.5;
        }

        .button-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(34, 197, 94, 0.3);
        }

        .btn-secondary {
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          color: #4ade80;
        }

        .btn-secondary:hover:not(:disabled) {
          background: rgba(74, 222, 128, 0.2);
          transform: translateY(-2px);
        }

        .loading-state {
          text-align: center;
          padding: 4rem 0;
        }

        .loader-spin {
          color: #4ade80;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 0.5rem;
          color: #fca5a5;
          margin-bottom: 2rem;
        }

        .weather-card {
          background: rgba(26, 61, 46, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .animate-in {
          animation: fadeInUp 0.6s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .location-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .location-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #4ade80;
          flex: 1;
        }

        .back-btn {
          padding: 0.5rem 1rem;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          border-radius: 0.5rem;
          color: #4ade80;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: rgba(74, 222, 128, 0.2);
          transform: translateX(-2px);
        }

        .forecast-date {
          font-size: 1.125rem;
          color: #86efac;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .weather-main {
          text-align: center;
          padding: 2rem 0;
        }

        .weather-icon {
          width: 120px;
          height: 120px;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        .temperature {
          font-size: 4rem;
          font-weight: 700;
          color: #4ade80;
          margin: 0.5rem 0;
        }

        .description {
          font-size: 1.25rem;
          color: #86efac;
          text-transform: capitalize;
          margin-bottom: 0.5rem;
        }

        .temp-range {
          color: #86efac;
          opacity: 0.7;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          margin-top: 2rem;
        }

        .detail-card {
          background: rgba(10, 31, 15, 0.5);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 0.75rem;
          padding: 1.25rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .detail-card:hover {
          transform: translateY(-4px);
          border-color: rgba(74, 222, 128, 0.4);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .detail-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #e8f5e9;
          margin: 0.75rem 0 0.5rem;
        }

        .detail-label {
          font-size: 0.875rem;
          color: #86efac;
          opacity: 0.8;
        }

        .forecast-card {
          background: rgba(26, 61, 46, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .forecast-card h3 {
          font-size: 1.25rem;
          color: #4ade80;
          margin-bottom: 1.5rem;
        }

        .forecast-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }

        .forecast-item {
          background: rgba(10, 31, 15, 0.5);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 0.75rem;
          padding: 1.25rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .forecast-item:hover {
          transform: translateY(-4px);
          border-color: rgba(74, 222, 128, 0.4);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .forecast-date-small {
          font-size: 0.875rem;
          font-weight: 600;
          color: #4ade80;
          margin-bottom: 0.75rem;
        }

        .forecast-icon {
          width: 50px;
          height: 50px;
          margin: 0.5rem 0;
        }

        .forecast-temp {
          font-size: 1rem;
          font-weight: 700;
          color: #e8f5e9;
          margin: 0.75rem 0 0.5rem;
        }

        .forecast-desc {
          font-size: 0.75rem;
          color: #86efac;
          text-transform: capitalize;
          opacity: 0.8;
        }

        .empty-state {
          text-align: center;
          padding: 5rem 0;
        }

        .empty-icon {
          color: #86efac;
          opacity: 0.5;
          margin-bottom: 1.5rem;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          color: #4ade80;
          margin-bottom: 0.75rem;
        }

        .empty-state p {
          color: #86efac;
          opacity: 0.7;
        }

        .suggestions-card {
          background: rgba(26, 61, 46, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .suggestions-card h3 {
          color: #4ade80;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(10, 31, 15, 0.5);
          border: 1px solid rgba(74, 222, 128, 0.2);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .suggestion-item:hover {
          background: rgba(10, 31, 15, 0.7);
          border-color: rgba(74, 222, 128, 0.4);
          transform: translateX(4px);
        }

        .suggestion-info {
          flex: 1;
        }

        .suggestion-name {
          color: #e8f5e9;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .suggestion-country {
          color: #86efac;
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .footer {
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(74, 222, 128, 0.2);
        }

        .footer-content {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-text {
          color: #86efac;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .footer-text strong {
          color: #4ade80;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .footer-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          border-radius: 0.5rem;
          color: #4ade80;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .footer-link:hover {
          background: rgba(74, 222, 128, 0.2);
          border-color: rgba(74, 222, 128, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .header-title h1 {
            font-size: 1.5rem;
          }

          .temperature {
            font-size: 3rem;
          }

          .details-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .forecast-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }

          .button-group {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WeatherApp;