import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpg';
import landingHero from '../assets/landing_hero.jpg';

// Import farming option images
import cropHealthImg from '../assets/crop_health.png';
import weatherImg from '../assets/weather.png';
import pestImg from '../assets/pest.png';
import cropRecImg from '../assets/crop_rec.png';
import fertilizerImg from '../assets/fertilizer.png';
import dashboardImg from '../assets/dashboard.png';
import marketImg from '../assets/market.png';
import alertsImg from '../assets/alerts.png';
import gpsImg from '../assets/gps.png';
import communityImg from '../assets/community.png';
import chatbotImg from '../assets/chatbot.png';
import marketExchangeImg from '../assets/market_exchange.png';
import messagingImg from '../assets/messaging.png';
import multilingualImg from '../assets/multilingual.svg';

import { 
  Leaf, 
  CloudRain, 
  Bug, 
  Calculator, 
  Map, 
  BarChart3, 
  MessageCircle, 
  Globe2, 
  Bot, 
  Compass, 
  TrendingUp, 
  BellRing, 
  Users2,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2
} from 'lucide-react';

export const Home = () => {
  const { t, locale, changeLanguage } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [loading, setLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const features = [
    { num: 1, name: "Crop Health Monitoring", desc: "Detect crop diseases using AI and image recognition. Upload a plant image to identify diseases and get organic/chemical treatment suggestions.", icon: Leaf, image: cropHealthImg },
    { num: 2, name: "Weather Forecast", desc: "Real-time weather updates including rainfall predictions, wind speeds, humidity indices, and daily 7-day temperature trends.", icon: CloudRain, image: weatherImg },
    { num: 3, name: "Pest Detection & Control", desc: "Identify crop pests. Access biological, organic, and chemical control recommendations to safeguard harvest health.", icon: Bug, image: pestImg },
    { num: 4, name: "Crop Recommendation System", desc: "Recommend ideal crops based on soil nutrients, season, historical parameters, and atmospheric conditions.", icon: Calculator, image: cropRecImg },
    { num: 5, name: "Fertilizer Recommendation", desc: "Suggest optimal fertilizer types and required dosages matching your specific crop and soil properties.", icon: Compass, image: fertilizerImg },
    { num: 6, name: "Farm Dashboard", desc: "View detailed statistics, current growth timelines, weather forecasts, alerts, and notifications in one integrated view.", icon: Map, image: dashboardImg },
    { num: 7, name: "Market Price Tracking", desc: "Daily crop pricing indexes tracked from local mandis and nearby markets. Decides the best time for you to sell.", icon: TrendingUp, image: marketImg },
    { num: 8, name: "Alert & Notification System", desc: "Get real-time warning alerts for extreme weather conditions, local pest outbreaks, and customized irrigation reminders.", icon: BellRing, image: alertsImg },
    { num: 9, name: "GPS Farm Mapping", desc: "Mark coordinates of field boundaries and log specific crop zones on an interactive satellite-style map layout.", icon: MapPin, image: gpsImg },
    { num: 10, name: "Farmer Community", desc: "Participate in discussion threads. Ask queries, share your agrarian hacks, and exchange tips with other farmers.", icon: Users2, image: communityImg },
    { num: 11, name: "Multilingual Support", desc: "Read and navigate the portal in English, Hindi (हिंदी), and regional languages (ਪੰਜਾਬੀ) for easier accessibility.", icon: Globe2, image: multilingualImg },
    { num: 12, name: "Agricultural Expert Chatbot", desc: "24/7 AI-powered agricultural advisor to answer farming questions, pest concerns, and weather guidelines immediately.", icon: Bot, image: chatbotImg },
    { num: 13, name: "Direct Market Exchange", desc: "Allows farmers to buy directly from sellers, and sellers to update inventory lists, add product stock, and list pictures.", icon: BarChart3, image: marketExchangeImg },
    { num: 14, name: "Direct Messaging", desc: "Send messages directly to user roles. Direct broadcast messaging pipelines for administrator announcements.", icon: MessageCircle, image: messagingImg }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-16">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 h-16 bg-white/90 border-b border-slate-200 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-6">
          {/* Left: Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg overflow-hidden transition-transform group-hover:scale-105">
              <img src={logo} alt="Green Watch Logo" className="h-full w-full object-contain hd-logo" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
              {t('appName')}
            </span>
          </Link>

          {/* Right: Actions & Language Picker */}
          <div className="flex items-center gap-4">
            {/* Language Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-955 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors border border-slate-200"
                title="Change Language"
              >
                <Globe2 className="h-3.5 w-3.5 text-slate-500" />
                <span className="uppercase">{locale}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-lg bg-white border border-slate-200 p-1 shadow-lg ring-1 ring-black/5 z-50">
                  <button
                    type="button"
                    onClick={() => { changeLanguage('en'); setShowLangMenu(false); }}
                    className={`w-full text-left text-xs px-3 py-2 rounded-md transition-colors ${locale === 'en' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => { changeLanguage('hi'); setShowLangMenu(false); }}
                    className={`w-full text-left text-xs px-3 py-2 rounded-md transition-colors ${locale === 'hi' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    हिंदी (Hindi)
                  </button>
                  <button
                    type="button"
                    onClick={() => { changeLanguage('pb'); setShowLangMenu(false); }}
                    className={`w-full text-left text-xs px-3 py-2 rounded-md transition-colors ${locale === 'pb' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    ਪੰਜਾਬੀ (Punjabi)
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <Link
                to="/dashboard"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              <Leaf className="w-3.5 h-3.5" /> Introducing Green Watch
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              A Modern Digital Ecosystem for <span className="text-emerald-600">Smart Agriculture</span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Green Watch bridges the gap between farmers and sellers. Sell or buy products directly without intermediaries, stay updated with real-time weather forecasts, perform crop disease diagnosis, and optimize yields with intelligent recommendations.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-3 rounded-lg shadow-sm transition-colors"
                >
                  Enter Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-3 rounded-lg shadow-sm transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-md h-72 sm:h-80 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <img src={landingHero} alt="Smart Agriculture Landscape" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto py-20 px-6 text-center" id="features">
        <div className="space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {t('featuresList')}
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
            Explore the powerful modules engineered in Green Watch to make agriculture sustainable, profitable, and accessible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => {
            const IconComponent = f.icon;
            return (
              <div 
                key={f.num}
                className="bg-white border border-slate-200/80 rounded-2xl text-left shadow-sm hover:shadow-xl hover:border-emerald-500/30 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Accent glassmorphism spot in card background */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-50/50 group-hover:bg-emerald-100/50 rounded-full filter blur-xl transition-colors duration-300" />
                
                {/* Image Header with watermark number & float icon */}
                <div className="h-40 w-full overflow-hidden relative border-b border-slate-100">
                  <img src={f.image} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
                  <div className="absolute top-3.5 left-3.5 p-2 bg-white/90 rounded-lg text-emerald-600 shadow-sm border border-emerald-100/30 backdrop-blur-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  {/* Translucent number watermark */}
                  <div className="absolute top-3 right-4 text-3xl font-black text-white/60 group-hover:text-white/80 transition-colors select-none duration-300">
                    {String(f.num).padStart(2, '0')}
                  </div>
                </div>

                <div className="p-5 space-y-2 relative">
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-emerald-700 transition-colors duration-300">
                    {f.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white border-t border-b border-slate-200 py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Contact coordinates info */}
          <div className="space-y-6 text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Contact Us</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Have questions regarding portal registration, direct seller accounts, or API keys? Drop us a message, and our system administrator will review it.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3.5 text-sm text-slate-600">
                <div className="p-2 bg-slate-100 rounded-md">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <span>sauravk1175@gmail.com</span>
              </div>
              <div className="flex items-center gap-3.5 text-sm text-slate-600">
                <div className="p-2 bg-slate-100 rounded-md">
                  <Phone className="w-4 h-4 text-slate-500" />
                </div>
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3.5 text-sm text-slate-600">
                <div className="p-2 bg-slate-100 rounded-md">
                  <MapPin className="w-4 h-4 text-slate-500" />
                </div>
                <span>Dehradun, India</span>
              </div>
            </div>
          </div>

          {/* Contact form panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
            <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t('contactName')}</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="E.g. Saurav Kumar"
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t('contactEmail')}</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="E.g. user@domain.com"
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t('contactSubject')}</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Subject"
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t('contactMessage')}</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe your inquiry..."
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t('contactSuccess')}</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="text-xs font-medium text-red-700 bg-red-50 p-3 rounded-lg border border-red-100">
                  Failed to send message. Please verify network connection.
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> 
                <span>{loading ? "Sending..." : t('contactSubmit')}</span>
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 text-center border-t border-slate-800 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <span className="text-base font-bold text-white block">Green Watch</span>
            <span className="text-xs text-slate-500 block mt-1">© 2026 Green Watch Agriculture System. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-xs font-medium">
            <Link to="/login" className="hover:text-white transition-colors">Portal Login</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            <a href="#features" className="hover:text-white transition-colors">Core Modules</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Home;
