import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import noticesImg from '../assets/notices.svg';
import {
  ScrollText,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Tag,
  Building2,
  Star,
  Trash2,
  Clipboard,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle
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
  const { user, isAdmin } = useAuth();
  
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Admin specific states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', category: 'scheme', source: 'Government of India', isImportant: false });
  const [copiedNoticeText, setCopiedNoticeText] = useState('');
  const [creatingNotice, setCreatingNotice] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

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

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setCreatingNotice(true);
    setActionMessage(null);
    const token = localStorage.getItem('greenwatch_token');

    try {
      const res = await apiFetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newNotice)
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Notice published successfully!' });
        setNewNotice({ title: '', content: '', category: 'scheme', source: 'Government of India', isImportant: false });
        setCopiedNoticeText('');
        fetchNotices();
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Failed to publish notice' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Server error creating notice' });
    } finally {
      setCreatingNotice(false);
    }
  };

  const handleParseNotice = () => {
    const lines = copiedNoticeText.trim().split('\n');
    if (lines.length === 0 || copiedNoticeText.trim() === '') {
      alert("Please paste notice content first.");
      return;
    }
    
    let title = '';
    let category = 'other';
    let source = 'Government of India';
    let content = '';
    
    let hasKeys = false;
    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.startsWith('title:')) {
        title = line.slice(6).trim();
        hasKeys = true;
      } else if (lower.startsWith('category:')) {
        const cat = line.slice(9).trim().toLowerCase();
        if (['scheme', 'advisory', 'alert', 'subsidy', 'policy', 'other'].includes(cat)) {
          category = cat;
        }
        hasKeys = true;
      } else if (lower.startsWith('source:')) {
        source = line.slice(7).trim();
        hasKeys = true;
      } else if (lower.startsWith('content:')) {
        content = line.slice(8).trim();
        hasKeys = true;
      }
    });
    
    if (!hasKeys) {
      title = lines[0].trim();
      content = lines.slice(1).join('\n').trim();
    }
    
    setNewNotice({
      title: title,
      category: category,
      source: source,
      content: content,
      isImportant: false
    });
    setActionMessage({ type: 'success', text: "Notice text parsed successfully! Review and click Post Notice." });
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm("Are you sure you want to delete this government notice?")) return;
    const token = localStorage.getItem('greenwatch_token');

    try {
      const res = await apiFetch(`/api/notices/${noticeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Notice deleted successfully' });
        setNotices(notices.filter(n => (n.id || n._id) !== noticeId));
      } else {
        const data = await res.json().catch(()=>({}));
        setActionMessage({ type: 'error', text: data.message || 'Failed to delete notice' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Server error deleting notice' });
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">

      {/* Header Banner */}
      <div className="h-28 w-full rounded-2xl overflow-hidden relative shadow-md bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950">
        <img
          src={noticesImg}
          alt="Government Notices"
          className="w-full h-full object-cover opacity-80 mix-blend-overlay animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-center p-6">
          <div className="flex items-center gap-2 text-white">
            <ScrollText className="w-6 h-6 text-emerald-400" />
            <h1 className="text-lg font-bold tracking-tight md:text-xl">Government Notices</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed md:text-sm">
            Official agricultural schemes, advisories & policy updates
          </p>
        </div>
        
        {/* Floating Refresh button */}
        <button
          onClick={fetchNotices}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Action Alerts */}
      {actionMessage && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 max-w-xl ${actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {actionMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Admin Panel notice publisher (Directly on this page) */}
      {isAdmin && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full p-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 text-left transition-colors border-b border-slate-100 cursor-pointer"
          >
            <div className="flex items-center gap-2 text-slate-800">
              <Star className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider">Admin Actions: Publish Official Notices</span>
            </div>
            {showAddForm ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {showAddForm && (
            <div className="p-5 bg-white grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form panel */}
              <div className="lg:col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-800">Manual Entry Form</h4>
                <form onSubmit={handleCreateNotice} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Notice Title</label>
                    <input
                      type="text"
                      required
                      value={newNotice.title}
                      onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                      className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Title of notification"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                      <select
                        value={newNotice.category}
                        onChange={e => setNewNotice({...newNotice, category: e.target.value})}
                        className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="scheme">Scheme</option>
                        <option value="advisory">Advisory</option>
                        <option value="alert">Alert</option>
                        <option value="subsidy">Subsidy</option>
                        <option value="policy">Policy</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Source / Department</label>
                      <input
                        type="text"
                        value={newNotice.source}
                        onChange={e => setNewNotice({...newNotice, source: e.target.value})}
                        className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="e.g. Ministry of Agriculture"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Content Details</label>
                    <textarea
                      required
                      rows={4}
                      value={newNotice.content}
                      onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                      className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                      placeholder="Write comprehensive details..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isImportantPage"
                      checked={newNotice.isImportant}
                      onChange={e => setNewNotice({...newNotice, isImportant: e.target.checked})}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="isImportantPage" className="text-xs font-bold text-slate-700">Mark notice as Important</label>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingNotice}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 ml-auto block"
                  >
                    {creatingNotice ? 'Posting...' : 'Post Notice'}
                  </button>
                </form>
              </div>

              {/* Copy Paste Panel */}
              <div className="lg:col-span-1 bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4 h-fit">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Clipboard className="w-3.5 h-3.5 text-emerald-600" /> Copy-Paste Tool
                </h4>
                
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 font-medium">
                    Paste raw notice text. We will automatically extract the Title and Details, or match tags like Title:, Content:, Category:, Source:.
                  </p>
                  
                  <textarea
                    rows={8}
                    value={copiedNoticeText}
                    onChange={(e) => setCopiedNoticeText(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    placeholder={`Title: Subsidized Seeds Available\nCategory: subsidy\nSource: Department of Agri\nContent: 50% discount on seeds...`}
                  />

                  <button
                    type="button"
                    onClick={handleParseNotice}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Parse & Load Notice
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

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
                className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative ${
                  notice.isImportant ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                }`}
              >
                
                {/* Admin Delete Action */}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteNotice(notice._id || notice.id)}
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Title row */}
                <div className="flex items-start justify-between gap-3 mb-3 pr-8">
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
