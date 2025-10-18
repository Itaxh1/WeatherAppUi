import React, { useState, useEffect } from 'react';
import {
  Cloud, Wind, Droplets, Search, Navigation, Loader,
  AlertCircle, X, List, Plus, Trash2, FileJson, FileText, FileDown, History, Edit2
} from 'lucide-react';
import './WeatherApp.css';
// --- API Configuration ---
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// +++ START: Supabase REST API Configuration +++
const SUPABASE_URL = 'https://njmcreqgbfyvabcqojdz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qbWNyZXFnYmZ5dmFiY3FvamR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1ODE4NzAsImV4cCI6MjA3NjE1Nzg3MH0.HzuZVVio9vIRjXtypCW5uAI2nDA5SBJjNF5EhqRDz1Y';
const SUPABASE_API_BASE_URL = `${SUPABASE_URL}/rest/v1`;
const TABLE_NAME = 'weather_requests';

// Common headers for all Supabase requests
const supabaseHeaders = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};
// +++ END: Supabase REST API Configuration +++

// --- API Endpoints (Using Free Tier Compatible URLs) ---
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AIR_POLLUTION_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
const ICON_URL = 'https://openweathermap.org/img/wn/';

// --- TypeScript Interfaces ---
interface CurrentWeather {
    locationName: string; temp: number; feelsLike: number; tempMin: number;
    tempMax: number; humidity: number; pressure: number; windSpeed: number;
    visibility: number; description: string; icon: string; timezone: number; aqi: number;
    coords: { lat: number; lon: number };
}
interface DailyForecast { date: string; maxTemp: number; minTemp: number; icon: string; }
interface WeatherRequest {
    id: string; location: { name: string; country: string; coordinates: { lat: number; lon: number } };
    date_range: { start_date: string; end_date: string; }; requested_by: string;
    weather_data?: {
        date: string;
        icon: string;
        description: string;
        temperature: { avg: number; max: number; min: number };
        humidity: number;
        windSpeed: number;
    }[];
}
interface RecentSearch { id: string; location: string; coords: { lat: number; lon: number }; }

