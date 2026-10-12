import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, NEPALI_CROP_NAMES, NEPALI_SEASONS, NEPALI_CATEGORIES } from '../data/translations';
import { LocationSelector } from './LocationSelector';
import { MapView } from './MapView';
import { CROPS } from '../data/cropData';
import { runRotationEngine } from '../services/rotationEngine';
import type { CropId, SoilTexture, DrainageClass } from '../types';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Check, 
  Info,
  Droplets,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface GuidedFarmPlannerProps {
  onPlanComplete: () => void;
  onExploreWeather?: () => void;
}

export function GuidedFarmPlanner({ onPlanComplete, onExploreWeather: _onExploreWeather }: GuidedFarmPlannerProps) {
  const { 
    state, 
    updateSoil, 
    updateFarmInputs, 
    setCandidate, 
    setPriority, 
    setRotationResult 
  } = useApp();
  
  const { language, location, soil, farmInputs, climateData } = state;
  const t = TRANSLATIONS[language];

  // Steps: 1: Location, 2: Farm & Soil, 3: Priorities, 4: Crops
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showAdvancedSoil, setShowAdvancedSoil] = useState(false);

  const candidateIds = farmInputs.candidateCropIds ?? [];
  const priority = farmInputs.priority ?? 'balanced';
  const planningSeasons = farmInputs.planningSeasons ?? 4;
  const startSeason = farmInputs.planningStartSeason ?? 'kharif';

  // Toggle crop selection
  const handleToggleCrop = (cropId: CropId) => {
    const isSelected = candidateIds.includes(cropId);
    setCandidate(cropId, !isSelected);
  };

  const handleSelectStandardSet = () => {
    const standardIds: CropId[] = [
      'rice-transplanted',
      'wheat',
      'maize',
      'lentil',
      'mustard',
      'soybean',
      'potato',
    ];
    standardIds.forEach((id) => setCandidate(id, true));
  };

  const handleClearAllCrops = () => {
    candidateIds.forEach((id) => setCandidate(id as CropId, false));
  };

  // Run the rotation analysis engine
  const handleGeneratePlans = () => {
    if (!location) return;
    const defaultIds: CropId[] = ['rice-transplanted', 'wheat', 'lentil', 'maize', 'mustard', 'soybean'];
    const activeCandidates = candidateIds.length > 0 ? (candidateIds as CropId[]) : defaultIds;

    const inputs: import('../types').FarmInputs = {
      location,
      soil,
      planningSeasons,
      candidateCropIds: activeCandidates,
      excludedCropIds: [],
      previousCropId: farmInputs.previousCropId ?? null,
      priority,
      planningStartSeason: startSeason,
    };

    const result = runRotationEngine(inputs, climateData);
    setRotationResult(result);
    onPlanComplete();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header and Step Indicator */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-200">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-wider text-forest-600 bg-forest-50 px-2.5 py-1 rounded inline-block mb-1.5">
              {t.workflow.title}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-ink">
              {step === 1 && t.location.title}
              {step === 2 && t.farm.title}
              {step === 3 && t.priority.title}
              {step === 4 && t.crops.title}
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
              {step === 1 && t.location.subtitle}
              {step === 2 && t.farm.subtitle}
              {step === 3 && t.priority.subtitle}
              {step === 4 && t.crops.subtitle}
            </p>
          </div>

          <div className="text-xs font-medium text-ink-muted shrink-0 bg-stone-50 px-3 py-1.5 rounded border border-stone-200 self-start sm:self-auto">
            {language === 'ne' ? `चरण ${step} / ४` : `Step ${step} of 4`}
          </div>
        </div>

        {/* Stepper bar */}
        <div className="grid grid-cols-4 gap-2 pt-4">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 py-2 px-1 text-left text-xs font-medium border-b-2 transition-colors ${
              step === 1
                ? 'border-forest-600 text-forest-700 font-semibold'
                : step > 1
                ? 'border-forest-200 text-forest-700 hover:border-forest-400'
                : 'border-stone-200 text-stone-400'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs ${
              step > 1 ? 'bg-forest-600 text-white' : step === 1 ? 'bg-forest-100 text-forest-800' : 'bg-stone-100 text-stone-500'
            }`}>
              {step > 1 ? <Check className="w-3 h-3" /> : '1'}
            </span>
            <span className="hidden sm:inline">{t.workflow.step1Label}</span>
          </button>

          <button
            onClick={() => location && setStep(2)}
            disabled={!location}
            className={`flex items-center gap-2 py-2 px-1 text-left text-xs font-medium border-b-2 transition-colors ${
              step === 2
                ? 'border-forest-600 text-forest-700 font-semibold'
                : step > 2
                ? 'border-forest-200 text-forest-700 hover:border-forest-400'
                : 'border-stone-200 text-stone-400'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs ${
              step > 2 ? 'bg-forest-600 text-white' : step === 2 ? 'bg-forest-100 text-forest-800' : 'bg-stone-100 text-stone-500'
            }`}>
              {step > 2 ? <Check className="w-3 h-3" /> : '2'}
            </span>
            <span className="hidden sm:inline">{t.workflow.step2Label}</span>
          </button>

          <button
            onClick={() => location && setStep(3)}
            disabled={!location}
            className={`flex items-center gap-2 py-2 px-1 text-left text-xs font-medium border-b-2 transition-colors ${
              step === 3
                ? 'border-forest-600 text-forest-700 font-semibold'
                : step > 3
                ? 'border-forest-200 text-forest-700 hover:border-forest-400'
                : 'border-stone-200 text-stone-400'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs ${
              step > 3 ? 'bg-forest-600 text-white' : step === 3 ? 'bg-forest-100 text-forest-800' : 'bg-stone-100 text-stone-500'
            }`}>
              {step > 3 ? <Check className="w-3 h-3" /> : '3'}
            </span>
            <span className="hidden sm:inline">{t.workflow.step3Label}</span>
          </button>

          <button
            onClick={() => location && setStep(4)}
            disabled={!location}
            className={`flex items-center gap-2 py-2 px-1 text-left text-xs font-medium border-b-2 transition-colors ${
              step === 4
                ? 'border-forest-600 text-forest-700 font-semibold'
                : 'border-stone-200 text-stone-400'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs ${
              step === 4 ? 'bg-forest-100 text-forest-800' : 'bg-stone-100 text-stone-500'
            }`}>
              4
            </span>
            <span className="hidden sm:inline">{t.workflow.step4Label}</span>
          </button>
        </div>
      </div>

      {/* STEP 1: LOCATION SELECTION */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                {t.location.title}
              </label>
              <LocationSelector 
                onLocationSelected={(_loc) => {
                  // Give user 600ms visual confirmation of location detection before smoothly advancing to step 2
                  setTimeout(() => {
                    setStep(2);
                  }, 600);
                }}
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
                {language === 'ne' ? 'अथवा नक्सामा आफ्नो खेत छुनुहोस्:' : 'Or tap your farm directly on the map:'}
              </label>
              <div className="rounded-lg overflow-hidden border border-stone-200">
                <MapView height="320px" />
              </div>
            </div>

            {location ? (
              <div className="p-4 bg-forest-50 border border-forest-200 rounded-lg flex items-start gap-3 text-forest-800">
                <CheckCircle2 className="w-5 h-5 text-forest-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <span className="font-semibold">{t.location.selectedLocation}</span>{' '}
                  <span className="font-bold text-forest-900">{location.name}</span>
                  {location.district && <span> ({location.district} {language === 'ne' ? 'जिल्ला' : 'District'})</span>}
                  <div className="text-2xs text-forest-700 font-mono mt-1">
                    {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>{t.location.noLocationSelected}</div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setStep(2)}
              disabled={!location}
              className="flex items-center gap-2 px-6 py-2.5 rounded-md font-semibold text-sm bg-forest-600 hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xs transition-colors"
            >
              <span>{t.workflow.next}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: FARM & SOIL DETAILS */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs space-y-6">
            {/* Irrigation question */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-ink">
                {t.farm.irrigation}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateSoil({ irrigationAvailable: true })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    soil.irrigationAvailable
                      ? 'border-forest-600 bg-forest-50 text-forest-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <Droplets className="w-4 h-4 text-forest-600" />
                    <span>{language === 'ne' ? 'सिँचाइ सुविधा छ' : 'Irrigation is available'}</span>
                  </div>
                  <p className="text-xs text-ink-secondary mt-1">
                    {t.farm.irrigationYes}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => updateSoil({ irrigationAvailable: false })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    !soil.irrigationAvailable
                      ? 'border-forest-600 bg-forest-50 text-forest-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <span className="w-4 h-4 rounded-full border border-stone-400 flex items-center justify-center text-2xs">✕</span>
                    <span>{language === 'ne' ? 'आकाशे पानी मात्र (सिँचाइ छैन)' : 'Rainfed only (No irrigation)'}</span>
                  </div>
                  <p className="text-xs text-ink-secondary mt-1">
                    {t.farm.irrigationNo}
                  </p>
                </button>
              </div>
            </div>

            {/* Soil texture question */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <label className="block text-sm font-semibold text-ink">
                {t.farm.soilType}
              </label>
              <p className="text-xs text-ink-secondary">{t.farm.soilHelp}</p>
              <select
                value={soil.texture}
                onChange={(e) => updateSoil({ texture: e.target.value as SoilTexture })}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-md text-sm text-ink focus:outline-forest focus:ring-1 focus:ring-forest"
              >
                <option value="unknown">{language === 'ne' ? 'थाहा छैन / सामान्य दोमट (मिश्रित)' : "I don't know / Average Loam (Mixed)"}</option>
                <option value="loam">{language === 'ne' ? 'दोमट माटो (Loam - उत्तम कृषि माटो)' : 'Loam (Balanced ideal agricultural soil)'}</option>
                <option value="sandy-loam">{language === 'ne' ? 'बलौटे दोमट (Sandy Loam - हल्का माटो)' : 'Sandy Loam (Light, easy draining)'}</option>
                <option value="clay-loam">{language === 'ne' ? 'चिम्ट्याइलो दोमट (Clay Loam - पानी थाम्ने)' : 'Clay Loam (Moderate water retention)'}</option>
                <option value="clay">{language === 'ne' ? 'चिम्ट्याइलो कालो माटो (Heavy Clay)' : 'Heavy Clay (Dense, retains water)'}</option>
                <option value="silt-loam">{language === 'ne' ? 'पाँगो माटो (Silt Loam - नदी तटीय)' : 'Silt Loam (Fertile alluvial sediment)'}</option>
              </select>
            </div>

            {/* Soil drainage question */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <label className="block text-sm font-semibold text-ink">
                {t.farm.drainage}
              </label>
              <p className="text-xs text-ink-secondary">{t.farm.drainageHelp}</p>
              <select
                value={soil.drainage}
                onChange={(e) => updateSoil({ drainage: e.target.value as DrainageClass })}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-md text-sm text-ink focus:outline-forest focus:ring-1 focus:ring-forest"
              >
                <option value="unknown">{language === 'ne' ? 'सामान्य / थाहा छैन' : 'Normal / Not sure'}</option>
                <option value="well-drained">{language === 'ne' ? 'राम्रो निकास (पानी जम्दैन)' : 'Well-drained (Water never stays logged)'}</option>
                <option value="moderately-well-drained">{language === 'ne' ? 'मध्यम (भारी वर्षामा केही घण्टा जम्छ)' : 'Moderately well-drained (Temporary pooling)'}</option>
                <option value="poorly-drained">{language === 'ne' ? 'कमजोर निकास (लामो समय पानी जम्छ)' : 'Poorly drained (Water logs for days)'}</option>
                <option value="excessively-drained">{language === 'ne' ? 'धेरै चाँडो सुक्ने (बलौटे)' : 'Excessively drained (Dries very quickly)'}</option>
              </select>
            </div>

            {/* Optional Advanced Accordion */}
            <div className="pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowAdvancedSoil(!showAdvancedSoil)}
                className="flex items-center gap-2 text-xs font-medium text-forest-700 hover:text-forest-900 py-1"
              >
                {showAdvancedSoil ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>{t.farm.advancedSoil}</span>
              </button>

              {showAdvancedSoil && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">{t.farm.phLabel}</label>
                    <input
                      type="number"
                      step="0.1"
                      min="3.5"
                      max="9.5"
                      placeholder="e.g. 6.5"
                      value={soil.ph ?? ''}
                      onChange={(e) => updateSoil({ ph: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full p-2 border border-stone-300 rounded text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1">{t.farm.omLabel}</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      placeholder="e.g. 2.0"
                      value={soil.organicMatter ?? ''}
                      onChange={(e) => updateSoil({ organicMatter: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full p-2 border border-stone-300 rounded text-sm bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md font-medium text-sm bg-stone-100 hover:bg-stone-200 text-ink transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.workflow.back}</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-md font-semibold text-sm bg-forest-600 hover:bg-forest-700 text-white shadow-xs transition-colors"
            >
              <span>{t.workflow.next}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PRIORITIES & HORIZON */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs space-y-6">
            <div>
              <label className="block text-sm font-semibold text-ink mb-3">
                {t.priority.title}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Balanced Option */}
                <button
                  type="button"
                  onClick={() => setPriority('balanced')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    priority === 'balanced'
                      ? 'border-forest-600 bg-forest-50 text-forest-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-sm">
                    <span>{t.priority.balanced}</span>
                    {priority === 'balanced' && <Check className="w-4 h-4 text-forest-600" />}
                  </div>
                  <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                    {t.priority.balancedDesc}
                  </p>
                </button>

                {/* Water Saving Option */}
                <button
                  type="button"
                  onClick={() => setPriority('water-conservation')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    priority === 'water-conservation'
                      ? 'border-forest-600 bg-forest-50 text-forest-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-sm">
                    <span>{t.priority.water}</span>
                    {priority === 'water-conservation' && <Check className="w-4 h-4 text-forest-600" />}
                  </div>
                  <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                    {t.priority.waterDesc}
                  </p>
                </button>

                {/* Climate & Heat Option */}
                <button
                  type="button"
                  onClick={() => setPriority('climate-suitability')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    priority === 'climate-suitability'
                      ? 'border-forest-600 bg-forest-50 text-forest-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-sm">
                    <span>{t.priority.climate}</span>
                    {priority === 'climate-suitability' && <Check className="w-4 h-4 text-forest-600" />}
                  </div>
                  <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                    {t.priority.climateDesc}
                  </p>
                </button>

                {/* Soil Health Option */}
                <button
                  type="button"
                  onClick={() => setPriority('soil-health')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    priority === 'soil-health'
                      ? 'border-forest-600 bg-forest-50 text-forest-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-sm">
                    <span>{t.priority.soil}</span>
                    {priority === 'soil-health' && <Check className="w-4 h-4 text-forest-600" />}
                  </div>
                  <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                    {t.priority.soilDesc}
                  </p>
                </button>
              </div>
            </div>

            {/* Seasons & starting season */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-200">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  {t.priority.startSeasonLabel}
                </label>
                <select
                  value={startSeason}
                  onChange={(e) => updateFarmInputs({ planningStartSeason: e.target.value as 'kharif' | 'rabi' })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-md text-sm text-ink focus:outline-forest"
                >
                  <option value="kharif">{t.priority.kharif}</option>
                  <option value="rabi">{t.priority.rabi}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  {t.priority.seasonsLabel}
                </label>
                <select
                  value={planningSeasons}
                  onChange={(e) => updateFarmInputs({ planningSeasons: parseInt(e.target.value, 10) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-md text-sm text-ink focus:outline-forest"
                >
                  <option value="3">{language === 'ne' ? '३ सिजन (१ वर्ष - ३ बाली चक्र)' : '3 Seasons (1 Year - 3 Crops)'}</option>
                  <option value="4">{language === 'ne' ? '४ सिजन (सिफारिस गरिएको - १.५ वर्ष)' : '4 Seasons (Recommended - 1.5 Years)'}</option>
                  <option value="6">{language === 'ne' ? '६ सिजन (२ वर्ष - पूर्ण चक्र)' : '6 Seasons (2 Years - Full Cycle)'}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md font-medium text-sm bg-stone-100 hover:bg-stone-200 text-ink transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.workflow.back}</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-md font-semibold text-sm bg-forest-600 hover:bg-forest-700 text-white shadow-xs transition-colors"
            >
              <span>{t.workflow.next}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CROPS TO INCLUDE & GENERATION */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
              <div>
                <span className="text-xs font-medium text-forest-700">
                  {candidateIds.length} {t.crops.selectedCount}
                </span>
                <p className="text-2xs text-ink-muted">
                  {language === 'ne' ? 'छानिएका बालीहरू मिलाएर विभिन्न बाली चक्र तयार पारिनेछ।' : 'The rotation engine will combine these crops into verified sequences.'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectStandardSet}
                  className="px-3 py-1.5 rounded bg-forest-50 text-forest-700 hover:bg-forest-100 font-medium transition-colors"
                >
                  {t.crops.selectAll}
                </button>
                <button
                  type="button"
                  onClick={handleClearAllCrops}
                  className="px-3 py-1.5 rounded bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium transition-colors"
                >
                  {t.crops.clearAll}
                </button>
              </div>
            </div>

            {/* Crop Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {CROPS.map((crop) => {
                const isSelected = candidateIds.includes(crop.id);
                const nep = NEPALI_CROP_NAMES[crop.id];
                const title = language === 'ne' ? (nep?.nepaliName ?? crop.localName) : crop.name;
                const subtitle = language === 'ne' ? (nep?.localSubtitle ?? crop.name) : crop.localName;
                const category = language === 'ne' ? (NEPALI_CATEGORIES[crop.category] ?? crop.category) : crop.category;
                const season = language === 'ne' ? (NEPALI_SEASONS[crop.calendar.season] ?? crop.calendar.season) : crop.calendar.season;

                return (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => handleToggleCrop(crop.id)}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-forest-600 bg-forest-50 text-forest-900 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-ink'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold text-xs leading-tight">{title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />}
                      </div>
                      <span className="text-2xs text-ink-muted block mt-0.5 font-medium">{subtitle}</span>
                    </div>

                    <div className="mt-2 pt-1 border-t border-stone-200/60 flex items-center justify-between text-3xs text-ink-subtle">
                      <span className="capitalize">{category}</span>
                      <span>{season}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md font-medium text-sm bg-stone-100 hover:bg-stone-200 text-ink transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.workflow.back}</span>
            </button>
            <button
              onClick={handleGeneratePlans}
              className="flex items-center gap-2 px-8 py-3 rounded-md font-bold text-sm bg-forest-600 hover:bg-forest-700 text-white shadow-md transition-all scale-[1.01] active:scale-100"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.workflow.saveAndReview}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
