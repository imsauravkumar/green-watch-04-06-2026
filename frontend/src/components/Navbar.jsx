import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { Bell, Globe, Sparkles, User as UserIcon, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { apiFetch } from '../api';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAdmin } = useAuth();
  const { t, locale, changeLanguage } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('greenwatch_token');
      const res = await apiFetch('/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        
        // Check for unseen notifications
        const userId = user?.uid || user?._id || user?.id || 'default';
        const seenKey = `greenwatch_seen_notifications_${userId}`;
        let seenIds = [];
        try {
          seenIds = JSON.parse(localStorage.getItem(seenKey)) || [];
        } catch (e) {
          seenIds = [];
        }
        const hasUnseenNotifs = data.some(n => !seenIds.includes(n.id || n._id));
        setHasUnseen(hasUnseenNotifs);
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const toggleNotifications = () => {
    const nextShow = !showNotifications;
    setShowNotifications(nextShow);
    setShowLangMenu(false);
    
    if (nextShow && notifications.length > 0) {
      const userId = user?.uid || user?._id || user?.id || 'default';
      const seenKey = `greenwatch_seen_notifications_${userId}`;
      let seenIds = [];
      try {
        seenIds = JSON.parse(localStorage.getItem(seenKey)) || [];
      } catch (e) {
        seenIds = [];
      }
      const updatedSeenIds = [...new Set([...seenIds, ...notifications.map(n => n.id || n._id)])];
      localStorage.setItem(seenKey, JSON.stringify(updatedSeenIds));
      setHasUnseen(false);
    }
  };

  const getRoleLabel = () => {
    if (!user || !user.role) return "User";
    if (user.role === 'admin') return "Admin";
    if (user.role === 'both') return "Farmer & Seller";
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  const getLogoRedirectPath = () => {
    if (!user) return "/";
    if (user.role === 'admin') return "/admin";
    return "/dashboard";
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left Branding + Mobile Toggle */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden focus:outline-none"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Brand Logo */}
          <Link to={getLogoRedirectPath()} className="flex items-center gap-1.5 sm:gap-2 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg overflow-hidden transition-transform group-hover:scale-105">
              <img src={logo} alt="Green Watch Logo" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <span className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 leading-none block">
                {t('appName')}
              </span>
              <span className="text-[9px] text-emerald-600 font-medium hidden sm:block mt-0.5">
                A Agriculture Web App
              </span>
            </div>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Language Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-md transition-colors"
              title="Change Language"
            >
              <Globe className="h-4 w-4 text-slate-500" />
              <span className="uppercase text-xs">{locale}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white border border-slate-200 p-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                <button
                  onClick={() => { changeLanguage('en'); setShowLangMenu(false); }}
                  className={`w-full text-left text-xs px-3 py-2 rounded-md transition-colors ${locale === 'en' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  English
                </button>
                <button
                  onClick={() => { changeLanguage('hi'); setShowLangMenu(false); }}
                  className={`w-full text-left text-xs px-3 py-2 rounded-md transition-colors ${locale === 'hi' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  onClick={() => { changeLanguage('pb'); setShowLangMenu(false); }}
                  className={`w-full text-left text-xs px-3 py-2 rounded-md transition-colors ${locale === 'pb' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  ਪੰਜਾਬੀ (Punjabi)
                </button>
              </div>
            )}
          </div>

          {/* Notifications Center */}
          {user && (
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="relative text-slate-700 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-md transition-colors"
                title="System Notifications"
              >
                <Bell className="h-4 w-4" />
                {hasUnseen && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg bg-white border border-slate-200 p-2 shadow-xl ring-1 ring-black/5 focus:outline-none max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2 mb-2">
                    <span className="font-semibold text-xs text-slate-800">Alerts & Broadcasts</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{notifications.length} Messages</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No new broadcasts at this time.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((n) => (
                        <div key={n.id || n._id} className="p-2 rounded-md hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                          <h4 className="font-medium text-xs text-slate-900 flex justify-between">
                            <span>{n.title}</span>
                            <span className="text-[9px] font-normal text-slate-400">
                              {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                          <div className="flex gap-2 mt-1 items-center">
                            <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-semibold uppercase">
                              To: {n.targetGroup}
                            </span>
                            <span className="text-[8px] text-slate-400">
                              From: {n.senderName}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Profile Info / Action */}
          {user ? (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                  {user.photoURL === "default-plant" ? (
                    <span className="text-base">🌱</span>
                  ) : user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-slate-500" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-none block group-hover:text-emerald-700 transition-colors">
                    {user.displayName}
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium leading-none block mt-0.5">
                    {getRoleLabel()}
                  </span>
                </div>
              </Link>
            </div>
          ) : (
            <Link 
              to="/login"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-sm"
            >
              Portal Login
            </Link>
          )}

        </div>
      </div>
    </header>
  );
};
export default Navbar;
