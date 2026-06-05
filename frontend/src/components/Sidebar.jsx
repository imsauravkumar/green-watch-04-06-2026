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
  FlaskConical,
  TrendingUp,
  MapPin,
  ShoppingBasket,
  Users,
  MessageCircle,
  ScrollText,
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

  // ─── Grouped sections ────────────────────────────────────────────────────
  const sections = [
    {
      heading: 'OVERVIEW',
      items: [
        { to: '/dashboard', label: t('farmDashboard'),   icon: LayoutDashboard, show: true },
        { to: '/weather',   label: t('weatherForecast'), icon: CloudSun,         show: true },
      ],
    },
    {
      heading: 'FARMING TOOLS',
      items: [
        { to: '/crop-health',    label: t('cropHealth'),    icon: Camera,       show: isFarmer },
        { to: '/pest-control',   label: t('pestDetection'), icon: Bug,          show: isFarmer },
        { to: '/crop-rec',       label: t('cropRec'),       icon: Sprout,       show: isFarmer },
        { to: '/fertilizer-rec', label: t('fertilizerRec'), icon: FlaskConical, show: isFarmer },
        { to: '/market-prices',  label: t('marketPrice'),   icon: TrendingUp,   show: isFarmer },
        { to: '/gps-mapping',    label: t('gpsMapping'),    icon: MapPin,       show: isFarmer },
      ],
    },
    {
      heading: 'COMMUNITY',
      items: [
        { to: '/marketplace',  label: t('navMarketplace'),      icon: ShoppingBasket, show: isFarmer || isSeller },
        { to: '/community',    label: t('navCommunity'),        icon: Users,          show: true },
        { to: '/chatbot',      label: t('expertChatbot'),       icon: MessageCircle,  show: true },
        { to: '/gov-notices',  label: t('navGovNotices'),     icon: ScrollText,     show: true },
      ],
    },
    {
      heading: 'ACCOUNT',
      items: [
        { to: '/profile', label: t('navProfile'), icon: User,        show: true },
        { to: '/admin',   label: t('navAdmin'),   icon: ShieldCheck, show: isAdmin },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 left-0 z-40 w-64 bg-slate-900 flex flex-col h-[calc(100vh-4rem)] border-r border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >


        {/* ── Nav sections ─────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll py-4 px-3 space-y-4">
          {sections.map((section, si) => {
            const visible = section.items.filter(i => i.show);
            if (visible.length === 0) return null;

            return (
              <div key={si}>
                {/* Section heading */}
                <p className="px-2 mb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase select-none opacity-80">
                  {section.heading}
                </p>

                {/* Section nav links */}
                <div className="space-y-1">
                  {visible.map(item => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-650 text-white shadow-md shadow-emerald-950/40'
                              : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              className={`h-4 w-4 shrink-0 transition-colors ${
                                isActive
                                  ? 'text-white'
                                  : 'text-slate-500 group-hover:text-slate-300'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* ── Logout footer ──────────────────────────── */}
        <div className="px-3 py-3 border-t border-slate-800 shrink-0">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="group flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-red-950/30 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="h-4 w-4 shrink-0 group-hover:text-red-400 transition-colors" />
            <span>{t('navLogout')}</span>
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
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
