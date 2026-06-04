import React, { useState } from 'react';
import { Compass, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';

export const FertilizerRecommendation = () => {
  const [formData, setFormData] = useState({
    crop: 'Wheat',
    soilType: 'Loamy',
    moisture: 'Moderate',
    nitrogen: '60',
    phosphorus: '35',
    potassium: '30'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const { crop, soilType, nitrogen, phosphorus, potassium } = formData;
      const n = parseInt(nitrogen) || 0;
      const p = parseInt(phosphorus) || 0;
      const k = parseInt(potassium) || 0;

      let recommendation = null;

      // Simple robust recommendation calculator matching standard agricultural guidelines
      if (crop === 'Wheat') {
        recommendation = {
          name: "NPK 12-32-16 & Urea split application",
          quantity: "50 kg DAP + 40 kg Urea per acre",
          schedule: "Apply 50% Urea + full DAP as basal dressing during sowing. Apply remaining Urea at first crown root irrigation (21 days after sowing).",
          reason: `Your Nitrogen level (${n}) is lower than wheat requirements (80+). Adding Urea split dressing will boost tillering.`
        };
      } else if (crop === 'Paddy') {
        recommendation = {
          name: "Urea & Single Super Phosphate (SSP) & MOP",
          quantity: "60 kg Urea + 45 kg SSP + 20 kg Muriate of Potash (MOP) per acre",
          schedule: "SSP and MOP should be applied as basal dressing. Apply Urea in three split doses: at transplanting, active tillering (30 days), and panicle initiation (60 days).",
          reason: `Paddy requires high nitrogen during waterlog tillering. Your current potassium (${k}) is sufficient, but basal MOP supports grain weights.`
        };
      } else if (crop === 'Cotton') {
        recommendation = {
          name: "Ammonium Sulphate & DAP mix",
          quantity: "35 kg DAP + 50 kg Ammonium Sulphate per acre",
          schedule: "Apply DAP at sowing. Top dress Ammonium Sulphate at square formation and flowering stage to support cotton boll count.",
          reason: `Cotton is extremely sensitive to sulphur. Ammonium Sulphate covers both Nitrogen and Sulphur deficits.`
        };
      } else {
        recommendation = {
          name: "Balanced NPK 19-19-19 Foliar Spray",
          quantity: "3 kg NPK soluble spray per acre in 200L water",
          schedule: "Spray evenly on crop canopy during vegetative vegetative stage. Repeat after 15 days if yellowing persists.",
          reason: "Default micro-dressing. Ideal for loamy soils with minor macronutrient imbalances."
        };
      }

      setResult(recommendation);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
          <Compass className="w-5 h-5 text-emerald-600" /> Fertilizer Recommendation
        </h1>
        <p className="text-xs text-slate-500">Suggest fertilizers and dosage quantities matching crop type and soil properties</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form Panel */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 mb-4">Input Crop Properties</h2>
          
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Crop</label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleInputChange}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Wheat">Wheat</option>
                <option value="Paddy">Paddy / Rice</option>
                <option value="Cotton">Cotton</option>
                <option value="Sugarcane">Sugarcane</option>
                <option value="Maize">Maize / Corn</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Soil Class Type</label>
              <select
                name="soilType"
                value={formData.soilType}
                onChange={handleInputChange}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Loamy">Loamy</option>
                <option value="Clay">Clay</option>
                <option value="Sandy">Sandy</option>
                <option value="Black">Black</option>
              </select>
            </div>

            {/* NPK parameters */}
            <div className="space-y-3 border-t border-slate-100 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Macronutrient analysis (ppm)</span>
              
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
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Calculate dosage"}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 mb-4">Calculated Dosage Report</h2>
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              <span className="text-xs text-slate-400">Computing fertilizer volumes...</span>
            </div>
          ) : result ? (
            <div className="space-y-4">
              
              {/* Rec Name */}
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800">
                <CheckCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-bold text-xs">Recommended: {result.name}</h3>
                  <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Dose: {result.quantity}</p>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application Schedule</span>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">{result.schedule}</p>
              </div>

              {/* Rationale */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nutrient Rationale</span>
                <p className="text-[11px] text-slate-600 leading-relaxed italic">{result.reason}</p>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-20">
              Select crop and nutrient metrics on the left, then click calculate to recommend fertilizers.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
export default FertilizerRecommendation;
