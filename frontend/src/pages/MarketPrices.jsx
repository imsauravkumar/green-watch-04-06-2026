import React, { useState } from 'react';
import { TrendingUp, Search, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import marketImg from '../assets/market.png';

export const MarketPrices = () => {
  const { t } = useTranslation();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState('Wheat (Gehu)');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const [historicalData] = useState(() => {
    const saved = localStorage.getItem('greenwatch_historical_prices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading saved market prices", e);
      }
    }
    return {
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
  });

  const cropConfig = {
    "Wheat (Gehu)": { mandi: "Ghaziabad Mandi", range: "2,550 – 2,600" },
    "Paddy (Common)": { mandi: "Hapur Mandi", range: "2,420 – 2,460" },
    "Paddy (Grade A)": { mandi: "Meerut Mandi", range: "2,440 – 2,480" },
    "Maize (Makka)": { mandi: "Bulandshahr Mandi", range: "2,400 – 2,450" },
    "Mustard (Sarson)": { mandi: "Aligarh Mandi", range: "6,100 – 6,250" },
    "Gram (Chana)": { mandi: "Agra Mandi", range: "5,800 – 5,950" },
    "Soybean": { mandi: "Indore Mandi", range: "4,850 – 4,950" },
    "Barley (Jau)": { mandi: "Muzaffarnagar Mandi", range: "2,120 – 2,180" },
    "Lentil (Masur)": { mandi: "Kanpur Mandi", range: "6,900 – 7,050" },
    "Bajra": { mandi: "Baghpat Mandi", range: "2,580 – 2,650" },
    "Jowar": { mandi: "Mathura Mandi", range: "3,300 – 3,380" },
    "Ragi": { mandi: "Lucknow Mandi", range: "3,850 – 3,950" },
    "Moong": { mandi: "Bareilly Mandi", range: "8,650 – 8,850" },
    "Cotton": { mandi: "Hisar Mandi", range: "8,200 – 8,400" },
    "Sugarcane": { mandi: "Saharanpur Mandi", range: "340 – 360" }
  };

  const getChangeAndTrend = (cropName, date) => {
    const datesChronological = [
      "28-May-2026", "29-May-2026", "30-May-2026", "31-May-2026", 
      "01-Jun-2026", "02-Jun-2026", "03-Jun-2026", "04-Jun-2026", 
      "05-Jun-2026", "06-Jun-2026"
    ];
    const currentIndex = datesChronological.indexOf(date);
    if (currentIndex <= 0) {
      return { change: "+0", trend: "up" };
    }
    const currentPrice = historicalData[date][cropName];
    const prevPrice = historicalData[datesChronological[currentIndex - 1]][cropName];
    const diff = currentPrice - prevPrice;
    if (diff > 0) {
      return { change: `+${diff}`, trend: "up" };
    } else if (diff < 0) {
      return { change: `${diff}`, trend: "down" };
    } else {
      return { change: "0", trend: "up" };
    }
  };

  const priceIndex = Object.keys(cropConfig).map(cropName => {
    const currentPrice = historicalData["06-Jun-2026"][cropName];
    const { change, trend } = getChangeAndTrend(cropName, "06-Jun-2026");
    return {
      crop: cropName,
      mandi: cropConfig[cropName].mandi,
      price: currentPrice.toLocaleString('en-IN'),
      unit: "Quintal",
      change: change,
      trend: trend,
      range: cropConfig[cropName].range
    };
  });

  const filteredPrices = priceIndex.filter(p => {
    const matchesSearch = p.crop.toLowerCase().includes(filterQuery.toLowerCase()) || 
                          p.mandi.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                            (selectedCategory === 'Grains' && ["Wheat", "Paddy", "Maize", "Bajra", "Jowar", "Ragi", "Barley"].some(x => p.crop.includes(x))) ||
                            (selectedCategory === 'Oilseeds' && ["Mustard", "Soybean"].some(x => p.crop.includes(x))) ||
                            (selectedCategory === 'Vegetables' && ["Gram", "Chana", "Lentil", "Masur", "Moong", "Cotton", "Sugarcane"].some(x => p.crop.includes(x)));
    return matchesSearch && matchesCategory;
  });

  const dates = [
    "28-May-2026", "29-May-2026", "30-May-2026", "31-May-2026", 
    "01-Jun-2026", "02-Jun-2026", "03-Jun-2026", "04-Jun-2026", 
    "05-Jun-2026", "06-Jun-2026"
  ];

  const prices = dates.map(d => historicalData[d][selectedCrop]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 10;
  
  const linePath = prices.map((p, i) => `${i === 0 ? 'M' : 'L'} ${30 + (i * 340 / 9)} ${140 - ((p - minPrice) / priceRange) * 100}`).join(' ');
  const areaPath = `${linePath} L 370 150 L 30 150 Z`;

  const firstPrice = historicalData["28-May-2026"][selectedCrop];
  const latestPrice = historicalData["06-Jun-2026"][selectedCrop];
  const totalChange = latestPrice - firstPrice;
  const totalChangePct = ((totalChange / firstPrice) * 100).toFixed(1);

  const isHi = t('appName') === "ग्रीन वॉच";
  const txtHistoricalTrend = isHi ? "फसल मूल्य इतिहास" : "Crop Price History";
  const txtSelectCrop = isHi ? "फसल चुनें:" : "Select Crop:";
  const txtClickRow = isHi ? "इतिहास देखने के लिए किसी फसल पर क्लिक करें" : "Click on any crop row to view history";
  const txtTenDayTrend = isHi ? "10-दिवसीय मूल्य रुझान" : "10-Day Price Trend";
  const txtLatestPrice = isHi ? "नवीनतम मूल्य" : "Latest Price";
  const txtTenDayChange = isHi ? "10-दिवसीय परिवर्तन" : "10-Day Change";
  const txtMandi = isHi ? "मंडी" : "Mandi";
  const txtDate = isHi ? "तारीख" : "Date";
  const txtPrice = isHi ? "मूल्य (₹)" : "Price (₹)";

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Header Banner */}
      <div className="min-h-[7rem] w-full rounded-2xl overflow-hidden relative shadow-md bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 flex items-center">
        <img
          src={marketImg}
          alt={t('marketTitle')}
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay animate-fade-in pointer-events-none"
        />
        <div className="relative z-10 w-full bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-center p-6 text-white animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <div>
              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                <h1 className="text-lg font-bold tracking-tight md:text-xl">{t('marketTitle')}</h1>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed md:text-sm">{t('marketDesc')}</p>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1 bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-xl shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
              {[t('all'), t('grains'), t('oilseeds'), t('vegetables')].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 md:text-sm shrink-0 ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Notification Alert */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-800 text-sm flex gap-3 shadow-sm">
        <Info className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-sm md:text-base">{t('sellingAdvisory')}</span>
          <p className="text-emerald-700 font-semibold leading-relaxed text-xs md:text-sm">
            Mustard seed valuations in Jaipur APMC are showing continuous upwards momentum (+2.1%) due to supply contractions. Farmers are recommended to release ready stocks within the next 4 days.
          </p>
        </div>
      </div>

      {/* Two Column Grid for Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Search & Latest Price Table */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchCrop')}
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Market Prices Table Grid */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-605">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-4 text-left">{t('cropVariety')}</th>
                    <th className="px-6 py-4 text-left">{t('mandiLocation')}</th>
                    <th className="px-6 py-4 text-left">{t('dailyPrice')}</th>
                    <th className="px-6 py-4 text-left">{t('dailyChange')}</th>
                    <th className="px-6 py-4 text-left">{t('weeklyRange')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredPrices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 font-semibold">{t('noListings')}</td>
                    </tr>
                  ) : (
                    filteredPrices.map((p, idx) => {
                      const isSelected = selectedCrop === p.crop;
                      return (
                        <tr 
                          key={idx} 
                          onClick={() => setSelectedCrop(p.crop)}
                          title={txtClickRow}
                          className={`hover:bg-emerald-50/30 cursor-pointer transition-all duration-150 ${isSelected ? 'bg-emerald-50/60 font-semibold' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <span className={`font-bold block text-xs ${isSelected ? 'text-emerald-700 font-extrabold' : 'text-slate-900'}`}>{p.crop}</span>
                            <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">per {p.unit}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-700 font-semibold">{p.mandi}</td>
                          <td className="px-6 py-4 text-slate-909 font-bold text-xs">₹{p.price}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-bold ${p.trend === 'up' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                              {p.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {p.change}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-605 font-bold text-xs">
                            ₹{p.range}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Historical Crop Price lookup */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{txtHistoricalTrend}</h2>
          </div>

          {/* Crop Selector Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400">{txtSelectCrop}</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
            >
              {Object.keys(cropConfig).map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>

          {/* Price details summary */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{txtLatestPrice}</span>
              <span className="text-xs font-black text-slate-900 mt-0.5 block">₹{latestPrice.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{txtMandi}: {cropConfig[selectedCrop].mandi}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{txtTenDayChange}</span>
              <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold mt-1 px-2.5 py-1 rounded ${totalChange >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {totalChange >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {totalChange >= 0 ? `+${totalChange}` : totalChange} ({totalChangePct}%)
              </span>
            </div>
          </div>

          {/* SVG Sparkline Chart */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 relative">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">{txtTenDayTrend}</span>
            
            <div className="w-full relative h-[140px]">
              <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal guidelines */}
                <line x1="30" y1="30" x2="370" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="80" x2="370" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="130" x2="370" y2="130" stroke="#e2e8f0" strokeWidth="1" />
                
                {/* Y-axis text */}
                <text x="25" y="34" className="text-[10px] fill-slate-500 font-bold" textAnchor="end">₹{maxPrice}</text>
                <text x="25" y="134" className="text-[10px] fill-slate-500 font-bold" textAnchor="end">₹{minPrice}</text>
                
                {/* Area path */}
                <path d={areaPath} fill="url(#chartGrad)" />
                {/* Line path */}
                <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Interactive Points */}
                {prices.map((p, i) => {
                  const cx = 30 + (i * 340 / 9);
                  const cy = 130 - ((p - minPrice) / (maxPrice - minPrice || 1)) * 100;
                  const isHovered = hoveredIndex === i;
                  return (
                    <g 
                      key={i} 
                      onMouseEnter={() => setHoveredIndex(i)} 
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="cursor-pointer"
                    >
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={isHovered ? 6 : 4} 
                        className={`fill-emerald-500 stroke-white stroke-2 transition-all duration-150`} 
                      />
                    </g>
                  );
                })}
              </svg>
              
              {/* Tooltip */}
              {hoveredIndex !== null && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2.5 py-1 rounded shadow-md pointer-events-none flex items-center gap-1.5 font-bold z-10">
                  <span>{dates[hoveredIndex].slice(0, 6)}:</span>
                  <span className="text-emerald-400 font-extrabold">₹{prices[hoveredIndex]}</span>
                </div>
              )}
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-between text-[10px] font-bold text-slate-400 px-[30px] -mt-1">
              <span>28-May</span>
              <span>01-Jun</span>
              <span>06-Jun</span>
            </div>
          </div>

          {/* List of 10-day prices */}
          <div className="max-h-[200px] overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-100">
            <div className="grid grid-cols-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider p-2.5 px-3 sticky top-0">
              <span>{txtDate}</span>
              <span className="text-right">{txtPrice}</span>
              <span className="text-right">{t('dailyChange')}</span>
            </div>
            
            {[...dates].reverse().map((date) => {
              const price = historicalData[date][selectedCrop];
              const { change, trend } = getChangeAndTrend(selectedCrop, date);
              return (
                <div key={date} className="grid grid-cols-3 text-[11px] p-2.5 px-3 items-center hover:bg-slate-50/50">
                  <span className="font-semibold text-slate-600">{date}</span>
                  <span className="text-right font-bold text-slate-800">₹{price.toLocaleString('en-IN')}</span>
                  <span className="text-right">
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {trend === 'up' ? '+' : ''}{change}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default MarketPrices;
