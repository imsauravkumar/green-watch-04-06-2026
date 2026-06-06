import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { User, MapPin, Shield, Mail, Camera, Trash2, CheckCircle } from 'lucide-react';
import authSideImg from '../assets/auth_side.jpg';

export const Profile = () => {
  const { user, updateProfileDetails } = useAuth();
  const { t } = useTranslation();

  const [name, setName] = useState(user?.displayName || '');
  const [location, setLocation] = useState(user?.location || '');
  const [photo, setPhoto] = useState(user?.photoURL || 'default-plant');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 2MB' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => { setPhoto(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => { setPhoto('default-plant'); };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await updateProfileDetails(name, location, photo);
      setMessage({ type: 'success', text: t('profileUpdated') });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || t('updateFailed') });
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = () => {
    if (!user) return "";
    if (user.role === 'admin') return t('administrator');
    if (user.role === 'both') return t('farmerSeller');
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Header Banner */}
      <div className="h-28 w-full rounded-2xl overflow-hidden relative shadow-md bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 shrink-0">
        <img
          src={authSideImg}
          alt={t('profileTitle')}
          className="w-full h-full object-cover opacity-60 mix-blend-overlay animate-fade-in pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-center p-6 text-white animate-fade-in">
          <div className="flex items-center gap-2 text-white">
            <User className="w-6 h-6 text-emerald-400" />
            <h1 className="text-lg font-bold tracking-tight md:text-xl">{t('profileTitle')}</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed md:text-sm">{t('profileDesc')}</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            
            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 mb-6">
              <div className="relative h-20 w-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-4xl overflow-hidden shadow-inner group">
                {photo === 'default-plant' ? (
                  <span>🌱</span>
                ) : (
                  <img src={photo} alt={name} className="h-full w-full object-cover" />
                )}
                <label htmlFor="photo-upload" className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs">
                  <Camera className="w-5 h-5" />
                </label>
                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <h3 className="font-bold text-slate-800 text-sm">{name || 'User'}</h3>
                <p className="text-[10px] text-slate-400">{t('uploadHighRes')}</p>
                <div className="flex items-center gap-2">
                  <label htmlFor="photo-upload-btn" className="text-[10px] font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer border border-emerald-100">
                    {t('changePhoto')}
                  </label>
                  <input id="photo-upload-btn" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  {photo !== 'default-plant' && (
                    <button onClick={handleRemovePhoto} className="text-[10px] font-bold px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition-colors flex items-center gap-1 border border-red-100">
                      <Trash2 className="w-3 h-3" /> {t('resetDefault')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts */}
            {message && (
              <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 mb-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : null}
                <span>{message.text}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('registeredEmail')}</span>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{user?.email}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('portalRole')}</span>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>{getRoleLabel()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">{t('fullName')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder={t('namePlaceholder')} className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">{t('locationLabel')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="E.g. New Delhi, India" className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 mt-4">
                {loading ? t('updatingChanges') : t('saveSettings')}
              </button>
            </form>

          </div>
    </div>
  );
};
export default Profile;
