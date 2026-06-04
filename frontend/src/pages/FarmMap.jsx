import React, { useState, useRef } from 'react';
import { MapPin, RefreshCw, Trash2, Sprout, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const FarmMap = () => {
  const { t } = useTranslation();
  const [points, setPoints] = useState([]);
  const [fields, setFields] = useState([
    { name: "defaultField1", area: "1.4", crop: "Wheat", color: "rgba(16, 185, 129, 0.4)", border: "#10b981", isDefault: true },
    { name: "defaultField2", area: "0.9", crop: "Paddy", color: "rgba(59, 130, 246, 0.4)", border: "#3b82f6", isDefault: true }
  ]);
  const [activeFieldName, setActiveFieldName] = useState('New Field');
  const [activeCrop, setActiveCrop] = useState('Wheat');
  
  const mapContainerRef = useRef(null);

  const handleMapClick = (e) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // Limit to 10 points for boundary plotting
    if (points.length < 10) {
      setPoints([...points, { x, y }]);
    }
  };

  const handleClearDrawing = () => {
    setPoints([]);
  };

  const handleSaveField = () => {
    if (points.length < 3) return;

    // Simple area calculation mock based on bounding box
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const calculatedArea = ((maxX - minX) * (maxY - minY) * 0.0001).toFixed(2);

    const colors = {
      'Wheat': { color: 'rgba(234, 179, 8, 0.35)', border: '#eab308' },
      'Paddy': { color: 'rgba(59, 130, 246, 0.35)', border: '#3b82f6' },
      'Cotton': { color: 'rgba(236, 72, 153, 0.35)', border: '#ec4899' },
      'Fallow': { color: 'rgba(120, 113, 108, 0.35)', border: '#78716c' }
    };

    const style = colors[activeCrop] || colors['Wheat'];

    const newFieldObj = {
      name: activeFieldName,
      crop: activeCrop,
      area: `${calculatedArea} ${t('acres')}`,
      points: [...points],
      color: style.color,
      border: style.border,
      isDefault: false
    };

    setFields([...fields, newFieldObj]);
    setPoints([]);
    setActiveFieldName('New Field');
  };

  const handleDeleteField = (idx) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
          <MapPin className="w-5 h-5 text-emerald-600" /> {t('farmMapTitle')}
        </h1>
        <p className="text-xs text-slate-500">{t('farmMapDesc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive SVG Map panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {t('satelliteCanvas')}
            </span>
            
            {/* Satellite mock canvas */}
            <div 
              ref={mapContainerRef}
              onClick={handleMapClick}
              className="relative w-full h-[400px] rounded-xl overflow-hidden cursor-crosshair border border-slate-350 select-none shadow-inner"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Darkening satellite image mask to improve node visibilities */}
              <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />

              {/* Render Plot Coordinates SVG Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* 1. Existing Saved Fields */}
                {fields.map((f, fIdx) => {
                  if (!f.points) return null;
                  const pointsStr = f.points.map(p => `${p.x},${p.y}`).join(' ');
                  const fieldName = f.isDefault ? t(f.name) : f.name;
                  const fieldArea = f.isDefault ? `${f.area} ${t('acres')}` : f.area;
                  return (
                    <g key={fIdx}>
                      <polygon 
                        points={pointsStr} 
                        fill={f.color} 
                        stroke={f.border} 
                        strokeWidth="2.5" 
                        strokeDasharray="4 2"
                      />
                      {/* Label in center of polygon */}
                      <text 
                        x={f.points[0].x} 
                        y={f.points[0].y - 8} 
                        fill="white" 
                        fontSize="9" 
                        fontWeight="bold" 
                        className="bg-black/80 px-1"
                        style={{ textShadow: '1px 1px 2px black' }}
                      >
                        {fieldName} ({fieldArea})
                      </text>
                    </g>
                  );
                })}

                {/* 2. Currently Drawing Field Polygon */}
                {points.length > 1 && (
                  <polyline
                    points={points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="rgba(16, 185, 129, 0.2)"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                )}

                {/* Complete close loop line if points >= 3 */}
                {points.length >= 3 && (
                  <line 
                    x1={points[points.length - 1].x}
                    y1={points[points.length - 1].y}
                    x2={points[0].x}
                    y2={points[0].y}
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                )}
              </svg>

              {/* 3. Render Coordinate node pins */}
              {points.map((p, idx) => (
                <div 
                  key={idx}
                  className="absolute h-3 w-3 bg-emerald-600 border-2 border-white rounded-full -translate-x-1.5 -translate-y-1.5 shadow flex items-center justify-center pointer-events-none"
                  style={{ left: p.x, top: p.y }}
                >
                  <span className="text-[7px] text-white font-bold">{idx + 1}</span>
                </div>
              ))}
            </div>

            {/* Drawing controls */}
            <div className="flex justify-between items-center mt-3">
              <span className="text-[10px] text-slate-500 font-semibold">
                {t('plottedNodes').replace('{count}', points.length)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleClearDrawing}
                  disabled={points.length === 0}
                  className="text-xs font-semibold px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {t('resetPins')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info & Config panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col space-y-6">
          
          {/* New field tag configuration */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">{t('tagFieldOutline')}</h2>
            
            <div className="space-y-3 text-left">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t('fieldLabelName')}</label>
                <input 
                  type="text"
                  value={activeFieldName}
                  onChange={(e) => setActiveFieldName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t('sownCropVariety')}</label>
                <select
                  value={activeCrop}
                  onChange={(e) => setActiveCrop(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Wheat">{t('wheatCropOption')}</option>
                  <option value="Paddy">{t('paddyCropOption')}</option>
                  <option value="Cotton">{t('cottonCropOption')}</option>
                  <option value="Fallow">{t('fallowLandOption')}</option>
                </select>
              </div>

              <button
                onClick={handleSaveField}
                disabled={points.length < 3}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" /> {t('saveCropZone')}
              </button>
            </div>
          </div>

          {/* List of saved zones */}
          <div className="space-y-3 flex-1 flex flex-col">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">{t('registeredCropZones')}</h2>
            
            <div className="space-y-2 overflow-y-auto max-h-[220px] flex-1">
              {fields.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">{t('noSavedCoordinates')}</div>
              ) : (
                fields.map((f, idx) => {
                  const name = f.isDefault ? t(f.name) : f.name;
                  const area = f.isDefault ? `${f.area} ${t('acres')}` : f.area;
                  const cropTransKey = f.crop === 'Wheat' ? 'wheatCropOption' : f.crop === 'Paddy' ? 'paddyCropOption' : f.crop === 'Cotton' ? 'cottonCropOption' : 'fallowLandOption';
                  return (
                    <div 
                      key={idx}
                      className="border border-slate-150 rounded-lg p-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">{name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">{t(cropTransKey)} • {area}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteField(idx)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default FarmMap;
