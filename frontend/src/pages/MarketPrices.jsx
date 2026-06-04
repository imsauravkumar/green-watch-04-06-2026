import React, { useState } from 'react';
import { TrendingUp, Search, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const MarketPrices = () => {
  const { t } = useTranslation();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const priceIndex = [
    { crop: "Wheat (Sonalika)", mandi: "New Delhi APMC", price: "2450", unit: "Quintal", change: "+1.2%", trend: "up", range: "2350 - 2500" },
    { crop: "Paddy (Basmati)", mandi: "Amritsar Mandi", price: "4100", unit: "Quintal", change: "-0.5%", trend: "down", range: "4000 - 4250" },
    { crop: "Mustard Seeds", mandi: "Jaipur APMC", price: "5650", unit: "Quintal", change: "+2.1%", trend: "up", range: "5400 - 5800" },
    { crop: "Onion (Nashik Red)", mandi: "Nashik APMC", price: "1900", unit: "Quintal", change: "+4.5%", trend: "up", range: "1700 - 2100" },
    { crop: "Potato (Jyoti)", mandi: "Agra APMC", price: "1250", unit: "Quintal", change: "-1.8%", trend: "down", range: "1150 - 1300" },
    { crop: "Cotton (Long Staple)", mandi: "Rajkot APMC", price: "7200", unit: "Quintal", change: "+0.8%", trend: "up", range: "7000 - 7350" }
  ];

  const filteredPrices = priceIndex.filter(p => {
    const matchesSearch = p.crop.toLowerCase().includes(filterQuery.toLowerCase()) || 
                          p.mandi.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                            (selectedCategory === 'Grains' && ["Wheat", "Paddy"].some(x => p.crop.includes(x))) ||
                            (selectedCategory === 'Oilseeds' && p.crop.includes("Mustard")) ||
                            (selectedCategory === 'Vegetables' && ["Onion", "Potato"].some(x => p.crop.includes(x)));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> {t('marketTitle')}
          </h1>
          <p className="text-xs text-slate-500">{t('marketDesc')}</p>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-lg">
          {[t('all'), t('grains'), t('oilseeds'), t('vegetables')].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${selectedCategory === cat ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Advisory Notification Alert */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-800 text-xs flex gap-3">
        <Info className="w-5 h-5 shrink-0 text-emerald-600" />
        <div className="space-y-1">
          <span className="font-bold">{t('sellingAdvisory')}</span>
          <p className="text-emerald-700 font-medium leading-relaxed">
            Mustard seed valuations in Jaipur APMC are showing continuous upwards momentum (+2.1%) due to supply contractions. Farmers are recommended to release ready stocks within the next 4 days.
          </p>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm max-w-md flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchCrop')}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Market Prices Table Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
              <tr>
                <th className="px-6 py-3.5 text-left">{t('cropVariety')}</th>
                <th className="px-6 py-3.5 text-left">{t('mandiLocation')}</th>
                <th className="px-6 py-3.5 text-left">{t('dailyPrice')}</th>
                <th className="px-6 py-3.5 text-left">{t('dailyChange')}</th>
                <th className="px-6 py-3.5 text-left">{t('weeklyRange')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">{t('noListings')}</td>
                </tr>
              ) : (
                filteredPrices.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5">
                      <span className="text-slate-900 font-semibold block">{p.crop}</span>
                      <span className="text-[9px] text-slate-400 font-normal mt-0.5 block">per {p.unit}</span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">{p.mandi}</td>
                    <td className="px-6 py-3.5 text-slate-900 font-bold text-sm">₹{p.price}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${p.trend === 'up' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {p.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {p.change}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 font-semibold">
                      ₹{p.range}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default MarketPrices;
