import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Megaphone
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'products' | 'messages' | 'broadcast'
  
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null); // { type: 'success'|'error', text: '' }
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Broadcast state
  const [broadcast, setBroadcast] = useState({ title: '', message: '', targetGroup: 'both' });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setActionMessage(null);
    const token = localStorage.getItem('greenwatch_token');

    try {
      if (activeTab === 'users') {
        const res = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setUsers(await res.json());
      } else if (activeTab === 'products') {
        const res = await fetch('/api/products', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setProducts(await res.json());
      } else if (activeTab === 'messages') {
        const res = await fetch('/api/contact', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setMessages(await res.json());
      }
    } catch (err) {
      console.error("Error fetching admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? All their database references will be removed.")) return;
    const token = localStorage.getItem('greenwatch_token');

    try {
      const res = await fetch(`/api/users/${userId}`, {
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
      const res = await fetch(`/api/products/${productId}`, {
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
      const res = await fetch('/api/admin/notifications', {
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
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            <ShieldAlert className="w-5 h-5 text-emerald-600" /> Admin Console
          </h1>
          <p className="text-xs text-slate-500">System maintenance, catalog controls, and user directory audit</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm gap-1 self-start md:self-auto">
          <button
            onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'users' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users className="w-3.5 h-3.5" /> Users
          </button>
          <button
            onClick={() => { setActiveTab('products'); setSearchQuery(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'products' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Store className="w-3.5 h-3.5" /> Products
          </button>
          <button
            onClick={() => { setActiveTab('messages'); setSearchQuery(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'messages' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Mail className="w-3.5 h-3.5" /> Contact Inbox
          </button>
          <button
            onClick={() => { setActiveTab('broadcast'); setSearchQuery(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'broadcast' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Megaphone className="w-3.5 h-3.5" /> Broadcasts
          </button>
        </div>
      </div>

      {/* Action alerts banner */}
      {actionMessage && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 max-w-xl ${actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
          {actionMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Search Bar for data lists */}
        {activeTab !== 'broadcast' && activeTab !== 'messages' && (
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={`Filter ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
            <span className="text-xs text-slate-400">Loading catalog data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            
            {/* 1. USERS LIST TAB */}
            {activeTab === 'users' && (
              <table className="w-full text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                  <tr>
                    <th className="px-6 py-3.5 text-left">User Name</th>
                    <th className="px-6 py-3.5 text-left">Email Address</th>
                    <th className="px-6 py-3.5 text-left">Assigned Role</th>
                    <th className="px-6 py-3.5 text-left">Location</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">No users found match filter.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id || u._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5 flex items-center gap-2">
                          <span className="text-base">🌱</span>
                          <span className="text-slate-900 font-semibold">{u.name}</span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">{u.email}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : u.role === 'both' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">{u.location}</td>
                        <td className="px-6 py-3.5 text-center">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id || u._id)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* 2. PRODUCTS CATALOG TAB */}
            {activeTab === 'products' && (
              <table className="w-full text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                  <tr>
                    <th className="px-6 py-3.5 text-left">Product</th>
                    <th className="px-6 py-3.5 text-left">Listed By Seller</th>
                    <th className="px-6 py-3.5 text-left">Price</th>
                    <th className="px-6 py-3.5 text-left">Stock Quantity</th>
                    <th className="px-6 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">No products found match filter.</td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id || p._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded border border-slate-200 bg-slate-100 flex items-center justify-center text-xs overflow-hidden shrink-0">
                            {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : "📦"}
                          </div>
                          <div>
                            <span className="text-slate-900 font-semibold block">{p.name}</span>
                            <span className="text-[10px] text-slate-400 block font-normal leading-none mt-0.5 truncate max-w-xs">{p.description}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-slate-700">{p.sellerName}</td>
                        <td className="px-6 py-3.5 font-bold text-slate-900">₹{p.price}</td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock === 0 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <button
                            onClick={() => handleDeleteProduct(p.id || p._id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Remove Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* 3. CONTACT MESSAGES TAB */}
            {activeTab === 'messages' && (
              <table className="w-full text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                  <tr>
                    <th className="px-6 py-3.5 text-left">Sender Details</th>
                    <th className="px-6 py-3.5 text-left">Subject</th>
                    <th className="px-6 py-3.5 text-left">Message Description</th>
                    <th className="px-6 py-3.5 text-left">Received Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400">No contact messages received.</td>
                    </tr>
                  ) : (
                    messages.map((m) => (
                      <tr key={m.id || m._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5">
                          <span className="text-slate-900 font-semibold block">{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{m.email}</span>
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-slate-800">{m.subject}</td>
                        <td className="px-6 py-3.5 text-slate-500 font-normal leading-relaxed max-w-sm whitespace-pre-wrap">{m.message}</td>
                        <td className="px-6 py-3.5 text-slate-400 font-normal">
                          {new Date(m.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* 4. BROADCAST CONSOLE TAB */}
            {activeTab === 'broadcast' && (
              <div className="max-w-xl p-6 mx-auto text-left space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-1.5">
                  <Megaphone className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Targeted Notifications console</h3>
                    <p className="text-[10px] text-slate-400">Dispatches warnings and messages direct to user groups</p>
                  </div>
                </div>

                <form onSubmit={handleSendBroadcast} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Alert Title</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Extreme Cold Warning or Seed Availability update"
                      value={broadcast.title}
                      onChange={(e) => setBroadcast(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Target Recipient Group</label>
                    <select
                      value={broadcast.targetGroup}
                      onChange={(e) => setBroadcast(prev => ({ ...prev, targetGroup: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="both">Both (All Users)</option>
                      <option value="farmer">Farmers Only</option>
                      <option value="seller">Sellers Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Alert Details / Body Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Write your broadcast announcement details..."
                      value={broadcast.message}
                      onChange={(e) => setBroadcast(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingBroadcast}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingBroadcast ? "Sending Broadcast..." : "Dispatch Broadcast"}</span>
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
export default AdminDashboard;
