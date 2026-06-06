import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import { useTranslation } from '../hooks/useTranslation';
import {
  Store,
  Plus,
  Trash2,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Upload,
  Search,
  Users,
  Bell,
  Package,
  X,
  Edit3,
  RefreshCw,
  Mail,
  Phone,
  Clock,
  DollarSign
} from 'lucide-react';
import { Dialog } from '@headlessui/react';
import marketExchangeImg from '../assets/market_exchange.png';

export const Marketplace = () => {
  const { user, isSeller, isFarmer, isAdmin } = useAuth();
  const { t } = useTranslation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'my-listings', 'requests'

  const handleMarkAllAsSeen = async (productId) => {
    const token = localStorage.getItem('greenwatch_token');
    try {
      const res = await apiFetch(`/api/products/${productId}/buyers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProducts(); // Refresh listings to update count and seen badges
      }
    } catch (err) {
      console.error("Error marking requests as seen:", err);
    }
  };

  // Add Product form state
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', stock: '', description: '', image: ''
  });

  const [statusMessage, setStatusMessage] = useState(null);

  // Buy flow
  const [buyingProductId, setBuyingProductId] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerMobile, setBuyerMobile] = useState('');

  // Buyers modal
  const [viewingBuyers, setViewingBuyers] = useState(null); // { product, buyers[] }
  const [buyersLoading, setBuyersLoading] = useState(false);

  // Stock update
  const [updatingStockId, setUpdatingStockId] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [stockUpdating, setStockUpdating] = useState(false);

  const myUserId = (user?.uid || user?.id || user?._id?.toString() || '').toString();

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    if (buyingProductId && user) {
      setBuyerName(user.name || user.displayName || '');
      setBuyerEmail(user.email || '');
      setBuyerMobile(user.mobile || user.phone || '');
    }
  }, [buyingProductId, user]);

  const fetchProducts = async () => {
    setLoading(true);
    const token = localStorage.getItem('greenwatch_token');
    try {
      const res = await apiFetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoading(false);
    }
  };

  // Notification badge: count unread buy requests across all seller's own products
  const unreadRequestCount = products
    .filter(p => (p.sellerId || '').toString() === myUserId)
    .reduce((sum, p) => sum + (p.buyRequests?.filter(r => !r.seen).length || 0), 0);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: t('imageLimitNote') });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setNewProduct(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    const token = localStorage.getItem('greenwatch_token');
    try {
      const res = await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: t('prodAddedSuccess') });
        setNewProduct({ name: '', price: '', stock: '', description: '', image: '' });
        setShowAddForm(false);
        fetchProducts();
      } else {
        setStatusMessage({ type: 'error', text: data.message || t('prodAddedFailed') });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: t('connError') });
    }
  };

  const handleBuyProduct = async (productId) => {
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerMobile.trim()) {
      setStatusMessage({ type: 'error', text: "Please fill in all buyer detail fields." });
      return;
    }
    setStatusMessage(null);
    const token = localStorage.getItem('greenwatch_token');
    try {
      const res = await apiFetch(`/api/products/${productId}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quantity: buyQuantity, buyerName, buyerEmail, buyerMobile })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: t('buyReqSentSuccess') || "Buy request sent to seller successfully!" });
        setBuyingProductId(null);
        setBuyQuantity(1);
        setBuyerName(''); setBuyerEmail(''); setBuyerMobile('');
        fetchProducts();
      } else {
        setStatusMessage({ type: 'error', text: data.message || t('purchaseFailed') });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: t('connError') });
    }
  };

  const handleDeleteListing = async (productId) => {
    if (!window.confirm("Remove this product listing?")) return;
    const token = localStorage.getItem('greenwatch_token');
    try {
      const res = await apiFetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusMessage({ type: 'success', text: t('prodRemovedSuccess') });
        fetchProducts();
      } else {
        const data = await res.json();
        setStatusMessage({ type: 'error', text: data.message || t('prodRemovedFailed') });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: t('connError') });
    }
  };

  const handleViewBuyers = async (product) => {
    setBuyersLoading(true);
    setViewingBuyers({ product, buyers: [] });
    const token = localStorage.getItem('greenwatch_token');
    try {
      const res = await apiFetch(`/api/products/${product._id || product.id}/buyers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const buyers = await res.json();
        setViewingBuyers({ product, buyers });
        // Refresh products so the badge count updates (requests are now marked seen)
        fetchProducts();
      } else {
        setViewingBuyers(null);
        setStatusMessage({ type: 'error', text: "Could not load buyer requests." });
      }
    } catch (err) {
      setViewingBuyers(null);
      setStatusMessage({ type: 'error', text: t('connError') });
    } finally {
      setBuyersLoading(false);
    }
  };

  const handleUpdateStock = async (productId) => {
    const stock = parseInt(newStockValue);
    if (isNaN(stock) || stock < 0) {
      setStatusMessage({ type: 'error', text: "Please enter a valid stock number (0 or more)." });
      return;
    }
    setStockUpdating(true);
    const token = localStorage.getItem('greenwatch_token');
    try {
      const res = await apiFetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ stock })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Stock updated to ${stock}` });
        setUpdatingStockId(null);
        setNewStockValue('');
        fetchProducts();
      } else {
        setStatusMessage({ type: 'error', text: data.message || "Failed to update stock." });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: t('connError') });
    } finally {
      setStockUpdating(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const catalogProducts = isSeller
    ? filteredProducts.filter(p => (p.sellerId || '').toString() !== myUserId)
    : filteredProducts;

  const myInventoryProducts = filteredProducts.filter(p => (p.sellerId || '').toString() === myUserId);

  const myRequests = products
    .filter(p => (p.sellerId || '').toString() === myUserId)
    .flatMap(p => (p.buyRequests || []).map(r => ({ ...r, product: p })))
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">

      {/* Header Banner */}
      <div className="h-28 w-full rounded-2xl overflow-hidden relative shadow-md bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950">
        <img
          src={marketExchangeImg}
          alt="Marketplace"
          className="w-full h-full object-cover opacity-60 mix-blend-overlay animate-fade-in pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-center p-6 text-white animate-fade-in">
          <div className="flex items-center justify-between w-full text-white">
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6 text-emerald-400" />
              <h1 className="text-lg font-bold tracking-tight md:text-xl">Agriculture Market</h1>
              {isSeller && unreadRequestCount > 0 && (
                <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  <Bell className="w-2.5 h-2.5" />
                  {unreadRequestCount} new
                </span>
              )}
            </div>

            {/* Actions aligned on the far right (last) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={fetchProducts}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-lg transition-all shadow-sm cursor-pointer"
                title="Refresh Catalog"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {isSeller && activeTab === 'my-listings' && (
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/50 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> {showAddForm ? t('cancelListing') || 'Cancel' : t('addProductSale') || 'Add Product'}
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed md:text-sm">
            {t('marketplaceDesc') || 'Direct buyer-seller platform for crop harvests, farming tools & verified seeds.'}
          </p>
        </div>
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 max-w-xl ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          <span className="flex-1">{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)}><X className="w-3.5 h-3.5 opacity-50 hover:opacity-100" /></button>
        </div>
      )}

      {/* Redesigned Glassmorphic Tabs Bar */}
      {isSeller && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex bg-slate-900/5 border border-slate-200 p-1.5 rounded-xl gap-2 w-fit max-w-full overflow-x-auto">
            <button
              onClick={() => { setActiveTab('catalog'); setShowAddForm(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'bg-white text-emerald-850 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              {t('browseCatalog') || 'Browse Catalog'}
            </button>
            
            <button
              onClick={() => { setActiveTab('my-listings'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'my-listings'
                  ? 'bg-white text-emerald-850 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              {t('myInventory') || 'My Listings & Stock'}
            </button>

            <button
              onClick={() => { setActiveTab('requests'); setShowAddForm(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'requests'
                  ? 'bg-white text-emerald-850 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              {t('buyerRequests') || 'Buyer Requests'}
              {unreadRequestCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  {unreadRequestCount}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'my-listings' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm w-fit cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {showAddForm ? t('cancelListing') || 'Cancel' : t('addProductSale') || 'Add Product'}
            </button>
          )}
        </div>
      )}

      {/* Add Product Panel */}
      {showAddForm && isSeller && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-xl">
          <h3 className="font-bold text-slate-900 text-sm mb-4">{t('listNewProduct')}</h3>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t('productNameLabel')}</label>
                <input
                  type="text" required placeholder="E.g. Certified Wheat Seeds"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('priceLabel')}</label>
                  <input
                    type="number" required min="1" placeholder="Price"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('stockLabel')}</label>
                  <input
                    type="number" required min="1" placeholder="Qty"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('prodDescLabel')}</label>
              <textarea
                required rows={3} placeholder="Details of the product..."
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('prodPictureLabel')}</label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-xs overflow-hidden shrink-0 text-slate-400">
                  {newProduct.image ? <img src={newProduct.image} alt="Preview" className="h-full w-full object-cover" /> : <Upload className="w-5 h-5" />}
                </div>
                <div>
                  <label className="text-xs font-bold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer border border-slate-200 transition-colors">
                    {t('uploadImageBtn')}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <span className="text-[10px] text-slate-400 block mt-1">{t('imageLimitNote')}</span>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-sm">
              {t('postListingBtn')}
            </button>
          </form>
        </div>
      )}

      {/* Search bar */}
      {activeTab !== 'requests' && (
        <div className="flex items-center bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          <span className="text-xs text-slate-400">{t('loadingCatalog')}</span>
        </div>
      ) : activeTab === 'requests' ? (
        /* ── Buyer Requests Inbox ── */
        <div className="space-y-4 max-w-4xl">
          {myRequests.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm">
              <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-400">No buyer requests yet</p>
              <p className="text-xs text-slate-300 mt-1">When buyers request your products, they will show up here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRequests.map((req, idx) => {
                const pid = req.product._id || req.product.id;
                return (
                  <div
                    key={idx}
                    className={`bg-white border rounded-xl p-5 shadow-sm transition-all hover:shadow-md relative flex flex-col justify-between ${!req.seen ? 'border-emerald-300 ring-1 ring-emerald-250 bg-emerald-50/10' : 'border-slate-200'}`}
                  >
                    {!req.seen && (
                      <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    )}

                    <div className="space-y-4">
                      {/* Product header */}
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-2xl overflow-hidden">
                          {req.product.image ? <img src={req.product.image} alt={req.product.name} className="h-full w-full object-cover" /> : "🌾"}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-xs line-clamp-1">{req.product.name}</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Qty: <span className="font-bold text-slate-800">{req.quantity}</span> • Total: <span className="font-black text-emerald-700">₹{req.quantity * req.product.price}</span></p>
                        </div>
                      </div>

                      {/* Buyer Details */}
                      <div className="space-y-2.5 text-xs text-slate-700">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Buyer Name</span>
                          <span className="font-bold text-slate-950 block mt-0.5">{req.buyerName}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                            <a href={`mailto:${req.buyerEmail}`} className="text-blue-600 font-semibold hover:underline flex items-center gap-1.5 mt-1 truncate">
                              <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {req.buyerEmail}
                            </a>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Number</span>
                            <a href={`tel:${req.buyerMobile}`} className="text-emerald-700 font-semibold hover:underline flex items-center gap-1.5 mt-1 truncate">
                              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {req.buyerMobile}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(req.requestedAt).toLocaleString()}
                      </span>
                      {!req.seen && (
                        <button
                          onClick={() => handleMarkAllAsSeen(pid)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-md transition-colors"
                        >
                          Mark as Seen
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── Product Catalog & Inventory grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'my-listings' ? myInventoryProducts : catalogProducts).length === 0 ? (
            activeTab === 'my-listings' ? (
              <div className="col-span-full text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center space-y-4">
                <Package className="w-12 h-12 text-slate-300" />
                <div>
                  <p className="text-sm font-bold text-slate-700">No listings found</p>
                  <p className="text-xs text-slate-400 mt-1">You haven't listed any products for sale yet.</p>
                </div>
                {isSeller && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Product for Sale
                  </button>
                )}
              </div>
            ) : (
              <div className="col-span-full text-center py-20 text-slate-400 text-xs">
                {t('noProductsFound')}
              </div>
            )
          ) : (
            (activeTab === 'my-listings' ? myInventoryProducts : catalogProducts).map((p) => {
              const pid = p._id || p.id;
              const isOwner = (p.sellerId || '').toString() === myUserId;
              const isOutOfStock = p.stock === 0;
              const unreadForProduct = p.buyRequests?.filter(r => !r.seen).length || 0;

              return (
                <div
                  key={pid}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-300/50 transition-all duration-300 flex flex-col relative group ${isOutOfStock ? 'border-red-100' : 'border-slate-200'}`}
                >
                  {/* Out of Stock overlay badge */}
                  {isOutOfStock && (
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      Out of Stock
                    </div>
                  )}

                  {/* Unread badge for seller */}
                  {isOwner && unreadForProduct > 0 && (
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-bounce">
                      {unreadForProduct}
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="h-44 bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100 relative text-3xl">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                      />
                    ) : (
                      <span className={`group-hover:scale-110 transition-transform duration-500 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}>🌾</span>
                    )}

                    {/* Floating Price Pill */}
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-emerald-400 font-extrabold text-xs rounded-full shadow-sm flex items-center gap-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">₹</span>{p.price}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col space-y-2.5">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-700 transition-colors truncate">{p.name}</h3>

                    <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed flex-1 font-medium">
                      {p.description}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold pt-2.5 border-t border-slate-100">
                      <span className="truncate max-w-[120px]">
                        👤 {p.sellerName} {isOwner && <span className="text-emerald-600 font-bold">({t('youLabel') || 'You'})</span>}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-extrabold border ${isOutOfStock ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        {isOutOfStock ? (t('outOfStock') || 'Out of Stock') : `${p.stock} left`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
                    {isOwner ? (
                      /* ── SELLER / OWNER VIEW ── */
                      <>
                        {/* View Buyers button with unread count */}
                        <button
                          onClick={() => handleViewBuyers(p)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Users className="w-3.5 h-3.5" />
                          {t('viewBuyersBtn') || 'View Buyers'}
                          {unreadForProduct > 0 && (
                            <span className="bg-red-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                              {unreadForProduct} new
                            </span>
                          )}
                        </button>

                        {/* Update Stock */}
                        {updatingStockId === pid ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number" min="0"
                              value={newStockValue}
                              onChange={e => setNewStockValue(e.target.value)}
                              placeholder="New qty"
                              className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateStock(pid)}
                              disabled={stockUpdating}
                              className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                            >
                              {stockUpdating ? '...' : 'Save'}
                            </button>
                            <button
                              onClick={() => { setUpdatingStockId(null); setNewStockValue(''); }}
                              className="text-xs px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setUpdatingStockId(pid); setNewStockValue(String(p.stock)); }}
                            className="w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Update Stock {isOutOfStock && <span className="text-red-500 text-[10px]">(Out of stock)</span>}
                          </button>
                        )}

                        {/* Delete own listing */}
                        <button
                          onClick={() => handleDeleteListing(pid)}
                          className={`w-full text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${isOutOfStock ? 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent'}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {isOutOfStock ? 'Remove Out-of-Stock Listing' : 'Remove Listing'}
                        </button>
                      </>
                    ) : buyingProductId === pid ? (
                      /* ── BUY FORM (Buyer filling details) ── */
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-0.5">{t('buyerNameLabel') || "Your Name"}</label>
                          <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none" required />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-0.5">{t('buyerEmailLabel') || "Your Email"}</label>
                          <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none" required />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-0.5">{t('buyerMobileLabel') || "Mobile Number"}</label>
                          <input type="text" value={buyerMobile} onChange={e => setBuyerMobile(e.target.value)} className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none" required />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-0.5">{t('quantityLabel') || "Quantity"}</label>
                          <input type="number" min="1" max={p.stock} value={buyQuantity} onChange={e => setBuyQuantity(parseInt(e.target.value))} className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none text-center font-bold" />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button onClick={() => handleBuyProduct(pid)} disabled={isOutOfStock} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50">
                            {t('confirmBtn') || 'Send Request'}
                          </button>
                          <button onClick={() => setBuyingProductId(null)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors">
                            {t('cancel') || 'Cancel'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── DEFAULT VIEW (non-owner, not in buy flow) ── */
                      <>
                        {isOutOfStock ? (
                          <div className="w-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5">
                            <Package className="w-3.5 h-3.5" />
                            Out of Stock
                          </div>
                        ) : (
                          <button
                            onClick={() => { setBuyingProductId(pid); setBuyQuantity(1); }}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            {t('buyDirectlyBtn') || 'Request to Buy'}
                          </button>
                        )}

                        {/* Admin: delete any product (highlighted if out of stock) */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteListing(pid)}
                            className={`w-full text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${isOutOfStock ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {isOutOfStock ? '⚠ Remove Out-of-Stock' : 'Admin: Remove'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Buyers Modal ── */}
      {viewingBuyers && (
        <Dialog open={true} onClose={() => setViewingBuyers(null)} className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-40" />
            <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Dialog.Title className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Buyer Requests
                  </Dialog.Title>
                  <p className="text-xs text-slate-500 mt-0.5">for: <span className="font-semibold text-slate-700">{viewingBuyers.product.name}</span></p>
                </div>
                <button onClick={() => setViewingBuyers(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {buyersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                </div>
              ) : viewingBuyers.buyers.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">{t('noBuyRequests') || 'No buyer requests yet.'}</p>
                  <p className="text-xs text-slate-300 mt-1">When buyers request your product, they'll appear here.</p>
                </div>
              ) : (
                <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {viewingBuyers.buyers.map((b, idx) => (
                    <li key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-slate-900">{b.buyerName}</p>
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                          Qty: {b.quantity}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <span className="text-slate-400">📧</span>
                          <a href={`mailto:${b.buyerEmail}`} className="text-blue-600 hover:underline">{b.buyerEmail}</a>
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <span className="text-slate-400">📱</span>
                          <a href={`tel:${b.buyerMobile}`} className="text-blue-600 hover:underline">{b.buyerMobile}</a>
                        </p>
                        {b.requestedAt && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span>🕐</span>
                            {new Date(b.requestedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => setViewingBuyers(null)}
                className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2.5 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
      )}

    </div>
  );
};

export default Marketplace;
