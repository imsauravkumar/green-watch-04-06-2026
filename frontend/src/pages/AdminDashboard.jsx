import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { apiFetch } from '../api';
import alertsImg from '../assets/alerts.png';
import { 
  Users, 
  Store, 
  Mail, 
  Send, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  ShieldAlert,
  Search,
  Sparkles,
  Megaphone,
  ScrollText,
  TrendingUp,
  Clipboard
} from 'lucide-react';

const cropConfig = {
  "Wheat (Gehu)": { mandi: "Ghaziabad Mandi" },
  "Paddy (Common)": { mandi: "Hapur Mandi" },
  "Paddy (Grade A)": { mandi: "Meerut Mandi" },
  "Maize (Makka)": { mandi: "Bulandshahr Mandi" },
  "Mustard (Sarson)": { mandi: "Aligarh Mandi" },
  "Gram (Chana)": { mandi: "Agra Mandi" },
  "Soybean": { mandi: "Indore Mandi" },
  "Barley (Jau)": { mandi: "Muzaffarnagar Mandi" },
  "Lentil (Masur)": { mandi: "Kanpur Mandi" },
  "Bajra": { mandi: "Baghpat Mandi" },
  "Jowar": { mandi: "Mathura Mandi" },
  "Ragi": { mandi: "Lucknow Mandi" },
  "Moong": { mandi: "Bareilly Mandi" },
  "Cotton": { mandi: "Hisar Mandi" },
  "Sugarcane": { mandi: "Saharanpur Mandi" }
};

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'users';
  
  const currentTabInfo = {
    users: {
      title: t('tabUsers') || 'Users',
      desc: 'Manage registered farmer and seller user accounts'
    },
    products: {
      title: t('tabProducts') || 'Products',
      desc: 'Monitor and moderate the marketplace product catalog'
    },
    messages: {
      title: t('tabContactInbox') || 'Contact',
      desc: 'Read contact and feedback submissions from users'
    },
    notices: {
      title: t('navGovNotices') || 'Government Notices',
      desc: 'Publish official agricultural notifications and alerts'
    },
    prices: {
      title: 'Market Rate Management',
      desc: 'Manage daily crop prices and APMC/Mandi index values'
    }
  }[activeTab] || {
    title: t('adminTitle') || 'Admin Console',
    desc: t('systemMaintenanceDesc') || 'System maintenance, catalog controls, and user directory audit'
  };

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };
  
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notices, setNotices] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null); // error when loading tab data fails
  const [actionMessage, setActionMessage] = useState(null); // { type: 'success'|'error', text: '' }
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Broadcast state
  const [broadcast, setBroadcast] = useState({ title: '', message: '', targetGroup: 'both' });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Notices state
  const [newNotice, setNewNotice] = useState({ title: '', content: '', category: 'other', source: 'Government of India', isImportant: false });
  const [creatingNotice, setCreatingNotice] = useState(false);
  const [copiedNoticeText, setCopiedNoticeText] = useState('');

  // Market rates state
  const [copiedText, setCopiedText] = useState('');
  const [priceDate, setPriceDate] = useState('06-Jun-2026');
  const [priceInputs, setPriceInputs] = useState({
    "Wheat (Gehu)": "", "Paddy (Common)": "", "Paddy (Grade A)": "", "Maize (Makka)": "",
    "Mustard (Sarson)": "", "Gram (Chana)": "", "Soybean": "", "Barley (Jau)": "",
    "Lentil (Masur)": "", "Bajra": "", "Jowar": "", "Ragi": "", "Moong": "",
    "Cotton": "", "Sugarcane": ""
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'prices') {
      const saved = localStorage.getItem('greenwatch_historical_prices');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data[priceDate]) {
            const datePrices = data[priceDate];
            const newInputs = {};
            Object.keys(priceInputs).forEach(crop => {
              newInputs[crop] = datePrices[crop] !== undefined ? datePrices[crop].toString() : "";
            });
            setPriceInputs(newInputs);
          }
        } catch (e) {
          console.error("Error reading saved prices", e);
        }
      }
    }
  }, [priceDate, activeTab]);

  const mapHeaderToCrop = (header) => {
    const h = header.toLowerCase().replace(/\(.*\)/g, '').trim();
    if (h.includes('wheat') || h.includes('gehu')) return 'Wheat (Gehu)';
    if (h.includes('paddy common') || h === 'paddy') return 'Paddy (Common)';
    if (h.includes('paddy grade a') || h.includes('grade a')) return 'Paddy (Grade A)';
    if (h.includes('maize') || h.includes('makka')) return 'Maize (Makka)';
    if (h.includes('mustard') || h.includes('sarson')) return 'Mustard (Sarson)';
    if (h.includes('chana') || h.includes('gram')) return 'Gram (Chana)';
    if (h.includes('soybean')) return 'Soybean';
    if (h.includes('barley') || h.includes('jau')) return 'Barley (Jau)';
    if (h.includes('masur') || h.includes('lentil')) return 'Lentil (Masur)';
    if (h.includes('bajra')) return 'Bajra';
    if (h.includes('jowar')) return 'Jowar';
    if (h.includes('ragi')) return 'Ragi';
    if (h.includes('moong')) return 'Moong';
    if (h.includes('cotton')) return 'Cotton';
    if (h.includes('sugarcane')) return 'Sugarcane';
    return null;
  };

  const handleParsePrices = () => {
    const lines = copiedText.trim().split('\n');
    if (lines.length < 2) {
      alert("Invalid text. Please paste a valid Markdown table or CSV.");
      return;
    }
    
    if (lines[0].includes('|')) {
      const cleanLine = (l) => l.split('|').map(s => s.trim()).filter(s => s !== '');
      const headers = cleanLine(lines[0]);
      const dataLines = lines.slice(1).filter(l => l.trim() !== '' && !l.includes('---'));
      if (dataLines.length === 0) {
        alert("No price data found in the table.");
        return;
      }
      
      const firstDataLine = cleanLine(dataLines[0]);
      if (firstDataLine.length < 2) {
        alert("Invalid data row format.");
        return;
      }
      
      const date = firstDataLine[0];
      setPriceDate(date);
      
      const newInputs = { ...priceInputs };
      headers.slice(1).forEach((header, idx) => {
        const cropName = mapHeaderToCrop(header);
        if (cropName) {
          const val = firstDataLine[idx + 1];
          if (val) {
            newInputs[cropName] = val.replace(/,/g, '').trim();
          }
        }
      });
      setPriceInputs(newInputs);
      setActionMessage({ type: 'success', text: `Parsed prices for date: ${date} successfully! Review and click Save.` });
    } else {
      const headers = lines[0].split(/[,\t]/).map(s => s.trim());
      const dataLines = lines.slice(1).filter(l => l.trim() !== '');
      if (dataLines.length === 0) return;
      
      const firstDataLine = dataLines[0].split(/[,\t]/).map(s => s.trim());
      const date = firstDataLine[0];
      setPriceDate(date);
      
      const newInputs = { ...priceInputs };
      headers.slice(1).forEach((header, idx) => {
        const cropName = mapHeaderToCrop(header);
        if (cropName) {
          const val = firstDataLine[idx + 1];
          if (val) {
            newInputs[cropName] = val.replace(/,/g, '').trim();
          }
        }
      });
      setPriceInputs(newInputs);
      setActionMessage({ type: 'success', text: `Parsed prices for date: ${date}! Review and click Save.` });
    }
  };

  const handleSavePrices = () => {
    const saved = localStorage.getItem('greenwatch_historical_prices');
    let historicalDataObj = {};
    if (saved) {
      try {
        historicalDataObj = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    } else {
      historicalDataObj = {
        "06-Jun-2026": {
          "Wheat (Gehu)": 2585, "Paddy (Common)": 2441, "Paddy (Grade A)": 2461, "Maize (Makka)": 2410,
          "Mustard (Sarson)": 6200, "Gram (Chana)": 5875, "Soybean": 4892, "Barley (Jau)": 2150,
          "Lentil (Masur)": 7000, "Bajra": 2625, "Jowar": 3320, "Ragi": 3900, "Moong": 8780,
          "Cotton": 8267, "Sugarcane": 350
        },
        "05-Jun-2026": {
          "Wheat (Gehu)": 2570, "Paddy (Common)": 2431, "Paddy (Grade A)": 2449, "Maize (Makka)": 2415,
          "Mustard (Sarson)": 6150, "Gram (Chana)": 5850, "Soybean": 4910, "Barley (Jau)": 2142,
          "Lentil (Masur)": 6960, "Bajra": 2605, "Jowar": 3330, "Ragi": 3870, "Moong": 8720,
          "Cotton": 8302, "Sugarcane": 345
        },
        "04-Jun-2026": {
          "Wheat (Gehu)": 2560, "Paddy (Common)": 2420, "Paddy (Grade A)": 2440, "Maize (Makka)": 2420,
          "Mustard (Sarson)": 6125, "Gram (Chana)": 5825, "Soybean": 4920, "Barley (Jau)": 2135,
          "Lentil (Masur)": 6930, "Bajra": 2590, "Jowar": 3340, "Ragi": 3850, "Moong": 8680,
          "Cotton": 8330, "Sugarcane": 343
        },
        "03-Jun-2026": {
          "Wheat (Gehu)": 2555, "Paddy (Common)": 2415, "Paddy (Grade A)": 2435, "Maize (Makka)": 2425,
          "Mustard (Sarson)": 6100, "Gram (Chana)": 5800, "Soybean": 4935, "Barley (Jau)": 2130,
          "Lentil (Masur)": 6910, "Bajra": 2580, "Jowar": 3350, "Ragi": 3840, "Moong": 8650,
          "Cotton": 8350, "Sugarcane": 342
        },
        "02-Jun-2026": {
          "Wheat (Gehu)": 2565, "Paddy (Common)": 2425, "Paddy (Grade A)": 2445, "Maize (Makka)": 2420,
          "Mustard (Sarson)": 6130, "Gram (Chana)": 5820, "Soybean": 4925, "Barley (Jau)": 2138,
          "Lentil (Masur)": 6940, "Bajra": 2595, "Jowar": 3340, "Ragi": 3860, "Moong": 8690,
          "Cotton": 8335, "Sugarcane": 344
        },
        "01-Jun-2026": {
          "Wheat (Gehu)": 2575, "Paddy (Common)": 2435, "Paddy (Grade A)": 2450, "Maize (Makka)": 2415,
          "Mustard (Sarson)": 6170, "Gram (Chana)": 5840, "Soybean": 4910, "Barley (Jau)": 2145,
          "Lentil (Masur)": 6970, "Bajra": 2610, "Jowar": 3330, "Ragi": 3880, "Moong": 8730,
          "Cotton": 8310, "Sugarcane": 347
        },
        "31-May-2026": {
          "Wheat (Gehu)": 2580, "Paddy (Common)": 2438, "Paddy (Grade A)": 2455, "Maize (Makka)": 2412,
          "Mustard (Sarson)": 6180, "Gram (Chana)": 5860, "Soybean": 4900, "Barley (Jau)": 2148,
          "Lentil (Masur)": 6985, "Bajra": 2618, "Jowar": 3325, "Ragi": 3890, "Moong": 8750,
          "Cotton": 8290, "Sugarcane": 348
        },
        "30-May-2026": {
          "Wheat (Gehu)": 2590, "Paddy (Common)": 2445, "Paddy (Grade A)": 2465, "Maize (Makka)": 2408,
          "Mustard (Sarson)": 6210, "Gram (Chana)": 5880, "Soybean": 4885, "Barley (Jau)": 2152,
          "Lentil (Masur)": 7010, "Bajra": 2630, "Jowar": 3315, "Ragi": 3910, "Moong": 8800,
          "Cotton": 8250, "Sugarcane": 351
        },
        "29-May-2026": {
          "Wheat (Gehu)": 2600, "Paddy (Common)": 2450, "Paddy (Grade A)": 2470, "Maize (Makka)": 2405,
          "Mustard (Sarson)": 6230, "Gram (Chana)": 5900, "Soybean": 4875, "Barley (Jau)": 2158,
          "Lentil (Masur)": 7030, "Bajra": 2640, "Jowar": 3310, "Ragi": 3925, "Moong": 8830,
          "Cotton": 8230, "Sugarcane": 353
        },
        "28-May-2026": {
          "Wheat (Gehu)": 2610, "Paddy (Common)": 2460, "Paddy (Grade A)": 2480, "Maize (Makka)": 2400,
          "Mustard (Sarson)": 6250, "Gram (Chana)": 5920, "Soybean": 4850, "Barley (Jau)": 2160,
          "Lentil (Masur)": 7050, "Bajra": 2650, "Jowar": 3300, "Ragi": 3950, "Moong": 8850,
          "Cotton": 8200, "Sugarcane": 355
        }
      };
    }
    
    const dayPrices = {};
    let hasInvalid = false;
    Object.keys(priceInputs).forEach(crop => {
      const val = parseInt(priceInputs[crop]);
      if (!val || val <= 0) {
        hasInvalid = true;
      }
      dayPrices[crop] = val || 0;
    });
    
    if (hasInvalid) {
      if (!window.confirm("Some prices are blank or invalid. Save anyway?")) return;
    }
    
    historicalDataObj[priceDate] = dayPrices;
    localStorage.setItem('greenwatch_historical_prices', JSON.stringify(historicalDataObj));
    setActionMessage({ type: 'success', text: `Saved market rates for ${priceDate} successfully in browser database!` });
  };

  const handleParseNotice = () => {
    const lines = copiedNoticeText.trim().split('\n');
    if (lines.length === 0) return;
    
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
    setActionMessage({ type: 'success', text: "Notice text parsed! Review and click Post Notice." });
  };

  const handleNoticeInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotice(prev => ({ ...prev, [name]: value }));
  };

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    setActionMessage(null);
    const token = localStorage.getItem('greenwatch_token');

    if (!token) {
      setFetchError('No authentication token found. Please log out and log back in.');
      setLoading(false);
      return;
    }

    try {
      if (activeTab === 'users') {
        const res = await apiFetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          setUsers(await res.json());
        } else {
          const data = await res.json().catch(() => ({}));
          setFetchError(`Failed to load users (${res.status}): ${data.message || 'Unauthorized or server error. Make sure you are logged in as admin.'}`);
        }
      } else if (activeTab === 'products') {
        const res = await apiFetch('/api/products', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          setProducts(await res.json());
        } else {
          const data = await res.json().catch(() => ({}));
          setFetchError(`Failed to load products (${res.status}): ${data.message || 'Server error.'}`);
        }
      } else if (activeTab === 'messages') {
        const res = await apiFetch('/api/contact', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          setMessages(await res.json());
        } else {
          const data = await res.json().catch(() => ({}));
          setFetchError(`Failed to load messages (${res.status}): ${data.message || 'Server error.'}`);
        }
      } else if (activeTab === 'notices') {
        const res = await apiFetch('/api/notices', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          setNotices(await res.json());
        } else {
          const data = await res.json().catch(() => ({}));
          setFetchError(`Failed to load notices (${res.status}): ${data.message || 'Server error.'}`);
        }
      } else if (activeTab === 'prices') {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching admin data", err);
      setFetchError(`Network error: ${err.message}. Check that the backend is reachable.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? All their database references will be removed.")) return;
    const token = localStorage.getItem('greenwatch_token');

    try {
      const res = await apiFetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: data.message || 'User deleted successfully' });
        setUsers(users.filter(u => (u.id || u._id) !== userId));
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Failed to delete user' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Server error' });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const token = localStorage.getItem('greenwatch_token');

    try {
      const res = await apiFetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: data.message || 'Product removed successfully' });
        setProducts(products.filter(p => (p.id || p._id) !== productId));
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Failed to remove product' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Server error' });
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    setSendingBroadcast(true);
    setActionMessage(null);
    const token = localStorage.getItem('greenwatch_token');

    try {
      const res = await apiFetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(broadcast)
      });
      
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Broadcast notification dispatched successfully!' });
        setBroadcast({ title: '', message: '', targetGroup: 'both' });
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Failed to dispatch broadcast' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Server error sending notification' });
    } finally {
      setSendingBroadcast(false);
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
        setActionMessage({ type: 'success', text: 'Government Notice published successfully!' });
        setNewNotice({ title: '', content: '', category: 'other', source: 'Government of India', isImportant: false });
        fetchData();
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Failed to create notice' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Server error creating notice' });
    } finally {
      setCreatingNotice(false);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm("Delete this government notice?")) return;
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

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Header Banner */}
      <div className="h-28 w-full rounded-2xl overflow-hidden relative shadow-md bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 shrink-0">
        <img
          src={alertsImg}
          alt={t('adminTitle')}
          className="w-full h-full object-cover opacity-60 mix-blend-overlay animate-fade-in pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-center p-6 text-white animate-fade-in">
          <div className="flex items-center gap-2 text-white">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
            <h1 className="text-lg font-bold tracking-tight md:text-xl">{currentTabInfo.title}</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed md:text-sm">{currentTabInfo.desc}</p>
        </div>
      </div>

      {/* Fetch error banner */}
      {fetchError && (
        <div className="p-4 rounded-xl text-sm font-semibold flex items-start gap-2.5 bg-red-50 text-red-800 border border-red-200 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold mb-0.5">Could not load data</p>
            <p className="font-normal text-xs">{fetchError}</p>
          </div>
          <button onClick={fetchData} className="ml-2 text-red-705 underline text-xs hover:text-red-900 shrink-0">Retry</button>
        </div>
      )}

      {/* Action alerts banner */}
      {actionMessage && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2.5 max-w-xl shadow-sm border ${actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-800 border-red-100'}`}>
          {actionMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Main Container: Content Viewport */}
      <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          
          {/* Search Bar for data lists */}
          {activeTab !== 'broadcast' && activeTab !== 'messages' && (
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('filterPlaceholder').replace('{tab}', activeTab === 'users' ? t('tabUsers') : activeTab === 'products' ? t('tabProducts') : activeTab)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              <span className="text-sm text-slate-400">{t('loadingCatalogData')}</span>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              
              {/* 1. USERS LIST TAB */}
              {activeTab === 'users' && (
                <>
                  {/* Desktop Table View */}
                  <table className="hidden md:table w-full text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-bold">
                      <tr>
                        <th className="px-6 py-3.5 text-left">{t('colUserName')}</th>
                        <th className="px-6 py-3.5 text-left">{t('colEmailAddr')}</th>
                        <th className="px-6 py-3.5 text-left">{t('colAssignedRole')}</th>
                        <th className="px-6 py-3.5 text-left">{t('colLocation')}</th>
                        <th className="px-6 py-3.5 text-left">IP Address</th>
                        <th className="px-6 py-3.5 text-center">{t('colActions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium bg-white">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400">
                            {fetchError ? '⚠ Could not load users — see error above' : t('noUsersFoundFilter')}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id || u._id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-3.5 flex items-center gap-2 text-sm text-slate-900">
                              <span className="text-base">🌱</span>
                              <span className="font-semibold">{u.name}</span>
                            </td>
                            <td className="px-6 py-3.5 text-sm text-slate-505">{u.email}</td>
                            <td className="px-6 py-3.5 text-sm">
                              <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : u.role === 'both' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                {u.role === 'admin' ? t('admin') : u.role === 'farmer' ? t('roleFarmer') : u.role === 'seller' ? t('roleSeller') : u.role === 'both' ? t('roleBoth') : u.role}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-sm text-slate-505">{u.location}</td>
                            <td className="px-6 py-3.5 text-sm font-mono text-slate-505">{u.ip || "Unknown"}</td>
                            <td className="px-6 py-3.5 text-center text-sm">
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUser(u.id || u._id)}
                                  className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Mobile Card List View */}
                  <div className="grid grid-cols-1 gap-4 p-4 md:hidden bg-slate-50/50">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        {fetchError ? '⚠ Could not load users — see error above' : t('noUsersFoundFilter')}
                      </div>
                    ) : (
                      filteredUsers.map((u) => (
                        <div key={u.id || u._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 relative">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-base">🌱</span>
                              <span className="font-semibold text-slate-900 text-sm">{u.name}</span>
                            </div>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : u.role === 'both' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                              {u.role === 'admin' ? t('admin') : u.role === 'farmer' ? t('roleFarmer') : u.role === 'seller' ? t('roleSeller') : u.role === 'both' ? t('roleBoth') : u.role}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-xs text-slate-500">
                            <div><span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mr-1.5">Email:</span>{u.email}</div>
                            <div><span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mr-1.5">Location:</span>{u.location || 'N/A'}</div>
                            <div><span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mr-1.5">IP Address:</span><span className="font-mono text-[11px]">{u.ip || 'Unknown'}</span></div>
                          </div>

                          {u.role !== 'admin' && (
                            <div className="flex justify-end border-t border-slate-100 pt-2 mt-1">
                              <button
                                onClick={() => handleDeleteUser(u.id || u._id)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors text-xs font-semibold flex items-center gap-1"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete User
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* 2. PRODUCTS CATALOG TAB */}
              {activeTab === 'products' && (
                <>
                  {/* Desktop Table View */}
                  <table className="hidden md:table w-full text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-bold">
                      <tr>
                        <th className="px-6 py-3.5 text-left">{t('colProduct')}</th>
                        <th className="px-6 py-3.5 text-left">{t('colListedBySeller')}</th>
                        <th className="px-6 py-3.5 text-left">{t('colPrice')}</th>
                        <th className="px-6 py-3.5 text-left">{t('colStockQty')}</th>
                        <th className="px-6 py-3.5 text-center">{t('colActions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium bg-white">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400">{t('noProductsFoundFilter')}</td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.id || p._id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-3.5 flex items-center gap-3 text-sm text-slate-900">
                              <div className="w-10 h-10 rounded border border-slate-200 bg-slate-100 flex items-center justify-center text-sm overflow-hidden shrink-0">
                                {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : "📦"}
                              </div>
                              <div>
                                <span className="text-slate-900 font-semibold block">{p.name}</span>
                                <span className="text-xs text-slate-400 block font-normal leading-normal mt-0.5 truncate max-w-xs">{p.description}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-sm text-slate-700">{p.sellerName}</td>
                            <td className="px-6 py-3.5 text-sm font-bold text-slate-905">₹{p.price}</td>
                            <td className="px-6 py-3.5 text-sm">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.stock === 0 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                                {p.stock} {t('unitsLabel')}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-center text-sm">
                              <button
                                onClick={() => handleDeleteProduct(p.id || p._id)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                                title="Remove Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Mobile Card List View */}
                  <div className="grid grid-cols-1 gap-4 p-4 md:hidden bg-slate-50/50">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">{t('noProductsFoundFilter')}</div>
                    ) : (
                      filteredProducts.map((p) => (
                        <div key={p.id || p._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3 relative animate-fade-in text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded border border-slate-200 bg-slate-100 flex items-center justify-center text-base overflow-hidden shrink-0">
                              {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : "📦"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-slate-900 font-bold text-sm block truncate">{p.name}</span>
                              <span className="text-xs text-slate-500 font-semibold block truncate">Seller: {p.sellerName}</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg">{p.description}</p>
                          
                          <div className="flex justify-between items-center text-xs">
                            <div className="font-extrabold text-slate-900">₹{p.price}</div>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.stock === 0 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                              {p.stock} {t('unitsLabel')}
                            </span>
                          </div>

                          <div className="flex justify-end border-t border-slate-100 pt-2">
                            <button
                              onClick={() => handleDeleteProduct(p.id || p._id)}
                              className="text-red-500 hover:text-red-755 p-1.5 rounded hover:bg-red-50 transition-colors text-xs font-semibold flex items-center gap-1"
                              title="Remove Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove Product
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* 3. CONTACT MESSAGES TAB */}
              {activeTab === 'messages' && (
                <>
                  {/* Desktop Table View */}
                  <table className="hidden md:table w-full text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-bold">
                      <tr>
                        <th className="px-6 py-3.5 text-left">{t('colSenderDetails')}</th>
                        <th className="px-6 py-3.5 text-left">{t('colSubject')}</th>
                        <th className="px-6 py-3.5 text-left">{t('colMsgDesc')}</th>
                        <th className="px-6 py-3.5 text-left">{t('colReceivedDate')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium bg-white">
                      {messages.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-slate-400">{t('noContactMsgs')}</td>
                        </tr>
                      ) : (
                        messages.map((m) => (
                          <tr key={m.id || m._id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-3.5 text-sm">
                              <span className="text-slate-900 font-semibold block">{m.name}</span>
                              <span className="text-xs text-slate-400 font-normal">{m.email}</span>
                            </td>
                            <td className="px-6 py-3.5 text-sm font-semibold text-slate-800">{m.subject}</td>
                            <td className="px-6 py-3.5 text-sm text-slate-600 font-normal leading-relaxed max-w-sm whitespace-pre-wrap">{m.message}</td>
                            <td className="px-6 py-3.5 text-xs text-slate-400 font-normal">
                              {new Date(m.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Mobile Card List View */}
                  <div className="grid grid-cols-1 gap-4 p-4 md:hidden bg-slate-50/50">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">{t('noContactMsgs')}</div>
                    ) : (
                      messages.map((m) => (
                        <div key={m.id || m._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 relative text-left">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-slate-900 font-bold text-sm block">{m.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{m.email}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-800 border-t border-slate-50 pt-1.5 mt-0.5">
                            <span className="text-[9px] text-slate-400 uppercase font-extrabold mr-1">Subject:</span>
                            {m.subject}
                          </div>

                          <p className="text-xs text-slate-606 font-normal leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded-lg border border-slate-150 mt-1">
                            {m.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}



              {/* 5. GOV NOTICES TAB */}
              {activeTab === 'notices' && (
                <div className="p-6">
                  <div className="border-b border-slate-100 pb-3 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ScrollText className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Government Notices</h3>
                        <p className="text-xs text-slate-400">Manage official schemes and advisories</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left/Main Column: List of Notices */}
                    <div className="lg:col-span-2 space-y-3">
                      <h4 className="text-sm font-bold text-slate-800 mb-2">Published Notices</h4>
                      {notices.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-sm">No notices published yet.</div>
                      ) : (
                        notices.map(notice => (
                          <div key={notice.id || notice._id} className={`bg-white border rounded-xl p-4 flex gap-4 ${notice.isImportant ? 'border-amber-200' : 'border-slate-200'}`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{notice.category}</span>
                                {notice.isImportant && <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Important</span>}
                              </div>
                              <h5 className="text-sm font-bold text-slate-900 mb-1 text-left">{notice.title}</h5>
                              <p className="text-sm text-slate-605 mb-2 leading-relaxed whitespace-pre-line text-left">{notice.content}</p>
                              <div className="text-xs text-slate-400 font-medium text-left">Source: {notice.source} | Posted: {new Date(notice.createdAt).toLocaleDateString()}</div>
                            </div>
                            <button onClick={() => handleDeleteNotice(notice.id || notice._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg h-fit transition-colors animate-fade-in" title="Delete Notice">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Right Column: Create Notices (Manual + Bulk Copy-Paste) */}
                    <div className="lg:col-span-1 space-y-4">
                      {/* Create Notice Form */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 h-fit space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 text-left">Post New Notice</h4>
                        <form onSubmit={handleCreateNotice} className="space-y-4 text-left">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">Title</label>
                            <input type="text" required value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Notice title" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                              <select value={newNotice.category} onChange={e => setNewNotice({...newNotice, category: e.target.value})} className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
                                <option value="scheme">Scheme</option>
                                <option value="advisory">Advisory</option>
                                <option value="alert">Alert</option>
                                <option value="subsidy">Subsidy</option>
                                <option value="policy">Policy</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">Source</label>
                              <input type="text" value={newNotice.source} onChange={e => setNewNotice({...newNotice, source: e.target.value})} className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="e.g. Govt of India" />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">Content</label>
                            <textarea required rows={4} value={newNotice.content} onChange={e => setNewNotice({...newNotice, content: e.target.value})} className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none" placeholder="Notice details..." />
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="isImportant" checked={newNotice.isImportant} onChange={e => setNewNotice({...newNotice, isImportant: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500" />
                            <label htmlFor="isImportant" className="text-xs font-bold text-slate-700">Mark as Important</label>
                          </div>
                          <button type="submit" disabled={creatingNotice} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                            {creatingNotice ? 'Posting...' : 'Post Notice'}
                          </button>
                        </form>
                      </div>

                      {/* Copy-Paste Notices Form */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 h-fit space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1">
                          <Clipboard className="w-4 h-4 text-emerald-600" /> Copy-Paste Notices
                        </h4>
                        <div className="space-y-3">
                          <p className="text-xs text-slate-400 font-medium">Paste notice text (e.g., Title on first line, details on next lines, or key prefixes like Title:, Content:, Category:, Source:).</p>
                          <textarea
                            rows={5}
                            value={copiedNoticeText}
                            onChange={(e) => setCopiedNoticeText(e.target.value)}
                            className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                            placeholder={`Title: Scheme Update\nCategory: scheme\nContent: Detailed description...`}
                          />
                          <button
                            type="button"
                            onClick={handleParseNotice}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Parse & Autofill
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. MARKET RATE MANAGEMENT TAB */}
              {activeTab === 'prices' && (
                <div className="p-6">
                  <div className="border-b border-slate-100 pb-3 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Market Rate Index Management</h3>
                        <p className="text-xs text-slate-400">Add or edit crop daily price records in local storage database</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Manual Entry Form - spans 2 columns */}
                    <div className="lg:col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-slate-200 pb-2.5">
                        <h4 className="text-sm font-bold text-slate-800 text-left">Manual Price Editor</h4>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <label className="text-xs font-bold text-slate-500">Target Date:</label>
                          <input
                            type="text"
                            value={priceDate}
                            onChange={(e) => setPriceDate(e.target.value)}
                            className="text-sm px-2.5 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-700"
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        {/* Desktop Price Table */}
                        <table className="hidden md:table w-full text-sm text-slate-650 animate-fade-in">
                          <thead className="bg-slate-100 border-b border-slate-200 text-slate-550 uppercase tracking-wider text-xs font-bold">
                            <tr>
                              <th className="px-6 py-3.5 text-left">Crop / Variety</th>
                              <th className="px-6 py-3.5 text-left">APMC / Mandi Location</th>
                              <th className="px-6 py-3.5 text-right w-48 font-bold">Daily Price (₹/Quintal)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium bg-white">
                            {Object.keys(priceInputs).map(crop => (
                              <tr key={crop} className="hover:bg-slate-50/50">
                                <td className="px-6 py-3 text-slate-900 font-semibold text-sm">
                                  {crop}
                                </td>
                                <td className="px-6 py-3 text-slate-500 text-sm">
                                  {cropConfig[crop]?.mandi || "N/A"}
                                </td>
                                <td className="px-6 py-3 text-right">
                                  <div className="inline-flex items-center gap-1.5 justify-end w-full">
                                    <span className="text-slate-400 font-bold text-sm">₹</span>
                                    <input
                                      type="number"
                                      value={priceInputs[crop]}
                                      onChange={(e) => setPriceInputs({ ...priceInputs, [crop]: e.target.value })}
                                      className="w-32 text-sm px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right font-bold text-slate-800"
                                      placeholder="0"
                                    />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Mobile Price Inputs List */}
                        <div className="md:hidden divide-y divide-slate-100 bg-white">
                          {Object.keys(priceInputs).map(crop => (
                            <div key={crop} className="py-3.5 px-4 flex flex-col gap-2 text-left">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-slate-900 font-bold text-sm">{crop}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cropConfig[crop]?.mandi || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-2 justify-between">
                                <span className="text-slate-450 font-bold text-xs">Price (₹/Quintal):</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-slate-400 font-bold text-sm">₹</span>
                                  <input
                                    type="number"
                                    value={priceInputs[crop]}
                                    onChange={(e) => setPriceInputs({ ...priceInputs, [crop]: e.target.value })}
                                    className="w-36 text-sm px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right font-bold text-slate-800"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSavePrices}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-6 rounded-lg transition-colors shadow-sm cursor-pointer ml-auto block"
                      >
                        Save Prices
                      </button>
                    </div>

                    {/* Copy-Paste Importer - spans 1 column */}
                    <div className="lg:col-span-1 bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4 h-fit">
                      <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1">
                        <Clipboard className="w-4 h-4 text-emerald-600" /> Bulk Copy-Paste Tool
                      </h4>
                      
                      <div className="space-y-3">
                        <p className="text-xs text-slate-400 font-medium">
                          Paste a Markdown table or CSV containing the date and prices of the crop varieties.
                        </p>
                        
                        <textarea
                          rows={8}
                          value={copiedText}
                          onChange={(e) => setCopiedText(e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono resize-none"
                          placeholder={`| DATE | Wheat (₹) | ...\n| 06-Jun-2026 | 2585 | ...`}
                        />

                        <button
                          type="button"
                          onClick={handleParsePrices}
                          className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Parse & Load Table
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

        </div>

    </div>
  );
};

export default AdminDashboard;