// --- Main App Component ---
const WeatherAppV2 = () => {
    const [location, setLocation] = useState('New York');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentView, setCurrentView] = useState<'current' | 'create' | 'list' | 'detail'>('current');
    const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
    const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
    const [localTime, setLocalTime] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [weatherRequests, setWeatherRequests] = useState<WeatherRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<WeatherRequest | null>(null);
    const [crudLocation, setCrudLocation] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [requestedBy, setRequestedBy] = useState('');
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
    const [editMode, setEditMode] = useState(false);
    
    useEffect(() => {
        const saved = localStorage.getItem('weatherRecentSearches');
        if (saved) setRecentSearches(JSON.parse(saved));
        fetchWeatherByCoords(40.7128, -74.0060, 'New York, NY, US');
    }, []);

    useEffect(() => {
        if (!currentWeather) return;
        const interval = setInterval(() => {
            const date = new Date(Date.now() + currentWeather.timezone * 1000);
            setLocalTime(date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' }));
        }, 1000);
        return () => clearInterval(interval);
    }, [currentWeather]);

    const formatDate = (dateStr?: string, options?: Intl.DateTimeFormatOptions) => {
        if (!dateStr) return 'N/A';
        const defaultOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
        return new Date(dateStr).toLocaleDateString('en-US', { ...defaultOptions, ...options });
    };
    const Footer = () => (
        <footer
          className="app-footer"
          style={{

            color: '#e6f0ea',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            marginTop: 'auto', // <-- key line (pushes footer to end)
          }}
        >
          <p>Built using Supabase + OpenWeather + React</p>
          <p>© {new Date().getFullYear()} | Crafted by Ashwin Kumar Uma Sankar</p>
      
          <div
            style={{
              marginTop: '0.8rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <a
              href="https://www.linkedin.com/in/ashwinkumar99"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                // backgroundColor: '#16a34a',
                color: '#e6f0ea',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#22c55e')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = '')}
            >
              LinkedIn
            </a>
      
            <a
              href="https://www.ashxinkumar.me/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                // backgroundColor: '#15803d',
                color: '#e6f0ea',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#22c55e')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = '')}
            >
              Portfolio
            </a>
          </div>
        </footer>
      );
      
      
      

    const fetchWeatherByCoords = async (lat: number, lon: number, locationName: string) => {
        setLoading(true); setError(''); setSuccess('');
        setLocation(locationName.split(',')[0]);
        setIsFocused(false); setSearchSuggestions([]);

        if (!OPENWEATHER_API_KEY) {
            setError("OpenWeather API Key is missing."); setLoading(false); return;
        }

        try {
            const params = new URLSearchParams({ lat: String(lat), lon: String(lon), appid: OPENWEATHER_API_KEY, units: 'metric' });
            
            const [weatherRes, forecastRes, airRes] = await Promise.all([
                fetch(`${WEATHER_URL}?${params}`),
                fetch(`${FORECAST_URL}?${params}`),
                fetch(`${AIR_POLLUTION_URL}?${params}`)
            ]);
            if (!weatherRes.ok || !forecastRes.ok || !airRes.ok) throw new Error('API Error: Could not fetch weather data. Please check your API key.');

            const weather = await weatherRes.json();
            const forecast = await forecastRes.json();
            const air = await airRes.json();
            
            setDailyForecast(processDailyForecast(forecast.list, weather.timezone));
            setCurrentWeather({
                locationName, temp: weather.main.temp, feelsLike: weather.main.feels_like,
                tempMin: weather.main.temp_min, tempMax: weather.main.temp_max,
                humidity: weather.main.humidity, pressure: weather.main.pressure, windSpeed: weather.wind.speed,
                visibility: weather.visibility / 1000, description: weather.weather[0].description,
                icon: weather.weather[0].icon, timezone: weather.timezone,
                aqi: air.list[0].main.aqi, coords: { lat, lon },
            });
            saveRecentSearch(locationName, { lat, lon });
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.'); setCurrentWeather(null);
        } finally {
            setLoading(false);
        }
    };
    
    const saveRecentSearch = (name: string, coords: { lat: number; lon: number }) => {
        const newSearch = { id: Date.now().toString(), location: name, coords };
        const updated = [newSearch, ...recentSearches.filter(s => s.location !== name)].slice(0, 3);
        setRecentSearches(updated);
        localStorage.setItem('weatherRecentSearches', JSON.stringify(updated));
    };

    const processDailyForecast = (list: any[], tz: number): DailyForecast[] => {
        const dailyData: { [key: string]: { temps: number[], icons: { [key: string]: number } } } = {};
        list.forEach(item => {
            const day = new Date((item.dt + tz) * 1000).toISOString().split('T')[0];
            if (!dailyData[day]) dailyData[day] = { temps: [], icons: {} };
            dailyData[day].temps.push(item.main.temp);
            const icon = item.weather[0].icon;
            dailyData[day].icons[icon] = (dailyData[day].icons[icon] || 0) + 1;
        });
        return Object.keys(dailyData).slice(0, 5).map(date => {
            const day = dailyData[date];
            const dominantIcon = Object.keys(day.icons).reduce((a, b) => day.icons[a] > day.icons[b] ? a : b);
            return { date, maxTemp: Math.round(Math.max(...day.temps)), minTemp: Math.round(Math.min(...day.temps)), icon: dominantIcon };
        });
    };

    const handleSearch = async (query: string) => {
        if (query.trim()) {
            const res = await fetch(`${GEO_URL}?q=${query.trim()}&limit=5&appid=${OPENWEATHER_API_KEY}`);
            if (res.ok) setSearchSuggestions(await res.json());
        } else { setSearchSuggestions([]); }
    };
    
    const handleSuggestionClick = (suggestion: any) => {
        const { lat, lon, name, country, state } = suggestion;
        fetchWeatherByCoords(lat, lon, `${name}, ${state ? `${state}, ` : ''}${country}`);
    };

    // --- NEW HELPER FUNCTION TO FETCH AND FORMAT WEATHER DATA ---
    const fetchAndFormatWeatherData = async (locationName: string, start: string, end: string) => {
        // 1. Geocode location to get coordinates
        const geoRes = await fetch(`${GEO_URL}?q=${locationName}&limit=1&appid=${OPENWEATHER_API_KEY}`);
        if (!geoRes.ok) throw new Error('Failed to geocode location.');
        const geoData = await geoRes.json();
        if (geoData.length === 0) throw new Error(`Location "${locationName}" not found.`);
        const { lat, lon } = geoData[0];

        // 2. Fetch current weather data for the coordinates
        // Note: Free OpenWeatherMap API doesn't support date range historical data easily.
        // This mimics the backend logic by using current weather for each day in the range.
        const weatherRes = await fetch(`${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`);
        if (!weatherRes.ok) throw new Error('Failed to fetch weather data.');
        const current = await weatherRes.json();
        
        // 3. Format data for each day in the date range
        const formattedData = [];
        let currentDate = new Date(new Date(start).toUTCString());
        const endDateObj = new Date(new Date(end).toUTCString());

        while (currentDate <= endDateObj) {
            formattedData.push({
                date: currentDate.toISOString().split('T')[0],
                temperature: {
                    avg: current.main.temp,
                    min: current.main.temp_min,
                    max: current.main.temp_max,
                },
                humidity: current.main.humidity,
                windSpeed: current.wind.speed,
                description: current.weather[0].description,
                icon: current.weather[0].icon,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return formattedData;
    };


    const fetchWeatherRequests = async () => {
        setLoading(true); setError('');
        try {
            const res = await fetch(`${SUPABASE_API_BASE_URL}/${TABLE_NAME}?select=*&order=created_at.desc`, {
                method: 'GET',
                headers: supabaseHeaders,
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to fetch data.'); }
            
            const data = await res.json();
            
            const formattedData = data.map((req: any) => ({
                id: req.id,
                location: { name: req.location_name, country: '', coordinates: { lat: 0, lon: 0 } },
                date_range: { start_date: req.start_date, end_date: req.end_date },
                requested_by: req.requested_by,
                weather_data: req.weather_data || [],
            }));
            
            setWeatherRequests(formattedData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATED CREATE FUNCTION ---
    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess('');
        
        const locationToSave = crudLocation || currentWeather?.locationName;
        if (!locationToSave) {
            setError("Location is required.");
            setLoading(false);
            return;
        }

        try {
            const weatherData = await fetchAndFormatWeatherData(locationToSave, startDate, endDate);

            const requestBody = {
                location_name: locationToSave,
                start_date: startDate,
                end_date: endDate,
                requested_by: requestedBy || 'Anonymous',
                weather_data: weatherData,
            };

            const res = await fetch(`${SUPABASE_API_BASE_URL}/${TABLE_NAME}`, {
                method: 'POST',
                headers: { ...supabaseHeaders, 'Prefer': 'return=minimal' },
                body: JSON.stringify(requestBody),
            });

            if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to create request.'); }
            
            setSuccess('Request created successfully!');
            fetchWeatherRequests();
            setCurrentView('list');
            
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATED UPDATE FUNCTION ---
    const handleUpdateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        setLoading(true); setError(''); setSuccess('');

        try {
            const weatherData = await fetchAndFormatWeatherData(crudLocation, startDate, endDate);

            const updatedData = {
                location_name: crudLocation,
                start_date: startDate,
                end_date: endDate,
                requested_by: requestedBy,
                weather_data: weatherData,
            };

            const res = await fetch(`${SUPABASE_API_BASE_URL}/${TABLE_NAME}?id=eq.${selectedRequest.id}`, {
                method: 'PATCH',
                headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
                body: JSON.stringify(updatedData),
            });
            
            if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to update request.'); }
            
            const data = (await res.json())[0];
            
            const formattedData = {
                id: data.id,
                location: { name: data.location_name, country: '', coordinates: { lat: 0, lon: 0 } },
                date_range: { start_date: data.start_date, end_date: data.end_date },
                requested_by: data.requested_by,
                weather_data: data.weather_data || [],
            };

            setSelectedRequest(formattedData);
            setSuccess('Request updated successfully!');
            setEditMode(false);
            fetchWeatherRequests();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRequest = async (id: string) => {
        // The window.confirm dialog can be unreliable in some environments.
        // Forcing the delete action to ensure it works as requested.
        setLoading(true); setError(''); setSuccess('');

        try {
            const res = await fetch(`${SUPABASE_API_BASE_URL}/${TABLE_NAME}?id=eq.${id}`, {
                method: 'DELETE',
                headers: supabaseHeaders,
            });

            if (!res.ok) { 
                // Try to parse error from Supabase
                try {
                    const err = await res.json();
                    throw new Error(err.message || 'Failed to delete request.');
                } catch {
                    throw new Error('Failed to delete request.');
                }
            }

            setSuccess('Request deleted.');
            setCurrentView('list');
            await fetchWeatherRequests(); // Refetch the list to ensure UI is in sync

        } catch (err: any) {
            setError(err.message);
            setLoading(false); // Manually set loading to false on error
        }
        // The finally block in fetchWeatherRequests will set loading to false on success
    };
    
    const handleExport = async (format: string) => {
        if (!selectedRequest) {
            setError('No request selected for export.');
            return;
        }

        if (format.toLowerCase() !== 'json') {
            setError(`Exporting to ${format.toUpperCase()} requires a server-side component. Only JSON export is supported.`);
            return;
        }

        setLoading(true); setError(''); setSuccess('');
        try {
            const res = await fetch(`${SUPABASE_API_BASE_URL}/${TABLE_NAME}?id=eq.${selectedRequest.id}&select=*`, {
                method: 'GET',
                headers: supabaseHeaders,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to fetch data for export.');
            }
            
            const data = (await res.json())[0];
            if (!data) throw new Error('Could not find the selected request.');

            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `weather-request-${selectedRequest.id}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setSuccess('JSON file exported successfully!');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMyLocation = () => {
        navigator.geolocation.getCurrentPosition(p => 
            fetchWeatherByCoords(p.coords.latitude, p.coords.longitude, 'Your Location')
        );
    };
    
    const renderCurrentWeatherView = () => (
        <div className="weather-grid">
            <div className="grid-card current-weather-new">
                <p className="location">{currentWeather?.locationName}</p>
                <p className="local-time-card">{localTime}</p>
                <div className="current-main">
                    <img src={`${ICON_URL}${currentWeather?.icon}@4x.png`} alt={currentWeather?.description} />
                    <p className="temp">{Math.round(currentWeather?.temp || 0)}°C</p>
                </div>
                <div className="current-details">
                    <p className="desc">{currentWeather?.description}</p>
                    <p>H: {Math.round(currentWeather?.tempMax || 0)}° / L: {Math.round(currentWeather?.tempMin || 0)}°</p>
                </div>
            </div>
            <div className="grid-card details-card">
                <h3>Details</h3>
                <div className="details-grid">
                    <span><strong>Feels Like:</strong> {Math.round(currentWeather?.feelsLike || 0)}°</span>
                    <span><strong>Humidity:</strong> {currentWeather?.humidity}%</span>
                    <span><strong>Wind:</strong> {currentWeather?.windSpeed} m/s</span>
                    <span><strong>Pressure:</strong> {currentWeather?.pressure} hPa</span>
                    <span><strong>Visibility:</strong> {currentWeather?.visibility} km</span>
                    <span><strong>AQI:</strong> {currentWeather?.aqi}</span>
                </div>
            </div>
            <div className="grid-card daily-forecast">
                <h3>5-Day Forecast</h3>
                <div className="daily-forecast-container">
                    {dailyForecast.map((day) => (
                        <div key={day.date} className="day-card">
                            <p className="day-name">{new Date(day.date).toLocaleDateString('en-US',{weekday:'short', timeZone:'UTC'})}</p>
                            <img src={`${ICON_URL}${day.icon}@2x.png`} alt="" />
                            <p className="day-temps"><strong>{day.maxTemp}°</strong> / {day.minTemp}°</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid-card recent-searches-card">
                <h3><History size={16}/> Recent Searches</h3>
                <ul>{recentSearches.map(s => (<li key={s.id} onClick={() => fetchWeatherByCoords(s.coords.lat, s.coords.lon, s.location)}><span>{s.location.split(',')[0]}</span></li>))}</ul>
            </div>
            <div className="grid-card weather-map small-map">
                {GOOGLE_MAPS_API_KEY ? <iframe title="Google Map" loading="lazy" style={{ border: 0, borderRadius: '12px', width: '100%', height: '100%' }} src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${currentWeather?.locationName}`}></iframe> : <div className="api-key-missing">Google Maps Key Missing</div>}
            </div>
        </div>
        
    );
    const renderCreateView = () => <div className="form-view"><h2>Create Weather Request</h2><form onSubmit={handleCreateRequest} className="form-card"><input type="text" placeholder="Location (e.g., New York, US)" defaultValue={currentWeather?.locationName || ''} onChange={e => setCrudLocation(e.target.value)} /><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required /><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required /><input type="text" placeholder="Your Name (Optional)" value={requestedBy} onChange={e => setRequestedBy(e.target.value)} /><button type="submit" className="btn" disabled={loading}>{loading ? 'Saving...' : 'Save Request'}</button></form></div>;
    const renderListView = () => <div className="list-view"><h2>Saved Requests</h2><div className="requests-container">{weatherRequests.length > 0 ? weatherRequests.map(req => (<div key={req.id} className="request-item" onClick={() => { setSelectedRequest(req); setCurrentView('detail'); }}><h4>{req.location.name}</h4><p>{formatDate(req.date_range.start_date)} to {formatDate(req.date_range.end_date)}</p></div>)) : <p>No saved requests found.</p>}</div></div>;
    const renderDetailView = () => selectedRequest && (
        <div className="detail-view">
            <button className="btn back-btn" onClick={() => { setCurrentView('list'); setEditMode(false); }}>← Back to List</button>
            
            {editMode ? (
                <form onSubmit={handleUpdateRequest} className="form-card edit-form">
                    <h3>Editing Request</h3>
                    <input type="text" defaultValue={selectedRequest.location.name} onChange={e => setCrudLocation(e.target.value)} />
                    <input type="date" defaultValue={selectedRequest.date_range.start_date.split('T')[0]} onChange={e => setStartDate(e.target.value)} />
                    <input type="date" defaultValue={selectedRequest.date_range.end_date.split('T')[0]} onChange={e => setEndDate(e.target.value)} />
                    <input type="text" defaultValue={selectedRequest.requested_by} onChange={e => setRequestedBy(e.target.value)} />
                    <div className="edit-actions">
                        <button type="button" className="btn cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
                        <button type="submit" className="btn" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="detail-header">
                        <h2>{selectedRequest.location.name}</h2>
                        <p>{formatDate(selectedRequest.date_range.start_date)} - {formatDate(selectedRequest.date_range.end_date)}</p>
                    </div>
                    <div className="export-options">
                        <button onClick={() => {
                            setEditMode(true);
                            setCrudLocation(selectedRequest.location.name);
                            setStartDate(selectedRequest.date_range.start_date.split('T')[0]);
                            setEndDate(selectedRequest.date_range.end_date.split('T')[0]);
                            setRequestedBy(selectedRequest.requested_by);
                        }}><Edit2 size={16}/> Edit</button>
                        <button onClick={() => handleExport('json')}><FileJson size={16}/>JSON</button>
                        <button onClick={() => handleExport('csv')}><FileText size={16}/>CSV</button>
                        <button onClick={() => handleExport('pdf')}><FileDown size={16}/>PDF</button>
                        <button className="btn delete-btn" onClick={() => handleDeleteRequest(selectedRequest.id)}><Trash2 size={16}/>Delete</button>
                    </div>
                </>
            )}

            <div className="saved-data-grid">
                {selectedRequest.weather_data && selectedRequest.weather_data.length > 0 ? (
                    selectedRequest.weather_data.map(day => (
                        <div key={day.date} className="saved-day-card">
                            <p className="saved-day-date">{formatDate(day.date, { weekday: 'long' })}</p>
                            <img src={`${ICON_URL}${day.icon}@2x.png`} alt={day.description} />
                            <p className="saved-day-temp">{Math.round(day.temperature.avg)}°C</p>
                            <p className="saved-day-range">{day.temperature.max}° / {day.temperature.min}°</p>
                            <p className="saved-day-desc">{day.description}</p>
                            <div className="saved-day-details">
                                <span><Droplets size={14} /> {day.humidity}%</span>
                                <span><Wind size={14} /> {day.windSpeed} m/s</span>
                            </div>
                        </div>
                    ))
                ) : <p>No detailed weather data found for this request.</p>}
            </div>
        </div>
    );

    if (loading && !currentWeather) return <div className="full-screen-loader"><Loader className="loader-spin" size={64} /></div>;

    return (
        <div className="weather-container">
            <aside className="sidebar">
                <Cloud size={28} onClick={() => setCurrentView('current')} style={{cursor:'pointer'}} />
            </aside>
            <main className="main-content">
                <header className="main-header">
                     <div className="search-wrapper">
                        <Search size={20} className="search-icon" />
                        <input type="text" value={location} onChange={e => { setLocation(e.target.value); handleSearch(e.target.value); }} onFocus={() => setIsFocused(true)} onBlur={() => setTimeout(() => setIsFocused(false), 200)} placeholder="Search for city..." className="search-input" />
                        <button className="location-btn" onClick={handleMyLocation}><Navigation size={20} /></button>
                        {isFocused && searchSuggestions.length > 0 && (
                            <div className="suggestions-box">{searchSuggestions.map((s, i) => (<div key={i} className="suggestion-item" onClick={() => handleSuggestionClick(s)}>{s.name}, {s.state ? `${s.state}, ` : ''}{s.country}</div>))}</div>
                        )}
                    </div>
                    <div className="header-actions">
                        <div className="view-switcher"><button onClick={() => setCurrentView('current')} className={currentView === 'current' ? 'active' : ''}><Cloud size={16}/> Dashboard</button><button onClick={() => setCurrentView('create')} className={currentView === 'create' ? 'active' : ''}><Plus size={16}/> Create</button><button onClick={() => { setCurrentView('list'); fetchWeatherRequests(); }} className={currentView === 'list' ? 'active' : ''}><List size={16}/> View Saved</button></div>
                    </div>
                </header>
                {error && <div className="alert-error"><AlertCircle size={20} /> {error} <X size={20} onClick={() => setError('')}/></div>}
                {success && <div className="alert-success">✓ {success} <X size={20} onClick={() => setSuccess('')}/></div>}
                {currentView === 'current' && currentWeather && renderCurrentWeatherView()}
                {currentView === 'create' && renderCreateView()}
                {currentView === 'list' && renderListView()}
                {currentView === 'detail' && renderDetailView()}
                <Footer />
            </main>
       
        </div>
    );
};

export default WeatherAppV2;

