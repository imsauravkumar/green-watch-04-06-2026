import React, { useState } from 'react';
import { Sprout, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';

export const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    soilType: 'Loamy',
    season: 'Rabi (Winter)',
    climate: 'Moderate',
    nitrogen: '50',
    phosphorus: '40',
    potassium: '40'
  });
  
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    setLoading(true);
    setRecommendations(null);

    setTimeout(() => {
      // Crop Recommendation logic based on inputs
      const { soilType, season, climate, nitrogen, phosphorus, potassium } = formData;
      const n = parseInt(nitrogen) || 0;
      const p = parseInt(phosphorus) || 0;
      const k = parseInt(potassium) || 0;

      let cropList = [];

      if (season.includes('Rabi') && soilType === 'Loamy') {
        cropList = [
          { name: "Wheat (Triticum aestivum)", confidence: "95%", water: "Low to Moderate", duration: "120-140 Days", description: "Wheat thrives in cool temperatures and well-drained loamy soils. Your NPK ratio matches optimal growth metrics." },
          { name: "Mustard (Brassica nigra)", confidence: "82%", water: "Low", duration: "110 Days", description: "Excellent secondary crop for dry Rabi winter. Low moisture requirements." }
        ];
      } else if (season.includes('Kharif') && (soilType === 'Clay' || soilType === 'Loamy')) {
        cropList = [
          { name: "Paddy/Rice (Oryza sativa)", confidence: "92%", water: "High (Flooded)", duration: "150 Days", description: "Clay soils hold water exceptionally well, making it ideal for flooded paddy fields during the hot monsoon season." },
          { name: "Maize/Corn (Zea mays)", confidence: "78%", water: "Moderate", duration: "90-110 Days", description: "Requires warmth and high nitrogen soils. Ensure proper field drainage to avoid root rot." }
        ];
      } else if (soilType === 'Black' || climate === 'Hot') {
        cropList = [
          { name: "Cotton (Gossypium hirsutum)", confidence: "90%", water: "Moderate", duration: "180 Days", description: "Black soil (Regur) holds moisture and minerals perfectly. High temperatures during boll development will maximize yield." },
          { name: "Soybean (Glycine max)", confidence: "75%", water: "Moderate", duration: "100-120 Days", description: "Black loamy soil provides adequate trace elements. Fixes atmospheric nitrogen, restoring soil health." }
        ];
      } else {
        cropList = [
          { name: "Millets (Ragi/Bajra)", confidence: "88%", water: "Very Low", duration: "90 Days", description: "Extremely resilient crop that survives in poor nutrient soils (low NPK) and hot, semi-arid climates." },
          { name: "Chickpeas/Gram (Cicer arietinum)", confidence: "80%", water: "Low", duration: "110-120 Days", description: "Pulse crop suitable for loamy/sandy soils. Requires cool weather during vegetative growth and high potassium." }
        ];
      }

      setRecommendations(cropList);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
          <Sprout className="w-5 h-5 text-emerald-600" /> Crop Recommendation System
        </h1>
        <p className="text-xs text-slate-500">Recommend optimal crops based on soil composition, season, and atmospheric conditions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form Panel */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 mb-4">Soil & Season Parameters</h2>
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Soil Class Type</label>
              <select
                name="soilType"
                value={formData.soilType}
                onChange={handleInputChange}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Loamy">Loamy (Balanced Sand/Clay)</option>
                <option value="Clay">Clay (Holds Water)</option>
                <option value="Sandy">Sandy (High Drainage)</option>
                <option value="Black">Black (Clay-rich Regur)</option>
                <option value="Alluvial">Alluvial (River Basin Silt)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Crop Sowing Season</label>
              <select
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Rabi (Winter)">Rabi (October - March)</option>
                <option value="Kharif (Monsoon)">Kharif (June - October)</option>
                <option value="Zaid (Summer)">Zaid (March - June)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Climate Profile</label>
              <select
                name="climate"
                value={formData.climate}
                onChange={handleInputChange}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Moderate">Moderate (Warm & Humid)</option>
                <option value="Cool">Cool & Dry</option>
                <option value="Hot">Hot & Arid</option>
              </select>
            </div>

            {/* NPK Inputs */}
            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">NPK soil chemistry (mg/kg)</span>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nitrogen (N)</label>
                  <input
                    type="number"
                    name="nitrogen"
                    min="0"
                    max="150"
                    value={formData.nitrogen}
                    onChange={handleInputChange}
                    className="w-full text-xs px-2 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Phosphor (P)</label>
                  <input
                    type="number"
                    name="phosphorus"
                    min="0"
                    max="150"
                    value={formData.phosphorus}
                    onChange={handleInputChange}
                    className="w-full text-xs px-2 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Potassium (K)</label>
                  <input
                    type="number"
                    name="potassium"
                    min="0"
                    max="150"
                    value={formData.potassium}
                    onChange={handleInputChange}
                    className="w-full text-xs px-2 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Recommend optimal Crops"}
            </button>

          </form>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 mb-4">Recommended Crop Options</h2>
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              <span className="text-xs text-slate-400">Running agricultural affinity algorithms...</span>
            </div>
          ) : recommendations ? (
            <div className="space-y-4">
              {recommendations.map((crop, idx) => (
                <div 
                  key={idx}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:border-emerald-100 hover:bg-white transition-all space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {crop.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Confidence match score: <span className="font-bold text-emerald-700">{crop.confidence}</span></p>
                    </div>

                    <div className="flex gap-2">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                        Water: {crop.water}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                        Cycle: {crop.duration}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {crop.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-20">
              Fill in soil nutrient properties on the left, and click analyze to recommend crops.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
export default CropRecommendation;
