import React, { useState } from 'react';
import { Compass, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const FertilizerRecommendation = () => {
  const { t } = useTranslation();
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
      const { crop, nitrogen, potassium } = formData;
      const n = parseInt(nitrogen) || 0;
      const k = parseInt(potassium) || 0;

      let recommendation = null;

      if (crop === 'Wheat') {
        recommendation = {
          name: t('fertWheatName'),
          quantity: t('fertWheatQty'),
          schedule: t('fertWheatSched'),
          reason: t('fertWheatReason').replace('{n}', n)
        };
      } else if (crop === 'Paddy') {
        recommendation = {
          name: t('fertPaddyName'),
          quantity: t('fertPaddyQty'),
          schedule: t('fertPaddySched'),
          reason: t('fertPaddyReason').replace('{k}', k)
        };
      } else if (crop === 'Cotton') {
        recommendation = {
          name: t('fertCottonName'),
          quantity: t('fertCottonQty'),
          schedule: t('fertCottonSched'),
          reason: t('fertCottonReason')
        };
      } else {
        recommendation = {
          name: t('fertDefaultName'),
          quantity: t('fertDefaultQty'),
          schedule: t('fertDefaultSched'),
          reason: t('fertDefaultReason')
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
          <Compass className="w-5 h-5 text-emerald-600" /> {t('fertilizerTitle')}
        </h1>
        <p className="text-xs text-slate-500">{t('fertilizerDesc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form Panel */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 mb-4">{t('inputCropProperties')}</h2>
          
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('targetCrop')}</label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleInputChange}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Wheat">{t('cropWheat').split(' ')[0]}</option>
                <option value="Paddy">{t('cropPaddy').split(' ')[0]}</option>
                <option value="Cotton">{t('cropCotton').split(' ')[0]}</option>
                <option value="Sugarcane">{t('fertilizers')}</option>
                <option value="Maize">{t('cropMaize').split(' ')[0]}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('soilClassType')}</label>
              <select
                name="soilType"
                value={formData.soilType}
                onChange={handleInputChange}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Loamy">{t('soilLoamy')}</option>
                <option value="Clay">{t('soilClay')}</option>
                <option value="Sandy">{t('soilSandy')}</option>
                <option value="Black">{t('soilBlack')}</option>
              </select>
            </div>

            {/* NPK parameters */}
            <div className="space-y-3 border-t border-slate-100 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('macronutrientAnalysis')}</span>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{t('nitrogen')}</label>
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
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{t('phosphorus')}</label>
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
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">{t('potassium')}</label>
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
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('calculateDosage')}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 mb-4">{t('calculatedDosageReport')}</h2>
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              <span className="text-xs text-slate-400">{t('computingFertilizer')}</span>
            </div>
          ) : result ? (
            <div className="space-y-4">
              
              {/* Rec Name */}
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800">
                <CheckCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-bold text-xs">{t('recommendedLabel')}: {result.name}</h3>
                  <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{t('doseLabel')}: {result.quantity}</p>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('appSchedule')}</span>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">{result.schedule}</p>
              </div>

              {/* Rationale */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('nutrientRationale')}</span>
                <p className="text-[11px] text-slate-600 leading-relaxed italic">{result.reason}</p>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-20">
              {t('selectCropPrompt')}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default FertilizerRecommendation;
