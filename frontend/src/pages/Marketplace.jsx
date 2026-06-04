import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Store, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  AlertCircle, 
  CheckCircle2, 
  Upload,
  Search,
  ChevronDown
} from 'lucide-react';

export const Marketplace = () => {
  const { user, isSeller, isFarmer } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    image: ''
  });
  
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success'|'error', text: '' }
  const [buyingProductId, setBuyingProductId] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const token = localStorage.getItem('greenwatch_token');
    try {
      const res = await fetch('/api/products', {
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Product picture must be less than 1.5MB' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    const token = localStorage.getItem('greenwatch_token');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Product listing added successfully!' });
        setNewProduct({ name: '', price: '', stock: '', description: '', image: '' });
        setShowAddForm(false);
        fetchProducts(); // Refresh list
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to add listing' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Server connection error' });
    }
  };

  const handleBuyProduct = async (productId) => {
    setStatusMessage(null);
    const token = localStorage.getItem('greenwatch_token');

    try {
      const res = await fetch(`/api/products/${productId}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: buyQuantity })
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Successfully purchased ${buyQuantity} items!` });
        setBuyingProductId(null);
        setBuyQuantity(1);
        fetchProducts(); // refresh stock numbers
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Purchase failed' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Server connection error' });
    }
  };

  const handleDeleteListing = async (productId) => {
    if (!window.confirm("Remove this product listing from marketplace?")) return;
    const token = localStorage.getItem('greenwatch_token');

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Listing removed successfully!' });
        fetchProducts();
      } else {
        const data = await res.json();
        setStatusMessage({ type: 'error', text: data.message || 'Failed to remove listing' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Server connection error' });
    }
  };

  const myUserId = user?.uid || user?.id || user?._id?.toString();

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            <Store className="w-5 h-5 text-emerald-600" /> Marketplace
          </h1>
          <p className="text-xs text-slate-500">Buy agricultural products from sellers, or list stock coordinates</p>
        </div>

        {/* Add Product Button (Seller only) */}
        {isSeller && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors self-start md:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" /> {showAddForm ? "Cancel Listing" : "Add Product for Sale"}
          </button>
        )}
      </div>

      {/* Success/Error Banners */}
      {statusMessage && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 max-w-xl ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Add Product Modal Panel */}
      {showAddForm && isSeller && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-xl">
          <h3 className="font-bold text-slate-900 text-sm mb-4">List New Agricultural Product</h3>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Product Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="E.g. Certified Wheat Seeds"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Price (₹) *</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    placeholder="Price"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Stock *</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    placeholder="Qty"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Product Description *</label>
              <textarea 
                required
                rows={3}
                placeholder="Details of chemical treatment, grain type, packaging size..."
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Product image uploader */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Product Picture</label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-xs overflow-hidden shrink-0 text-slate-400">
                  {newProduct.image ? <img src={newProduct.image} alt="Preview" className="h-full w-full object-cover" /> : <Upload className="w-5 h-5" />}
                </div>
                <div>
                  <label className="text-xs font-bold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer border border-slate-200 transition-colors">
                    Upload image
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>
                  <span className="text-[10px] text-slate-400 block mt-1">JPEG/PNG, max size 1.5MB</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Post Listing
            </button>
          </form>
        </div>
      )}

      {/* Search Filter bar */}
      <div className="flex items-center bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search crop seeds, fertilizers, tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          <span className="text-xs text-slate-400">Loading catalog...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400 text-xs">
              No products found in marketplace.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isOwner = p.sellerId === myUserId;
              return (
                <div 
                  key={p.id || p._id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow relative"
                >
                  {/* Product Picture */}
                  <div className="h-40 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100 text-3xl">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    ) : "🌾"}
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{p.name}</h3>
                      <span className="text-xs font-black text-slate-900">₹{p.price}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed flex-1">
                      {p.description}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-50">
                      <span>Seller: {p.sellerName} {isOwner && "(You)"}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${p.stock === 0 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                      </span>
                    </div>
                  </div>

                  {/* Actions Drawer */}
                  <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                    {isOwner ? (
                      <button
                        onClick={() => handleDeleteListing(p.id || p._id)}
                        className="w-full text-xs font-semibold py-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 rounded-lg flex items-center justify-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Listing
                      </button>
                    ) : (
                      isFarmer && (
                        buyingProductId === (p.id || p._id) ? (
                          <div className="w-full flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max={p.stock}
                              value={buyQuantity}
                              onChange={(e) => setBuyQuantity(parseInt(e.target.value))}
                              className="w-16 text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none text-center font-bold"
                            />
                            <button
                              onClick={() => handleBuyProduct(p.id || p._id)}
                              disabled={p.stock === 0}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setBuyingProductId(null)}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setBuyingProductId(p.id || p._id); setBuyQuantity(1); }}
                            disabled={p.stock === 0}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" /> Buy Directly
                          </button>
                        )
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
export default Marketplace;
