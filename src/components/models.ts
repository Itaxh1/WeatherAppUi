export interface CurrentWeather {
    locationName: string;
    temp: number;
    feelsLike: number;
    tempMin: number;
    tempMax: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    visibility: number;
    description: string;
    icon: string;
    timezone: number;
    aqi: number;
    coords: { lat: number; lon: number };
}

export interface DailyForecast {
    date: string;
    maxTemp: number;
    minTemp: number;
    icon: string;
}

export interface WeatherRequest {
    id: string;
    location: {
        name: string;
        country: string;
        coordinates: { lat: number; lon: number };
    };
    date_range: {
        start_date: string;
        end_date: string;
    };
    requested_by: string;
    weather_data?: {
        date: string;
        icon: string;
        description: string;
        temperature: { avg: number; max: number; min: number };
        humidity: number;
        windSpeed: number;
    }[];
}

export interface RecentSearch {
    id: string;
    location: string;
    coords: { lat: number; lon: number };
}
