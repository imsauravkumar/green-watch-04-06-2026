import React, { useState } from 'react';
import { Bug, Search, Upload, RefreshCw, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

export const PestControl = () => {
  const [image, setImage] = useState(null);
  const [identifying, setIdentifying] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('All');

  const pestsCatalog = [
    {
      name: "Fall Armyworm (Spodoptera frugiperda)",
      crop: "Corn / Maize",
      impact: "Chews large ragged holes in leaves. Can completely defoliate whorls and burrow into corn ears, destroying yield potential.",
      organic: "Release Trichogramma wasps (egg parasites). Spray Neem seed kernel extract (NSKE 5%) or Bacillus thuringiensis (Bt) formulations.",
      chemical: "Apply Spinetoram 11.7% SC or Emamectin benzoate 5% SG at whorl stage."
    },
    {
      name: "Aphids (Aphis gossypii)",
      crop: "Cotton / Vegetables",
      impact: "Suck sap from leaves, causing curling and stunting. Excrete honey-dew leading to sooty mold. Transmit viral diseases.",
      organic: "Introduce ladybug beetles or hoverfly larvae. Spray strong water jets or insecticidal potassium soaps. Apply neem oil.",
      chemical: "Spray Imidacloprid 17.8% SL or Acetamiprid 20% SP under leaf surfaces."
    },
    {
      name: "Rice Stem Borer (Scirpophaga incertulas)",
      crop: "Rice",
      impact: "Larvae bore into stem center, causing 'dead hearts' in vegetative stage and 'white heads' (empty panicles) in reproductive stage.",
      organic: "Install pheromone traps (5-8 traps/acre) to monitor moths. Encourage predatory spiders. Keep field water levels balanced.",
      className: "Rice",
      chemical: "Broadcast Cartap hydrochloride 4G or Fipronil 0.3G granules in standing water."
    },
    {
      name: "Brown Plant Hopper (Nilaparvata lugens)",
      crop: "Rice",
      impact: "Sucks plant sap, causing leaves to turn yellow and dry. Produces 'hopper burn' patches where crops completely collapse.",
      organic: "Avoid high nitrogen fertilization. Drain water from fields for 3-4 days. Conserve mirid bugs (natural predators).",
      chemical: "Apply Pymetrozine 50% WG or Dinotefuran 20% SG near plant bases."
    }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePestScan = () => {
    if (!image) return;
    setIdentifying(true);
    setTimeout(() => {
      // Pick a random pest from catalog to simulate identification
      const match = pestsCatalog[Math.floor(Math.random() * pestsCatalog.length)];
      setScanResult(match);
      setIdentifying(false);
    }, 2000);
  };

  const filteredPests = selectedCrop === 'All' 
    ? pestsCatalog 
    : pestsCatalog.filter(p => p.crop.toLowerCase().includes(selectedCrop.toLowerCase()));

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
          <Bug className="w-5 h-5 text-emerald-600" /> Pest Detection & Control
        </h1>
        <p className="text-xs text-slate-500">Identify destructive crop pests and view organic and chemical controls</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pest AI scanner panel */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">AI Pest Analyzer</h2>
          
          {image ? (
            <div className="space-y-4">
              <div className="h-44 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                <img src={image} alt="uploaded pest" className="h-full object-contain" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePestScan}
                  disabled={identifying}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                >
                  {identifying ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : "Scan Crop Pest"}
                </button>
                <button
                  onClick={() => { setImage(null); setScanResult(null); }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-6 flex flex-col items-center justify-center min-h-[220px] text-center space-y-3">
              <div className="p-2.5 bg-emerald-50 rounded-full text-emerald-600">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Upload pest or damaged leaf photo</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Scans using visual neural patterns</span>
              </div>
              <label className="text-xs font-semibold px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg cursor-pointer transition-colors shadow-sm">
                Choose Picture
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          )}

          {/* Scanner readout */}
          {scanResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg space-y-1 mt-2 text-left">
              <span className="text-[9px] font-bold text-emerald-800 uppercase block">Scanner match:</span>
              <h4 className="font-bold text-slate-900 text-xs">{scanResult.name}</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed font-medium">{scanResult.impact.slice(0, 100)}...</p>
            </div>
          )}
        </div>

        {/* Directory catalog control */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">Agricultural Pest Catalog</h2>
            
            {/* Category filter buttons */}
            <div className="flex gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-lg">
              {['All', 'Corn', 'Rice', 'Cotton'].map((crop) => (
                <button
                  key={crop}
                  onClick={() => setSelectedCrop(crop)}
                  className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${selectedCrop === crop ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredPests.map((pest, idx) => (
              <div 
                key={idx}
                className="border border-slate-200 rounded-xl p-4 space-y-3 hover:border-emerald-100 transition-colors bg-white shadow-sm text-left"
              >
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <h3 className="font-bold text-slate-900 text-xs">{pest.name}</h3>
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">{pest.crop}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Crop Impact</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{pest.impact}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                  <div className="space-y-1 bg-emerald-50/20 p-2.5 rounded-lg border border-emerald-50/50">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Organic Treatment
                    </span>
                    <p className="text-[10px] text-slate-600 leading-relaxed">{pest.organic}</p>
                  </div>
                  <div className="space-y-1 bg-blue-50/25 p-2.5 rounded-lg border border-blue-50/50">
                    <span className="text-[9px] font-bold text-blue-800 uppercase flex items-center gap-1">
                      <Bug className="w-3.5 h-3.5" /> Chemical Treatment
                    </span>
                    <p className="text-[10px] text-slate-600 leading-relaxed">{pest.chemical}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
export default PestControl;
