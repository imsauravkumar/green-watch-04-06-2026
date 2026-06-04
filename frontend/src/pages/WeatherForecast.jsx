import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { 
  CloudSun, 
  Search, 
  Droplet, 
  Wind, 
  CloudRain, 
  Thermometer, 
  Compass 
} from 'lucide-react';

export const WeatherForecast = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [locationInput, setLocationInput] = useState(user?.location || 'New Delhi, India');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather(locationInput);
  }, []);

  const fetchWeather = async (loc) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('greenwatch_token');
    try {
      const res = await fetch(`/api/weather?location=${encodeURIComponent(loc)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
      } else {
        setError("Failed to fetch weather data for that location.");
      }
    } catch (err) {
      setError("Network error fetching weather.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (locationInput.trim()) {
      fetchWeather(locationInput);
    }
  };

  const weatherIcons = {
    "Sunny": "☀️",
    "Clear": "☀️",
    "Partly Cloudy": "⛅",
    "Cloudy": "☁️",
    "Light Rain": "🌦️",
    "Rain": "🌧️",
    "Thunderstorm": "⛈️",
    "Windy": "💨"
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            <CloudSun className="w-5 h-5 text-emerald-600" /> {t('weatherForecast')}
          </h1>
          <p className="text-xs text-slate-500">{t('extendedForecast')} — {t('humidity')}, {t('windSpeed')}, {t('rainfall')}</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 self-start sm:self-auto">
          <div className="relative w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchCityState')}
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
            {t('search')}
          </button>
        </form>
      </div>

      {error && (
        <div className="text-xs font-semibold text-red-700 bg-red-50 p-3 rounded-lg border border-red-100 max-w-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          <span className="text-xs text-slate-400">{t('fetchingTelemetry')}</span>
        </div>
      ) : weather ? (
        <div className="space-y-6">
          
          {/* Main Weather Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            
            {/* Condition and Temp */}
            <div className="md:col-span-1 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('currentWeather')}</span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{weather.location}</h2>
              </div>
              <div className="flex items-center gap-4 my-6">
                <span className="text-6xl">{weatherIcons[weather.current.condition] || "☀️"}</span>
                <div>
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{weather.current.temp}°C</span>
                  <span className="text-xs font-semibold text-slate-500 block mt-0.5">{weather.current.condition}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium italic">"{weather.current.description}"</p>
            </div>

            {/* Weather Attributes grid */}
            <div className="md:col-span-2 grid grid-cols-2 gap-6 p-2">
              <div className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div className="p-2.5 bg-sky-50 rounded-lg text-sky-600">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('humidity')}</span>
                  <span className="text-sm font-extrabold text-slate-800">{weather.current.humidity}%</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div className="p-2.5 bg-teal-50 rounded-lg text-teal-600">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('windSpeedLabel')}</span>
                  <span className="text-sm font-extrabold text-slate-800">{weather.current.windSpeed} km/h</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('rainfallLabel')}</span>
                  <span className="text-sm font-extrabold text-slate-800">{weather.current.rainfall} mm</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('tempRange')}</span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {weather.forecast[0]?.tempMin}°C - {weather.forecast[0]?.tempMax}°C
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day extended outlook grid */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800">{t('extendedForecast')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {weather.forecast.map((day, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-50/50 border border-slate-150 rounded-xl p-3.5 text-center flex flex-col items-center shadow-inner"
                >
                  <span className="text-xs font-bold text-slate-600">{day.day}</span>
                  <span className="text-[10px] text-slate-400">{day.date}</span>
                  <span className="text-3xl my-3">{weatherIcons[day.condition] || "☀️"}</span>
                  <div className="space-y-1">
                    <span className="text-sm font-extrabold text-slate-900 block leading-none">{day.tempMax}°C</span>
                    <span className="text-[10px] font-medium text-slate-400 block leading-none">{day.tempMin}°C</span>
                  </div>
                  <div className="flex gap-2 text-[8px] text-slate-400 mt-4 border-t border-slate-200 pt-2 w-full justify-center">
                    <span className="flex items-center gap-0.5"><Droplet className="w-2.5 h-2.5 text-sky-400" /> {day.humidity}%</span>
                    {day.rainfall > 0 && <span className="flex items-center gap-0.5 text-blue-500 font-bold"><CloudRain className="w-2.5 h-2.5" /> {day.rainfall}mm</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};
export default WeatherForecast;
