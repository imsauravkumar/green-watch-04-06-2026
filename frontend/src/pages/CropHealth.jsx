import React, { useState } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const CropHealth = () => {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setImage(reader.result); setResult(null); };
    reader.readAsDataURL(file);
  };

  const runMockAnalysis = () => {
    if (!image) return;
    setAnalyzing(true);
    setTimeout(() => {
      const mockReports = [
        {
          disease: "Tomato Early Blight (Alternaria solani)",
          severity: "Moderate (45%)",
          symptoms: "Dark, concentric spots (target-like) on older leaves. Surrounding tissue yellowing followed by leaf defoliation.",
          organic: "Apply copper-based organic fungicide sprays. Remove infected lower leaves immediately to prevent spore splash. Avoid overhead watering.",
          chemical: "Spray Chlorothalonil or Mancozeb-containing fungicides every 7-10 days until spread ceases."
        },
        {
          disease: "Potato Late Blight (Phytophthora infestans)",
          severity: "High (80%) - Urgent action needed",
          symptoms: "Water-soaked dark lesions on leaf tips. White fuzzy growth on leaf undersides in humid conditions. Stems turning black.",
          organic: "Remove and destroy all infected foliage. Spray copper carbonate or baking soda solutions. Ensure wide spacing for dry air circulation.",
          chemical: "Apply systemic fungicides containing Metalaxyl or Ridomil Gold to prevent tuber contamination."
        },
        {
          disease: "Powdery Mildew (Podosphaera pannosa)",
          severity: "Low (20%)",
          symptoms: "White, powdery flour-like fungal coatings covering leaf surfaces. Leaves curling upwards.",
          organic: "Spray a mixture of 1 tbsp baking soda + 1 tsp liquid soap in 4L water. Increase sun exposure. Spray neem oil solution.",
          chemical: "Apply sulphur or Myclobutanil-based systemic mildewcide sprays."
        },
        {
          disease: "Healthy Leaf - No Pathogens Detected",
          severity: "None (0%)",
          symptoms: "Foliage exhibits rich chlorophyll levels. Stomatal cells and veins show uniform structures.",
          organic: "Maintain regular nitrogen-rich compost dressings. Keep mulch moisture levels checked.",
          chemical: "No chemical fungicides or interventions needed."
        }
      ];
      setResult(mockReports[Math.floor(Math.random() * mockReports.length)]);
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-600" /> {t('cropHealthTitle')}
        </h1>
        <p className="text-xs text-slate-500">{t('cropHealthDesc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upload Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] space-y-4">
          {image ? (
            <div className="space-y-4 w-full">
              <div className="h-60 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                <img src={image} alt="Crop Leaf" className="h-full object-contain" />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={runMockAnalysis}
                  disabled={analyzing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {analyzing ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" />{t('analyzingFoliage')}</>
                  ) : t('analyzeLeaf')}
                </button>
                <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                  {t('retakePhoto')}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 w-full h-full min-h-[250px] space-y-3">
              <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 text-center">{t('uploadLeaf')}</p>
                <p className="text-[10px] text-slate-400 text-center mt-1">{t('jpgPngSupported')}</p>
              </div>
              <label className="text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-colors shadow-sm">
                {t('browseFiles')}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold tracking-tight text-slate-800 border-b border-slate-100 pb-3 mb-4">
            {t('diagnosticReadout')}
          </h2>

          {analyzing ? (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center gap-3">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
              <span className="text-xs text-slate-400">{t('computingIndices')}</span>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-150 p-3 rounded-lg">
                {result.severity.includes("High") ? (
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">{result.disease}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">{t('severity')}: <span className="font-bold text-amber-600">{result.severity}</span></p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{t('observedSymptoms')}</span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{result.symptoms}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t('organicTreatment')}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{result.organic}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 uppercase flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" /> {t('chemicalTreatment')}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{result.chemical}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-400 text-xs text-center">
              {t('uploadAndAnalyze')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CropHealth;
