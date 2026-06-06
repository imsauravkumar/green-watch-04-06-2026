import React, { useState } from 'react';
import { Sprout, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import cropRecImg from '../assets/crop_rec.png';

export const CropRecommendation = () => {
  const { t, locale } = useTranslation();
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
      const { soilType, season, climate } = formData;

      let cropList = [];

      if (season.includes('Rabi') && soilType === 'Loamy') {
        cropList = [
          { name: t('cropWheat'), confidence: "95%", water: t('soilLoamy'), duration: "120-140 " + (locale === 'hi' ? "दिन" : locale === 'pb' ? "ਦਿਨ" : "Days"), description: t('wheatDesc') },
          { name: t('cropMustard'), confidence: "82%", water: t('soilLoamy'), duration: "110 " + (locale === 'hi' ? "दिन" : locale === 'pb' ? "ਦਿਨ" : "Days"), description: t('mustardDesc') }
        ];
      } else if (season.includes('Kharif') && (soilType === 'Clay' || soilType === 'Loamy')) {
        cropList = [
          { name: t('cropPaddy'), confidence: "92%", water: t('soilClay'), duration: "150 " + (locale === 'hi' ? "दिन" : locale === 'pb' ? "ਦਿਨ" : "Days"), description: t('paddyDesc') },
          { name: t('cropMaize'), confidence: "78%", water: t('soilLoamy'), duration: "90-110 " + (locale === 'hi' ? "दिन" : locale === 'pb' ? "ਦਿਨ" : "Days"), description: t('maizeDesc') }
        ];
      } else if (soilType === 'Black' || climate === 'Hot') {
        cropList = [
          { name: t('cropCotton'), confidence: "90%", water: t('soilBlack'), duration: "180 " + (locale === 'hi' ? "दिन" : locale === 'pb' ? "ਦਿਨ" : "Days"), description: t('cottonDesc') },
          { name: t('cropSoybean'), confidence: "75%", water: t('soilLoamy'), duration: "100-120 " + (locale === 'hi' ? "दिन" : locale === 'pb' ? "ਦਿਨ" : "Days"), description: t('soybeanDesc') }
        ];
      } else {
        cropList = [
          { name: t('cropMillets'), confidence: "88%", water: t('soilSandy'), duration: "90 " + (locale === 'hi' ? "दिन" : locale === 'pb' ? "ਦਿਨ" : "Days"), description: t('milletsDesc') },
          { name: t('cropChickpeas'), confidence: "80%", water: t('soilLoamy'), duration: "110-120 " + (locale === 'hi' ? "दिन" : locale === 'pb' ? "ਦਿਨ" : "Days"), description: t('chickpeasDesc') }
        ];
      }

      setRecommendations(cropList);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Header Banner */}
      <div className="h-28 w-full rounded-2xl overflow-hidden relative shadow-md bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950">
        <img
          src={cropRecImg}
          alt={t('cropRecTitle')}
          className="w-full h-full object-cover opacity-60 mix-blend-overlay animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-center p-6 text-white animate-fade-in">
          <div className="flex items-center gap-2 text-white">
            <Sprout className="w-6 h-6 text-emerald-400" />
            <h1 className="text-lg font-bold tracking-tight md:text-xl">{t('cropRecTitle')}</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed md:text-sm">{t('cropRecDesc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form Panel */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 mb-4">{t('soilSeasonParams')}</h2>
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            
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
                <option value="Alluvial">{t('soilAlluvial')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('cropSowingSeason')}</label>
              <select
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Rabi (Winter)">{t('seasonRabi')}</option>
                <option value="Kharif (Monsoon)">{t('seasonKharif')}</option>
                <option value="Zaid (Summer)">{t('seasonZaid')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">{t('climateProfile')}</label>
              <select
                name="climate"
                value={formData.climate}
                onChange={handleInputChange}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Moderate">{t('climateModerate')}</option>
                <option value="Cool">{t('climateCool')}</option>
                <option value="Hot">{t('climateHot')}</option>
              </select>
            </div>

            {/* NPK Inputs */}
            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('npkChemistry')}</span>
              
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
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('recommendOptimalCrops')}
            </button>

          </form>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 mb-4">{t('recommendedCropOptions')}</h2>
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              <span className="text-xs text-slate-400">{t('runningAlgorithms')}</span>
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
                      <p className="text-[10px] text-slate-400 mt-0.5">{t('confidenceMatch')}: <span className="font-bold text-emerald-700">{crop.confidence}</span></p>
                    </div>

                    <div className="flex gap-2">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                        {t('water')}: {crop.water}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                        {t('cycle')}: {crop.duration}
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
              {t('fillSoilNutrientPrompt')}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default CropRecommendation;
