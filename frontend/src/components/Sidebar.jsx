import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import Modal from './Modal';
import {
  LayoutDashboard,
  CloudSun,
  Camera,
  Bug,
  Sprout,
  Compass,
  MapPin,
  TrendingUp,
  Store,
  Users,
  MessageSquare,
  User,
  ShieldCheck,
  LogOut
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin, isFarmer, isSeller } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/');
  };

  const navItems = [
    {
      to: "/dashboard",
      label: t('farmDashboard'),
      icon: LayoutDashboard,
      show: true
    },
    {
      to: "/weather",
      label: t('weatherForecast'),
      icon: CloudSun,
      show: true
    },
    {
      to: "/crop-health",
      label: t('cropHealth'),
      icon: Camera,
      show: isFarmer
    },
    {
      to: "/pest-control",
      label: t('pestDetection'),
      icon: Bug,
      show: isFarmer
    },
    {
      to: "/crop-rec",
      label: t('cropRec'),
      icon: Sprout,
      show: isFarmer
    },
    {
      to: "/fertilizer-rec",
      label: t('fertilizerRec'),
      icon: Compass,
      show: isFarmer
    },
    {
      to: "/market-prices",
      label: t('marketPrice'),
      icon: TrendingUp,
      show: isFarmer
    },
    {
      to: "/gps-mapping",
      label: t('gpsMapping'),
      icon: MapPin,
      show: isFarmer
    },
    {
      to: "/marketplace",
      label: t('navMarketplace'),
      icon: Store,
      show: isFarmer || isSeller
    },
    {
      to: "/community",
      label: t('navCommunity'),
      icon: Users,
      show: true
    },
    {
      to: "/chatbot",
      label: t('expertChatbot'),
      icon: MessageSquare,
      show: true
    },
    {
      to: "/profile",
      label: t('navProfile'),
      icon: User,
      show: true
    },
    {
      to: "/admin",
      label: t('navAdmin'),
      icon: ShieldCheck,
      show: isAdmin
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 top-16 bg-slate-950/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside 
        className={`fixed top-16 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col h-[calc(100vh-4rem)] border-r border-slate-800 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Items list */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {navItems
            .filter(item => item.show)
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-900/10"
                        : "hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
        </nav>

        {/* Footer logout button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center justify-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>{t('navLogout')}</span>
          </button>
        </div>

      </aside>

      {/* Logout confirmation popup modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title={t('confirmLogout')}
        footer={
          <>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="text-xs font-semibold px-4 py-2 border border-slate-200 text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              {t('yesLogOut')}
            </button>
          </>
        }
      >
        <div className="space-y-2">
          <p className="text-slate-700 font-medium">{t('logoutQuestion')}</p>
          <p className="text-xs text-slate-500">{t('logoutNote')}</p>
        </div>
      </Modal>
    </>
  );
};
export default Sidebar;
