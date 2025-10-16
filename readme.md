# 🌦️ Weather Dashboard

A modern, interactive weather application built with React that provides real-time weather data and 5-day forecasts. Features a beautiful dark green theme with smooth animations and an intuitive user interface.

![Weather Dashboard](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![OpenWeather API](https://img.shields.io/badge/OpenWeather-API-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

### Core Functionality
- 🔍 **Multi-format Location Search**: Search by city name, zip code, GPS coordinates, landmarks, or any location identifier
- 🌡️ **Current Weather**: Real-time temperature, conditions, and atmospheric data
- 📅 **5-Day Forecast**: Extended weather predictions with interactive day selection
- 📍 **Geolocation Support**: Get weather for your current location with one click
- 🎯 **Interactive Forecast**: Click any forecast day to view detailed weather metrics

### Weather Metrics Displayed
- 🌡️ Current temperature and "feels like" temperature
- 💧 Humidity percentage
- 💨 Wind speed
- 👁️ Visibility distance
- 🎚️ Atmospheric pressure
- 🌅 Sunrise and sunset times
- 🌡️ Daily high and low temperatures

### Design & UX
- 🎨 Dark green forest theme with glassmorphism effects
- ✨ Smooth fade-in animations and hover effects
- 📱 Fully responsive design (mobile, tablet, desktop)
- ⌨️ Keyboard support (Enter key to search)
- 🔄 Loading states and error handling
- 🌟 Modern glassmorphic UI with backdrop blur

## 🚀 Getting Started
- OpenWeather API key (provided in code, or get your own from [OpenWeather](https://openweathermap.org/api))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/weather-dashboard.git
cd weather-dashboard
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start the development server**
```bash
npm start
# or
yarn start
```

4. **Open your browser**
Navigate to `http://localhost:3000`

## 🔧 Configuration

### API Key Setup
The app uses the OpenWeather API. The API key is included in the code for demonstration purposes:

```javascript
const API_KEY = '1d83c4f40e4a712ab9c57d0db16b1349';
```

**For production use**, it's recommended to:
1. Get your own API key from [OpenWeather](https://openweathermap.org/api)
2. Store it in an environment variable:

```bash
# Create a .env file
REACT_APP_WEATHER_API_KEY=your_api_key_here
```


## 📖 Usage

### Searching for Weather

1. **By Location Name**
   - Type any city name: `New York`, `London`, `Tokyo`
   - Include state/country for better results: `Portland, Oregon`
   - Press Enter or click "Get Weather"

2. **By Zip/Postal Code**
   - Enter zip code: `90210` (US)
   - For international: `SW1A 1AA,UK`

3. **By GPS Coordinates**
   - Format: `40.7128,-74.0060`
   - Latitude, Longitude

4. **By Current Location**
   - Click "Use My Location" button
   - Allow browser location access when prompted

### Viewing Forecast Details

1. Search for any location to see current weather
2. Scroll down to view the 5-day forecast cards
3. **Click on any forecast day** to see detailed weather metrics
4. Click "← Back to Today" to return to current weather

## 🛠️ Technology Stack

- **Framework**: React 18+
- **Icons**: Lucide React
- **API**: OpenWeather API (Current Weather + 5-Day Forecast)
- **Styling**: Custom CSS with CSS-in-JS
- **Geolocation**: Browser Geolocation API
- **HTTP Client**: Fetch API

## 📂 Project Structure

```
weather-dashboard/
├── src/
│   ├── components/
│   │   └── WeatherApp.jsx       # Main weather component
│   ├── App.js                   # Root component
│   └── index.js                 # Entry point
├── public/
│   └── index.html
├── package.json
└── README.md
```

## 🎨 Design Philosophy

The app features a **dark green forest theme** inspired by nature and modern web design trends:

- **Color Palette**:
  - Background: Deep forest greens (`#0a1f0f`, `#1a3d2e`, `#0d2818`)
  - Accent: Neon green (`#4ade80`)
  - Text: Light green shades (`#e8f5e9`, `#86efac`)

- **UI Patterns**:
  - Glassmorphism with backdrop blur
  - Subtle gradients and shadows
  - Smooth transitions and hover effects
  - Minimalist, content-first layout

## 🔒 Privacy & Security

- **No data collection**: The app doesn't store or transmit any user data
- **Geolocation**: Location access is only requested when you click "Use My Location"
- **API calls**: All requests go directly to OpenWeather API
- **Client-side only**: No backend server, all processing happens in your browser

## 🐛 Known Limitations

- Sunrise/sunset times for forecast days are approximated (API limitation)
- Free API tier has rate limits (60 calls/minute)
- Geolocation requires HTTPS in production
- Some locations may have limited forecast data availability

## 🚧 Future Enhancements

- [ ] Hourly forecast view
- [ ] Weather alerts and notifications
- [ ] Temperature unit toggle (Celsius/Fahrenheit)
- [ ] Multiple location saving
- [ ] Weather maps integration
- [ ] Historical weather data
- [ ] Dark/light theme toggle
- [ ] Multi-language support
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Ashwin Kumar Uma Sankar**
- Portfolio: [ashxinkumar.me](https://www.ashxinkumar.me/)
- Education: Master of Engineering in CS, Oregon State University (GPA: 3.6/4.0)
- Status: Actively seeking full-stack roles

## 🙏 Acknowledgments

- Weather data provided by [OpenWeather API](https://openweathermap.org/)
- Icons by [Lucide React](https://lucide.dev/)
- Inspired by modern weather applications and nature-themed design

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

**Note**: This project was created as a technical assessment to demonstrate full-stack development skills, API integration, responsive design, and modern React patterns.