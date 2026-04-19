import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Thermometer, Sun, CloudRain, Loader2, MapPin, RefreshCw, Lightbulb } from 'lucide-react';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const weatherCodeMap = {
  0: { icon: Sun, label: 'Clear' },
  1: { icon: Sun, label: 'Mostly Clear' },
  2: { icon: Cloud, label: 'Partly Cloudy' },
  3: { icon: Cloud, label: 'Cloudy' },
  45: { icon: Cloud, label: 'Foggy' },
  48: { icon: Cloud, label: 'Fog' },
  51: { icon: CloudRain, label: 'Light Drizzle' },
  53: { icon: CloudRain, label: 'Drizzle' },
  55: { icon: CloudRain, label: 'Heavy Drizzle' },
  61: { icon: CloudRain, label: 'Light Rain' },
  63: { icon: CloudRain, label: 'Rain' },
  65: { icon: CloudRain, label: 'Heavy Rain' },
  80: { icon: CloudRain, label: 'Light Showers' },
  81: { icon: CloudRain, label: 'Showers' },
  82: { icon: CloudRain, label: 'Heavy Showers' },
  95: { icon: CloudRain, label: 'Thunderstorm' },
};

export function WeatherAdvisory() {
  const { t, language } = useApp();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const getLocation = () => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          () => {
            // Default to central India
            resolve({ lat: 20.5937, lon: 78.9629 });
          },
          { timeout: 5000 }
        );
      } else {
        resolve({ lat: 20.5937, lon: 78.9629 });
      }
    });
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const coords = await getLocation();
      setLocation(coords);
      
      const response = await axios.get(`${API_URL}/api/weather`, {
        params: { lat: coords.lat, lon: coords.lon }
      });
      
      setWeather(response.data);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to fetch weather data');
      // Set mock data on error
      setWeather({
        current: {
          temperature: 28,
          humidity: 65,
          precipitation: 0,
          wind_speed: 12,
          weather_code: 1
        },
        daily: {
          time: ['Today', 'Tomorrow', 'Day After'],
          temperature_2m_max: [32, 33, 31],
          temperature_2m_min: [22, 23, 21],
          precipitation_probability_max: [10, 30, 60]
        },
        is_mock: true
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherInfo = (code) => {
    return weatherCodeMap[code] || { icon: Cloud, label: 'Unknown' };
  };

  const getFarmingAdvice = () => {
    if (!weather?.current) return [];
    
    const advice = [];
    const { temperature, humidity, precipitation, wind_speed } = weather.current;

    // Temperature-based advice
    if (temperature > 35) {
      advice.push({
        type: 'warning',
        text: language === 'hi' 
          ? '🌡️ उच्च तापमान - फसलों को अधिक पानी दें और छाया प्रदान करें।'
          : language === 'mr'
          ? '🌡️ उच्च तापमान - पिकांना जास्त पाणी द्या आणि सावली द्या.'
          : '🌡️ High temperature - Provide extra irrigation and shade to crops.'
      });
    } else if (temperature < 15) {
      advice.push({
        type: 'info',
        text: language === 'hi'
          ? '❄️ ठंडा मौसम - ठंड से बचाव के लिए फसलों को ढकें।'
          : language === 'mr'
          ? '❄️ थंड हवामान - थंडीपासून संरक्षणासाठी पिके झाका.'
          : '❄️ Cold weather - Cover crops for frost protection.'
      });
    }

    // Humidity-based advice
    if (humidity > 80) {
      advice.push({
        type: 'warning',
        text: language === 'hi'
          ? '💧 उच्च आर्द्रता - फफूंद रोगों का खतरा। पौधों की निगरानी करें।'
          : language === 'mr'
          ? '💧 उच्च आर्द्रता - बुरशीजन्य रोगांचा धोका. रोपांवर लक्ष ठेवा.'
          : '💧 High humidity - Risk of fungal diseases. Monitor plants closely.'
      });
    }

    // Wind-based advice
    if (wind_speed > 20) {
      advice.push({
        type: 'warning',
        text: language === 'hi'
          ? '💨 तेज हवा - कीटनाशक छिड़काव से बचें।'
          : language === 'mr'
          ? '💨 जोरदार वारा - कीटकनाशक फवारणी टाळा.'
          : '💨 Strong winds - Avoid pesticide spraying.'
      });
    }

    // Precipitation advice
    if (precipitation > 0 || (weather.daily?.precipitation_probability_max?.[0] > 50)) {
      advice.push({
        type: 'info',
        text: language === 'hi'
          ? '🌧️ बारिश की संभावना - सिंचाई न करें, जल जमाव रोकें।'
          : language === 'mr'
          ? '🌧️ पावसाची शक्यता - पाणी देऊ नका, पाणी साचणे टाळा.'
          : '🌧️ Rain expected - Skip irrigation, prevent waterlogging.'
      });
    } else {
      advice.push({
        type: 'success',
        text: language === 'hi'
          ? '☀️ सिंचाई के लिए अच्छा दिन - सुबह 5-8 बजे पानी दें।'
          : language === 'mr'
          ? '☀️ पाणी देण्यासाठी चांगला दिवस - सकाळी 5-8 वाजता पाणी द्या.'
          : '☀️ Good day for irrigation - Water early morning (5-8 AM).'
      });
    }

    return advice;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="weather-loading">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#2F6944] mx-auto mb-3" />
          <p className="text-[#5C7364]">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const weatherInfo = getWeatherInfo(weather?.current?.weather_code);
  const WeatherIcon = weatherInfo.icon;
  const farmingAdvice = getFarmingAdvice();

  return (
    <div 
      className="flex-1 px-4 pt-6 pb-4 overflow-y-auto hide-scrollbar"
      data-testid="weather-advisory-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 page-enter">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2924] font-['Outfit']">
            {t('weather_title')}
          </h1>
          {location && (
            <p className="text-[#5C7364] text-sm flex items-center gap-1 mt-1">
              <MapPin size={14} />
              {language === 'hi' ? 'भारत' : language === 'mr' ? 'भारत' : 'India'}
              {weather?.is_mock && ' (Demo)'}
            </p>
          )}
        </div>
        <button
          onClick={fetchWeather}
          data-testid="weather-refresh-btn"
          className="w-10 h-10 rounded-xl bg-[#F7F9F4] flex items-center justify-center text-[#5C7364] hover:bg-[#E4EBE5] transition-colors"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Current Weather Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#2F6944] to-[#51A870] text-white mb-6 p-6" data-testid="current-weather-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-2">{t('current_weather')}</p>
            <div className="text-5xl font-bold font-['Outfit'] text-white drop-shadow-md">
              {Math.round(weather?.current?.temperature || 0)}°C
            </div>
            <p className="text-white/90 mt-3 font-medium text-lg">{weatherInfo.label}</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <WeatherIcon size={40} className="text-white" />
          </div>
        </div>
      </div>

      {/* Weather Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center" data-testid="humidity-card">
          <Droplets size={24} className="mx-auto text-blue-500 mb-2" />
          <p className="text-xl font-bold text-[#1F2924]">{weather?.current?.humidity}%</p>
          <p className="text-xs text-[#5C7364]">{t('humidity')}</p>
        </div>
        
        <div className="card text-center" data-testid="wind-card">
          <Wind size={24} className="mx-auto text-teal-500 mb-2" />
          <p className="text-xl font-bold text-[#1F2924]">{weather?.current?.wind_speed}</p>
          <p className="text-xs text-[#5C7364]">{t('wind_speed')}</p>
        </div>
        
        <div className="card text-center" data-testid="precipitation-card">
          <CloudRain size={24} className="mx-auto text-indigo-500 mb-2" />
          <p className="text-xl font-bold text-[#1F2924]">{weather?.current?.precipitation}mm</p>
          <p className="text-xs text-[#5C7364]">{t('precipitation')}</p>
        </div>
      </div>

      {/* Farming Advice */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#1F2924] mb-3 font-['Outfit'] flex items-center gap-2">
          <Lightbulb size={18} className="text-amber-500" />
          {t('farming_advice')}
        </h3>
        <div className="space-y-2">
          {farmingAdvice.map((advice, index) => (
            <div 
              key={index}
              className={`card border-l-4 stagger-item ${
                advice.type === 'warning' 
                  ? 'border-l-amber-500 bg-amber-50/50' 
                  : advice.type === 'success'
                  ? 'border-l-green-500 bg-green-50/50'
                  : 'border-l-blue-500 bg-blue-50/50'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-sm text-[#1F2924]">{advice.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Day Forecast */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#1F2924] mb-3 font-['Outfit']">
          {t('forecast')}
        </h3>
        <div className="space-y-2">
          {weather?.daily?.time?.slice(0, 3).map((day, index) => {
            const maxTemp = weather.daily.temperature_2m_max?.[index];
            const minTemp = weather.daily.temperature_2m_min?.[index];
            const rainChance = weather.daily.precipitation_probability_max?.[index];
            
            const dayLabel = index === 0 
              ? (language === 'hi' ? 'आज' : language === 'mr' ? 'आज' : 'Today')
              : index === 1
              ? (language === 'hi' ? 'कल' : language === 'mr' ? 'उद्या' : 'Tomorrow')
              : day;
            
            return (
              <div 
                key={index}
                className="card flex items-center justify-between stagger-item"
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`forecast-day-${index}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F9F4] flex items-center justify-center">
                    {rainChance > 50 ? (
                      <CloudRain size={20} className="text-blue-500" />
                    ) : (
                      <Sun size={20} className="text-amber-500" />
                    )}
                  </div>
                  <span className="font-medium text-[#1F2924]">{dayLabel}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-blue-500">
                    <Droplets size={14} />
                    <span>{rainChance}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#5C7364]">
                    <Thermometer size={14} />
                    <span>{minTemp}° - {maxTemp}°</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WeatherAdvisory;
