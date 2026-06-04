import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { Sparkles, Mail, Lock, User, MapPin, Shield, Sprout, Store, AlertTriangle, Globe } from 'lucide-react';
import logo from '../assets/logo.jpg';

export const Signup = () => {
  const { signup } = useAuth();
  const { t, locale, changeLanguage } = useTranslation();
  const navigate = useNavigate();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    role: 'farmer' // default
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData(prev => ({ ...prev, role: selectedRole }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const registeredUser = await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.location
      );
      if (registeredUser && registeredUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 relative">
      {/* Floating Language Picker */}
      <div className="absolute top-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg shadow-sm transition-colors"
            type="button"
          >
            <Globe className="h-3.5 w-3.5 text-slate-500" />
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
      </div>

      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl overflow-hidden hover:scale-105 transition-transform">
            <img src={logo} alt="Green Watch Logo" className="h-full w-full object-contain hd-logo" />
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {t('signupTitle')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('signupSubtitle')}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-semibold text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
          
          {/* Name input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">{t('nameLabel')} *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="E.g. Saurav Kumar"
                className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">{t('emailLabel')} *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="you@example.com"
                className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">{t('passwordLabel')} *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Minimum 6 characters"
                className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Location input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">{t('locationLabel')}</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="E.g. New Delhi, India"
                className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Visual Role Selector Cards */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">{t('roleLabel')} *</label>
            <div className="grid grid-cols-3 gap-3">
              {/* Farmer option card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('farmer')}
                className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-center ${formData.role === 'farmer' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-600/10' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
              >
                <Sprout className={`w-5 h-5 ${formData.role === 'farmer' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold block leading-none">{t('roleFarmer')}</span>
              </button>

              {/* Seller option card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('seller')}
                className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-center ${formData.role === 'seller' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-600/10' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
              >
                <Store className={`w-5 h-5 ${formData.role === 'seller' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold block leading-none">{t('roleSeller')}</span>
              </button>

              {/* Both option card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('both')}
                className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-center ${formData.role === 'both' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-600/10' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
              >
                <Shield className={`w-5 h-5 ${formData.role === 'both' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold block leading-none">{t('roleBoth')}</span>
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 mt-2"
          >
            {loading ? t('creatingAccount') : t('authSubmitSignup')}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {t('haveAccount')}{" "}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              {t('signInInstead')}
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
export default Signup;
