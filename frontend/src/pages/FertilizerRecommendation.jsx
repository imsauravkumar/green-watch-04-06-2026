import React, { useState } from 'react';
import { Compass, RefreshCw, CheckCircle, ShieldAlert, Sparkles, Scale, Clock, Activity, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import fertilizerImg from '../assets/fertilizer.png';

export const FertilizerRecommendation = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    crop: 'Wheat',
    soilType: 'Loamy',
    growthStage: 'Sowing',
    irrigation: 'Irrigated',
    ph: '6.5',
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

  const isHi = t('appName') === "ग्रीन वॉच";

  const cropsList = [
    { value: 'Wheat', label: isHi ? "गेहूं (Wheat)" : "Wheat (Gehu)" },
    { value: 'Paddy', label: isHi ? "धान (Paddy/Rice)" : "Paddy (Rice)" },
    { value: 'Maize', label: isHi ? "मक्का (Maize)" : "Maize (Makka)" },
    { value: 'Mustard', label: isHi ? "सरसों (Mustard)" : "Mustard (Sarson)" },
    { value: 'Soybean', label: isHi ? "सोयाबीन (Soybean)" : "Soybean" },
    { value: 'Gram', label: isHi ? "चना (Chickpeas/Gram)" : "Gram (Chana)" },
    { value: 'Cotton', label: isHi ? "कपास (Cotton)" : "Cotton" }
  ];

  const growthStages = [
    { value: 'Sowing', label: isHi ? "बुवाई चरण (Sowing)" : "Sowing Stage" },
    { value: 'Vegetative', label: isHi ? "वानस्पतिक चरण (Vegetative)" : "Vegetative Growth" },
    { value: 'Flowering', label: isHi ? "फूल आने का चरण (Flowering)" : "Flowering Stage" },
    { value: 'Maturity', label: isHi ? "परिपक्वता चरण (Maturity)" : "Maturity Stage" }
  ];

  const irrigationTypes = [
    { value: 'Irrigated', label: isHi ? "सिंचित (Irrigated)" : "Irrigated (Canal/Well)" },
    { value: 'Rainfed', label: isHi ? "वर्षा-आधारित (Rainfed)" : "Rainfed (Monsoon)" }
  ];

  const txtFieldSowingContext = isHi ? "खेत और बुवाई का संदर्भ" : "Field & Sowing Context";
  const txtGrowthStage = isHi ? "फसल वृद्धि चरण" : "Crop Growth Stage";
  const txtIrrigation = isHi ? "सिंचाई का प्रकार" : "Irrigation Type";
  const txtSoilProfile = isHi ? "मिट्टी की रूपरेखा" : "Soil Profile";
  const txtPHLevel = isHi ? "मिट्टी का पीएच स्तर (pH)" : "Soil pH Level";
  const txtMacronutrients = isHi ? "मैक्रोन्यूट्रिएंट विश्लेषण (PPM)" : "Macronutrient Analysis (PPM)";
  const txtAlert = isHi ? "सचेत / चेतावनी" : "Soil Health Alert";

  const handleCalculate = (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const { crop, soilType, growthStage, irrigation, ph, nitrogen, phosphorus, potassium } = formData;
      const n = parseInt(nitrogen) || 0;
      const p = parseInt(phosphorus) || 0;
      const k = parseInt(potassium) || 0;
      const phVal = parseFloat(ph) || 7.0;

      let recommendation = null;
      let dynamicReason = "";
      let warnings = [];

      // Compute dynamic soil warnings
      if (phVal < 6.0) {
        warnings.push(isHi 
          ? `अम्लीय मिट्टी (pH ${phVal}): पोषक तत्वों के अवशोषण में सुधार के लिए चूना (200 किलो/एकड़) मिलाएं।` 
          : `Acidic Soil (pH ${phVal}): Apply 200 kg lime per acre during field preparation.`);
      } else if (phVal > 7.8) {
        warnings.push(isHi 
          ? `क्षारीय मिट्टी (pH ${phVal}): मिट्टी की क्षारीयता को कम करने के लिए जिप्सम (150 किलो/एकड़) डालें।` 
          : `Alkaline Soil (pH ${phVal}): Incorporate 150 kg gypsum per acre to reduce alkalinity.`);
      }

      if (n < 45) {
        dynamicReason += isHi 
          ? `मिट्टी में नाइट्रोजन (${n} PPM) काफी कम है। फसल की वृद्धि बढ़ाने के लिए यूरिया की सामान्य खुराक में 15% की वृद्धि करें। ` 
          : `Soil Nitrogen (${n} PPM) is deficient. Boost nitrogenous application (Urea) by 15% during tillering. `;
      }
      if (p < 25) {
        dynamicReason += isHi 
          ? `फास्फोरस स्तर (${p} PPM) अपर्याप्त है। शुरुआती जड़ों को सहारा देने के लिए एसएसपी या डीएपी की बेसल खुराक में वृद्धि करें। ` 
          : `Phosphorus (${p} PPM) is low. Increase basal single super phosphate (SSP) or DAP. `;
      }

      if (crop === 'Wheat') {
        recommendation = {
          name: isHi ? "एनपीके 12-32-16 और यूरिया का विभक्त अनुप्रयोग" : "NPK 12-32-16 & Urea Split Application",
          quantity: isHi ? "50 किलो डीएपी + 40 किलो यूरिया प्रति एकड़" : "50 kg DAP + 40 kg Urea per acre",
          schedule: isHi 
            ? "बुवाई के समय 50% यूरिया और पूरी डीएपी डालें। शेष यूरिया पहली सिंचाई (बुवाई के 21 दिन बाद) पर डालें।" 
            : "Apply 50% Urea + full DAP as basal dressing during sowing. Apply remaining Urea at first crown root irrigation (21 days after sowing).",
          reason: dynamicReason + (isHi 
            ? `गेहूं को नाइट्रोजन की उच्च आवश्यकता होती है। आपका वर्तमान नाइट्रोजन स्तर (${n} PPM) है।` 
            : `Wheat requires high nitrogen during vegetative growth. Your current soil nitrogen level is ${n} PPM.`),
          warnings: warnings
        };
      } else if (crop === 'Paddy') {
        recommendation = {
          name: isHi ? "यूरिया, सिंगल सुपर फॉस्फेट (SSP) और एमओपी" : "Urea & SSP & MOP Combination",
          quantity: isHi ? "60 किलो यूरिया + 45 किलो एसएसपी + 20 किलो एमओपी प्रति एकड़" : "60 kg Urea + 45 kg SSP + 20 kg MOP per acre",
          schedule: isHi 
            ? "एसएसपी और एमओपी को बुवाई/रोपाई के समय डालें। यूरिया को तीन किस्तों में डालें: रोपाई पर, कल्ले फूटते समय और बालियां बनते समय।" 
            : "Apply SSP and MOP as basal dressing. Apply Urea in three split doses: transplanting, active tillering (30 days), and panicle initiation (60 days).",
          reason: dynamicReason + (isHi 
            ? `धान को पानी से भरे खेतों में नाइट्रोजन की अधिक आवश्यकता होती है। पोटेशियम स्तर (${k} PPM) पर्याप्त है लेकिन दाने के वजन के लिए एमओपी आवश्यक है।` 
            : `Paddy requires high nitrogen during tillering. Your potassium level is ${k} PPM, and basal MOP is essential for grain filling.`),
          warnings: warnings
        };
      } else if (crop === 'Cotton') {
        recommendation = {
          name: isHi ? "अमोनियम सल्फेट और डीएपी मिश्रण" : "Ammonium Sulphate & DAP Mix",
          quantity: isHi ? "35 किलो डीएपी + 50 किलो अमोनियम सल्फेट प्रति एकड़" : "35 kg DAP + 50 kg Ammonium Sulphate per acre",
          schedule: isHi 
            ? "बुवाई के समय डीएपी डालें। कपास की कलियां और फूल बनने के समय अमोनियम सल्फेट का छिड़काव करें।" 
            : "Apply DAP at sowing. Top dress Ammonium Sulphate during square formation and flowering stage to support cotton boll count.",
          reason: dynamicReason + (isHi 
            ? "कपास सल्फर के प्रति संवेदनशील है। अमोनियम सल्फेट सल्फर और नाइट्रोजन दोनों की कमी को पूरा करता है।" 
            : "Cotton is sensitive to sulphur. Ammonium Sulphate fulfills both Nitrogen and Sulphur deficits."),
          warnings: warnings
        };
      } else if (crop === 'Maize') {
        recommendation = {
          name: isHi ? "एनपीके 15-15-15 और जिंक सल्फेट" : "NPK 15-15-15 & Zinc Sulphate",
          quantity: isHi ? "60 किलो एनपीके + 10 किलो जिंक सल्फेट प्रति एकड़" : "60 kg NPK + 10 kg Zinc Sulphate per acre",
          schedule: isHi 
            ? "बुवाई के समय पूरा जिंक सल्फेट और 50% एनपीके डालें। शेष एनपीके बुवाई के 35 दिन बाद (घुटने की ऊंचाई पर) डालें।" 
            : "Apply full Zinc and 50% NPK at sowing. Apply remaining NPK at knee-high stage (35 days after sowing).",
          reason: dynamicReason + (isHi 
            ? `मक्के को प्रचुर मात्रा में जिंक की आवश्यकता होती है। आपका फास्फोरस स्तर (${p} PPM) और नाइट्रोजन स्तर (${n} PPM) है।` 
            : `Maize has high zinc requirements. Your soil Phosphorus is ${p} PPM and Nitrogen is ${n} PPM.`),
          warnings: warnings
        };
      } else if (crop === 'Mustard') {
        recommendation = {
          name: isHi ? "एसएसपी और अमोनियम सल्फेट" : "SSP & Ammonium Sulphate",
          quantity: isHi ? "40 किलो एसएसपी + 30 किलो अमोनियम सल्फेट प्रति एकड़" : "40 kg SSP + 30 kg Ammonium Sulphate per acre",
          schedule: isHi 
            ? "खेत तैयार करते समय एसएसपी को बुनियादी खुराक के रूप में डालें। पहली सिंचाई (25-30 दिन) पर अमोनियम सल्फेट डालें।" 
            : "Apply SSP as basal dose during land preparation. Apply Ammonium Sulphate at first irrigation (25-30 days).",
          reason: dynamicReason + (isHi 
            ? "सरसों में तेल की मात्रा बढ़ाने के लिए सल्फर की आवश्यकता होती है। एसएसपी और अमोनियम सल्फेट आवश्यक सल्फर प्रदान करते हैं।" 
            : "Mustard requires high Sulphur for oil synthesis. SSP and Ammonium Sulphate satisfy both Sulphur and Nitrogen requirements."),
          warnings: warnings
        };
      } else if (crop === 'Soybean') {
        recommendation = {
          name: isHi ? "एनपीके 12-32-16 और राइजोबियम बीज उपचार" : "NPK 12-32-16 & Rhizobium Culture",
          quantity: isHi ? "40 किलो एनपीके + 200 ग्राम राइजोबियम कल्चर प्रति एकड़" : "40 kg NPK + 200g Rhizobium seed treatment per acre",
          schedule: isHi 
            ? "बुवाई से पहले बीजों को राइजोबियम कल्चर से उपचारित करें। बुवाई के समय एनपीके 12-32-16 को बेसल खुराक के रूप में दें।" 
            : "Treat seeds with Rhizobium culture before sowing. Apply NPK 12-32-16 as basal dressing.",
          reason: dynamicReason + (isHi 
            ? `सोयाबीन वायुमंडलीय नाइट्रोजन को स्थिर करती है। आपका फास्फोरस स्तर (${p} PPM) है, जो शुरुआती जड़ विकास का समर्थन करता है।` 
            : `Soybean is a legume that fixes nitrogen. Your soil Phosphorus is ${p} PPM, which supports early root establishment.`),
          warnings: warnings
        };
      } else if (crop === 'Gram') {
        recommendation = {
          name: isHi ? "डीएपी और जिप्सम अनुप्रयोग" : "DAP & Gypsum Application",
          quantity: isHi ? "30 किलो डीएपी + 50 किलो जिप्सम प्रति एकड़" : "30 kg DAP + 50 kg Gypsum per acre",
          schedule: isHi 
            ? "बुवाई के समय डीएपी डालें। खेत की तैयारी के दौरान मिट्टी में जिप्सम मिलाएं।" 
            : "Apply DAP at sowing. Incorporate Gypsum into soil during land preparation.",
          reason: dynamicReason + (isHi 
            ? `चने को कम नाइट्रोजन लेकिन उच्च फास्फोरस की आवश्यकता होती है। जिप्सम कैल्शियम और सल्फर प्रदान करता है जो फली के विकास में सहायक है।` 
            : `Gram needs low nitrogen but high phosphorus. Gypsum provides Calcium and Sulphur to improve pod development.`),
          warnings: warnings
        };
      } else {
        recommendation = {
          name: isHi ? "संतुलित एनपीके 19-19-19 पर्णीय छिड़काव" : "Balanced NPK 19-19-19 Foliar Spray",
          quantity: isHi ? "3 किलो एनपीके स्प्रे प्रति एकड़ 200 लीटर पानी में" : "3 kg NPK soluble spray per acre in 200L water",
          schedule: isHi 
            ? "वानस्पतिक अवस्था के दौरान फसल की पत्तियों पर समान रूप से छिड़काव करें। यदि पीलापन बना रहता है तो 15 दिनों के बाद दोहराएं।" 
            : "Spray evenly on crop canopy during vegetative stage. Repeat after 15 days if yellowing persists.",
          reason: dynamicReason + (isHi 
            ? "सामान्य सूक्ष्म पोषण पूरक। मामूली पोषक तत्वों के असंतुलन के लिए आदर्श।" 
            : "Default micro-dressing. Ideal for minor macronutrient imbalances."),
          warnings: warnings
        };
      }

      setResult(recommendation);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Header Banner */}
      <div className="h-28 w-full rounded-2xl overflow-hidden relative shadow-md bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950">
        <img
          src={fertilizerImg}
          alt={t('fertilizerTitle')}
          className="w-full h-full object-cover opacity-60 mix-blend-overlay animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-center p-6 text-white animate-fade-in">
          <div className="flex items-center gap-2 text-white">
            <Compass className="w-6 h-6 text-emerald-400" />
            <h1 className="text-lg font-bold tracking-tight md:text-xl">{t('fertilizerTitle')}</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed md:text-sm">{t('fertilizerDesc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Form Panel - Spans 1 column */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5">
            {t('inputCropProperties')}
          </h2>
          
          <form onSubmit={handleCalculate} className="space-y-4">
            
            {/* Section 1: Sowing Context */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                {txtFieldSowingContext}
              </span>
              
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">{t('targetCrop')}</label>
                <select
                  name="crop"
                  value={formData.crop}
                  onChange={handleInputChange}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
                >
                  {cropsList.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">{txtGrowthStage}</label>
                  <select
                    name="growthStage"
                    value={formData.growthStage}
                    onChange={handleInputChange}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
                  >
                    {growthStages.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">{txtIrrigation}</label>
                  <select
                    name="irrigation"
                    value={formData.irrigation}
                    onChange={handleInputChange}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
                  >
                    {irrigationTypes.map(i => (
                      <option key={i.value} value={i.value}>{i.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Soil Profile */}
            <div className="space-y-3 border-t border-slate-100 pt-3">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                {txtSoilProfile}
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">{t('soilClassType')}</label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleInputChange}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
                  >
                    <option value="Loamy">{isHi ? "दोमट (Loamy)" : "Loamy"}</option>
                    <option value="Clay">{isHi ? "चिकनी मिट्टी (Clay)" : "Clay"}</option>
                    <option value="Sandy">{isHi ? "बलुई (Sandy)" : "Sandy"}</option>
                    <option value="Black">{isHi ? "काली मिट्टी (Black)" : "Black"}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">{txtPHLevel}</label>
                  <input
                    type="number"
                    name="ph"
                    min="4.0"
                    max="10.0"
                    step="0.1"
                    value={formData.ph}
                    onChange={handleInputChange}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: NPK values */}
            <div className="space-y-3 border-t border-slate-100 pt-3">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                {txtMacronutrients}
              </span>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-0.5">{t('nitrogen')}</label>
                  <input
                    type="number"
                    name="nitrogen"
                    min="0"
                    max="150"
                    value={formData.nitrogen}
                    onChange={handleInputChange}
                    className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-0.5">{t('phosphorus')}</label>
                  <input
                    type="number"
                    name="phosphorus"
                    min="0"
                    max="150"
                    value={formData.phosphorus}
                    onChange={handleInputChange}
                    className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-0.5">{t('potassium')}</label>
                  <input
                    type="number"
                    name="potassium"
                    min="0"
                    max="150"
                    value={formData.potassium}
                    onChange={handleInputChange}
                    className="w-full text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-bold text-slate-700"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs font-bold py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer text-white"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('calculateDosage')}
            </button>
          </form>
        </div>

        {/* Right Results Panel - Spans 2 columns */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col min-h-[400px]">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5 mb-4">
            {t('calculatedDosageReport')}
          </h2>
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              <span className="text-xs text-slate-400 font-semibold">{t('computingFertilizer')}</span>
            </div>
          ) : result ? (
            <div className="space-y-4">
              
              {/* Recommended Solution Banner */}
              <div className="flex items-center gap-3.5 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 shadow-sm shadow-emerald-500/5">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{t('recommendedLabel')}: {result.name}</h3>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">{t('doseLabel')}: {result.quantity}</p>
                </div>
              </div>

              {/* Warnings / Alerts block */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-xs flex gap-3 shadow-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 animate-pulse mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-xs">{txtAlert}</span>
                    {result.warnings.map((warn, index) => (
                      <p key={index} className="text-amber-700 font-medium leading-relaxed text-xs">
                        {warn}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid detail cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Dosage Schedule Card */}
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t('appSchedule')}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">{result.schedule}</p>
                </div>

                {/* Agronomic Rationale Card */}
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t('nutrientRationale')}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic font-medium">{result.reason}</p>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-20 gap-2 font-medium">
              <Sparkles className="w-8 h-8 text-emerald-500/40 animate-pulse" />
              <span>{t('selectCropPrompt')}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default FertilizerRecommendation;
