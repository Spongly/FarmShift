// ============================================================
// FarmShift Nepal — Actionable Weekly Farming Plan Component
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { addDays, format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { generateWeeklyFarmPlan, type ActionTask, type CropStage } from '../services/farmActionPlanner';
import { fetchWeatherForecast, type WeatherForecastData } from '../services/weatherForecast';
import { CROPS } from '../data/cropData';
import { Card, Select, Label } from './ui';
import { CalendarDays, CloudRain, Info } from 'lucide-react';
import type { CropId } from '../types';

const STAGE_OPTIONS: { value: CropStage; en: string; ne: string }[] = [
  { value: 'pre_sowing', en: 'Preparing / sowing', ne: 'तयारी / रोपाइँ' },
  { value: 'growing', en: 'Crop is growing', ne: 'बाली बढ्दैछ' },
  { value: 'harvest', en: 'Harvesting', ne: 'बाली भित्र्याउँदै' },
  { value: 'off_season', en: 'Field is empty', ne: 'खेत खाली छ' },
];

const PRIORITY_NE: Record<ActionTask['priority'], string> = {
  critical: 'अत्यावश्यक',
  recommended: 'सिफारिस',
  optional: 'ऐच्छिक',
};

const CATEGORY_LABELS: Record<ActionTask['category'], { en: string; ne: string }> = {
  planting: { en: 'Planting', ne: 'रोपाइँ' },
  soil_prep: { en: 'Soil', ne: 'माटो' },
  irrigation: { en: 'Water', ne: 'पानी' },
  fertilizer: { en: 'Fertilizer', ne: 'मल' },
  protection: { en: 'Protection', ne: 'सुरक्षा' },
  monitoring: { en: 'Monitoring', ne: 'निरीक्षण' },
  harvest: { en: 'Harvest', ne: 'बाली भित्र्याउने' },
};

const PRIORITY_ORDER: ActionTask['priority'][] = ['critical', 'recommended', 'optional'];

export function ActionPlannerView() {
  const { state } = useApp();
  const { location, soil, language } = state;
  const isNe = language === 'ne';

  const [selectedCrop, setSelectedCrop] = useState<CropId>('rice-transplanted');
  const [stageOverride, setStageOverride] = useState<CropStage | 'auto'>('auto');
  const [forecast, setForecast] = useState<WeatherForecastData | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    if (!location) return;
    fetchWeatherForecast(location.latitude, location.longitude)
      .then(setForecast)
      .catch(() => {
        // offline: the plan still works from the crop calendar alone
      });
  }, [location?.latitude, location?.longitude]);

  const today = useMemo(() => new Date(), []);
  const plan = useMemo(
    () => generateWeeklyFarmPlan(selectedCrop, soil, forecast, { today, stage: stageOverride === 'auto' ? undefined : stageOverride }),
    [selectedCrop, soil, forecast, today, stageOverride]
  );

  const weekTasks = (w: number) => plan.weeklyTasks.filter((t) => t.weekNumber === w);
  const filteredTasks = weekTasks(selectedWeek).sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  );
  const weekRange = (w: number) =>
    `${format(addDays(today, (w - 1) * 7), 'MMM d')} – ${format(addDays(today, w * 7 - 1), 'MMM d')}`;

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-forest-700" />
            <div>
              <h3 className="font-bold text-sm text-ink">
                {isNe ? 'व्यक्तिगत साप्ताहिक कृषि कार्यतालिका' : 'Personalized Weekly Farm Plan'}
              </h3>
              <p className="text-2xs text-ink-muted">
                {isNe ? 'बाली, माटो र मौसम पूर्वानुमानअनुसार ४ हप्ताको कार्ययोजना' : 'A 4-week task list built from your crop, soil and the live forecast'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="plan-crop-select" className="mb-0 text-xs">{isNe ? 'बाली:' : 'Crop:'}</Label>
              <Select
                id="plan-crop-select"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value as CropId)}
                className="text-xs"
              >
                {CROPS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isNe ? c.localName : c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="plan-stage-select" className="mb-0 text-xs">{isNe ? 'अवस्था:' : 'Stage:'}</Label>
              <Select
                id="plan-stage-select"
                value={stageOverride}
                onChange={(e) => setStageOverride(e.target.value as CropStage | 'auto')}
                className="text-xs"
              >
                <option value="auto">{isNe ? 'स्वचालित (बाली पात्रोबाट)' : 'Auto (from crop calendar)'}</option>
                {STAGE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {isNe ? s.ne : s.en}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Phase Summary */}
        <div className="bg-forest-50 border border-forest-200 p-3 rounded text-xs space-y-1">
          <span className="text-3xs uppercase font-mono text-forest-800 font-bold block">
            {isNe ? 'वर्तमान अवस्था:' : 'Current stage:'}
          </span>
          <span className="font-bold text-forest-900 block">
            {isNe ? plan.currentSeasonalPhaseNe : plan.currentSeasonalPhaseEn}
          </span>
          <span className="text-2xs text-forest-800 block">
            {isNe ? plan.operationalSummaryNe : plan.operationalSummaryEn}
          </span>
        </div>

        {/* 7-day forecast strip: the data behind week 1 */}
        {forecast && forecast.daily.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-2xs font-semibold text-ink-muted mb-1.5">
              <CloudRain className="w-3.5 h-3.5 text-forest-700" />
              {isNe ? '७ दिनको पूर्वानुमान (Open-Meteo)' : '7-day forecast (Open-Meteo)'}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {forecast.daily.slice(0, 7).map((d) => (
                <div
                  key={d.date}
                  className={`rounded border px-1.5 py-1.5 text-center text-2xs ${
                    d.precipitationSum >= 25 ? 'bg-sienna-50 border-sienna-200' : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="font-mono text-ink-muted">{d.date.slice(5)}</div>
                  <div className="font-bold text-ink">{Math.round(d.tempMax)}° / {Math.round(d.tempMin)}°</div>
                  <div className="text-forest-800">{d.precipitationSum.toFixed(0)} mm</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Week Selector Tabs */}
        <div className="flex border-b border-stone-200 gap-2 overflow-x-auto">
          {([1, 2, 3, 4] as const).map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors text-left shrink-0 ${
                selectedWeek === w
                  ? 'border-forest-700 text-forest-900'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <span className="block">
                {isNe ? `हप्ता ${w}` : `Week ${w}`}
                <span className="ml-1.5 text-3xs font-mono bg-stone-100 text-ink-muted px-1.5 py-0.5 rounded-full">
                  {weekTasks(w).length}
                </span>
              </span>
              <span className="block text-3xs font-normal font-mono">{weekRange(w)}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Action Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card padding="md" className="text-center py-8 text-xs text-ink-muted">
            {isNe ? 'यस हप्ताका लागि कुनै कार्य छैन।' : 'No tasks for this week.'}
          </Card>
        ) : (
          filteredTasks.map((t) => (
            <Card
              key={t.id}
              padding="md"
              className={`space-y-2 border-l-4 ${t.priority === 'critical' ? 'border-l-sienna' : 'border-l-forest-700'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-3xs font-bold uppercase px-2 py-0.5 rounded ${
                    t.priority === 'critical' ? 'bg-sienna-50 text-sienna border border-sienna-200' : 'bg-forest-50 text-forest-800'
                  }`}>
                    {isNe ? PRIORITY_NE[t.priority] : t.priority}
                  </span>
                  <span className="text-3xs font-mono uppercase text-ink-muted">
                    {isNe ? CATEGORY_LABELS[t.category].ne : CATEGORY_LABELS[t.category].en}
                  </span>
                  <h4 className="font-bold text-sm text-ink w-full sm:w-auto">{isNe ? t.titleNe : t.titleEn}</h4>
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
                  <strong>{isNe ? 'किन:' : 'Why:'}</strong> {isNe ? t.scientificReasonNe : t.scientificReasonEn}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
