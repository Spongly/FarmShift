// ============================================================
// FarmShift Nepal — Actionable Weekly Farming Plan Component
// ============================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateWeeklyFarmPlan, type WeeklyFarmPlan } from '../services/farmActionPlanner';
import { fetchWeatherForecast, type WeatherForecastData } from '../services/weatherForecast';
import { CROPS } from '../data/cropData';
import { Card, Select, Label } from './ui';
import { 
  CalendarDays, 
  CloudRain, 
  Info
} from 'lucide-react';
import type { CropId } from '../types';

export function ActionPlannerView() {
  const { state } = useApp();
  const { location, soil, language } = state;
  const isNe = language === 'ne';

  const [selectedCrop, setSelectedCrop] = useState<CropId>('rice-transplanted');
  const [forecast, setForecast] = useState<WeatherForecastData | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<1 | 2 | 3 | 4>(1);
  const [plan, setPlan] = useState<WeeklyFarmPlan>(() => generateWeeklyFarmPlan('rice-transplanted', soil, null));

  useEffect(() => {
    if (location) {
      fetchWeatherForecast(location.latitude, location.longitude).then((data) => {
        setForecast(data);
        setPlan(generateWeeklyFarmPlan(selectedCrop, soil, data));
      }).catch(() => {
        // graceful offline fallback
      });
    }
  }, [location?.latitude, location?.longitude, selectedCrop]);

  const handleCropChange = (cropId: CropId) => {
    setSelectedCrop(cropId);
    setPlan(generateWeeklyFarmPlan(cropId, soil, forecast));
  };

  const filteredTasks = plan.weeklyTasks.filter((t) => t.weekNumber === selectedWeek);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-forest-700" />
            <div>
              <h3 className="font-bold text-sm text-ink">
                {isNe ? 'व्यक्तिगत साप्ताहिक कृषि कार्यतालिका' : 'Personalized Weekly Actionable Farm Plan'}
              </h3>
              <p className="text-2xs text-ink-muted">
                {isNe ? 'मौसम पूर्वानुमान र माटोको स्थितिअनुसार स्वचालित कार्ययोजना' : 'Dynamic schedule combining 7-day numerical forecasts with crop phenology'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="plan-crop-select" className="mb-0 text-xs">{isNe ? 'बाली:' : 'Crop:'}</Label>
            <Select
              id="plan-crop-select"
              value={selectedCrop}
              onChange={(e) => handleCropChange(e.target.value as CropId)}
              className="text-xs"
            >
              {CROPS.map((c) => (
                <option key={c.id} value={c.id}>
                  {isNe ? c.localName : c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Phase Summary */}
        <div className="bg-forest-50 border border-forest-200 p-3 rounded text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-3xs uppercase font-mono text-forest-800 font-bold block">
              {isNe ? 'वर्तमान सिजनको चरण:' : 'Current Growth Stage:'}
            </span>
            <span className="font-bold text-forest-900">
              {isNe ? plan.currentSeasonalPhaseNe : plan.currentSeasonalPhaseEn}
            </span>
          </div>

          {forecast && (
            <div className="flex items-center gap-2 text-2xs text-forest-800 bg-white/80 px-2.5 py-1 rounded border border-forest-200">
              <CloudRain className="w-3.5 h-3.5 text-forest-700" />
              <span>Forecast: {Math.round(forecast.summary.totalRainNext7Days)} mm rain upcoming</span>
            </div>
          )}
        </div>

        {/* Week Selector Tabs */}
        <div className="flex border-b border-stone-200 gap-2">
          {([1, 2, 3, 4] as const).map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                selectedWeek === w
                  ? 'border-forest-700 text-forest-900'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {isNe ? `हप्ता ${w}` : `Week ${w}`}
            </button>
          ))}
        </div>
      </Card>

      {/* Action Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card padding="md" className="text-center py-8 text-xs text-ink-muted">
            {isNe ? 'यस हप्ताका लागि कुनै आकस्मिक कार्य बाँकी छैन।' : 'No urgent interventions required for this week.'}
          </Card>
        ) : (
          filteredTasks.map((t) => (
            <Card key={t.id} padding="md" className="space-y-2 border-l-4 border-l-forest-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-3xs font-bold uppercase px-2 py-0.5 rounded ${
                    t.priority === 'critical' ? 'bg-sienna-50 text-sienna border border-sienna-200' : 'bg-forest-50 text-forest-800'
                  }`}>
                    {t.priority}
                  </span>
                  <h4 className="font-bold text-sm text-ink">{isNe ? t.titleNe : t.titleEn}</h4>
                </div>

                {t.weatherTriggerEn && (
                  <span className="text-2xs font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                    ⚡ {isNe ? t.weatherTriggerNe : t.weatherTriggerEn}
                  </span>
                )}
              </div>

              <p className="text-xs text-ink leading-relaxed">
                {isNe ? t.instructionsNe : t.instructionsEn}
              </p>

              <div className="pt-2 border-t border-stone-200/80 flex items-start gap-1.5 text-2xs text-ink-muted">
                <Info className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                <span>
                  <strong>{isNe ? 'वैज्ञानिक कारण:' : 'Scientific Basis:'}</strong> {isNe ? t.scientificReasonNe : t.scientificReasonEn}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
