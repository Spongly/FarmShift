// ============================================================
// FarmShift Nepal — Integrated Soil Health & Fertilizer Guidance Module
// ============================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateFertilizerGuidance, type SoilTestInput, type FertilizerRecommendation } from '../services/soilNutrientService';
import { CROPS } from '../data/cropData';
import { Card, Button, Label, Input, Select } from './ui';
import { FlaskConical, Scale } from 'lucide-react';
import type { CropId } from '../types';

export function SoilNutrientModule() {
  const { state, updateSoil } = useApp();
  const { soil, language } = state;
  const isNe = language === 'ne';

  const [selectedCrop, setSelectedCrop] = useState<CropId>('rice-transplanted');
  const [areaUnit, setAreaUnit] = useState<'ropani' | 'bigha' | 'hectare'>('ropani');
  const [areaSize, setAreaSize] = useState<number>(1);
  const [legumePreceded, setLegumePreceded] = useState<boolean>(false);
  const [guidanceResult, setGuidanceResult] = useState<FertilizerRecommendation | null>(() => {
    return calculateFertilizerGuidance({
      areaUnit: 'ropani',
      areaSize: 1,
      ph: soil.ph ?? 6.2,
      organicMatterPct: soil.organicMatter ?? 2.0,
      texture: soil.texture,
      cropId: 'rice-transplanted',
      previousCropLegume: false,
    });
  });

  const handleCalculate = () => {
    const input: SoilTestInput = {
      areaUnit,
      areaSize,
      ph: soil.ph,
      organicMatterPct: soil.organicMatter,
      texture: soil.texture,
      cropId: selectedCrop,
      previousCropLegume: legumePreceded,
    };
    const res = calculateFertilizerGuidance(input);
    setGuidanceResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-forest-700" />
            <div>
              <h3 className="font-bold text-sm text-ink">
                {isNe ? 'माटो परीक्षण तथा बालीअनुसार मलखाद योजना' : 'Soil Health & Crop-Specific Fertilizer Calculator'}
              </h3>
              <p className="text-2xs text-ink-muted">
                {isNe ? 'नेपाल सरकार कृषि मन्त्रालय (MoALD) तथा NARC को सिफारिस मापदण्ड' : 'Based on official Nepal MoALD & NARC fertilizer dosage standards'}
              </p>
            </div>
          </div>
          <span className="text-2xs bg-stone-100 text-ink-secondary px-2.5 py-1 rounded font-mono">
            Standard: MoALD-2022
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="crop-select">{isNe ? 'लक्षित बाली' : 'Target Crop'}</Label>
            <Select
              id="crop-select"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value as CropId)}
            >
              {CROPS.map((c) => (
                <option key={c.id} value={c.id}>
                  {isNe ? c.localName : c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="area-size">{isNe ? 'खेतको क्षेत्रफल' : 'Farm Area'}</Label>
            <div className="flex gap-2">
              <Input
                id="area-size"
                type="number"
                min="0.1"
                step="0.5"
                value={areaSize}
                onChange={(e) => setAreaSize(parseFloat(e.target.value) || 1)}
                className="w-24"
              />
              <Select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value as 'ropani' | 'bigha' | 'hectare')}
              >
                <option value="ropani">{isNe ? 'रोपनी' : 'Ropani'}</option>
                <option value="bigha">{isNe ? 'बिघा' : 'Bigha'}</option>
                <option value="hectare">{isNe ? 'हेक्टर' : 'Hectare'}</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="soil-ph">{isNe ? 'माटोको पीएच (pH)' : 'Soil pH'}</Label>
            <Input
              id="soil-ph"
              type="number"
              step="0.1"
              min="3.5"
              max="9.5"
              placeholder="e.g. 6.2"
              value={soil.ph ?? ''}
              onChange={(e) => updateSoil({ ph: e.target.value ? parseFloat(e.target.value) : null })}
            />
            <span className="text-3xs text-ink-muted">Default: 6.2 (Neutral)</span>
          </div>

          <div>
            <Label htmlFor="soil-om">{isNe ? 'प्राङ्गारिक पदार्थ %' : 'Organic Matter %'}</Label>
            <Input
              id="soil-om"
              type="number"
              step="0.1"
              min="0"
              max="15"
              placeholder="e.g. 2.1"
              value={soil.organicMatter ?? ''}
              onChange={(e) => updateSoil({ organicMatter: e.target.value ? parseFloat(e.target.value) : null })}
            />
            <span className="text-3xs text-ink-muted">Default: 2.0%</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-stone-200">
          <label className="flex items-center gap-2 text-xs text-ink cursor-pointer select-none">
            <input
              type="checkbox"
              checked={legumePreceded}
              onChange={(e) => setLegumePreceded(e.target.checked)}
              className="rounded border-stone-300 text-forest-700 focus:ring-forest-600 h-4 w-4"
            />
            <span>
              {isNe ? 'अघिल्लो सिजनमा कोसे/दलहन बाली लगाइएको थियो (नाइट्रोजन छुट पाउने)' : 'Previous crop was a legume (Grants ~25 kg/ha Nitrogen credit)'}
            </span>
          </label>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCalculate}
            leftIcon={<Scale className="w-3.5 h-3.5" />}
          >
            {isNe ? 'मलखाद हिसाब गर्नुहोस्' : 'Calculate Application Rates'}
          </Button>
        </div>
      </Card>

      {/* Result Display */}
      {guidanceResult && (
        <div className="space-y-4">
          {/* Diagnostic Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card padding="md" className="space-y-2 bg-stone-50">
              <span className="text-2xs font-bold uppercase tracking-wider text-forest-800 font-mono">
                {isNe ? 'माटो परीक्षण विश्लेषण' : 'Soil Test Diagnosis'}
              </span>
              <ul className="text-xs text-ink space-y-1.5 list-disc pl-4">
                {(isNe ? guidanceResult.soilDiagnosisNe : guidanceResult.soilDiagnosisEn).map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </Card>

            <Card padding="md" className="space-y-2 bg-stone-50">
              <span className="text-2xs font-bold uppercase tracking-wider text-amber-800 font-mono">
                {isNe ? 'विशेष सावधानीहरू' : 'Agronomic Precautions'}
              </span>
              <ul className="text-xs text-ink-secondary space-y-1.5 list-disc pl-4">
                {(isNe ? guidanceResult.cautionsNe : guidanceResult.cautionsEn).map((c, i) => (
                  <li key={i} className="text-amber-900">{c}</li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Commercial Fertilizer Quantities */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card padding="sm" className="bg-white border-forest-200">
              <span className="text-2xs text-ink-muted uppercase font-mono">{isNe ? 'युरिया मल' : 'Urea (46% N)'}</span>
              <div className="text-lg font-bold text-forest-900 font-mono mt-0.5">
                {guidanceResult.commercialFertilizerTotal.ureaKg} <span className="text-xs font-normal">kg</span>
              </div>
              <span className="text-3xs text-ink-subtle">{isNe ? 'टप-ड्रेसिङमा विभाजित' : 'Split application'}</span>
            </Card>

            <Card padding="sm" className="bg-white border-forest-200">
              <span className="text-2xs text-ink-muted uppercase font-mono">{isNe ? 'डीएपी मल' : 'DAP (18:46:0)'}</span>
              <div className="text-lg font-bold text-forest-900 font-mono mt-0.5">
                {guidanceResult.commercialFertilizerTotal.dapKg} <span className="text-xs font-normal">kg</span>
              </div>
              <span className="text-3xs text-ink-subtle">{isNe ? 'रोप्ने बेला हाल्ने' : '100% at basal'}</span>
            </Card>

            <Card padding="sm" className="bg-white border-forest-200">
              <span className="text-2xs text-ink-muted uppercase font-mono">{isNe ? 'पोटास (MOP)' : 'Potash (MOP)'}</span>
              <div className="text-lg font-bold text-forest-900 font-mono mt-0.5">
                {guidanceResult.commercialFertilizerTotal.mopKg} <span className="text-xs font-normal">kg</span>
              </div>
              <span className="text-3xs text-ink-subtle">{isNe ? 'रोप्ने बेला हाल्ने' : '100% at basal'}</span>
            </Card>

            <Card padding="sm" className="bg-white border-stone-200">
              <span className="text-2xs text-ink-muted uppercase font-mono">{isNe ? 'कम्पोस्ट / गोबरमल' : 'Compost (FYM)'}</span>
              <div className="text-lg font-bold text-ink font-mono mt-0.5">
                {guidanceResult.commercialFertilizerTotal.compostKg} <span className="text-xs font-normal">kg</span>
              </div>
              <span className="text-3xs text-ink-subtle">{isNe ? 'जोत्ने बेला मिसाउने' : 'During deep tillage'}</span>
            </Card>

            <Card padding="sm" className="bg-white border-stone-200">
              <span className="text-2xs text-ink-muted uppercase font-mono">{isNe ? 'कृषि चुन' : 'Agri Lime'}</span>
              <div className="text-lg font-bold text-ink font-mono mt-0.5">
                {guidanceResult.commercialFertilizerTotal.agriculturalLimeKg} <span className="text-xs font-normal">kg</span>
              </div>
              <span className="text-3xs text-ink-subtle">{guidanceResult.commercialFertilizerTotal.agriculturalLimeKg > 0 ? (isNe ? 'अम्लीय माटोका लागि' : 'pH < 5.5 correction') : (isNe ? 'आवश्यक छैन' : 'Not required')}</span>
            </Card>
          </div>

          {/* Split Application Schedule Table */}
          <Card padding="md" className="space-y-3">
            <span className="text-xs font-bold text-ink block">
              {isNe ? 'मलखाद प्रयोग गर्ने समयतालिका' : 'Recommended Application Timing Schedule'}
            </span>
            <div className="space-y-2">
              {guidanceResult.applicationSchedule.map((s, idx) => (
                <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded text-xs space-y-1">
                  <div className="flex justify-between items-start font-semibold text-ink">
                    <span>{isNe ? s.stageNe : s.stage}</span>
                    <span className="text-forest-800 text-2xs font-mono">{isNe ? s.timingNe : s.timing}</span>
                  </div>
                  <p className="text-ink-secondary text-2xs">{isNe ? s.instructionsNe : s.instructionsEn}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
