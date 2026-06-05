import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useTranslation } from '../hooks/useTranslation';
import noticesImg from '../assets/notices.svg';
import {
  ScrollText,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Tag,
  Building2,
  Star
} from 'lucide-react';

const CATEGORY_STYLES = {
  scheme:   { label: 'Scheme',   color: 'bg-blue-50 text-blue-700 border-blue-200' },
  advisory: { label: 'Advisory', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  alert:    { label: 'Alert',    color: 'bg-red-50 text-red-700 border-red-200' },
  subsidy:  { label: 'Subsidy',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  policy:   { label: 'Policy',   color: 'bg-purple-50 text-purple-700 border-purple-200' },
  other:    { label: 'General',  color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const GovernmentNotices = () => {
  const { t } = useTranslation();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('greenwatch_token');
    try {
      const res = await apiFetch('/api/notices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotices(await res.json());
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to load notices.');
      }
    } catch (err) {
      setError('Network error. Could not load notices.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50">

      {/* Header Banner */}
      <div className="h-40 w-full rounded-2xl overflow-hidden relative shadow-md bg-slate-950">
        <img
          src={noticesImg}
          alt="Government Notices"
          className="w-full h-full object-cover opacity-80 mix-blend-overlay animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent flex flex-col justify-end p-6">
          <div className="flex items-center gap-2 text-white">
            <ScrollText className="w-6 h-6 text-emerald-400" />
            <h1 className="text-lg font-bold tracking-tight">Government Notices</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed">
            Official agricultural schemes, advisories & policy updates
          </p>
        </div>
        
        {/* Floating Refresh button */}
        <button
          onClick={fetchNotices}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-3 rounded-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          <span className="text-xs text-slate-400">Loading notices...</span>
        </div>
      ) : notices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ScrollText className="w-12 h-12 text-slate-200 mb-3" />
          <p className="text-sm font-semibold text-slate-400">No notices yet</p>
          <p className="text-xs text-slate-300 mt-1">Government notices posted by admin will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => {
            const cat = CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.other;
            return (
              <div
                key={notice._id || notice.id}
                className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow ${
                  notice.isImportant ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                }`}
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {notice.isImportant && (
                      <Star className="w-4 h-4 text-amber-500 shrink-0 fill-amber-400" />
                    )}
                    <h2 className="text-sm font-bold text-slate-900 leading-snug">{notice.title}</h2>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border ${cat.color}`}>
                    {cat.label}
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap mb-4">
                  {notice.content}
                </p>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 border-t border-slate-50 pt-3">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {notice.source || 'Government of India'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Posted by: {notice.postedBy}
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Calendar className="w-3 h-3" />
                    {new Date(notice.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GovernmentNotices;
