import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { 
  CloudSun, 
  MapPin, 
  User, 
  Bell, 
  ArrowUpRight, 
  Activity, 
  Camera, 
  Compass, 
  Map, 
  TrendingUp, 
  MessageSquare,
  ShieldAlert,
  Wind,
  Droplet,
  CloudRain
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';

// Import shortcut card images
import cropHealthImg from '../assets/crop_health.png';
import pestImg from '../assets/pest.png';
import cropRecImg from '../assets/crop_rec.png';
import fertilizerImg from '../assets/fertilizer.png';
import marketImg from '../assets/market.png';
import gpsImg from '../assets/gps.png';
import marketExchangeImg from '../assets/market_exchange.png';
import communityImg from '../assets/community.png';
import dashboardImg from '../assets/dashboard.png';

export const Dashboard = () => {
  const { user, isFarmer, isSeller } = useAuth();
  const { t } = useTranslation();
  
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    if (user) {
      fetchWeather();
      fetchNotifications();
    }
  }, [user]);

  const fetchWeather = async () => {
    try {
      setLoadingWeather(true);
      const token = localStorage.getItem('greenwatch_token');
      const locationQuery = encodeURIComponent(user.location || "New Delhi, India");
      const res = await apiFetch(`/api/weather?location=${locationQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
      }
    } catch (err) {
      console.error("Error fetching weather", err);
    } finally {
      setLoadingWeather(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('greenwatch_token');
      const res = await apiFetch('/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.slice(0, 3)); // show top 3 alerts
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const getRoleLabel = () => {
    if (!user || !user.role) return "User";
    if (user.role === 'admin') return "Administrator";
    if (user.role === 'both') return "Farmer & Product Seller";
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
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

  // Map helper names to make sure we use imported icons correctly
  const SproutAdviser = Activity;
  const StoreShortcut = TrendingUp;
  const UsersGroup = MessageSquare;

  const farmShortcuts = [
    { to: "/crop-health", label: t('cropHealth'), desc: t('scanCrops'), icon: Camera, image: cropHealthImg, show: isFarmer },
    { to: "/pest-control", label: t('pestDetection'), desc: t('identifyPests'), icon: ShieldAlert, image: pestImg, show: isFarmer },
    { to: "/crop-rec", label: t('cropAdvisor'), desc: t('getBestCrops'), icon: SproutAdviser, image: cropRecImg, show: isFarmer },
    { to: "/fertilizer-rec", label: t('fertilizers'), desc: t('optimalFertilizer'), icon: Compass, image: fertilizerImg, show: isFarmer },
    { to: "/market-prices", label: t('marketPrice'), desc: t('mandiTrends'), icon: TrendingUp, image: marketImg, show: isFarmer },
    { to: "/gps-mapping", label: t('gpsFarmMap'), desc: t('drawBoundaries'), icon: Map, image: gpsImg, show: isFarmer },
    { to: "/marketplace", label: t('marketplace'), desc: t('sellBuyDirect'), icon: StoreShortcut, image: marketExchangeImg, show: isFarmer || isSeller },
    { to: "/community", label: t('forumBoard'), desc: t('engageExperts'), icon: UsersGroup, image: communityImg, show: true }
  ];

  if (!user) return null;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Header Info Banner */}
      <div className="min-h-[7rem] md:h-28 w-full rounded-2xl overflow-hidden relative shadow-md bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 flex flex-col md:flex-row md:items-center justify-between p-6 text-white gap-4 shrink-0">
        <img
          src={dashboardImg}
          alt="Dashboard"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay animate-fade-in pointer-events-none"
        />
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl overflow-hidden shadow-inner shrink-0">
            {user?.photoURL === "default-plant" ? "🌱" : user?.photoURL ? <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" /> : "👤"}
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight md:text-xl flex items-center gap-2">
              {t('welcomeBack')}, {user?.displayName}!
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-4 mt-1 font-medium md:text-sm">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" /> {getRoleLabel()}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {user?.location || t('notSpecified')}</span>
            </p>
          </div>
        </div>
        <Link to="/profile" className="relative z-10 text-xs font-semibold px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white rounded-lg transition-all flex items-center justify-center gap-1.5 self-start md:self-auto cursor-pointer">
          {t('editProfile')} <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weather Forecast Widget */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-emerald-600" /> {t('weatherForecast')}
            </h2>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              {t('location')}: {weather?.location || user?.location || t('notSpecified')}
            </span>
          </div>

          {loadingWeather ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              <span className="text-xs text-slate-400">{t('loadingForecasts')}</span>
            </div>
          ) : weather ? (
            <div className="space-y-6">
              {/* Current day weather */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/50 border border-slate-150 p-4 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="text-5xl shrink-0">
                    {weatherIcons[weather.current.condition] || "☀️"}
                  </span>
                  <div>
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {weather.current.temp}°C
                    </span>
                    <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                      {weather.current.condition} - {weather.current.description}
                    </span>
                  </div>
                </div>

                <div className="flex gap-6 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6 text-xs text-slate-500 font-medium w-full sm:w-auto justify-around">
                  <div className="flex flex-col items-center gap-1">
                    <Droplet className="w-4 h-4 text-sky-500" />
                    <span>{weather.current.humidity}%</span>
                    <span className="text-[9px] text-slate-400 font-normal">Humidity</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Wind className="w-4 h-4 text-teal-500" />
                    <span>{weather.current.windSpeed} km/h</span>
                    <span className="text-[9px] text-slate-400 font-normal">Wind</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    <span>{weather.current.rainfall} mm</span>
                    <span className="text-[9px] text-slate-400 font-normal">Rainfall</span>
                  </div>
                </div>
              </div>

              {/* 7-Day Forecast Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700">{t('extendedForecast')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {weather.forecast.map((day, idx) => (
                    <div 
                      key={idx}
                      className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col items-center text-center shadow-sm"
                    >
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{day.day.slice(0, 3)}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">{day.date}</span>
                      <span className="text-2xl my-2">{weatherIcons[day.condition] || "☀️"}</span>
                      <span className="text-xs font-bold text-slate-800">{day.tempMax}°</span>
                      <span className="text-[9px] font-medium text-slate-400">{day.tempMin}°</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              {t('weatherOffline')}
            </div>
          )}
        </div>

        {/* System Warnings & Broadcast Notifications */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" /> {t('alertsBulletins')}
            </h2>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold uppercase">
              {t('targeted')}
            </span>
          </div>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {t('noAlerts')}
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id || n._id}
                  className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-xs text-slate-900 leading-snug">
                      {n.title}
                    </h3>
                    <span className="text-[8px] text-slate-400 font-medium shrink-0">
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-1.5 text-[8px] text-slate-400 pt-1.5">
                    <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-semibold uppercase text-[7.5px]">
                      {n.targetGroup}
                    </span>
                    <span>•</span>
                    <span>Admin: {n.senderName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Action Shortcut Modules Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800">{t('quickAccessModules')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {farmShortcuts
            .filter(s => s.show)
            .map((shortcut, idx) => {
              const IconComponent = shortcut.icon;
              return (
                <Link
                  key={idx}
                  to={shortcut.to}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-350 transition-all text-left flex flex-col group"
                >
                  {/* Card Header Image */}
                  <div className="h-24 w-full overflow-hidden relative bg-slate-100">
                    <img 
                      src={shortcut.image} 
                      alt={shortcut.label} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out" 
                    />
                    <div className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-emerald-600 shadow-sm">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs flex items-center justify-between group-hover:text-emerald-700 transition-colors">
                        <span className="truncate">{shortcut.label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        {shortcut.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>

    </div>
  );
};
export default Dashboard;
