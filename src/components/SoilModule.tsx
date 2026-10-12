import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, SectionHeader, Label, Input, Select } from './ui';
import { SOIL_TEXTURE_LABELS, DRAINAGE_LABELS } from '../data/cropData';
import type { SoilTexture, DrainageClass } from '../types';

const NEPALI_SOIL_TEXTURE_LABELS: Record<SoilTexture, string> = {
  'clay': 'चिम्ट्याइलो माटो (Clay)',
  'silty-clay': 'पाँगो-चिम्ट्याइलो माटो (Silty Clay)',
  'clay-loam': 'चिम्ट्याइलो दोमट माटो (Clay Loam)',
  'silty-clay-loam': 'पाँगो दोमट माटो (Silty Clay Loam)',
  'silt-loam': 'पाँगो माटो (Silt Loam)',
  'loam': 'दोमट / मध्यम माटो (Loam)',
  'sandy-loam': 'बलौटे दोमट माटो (Sandy Loam)',
  'loamy-sand': 'दोमट बलौटे माटो (Loamy Sand)',
  'sandy': 'बलौटे माटो (Sandy)',
  'unknown': 'थाहा छैन / सामान्य',
};

const NEPALI_DRAINAGE_LABELS: Record<DrainageClass, string> = {
  'poorly-drained': 'कमजोर निकास / पानी जम्ने',
  'somewhat-poorly-drained': 'पानी ढिलो सुक्ने',
  'moderately-well-drained': 'मध्यम निकास (केही घण्टा जम्ने)',
  'well-drained': 'राम्रो निकास (पानी नजम्ने)',
  'somewhat-excessively-drained': 'पानी चाँडै सुक्ने',
  'excessively-drained': 'अत्यधिक निकास / खुकुलो',
  'unknown': 'थाहा छैन / सामान्य',
};

export function SoilModule() {
  const { state, updateSoil } = useApp();
  const { soil, language } = state;
  const ne = language === 'ne';

  const textureLabels = ne ? NEPALI_SOIL_TEXTURE_LABELS : SOIL_TEXTURE_LABELS;
  const drainageLabels = ne ? NEPALI_DRAINAGE_LABELS : DRAINAGE_LABELS;

  return (
    <Card padding="md" className="space-y-4">
      <SectionHeader
        mono={ne ? 'माटो तथा खेतका कारकहरू' : 'EDAPHIC FACTORS'}
        title={ne ? 'माटो तथा खेतको अवस्था' : 'Soil & Field Parameters'}
        subtitle={
          ne
            ? 'स्थानीय माटोको गुणस्तरले मलको प्रभावकारिता, पानी निकास र बाली उपयुक्तता निर्धारण गर्छ।'
            : 'Local soil properties inform nutrient buffering, drainage risks, and crop suitability.'
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Soil Texture */}
        <div>
          <Label htmlFor="soil-texture">{ne ? 'माटोको किसिम' : 'Soil Texture'}</Label>
          <Select
            id="soil-texture"
            value={soil.texture}
            onChange={(e) => updateSoil({ texture: e.target.value as SoilTexture })}
          >
            {Object.entries(textureLabels).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </Select>
          <p className="text-2xs text-ink-subtle mt-1">
            {ne ? 'पानी थाम्ने क्षमता र खनजोत सहजता निर्धारण गर्छ।' : 'Determines water retention and tilth.'}
          </p>
        </div>

        {/* Drainage Class */}
        <div>
          <Label htmlFor="soil-drainage">{ne ? 'पानी निकासको अवस्था' : 'Drainage Condition'}</Label>
          <Select
            id="soil-drainage"
            value={soil.drainage}
            onChange={(e) => updateSoil({ drainage: e.target.value as DrainageClass })}
          >
            {Object.entries(drainageLabels).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </Select>
          <p className="text-2xs text-ink-subtle mt-1">
            {ne ? 'मनसुनको समयमा खेतमा पानी जम्ने जोखिम देखाउँछ।' : 'Identifies waterlogging risk during monsoon.'}
          </p>
        </div>

        {/* Soil pH */}
        <div>
          <Label htmlFor="soil-ph">{ne ? 'माटोको pH मान (ऐच्छिक)' : 'Soil pH (Optional)'}</Label>
          <Input
            id="soil-ph"
            type="number"
            step="0.1"
            min="3.5"
            max="9.5"
            placeholder="e.g. 6.5"
            value={soil.ph ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : parseFloat(e.target.value);
              updateSoil({ ph: val });
            }}
          />
          <p className="text-2xs text-ink-subtle mt-1">
            {ne ? 'सामान्य बाली दायरा: ५.५ देखि ७.५' : 'Normal crop range: 5.5 - 7.5'}
          </p>
        </div>

        {/* Soil Organic Matter */}
        <div>
          <Label htmlFor="soil-om">{ne ? 'प्राङ्गारिक पदार्थ % (ऐच्छिक)' : 'Organic Matter % (Optional)'}</Label>
          <Input
            id="soil-om"
            type="number"
            step="0.1"
            min="0"
            max="20"
            placeholder="e.g. 2.1"
            value={soil.organicMatter ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : parseFloat(e.target.value);
              updateSoil({ organicMatter: val });
            }}
          />
          <p className="text-2xs text-ink-subtle mt-1">
            {ne ? 'नेपालको पहाडी माटोमा सामान्य: १.०% देखि ३.०%' : 'Typical Nepal hill soil: 1.0 - 3.0%'}
          </p>
        </div>
      </div>

      {/* Irrigation Checkbox & Notes */}
      <div className="pt-2 border-t border-paper-300 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-paper-300 text-forest focus:ring-forest h-4 w-4"
            checked={soil.irrigationAvailable}
            onChange={(e) => updateSoil({ irrigationAvailable: e.target.checked })}
          />
          <span className="text-sm font-medium text-ink">
            {ne ? 'भरपर्दो थप सिँचाइ सुविधा उपलब्ध छ' : 'Reliable supplementary irrigation available'}
          </span>
        </label>
        <p className="text-xs text-ink-muted pl-6">
          {ne
            ? 'सिँचाइ उपलब्ध हुँदा हिउँद र चैते बाली (गहुँ, तोरी, तरकारी) मा पानीको अभाव कम हुन्छ।'
            : 'Enabling irrigation mitigates dry-season soil moisture deficits for winter/spring crops (wheat, mustard, winter vegetables).'}
        </p>

        <div>
          <Label htmlFor="soil-notes">
            {ne ? 'माटो परीक्षण वा खेतको विगतको टिप्पणी' : 'Soil Testing / Farm History Notes'}
          </Label>
          <Input
            id="soil-notes"
            type="text"
            placeholder={
              ne
                ? 'जस्तै: भिरालो गरा; साउनमा बाढी पस्ने समस्या; अघिल्लो वर्ष चुन हालिएको'
                : 'e.g. Terraced slope; historical flooding in July; lime added last season'
            }
            value={soil.notes}
            onChange={(e) => updateSoil({ notes: e.target.value })}
          />
        </div>
      </div>
    </Card>
  );
}
