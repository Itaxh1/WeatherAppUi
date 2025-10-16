import React, { useState, KeyboardEvent } from 'react';
import {
  Cloud, MapPin, Wind, Droplets, Thermometer, Search,
  Navigation, X, Info
} from 'lucide-react';

interface WeatherData {
  locationName: string;
  current: {
    icon: string;
    description: string;
    temperature: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
  };
  forecast: {
    date: string;
    icon: string;
    description: string;
    max_temp: number;
    min_temp: number;
  }[];
}

const WeatherApp: React.FC = () => {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showModal, setShowModal] = useState(false);

  const API_BASE_URL =
    'http://127.0.0.1:5000';

  const fetchWeather = async (loc?: string) => {
    setLoading(true);
    setError('');

    const url = loc
      ? `${API_BASE_URL}/api/weather?location=${encodeURIComponent(loc)}`
      : `${API_BASE_URL}/api/weather`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setWeatherData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (location.trim()) {
      fetchWeather(location.trim());
    } else {
      setError('Please enter a location.');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleCurrentLocation = () => {
    setLocation('');
    fetchWeather();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-vh-100 bg-light py-4 px-3">
      <div className="container">
        {/* Header */}
        <header className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <Cloud size={32} className="text-primary" />
            <h1 className="fw-bold text-primary">Weather Dashboard</h1>
          </div>
          <p className="text-muted small">
            Built by <strong>You</strong> —{' '}
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-link p-0 text-decoration-none text-primary"
            >
              <Info size={16} /> About PMA
            </button>
          </p>
        </header>

        {/* Search Section */}
        <div className="bg-white rounded-4 p-4 shadow mb-4">
          <div className="input-group mb-3">
            <span className="input-group-text bg-white border-end-0">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter city, zip code, or landmark..."
              className="form-control border-start-0"
            />
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary flex-fill d-flex align-items-center justify-content-center gap-2"
            >
              <Search size={18} /> Get Weather
            </button>
            <button
              onClick={handleCurrentLocation}
              disabled={loading}
              className="btn btn-secondary flex-fill d-flex align-items-center justify-content-center gap-2"
            >
              <Navigation size={18} /> My Location
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3 text-muted">Fetching weather data...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* Weather Data */}
        {weatherData && !loading && (
          <div className="bg-white rounded-4 p-4 shadow">
            <h2 className="h4 mb-3 d-flex align-items-center gap-2">
              <MapPin size={20} /> {weatherData.locationName}
            </h2>

            <div className="d-flex flex-column align-items-center">
              <img
                src={weatherData.current.icon}
                alt={weatherData.current.description}
                width={80}
                height={80}
              />
              <h3 className="display-5 fw-bold">
                {Math.round(weatherData.current.temperature)}°
              </h3>
              <p className="text-capitalize">{weatherData.current.description}</p>
            </div>

            <div className="d-flex justify-content-around text-center mt-4">
              <div>
                <Thermometer size={18} /> <br />
                <strong>{Math.round(weatherData.current.feels_like)}°C</strong>
                <div className="small text-muted">Feels Like</div>
              </div>
              <div>
                <Droplets size={18} /> <br />
                <strong>{weatherData.current.humidity}%</strong>
                <div className="small text-muted">Humidity</div>
              </div>
              <div>
                <Wind size={18} /> <br />
                <strong>{weatherData.current.wind_speed.toFixed(1)} m/s</strong>
                <div className="small text-muted">Wind</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;
