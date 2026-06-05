import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { Sparkles, Mail, Lock, AlertTriangle, Globe } from 'lucide-react';
import logo from '../assets/logo.jpg';
import authSide from '../assets/auth_side.svg';

export const Login = () => {
  const { login, resetPassword } = useAuth();
  const { t, locale, changeLanguage } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Password reset states
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState(null);
  const [resetError, setResetError] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await login(formData.email, formData.password);
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      let customError = err.message || 'Failed to authenticate. Check credentials.';
      const code = err.code || '';
      const msg = (err.message || '').toLowerCase();
      
      // Professional warnings for common authentication errors
      if (
        code === 'auth/wrong-password' || 
        code === 'auth/user-not-found' || 
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-login-credentials' ||
        msg.includes('wrong-password') ||
        msg.includes('user-not-found') ||
        msg.includes('invalid-credential') ||
        msg.includes('invalid-login-credentials') ||
        msg.includes('invalid email or password') ||
        msg.includes('check credentials') ||
        msg.includes('password') ||
        msg.includes('email') ||
        msg.includes('credential') ||
        msg.includes('auth')
      ) {
        customError = 'password is wrong';
        setShowPasswordDialog(true);
      } else if (code === 'auth/too-many-requests' || msg.includes('too-many-requests') || msg.includes('disabled')) {
        customError = 'Access to this account has been temporarily disabled due to multiple failed login attempts. Reset your password to regain access.';
      }
      setError(customError);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError(null);
    setResetMessage(null);
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetMessage("A password reset link has been sent to your email address.");
    } catch (err) {
      let customError = err.message || 'Failed to send password reset email. Please try again.';
      if (err.code === 'auth/user-not-found') {
        customError = 'No account was found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        customError = 'Please enter a valid email address.';
      }
      setResetError(customError);
    } finally {
      setResetLoading(false);
    }
  };

  if (isResetting) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
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

        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-8 space-y-6 animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl overflow-hidden hover:scale-105 transition-transform">
              <img src={logo} alt="Green Watch Logo" className="h-full w-full object-contain hd-logo" />
            </Link>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {t('resetPassword')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('resetSubtitle')}
            </p>
          </div>

          {/* Success message */}
          {resetMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50/80 border border-emerald-200/60 rounded-xl text-xs text-emerald-800 shadow-sm animate-in fade-in duration-200 text-left">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">{t('resetLinkSent')}</p>
                <p className="text-emerald-700/90 leading-relaxed">{resetMessage}</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {resetError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50/80 border border-red-200/60 rounded-xl text-xs text-red-800 shadow-sm animate-in fade-in duration-200 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">{t('resetFailed')}</p>
                <p className="text-red-700/90 leading-relaxed">{resetError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleResetSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">{t('emailLabel')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="user@email.com"
                  className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
            >
              {resetLoading ? t('sendingLink') : t('sendResetLink')}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsResetting(false);
                setResetError(null);
                setResetMessage(null);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              {t('backToSignIn')}
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center lg:grid lg:grid-cols-2 lg:items-stretch lg:p-0 relative overflow-hidden">
      {/* Wrong Password Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs sm:max-w-sm p-6 space-y-5 animate-in zoom-in-95 duration-200 m-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Incorrect Password</h3>
              <p className="text-sm text-slate-500">
                The password you entered is incorrect. Please try again or reset your password.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowPasswordDialog(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setIsResetting(true);
                  setError(null);
                }}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                {t('forgotPassword')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left side: Immersive connection illustration panel (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white h-screen sticky top-0 overflow-hidden">
        {/* Background glow lines */}
        <div className="absolute inset-0 bg-emerald-950/10 backdrop-blur-[1px] z-0" />
        
        {/* Floating branding/overlay content */}
        <div className="relative flex flex-col justify-between h-full flex-1 z-10">
          <Link to="/" className="flex items-center gap-2 group self-start">
            <div className="h-9 w-9 rounded-lg overflow-hidden bg-white/95 p-0.5 shadow-sm">
              <img src={logo} alt="Green Watch Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-white group-hover:text-emerald-250 transition-colors">
              Green Watch
            </span>
          </Link>
          
          {/* SVG Connection Illustration - Centered and scales cleanly */}
          <div className="flex-1 flex items-center justify-center my-6">
            <img src={authSide} alt="Agriculture Connection Diagram" className="max-h-[50vh] w-auto object-contain animate-in fade-in zoom-in-95 duration-500" />
          </div>
          
          <div className="space-y-3 max-w-md">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
              Bridging the gap between farmers and direct markets.
            </h1>
            <p className="text-xs text-emerald-100/95 leading-relaxed font-semibold">
              Empowering farmers with smart agricultural tools: AI diagnostics, weather alerts, real price index, and direct market trade.
            </p>
            <p className="text-[10px] text-emerald-200/50 font-semibold uppercase tracking-wider pt-2">
              © 2026 Green Watch Agriculture System
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Form Container */}
      <div className="w-full flex items-center justify-center p-6 sm:p-12 lg:p-16 h-full relative min-h-screen">
        {/* Floating Language Picker inside Form side */}
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

        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-8 space-y-6">
          
          {/* Branding Title */}
          <div className="text-center space-y-2">
            <Link to="/" className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl overflow-hidden hover:scale-105 transition-transform">
              <img src={logo} alt="Green Watch Logo" className="h-full w-full object-contain hd-logo" />
            </Link>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {t('loginTitle')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('loginSubtitle')}
            </p>
          </div>

          {/* Auth Error Display */}
          {error && error !== 'password is wrong' && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50/80 border border-red-200/60 rounded-xl text-xs text-red-800 shadow-sm animate-in fade-in duration-200 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">{t('authWarning')}</p>
                <p className="text-red-700/90 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
            {/* Email input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">{t('emailLabel')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="user@email.com"
                  className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">{t('passwordLabel')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className={`w-full text-xs pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${error === 'password is wrong' ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
              </div>
              {error === 'password is wrong' && (
                <div className="mt-2 flex flex-col items-start gap-1.5 animate-in fade-in duration-200">
                  <p className="text-xs text-red-600 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetting(true);
                      setError(null);
                    }}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors focus:outline-none"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Authenticating..." : t('authSubmitLogin')}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              {t('noAccount')}{" "}
              <Link to="/signup" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                {t('createAccount')}
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
