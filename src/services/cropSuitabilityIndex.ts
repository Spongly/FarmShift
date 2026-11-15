// ============================================================
// FarmShift Nepal — Crop Suitability Index
// A transparent rule-based score: each factor is compared against the
// crop's tolerance range and the four factor scores are combined with
// fixed weights. Nothing here is trained or fitted to yield data.
// ============================================================

import type { CropId, MonthlyAggregate } from '../types';

export interface SuitabilityInputs {
  elevationMeters: number;
  sowingMonthTemp: number;
  seasonRainfallMm: number;
  soilPh: number;
  irrigationAvailable: number; // 0 or 1
}

export interface SuitabilityResult {
  cropId: CropId;
  suitabilityScore: number; // 0.0 to 1.0 index, not a probability
  suitabilityClass: 'Optimal' | 'Favorable' | 'Marginal' | 'Unsuitable';
  topFeatureInfluences: {
    featureName: string;
    impact: 'positive' | 'negative' | 'neutral';
    explanation: string;
  }[];
}

// ============================================================
// Per-crop tolerance ranges (min / optimal band / max)
// Hand-set in the style of FAO ECOCROP crop envelopes; not yet
// validated against Nepal district yield statistics.
// ============================================================

interface CropModelSpec {
  elevation: { min: number; optMin: number; optMax: number; max: number };
  temp: { min: number; optMin: number; optMax: number; max: number };
  water: { min: number; optMin: number; optMax: number; max: number };
  ph: { min: number; optMin: number; optMax: number; max: number };
}

const CROP_MODELS: Record<CropId, CropModelSpec> = {
  'rice-transplanted': {
    elevation: { min: 50, optMin: 100, optMax: 1600, max: 2200 },
    temp: { min: 16, optMin: 22, optMax: 32, max: 38 },
    water: { min: 700, optMin: 900, optMax: 1400, max: 2500 },
    ph: { min: 5.0, optMin: 5.5, optMax: 7.0, max: 8.0 },
  },
  'rice-direct-seeded': {
    elevation: { min: 50, optMin: 100, optMax: 1400, max: 1800 },
    temp: { min: 16, optMin: 22, optMax: 32, max: 38 },
    water: { min: 500, optMin: 700, optMax: 1100, max: 1800 },
    ph: { min: 5.2, optMin: 5.5, optMax: 7.0, max: 8.0 },
  },
  'wheat': {
    elevation: { min: 50, optMin: 100, optMax: 2000, max: 3000 },
    temp: { min: 6, optMin: 12, optMax: 22, max: 30 },
    water: { min: 250, optMin: 350, optMax: 550, max: 800 },
    ph: { min: 5.5, optMin: 6.0, optMax: 7.5, max: 8.2 },
  },
  'maize': {
    elevation: { min: 50, optMin: 200, optMax: 2200, max: 2600 },
    temp: { min: 12, optMin: 20, optMax: 30, max: 36 },
    water: { min: 350, optMin: 500, optMax: 800, max: 1200 },
    ph: { min: 5.4, optMin: 5.8, optMax: 7.2, max: 8.0 },
  },
  'lentil': {
    elevation: { min: 50, optMin: 80, optMax: 1400, max: 1800 },
    temp: { min: 5, optMin: 12, optMax: 24, max: 30 },
    water: { min: 180, optMin: 250, optMax: 400, max: 600 },
    ph: { min: 5.8, optMin: 6.2, optMax: 7.8, max: 8.5 },
  },
  'chickpea': {
    elevation: { min: 50, optMin: 80, optMax: 1000, max: 1400 },
    temp: { min: 6, optMin: 15, optMax: 26, max: 32 },
    water: { min: 150, optMin: 220, optMax: 380, max: 550 },
    ph: { min: 6.0, optMin: 6.5, optMax: 8.0, max: 8.5 },
  },
  'blackgram': {
    elevation: { min: 50, optMin: 100, optMax: 1200, max: 1600 },
    temp: { min: 18, optMin: 25, optMax: 34, max: 40 },
    water: { min: 250, optMin: 350, optMax: 550, max: 800 },
    ph: { min: 5.8, optMin: 6.2, optMax: 7.5, max: 8.0 },
  },
  'soybean': {
    elevation: { min: 200, optMin: 600, optMax: 1800, max: 2200 },
    temp: { min: 15, optMin: 22, optMax: 29, max: 35 },
    water: { min: 400, optMin: 500, optMax: 750, max: 1100 },
    ph: { min: 5.8, optMin: 6.2, optMax: 7.2, max: 7.8 },
  },
  'mustard': {
    elevation: { min: 50, optMin: 100, optMax: 1800, max: 2400 },
    temp: { min: 6, optMin: 12, optMax: 22, max: 30 },
    water: { min: 180, optMin: 250, optMax: 400, max: 600 },
    ph: { min: 5.5, optMin: 6.0, optMax: 7.5, max: 8.2 },
  },
  'potato': {
    elevation: { min: 200, optMin: 800, optMax: 2800, max: 3600 },
    temp: { min: 6, optMin: 14, optMax: 20, max: 28 },
    water: { min: 350, optMin: 450, optMax: 650, max: 900 },
    ph: { min: 4.8, optMin: 5.2, optMax: 6.5, max: 7.5 },
  },
  'millet-finger': {
    elevation: { min: 300, optMin: 800, optMax: 2400, max: 2800 },
    temp: { min: 15, optMin: 22, optMax: 32, max: 38 },
    water: { min: 250, optMin: 350, optMax: 600, max: 900 },
    ph: { min: 4.8, optMin: 5.5, optMax: 7.5, max: 8.2 },
  },
  'buckwheat': {
    elevation: { min: 1200, optMin: 1800, optMax: 3600, max: 4200 },
    temp: { min: 5, optMin: 14, optMax: 22, max: 28 },
    water: { min: 180, optMin: 220, optMax: 380, max: 550 },
    ph: { min: 4.5, optMin: 5.0, optMax: 7.2, max: 8.0 },
  },
  'tomato-winter': {
    elevation: { min: 50, optMin: 100, optMax: 1500, max: 1900 },
    temp: { min: 10, optMin: 18, optMax: 27, max: 34 },
    water: { min: 350, optMin: 450, optMax: 650, max: 900 },
    ph: { min: 5.8, optMin: 6.2, optMax: 7.0, max: 7.8 },
  },
  'spinach': {
    elevation: { min: 50, optMin: 100, optMax: 2000, max: 2400 },
    temp: { min: 4, optMin: 10, optMax: 18, max: 26 },
    water: { min: 150, optMin: 200, optMax: 350, max: 500 },
    ph: { min: 6.2, optMin: 6.5, optMax: 7.5, max: 8.0 },
  },
  'barley': {
    elevation: { min: 800, optMin: 1500, optMax: 3500, max: 4000 },
    temp: { min: 3, optMin: 10, optMax: 20, max: 28 },
    water: { min: 200, optMin: 250, optMax: 450, max: 650 },
    ph: { min: 6.0, optMin: 6.5, optMax: 8.0, max: 8.5 },
  },
  'pigeonpea': {
    elevation: { min: 50, optMin: 100, optMax: 1000, max: 1400 },
    temp: { min: 18, optMin: 24, optMax: 35, max: 40 },
    water: { min: 400, optMin: 600, optMax: 900, max: 1300 },
    ph: { min: 5.5, optMin: 6.0, optMax: 7.5, max: 8.2 },
  },
  'cowpea': {
    elevation: { min: 50, optMin: 100, optMax: 1400, max: 1800 },
    temp: { min: 16, optMin: 22, optMax: 34, max: 38 },
    water: { min: 300, optMin: 400, optMax: 650, max: 900 },
    ph: { min: 5.5, optMin: 6.0, optMax: 7.2, max: 7.8 },
  },
  'fieldpea': {
    elevation: { min: 50, optMin: 200, optMax: 2200, max: 2800 },
    temp: { min: 5, optMin: 12, optMax: 20, max: 27 },
    water: { min: 250, optMin: 350, optMax: 500, max: 700 },
    ph: { min: 6.0, optMin: 6.5, optMax: 7.5, max: 8.0 },
  },
  'rajma-bean': {
    elevation: { min: 600, optMin: 1200, optMax: 2600, max: 3000 },
    temp: { min: 10, optMin: 16, optMax: 25, max: 30 },
    water: { min: 350, optMin: 450, optMax: 700, max: 950 },
    ph: { min: 5.8, optMin: 6.2, optMax: 7.0, max: 7.8 },
  },
  'sesame': {
    elevation: { min: 50, optMin: 100, optMax: 1200, max: 1500 },
    temp: { min: 18, optMin: 25, optMax: 35, max: 40 },
    water: { min: 250, optMin: 350, optMax: 600, max: 850 },
    ph: { min: 5.5, optMin: 6.2, optMax: 7.5, max: 8.0 },
  },
  'groundnut': {
    elevation: { min: 50, optMin: 100, optMax: 1100, max: 1400 },
    temp: { min: 18, optMin: 24, optMax: 33, max: 38 },
    water: { min: 400, optMin: 500, optMax: 750, max: 1000 },
    ph: { min: 5.8, optMin: 6.0, optMax: 7.0, max: 7.8 },
  },
  'sunflower': {
    elevation: { min: 50, optMin: 100, optMax: 1500, max: 2000 },
    temp: { min: 12, optMin: 20, optMax: 30, max: 36 },
    water: { min: 300, optMin: 450, optMax: 700, max: 950 },
    ph: { min: 6.0, optMin: 6.5, optMax: 7.8, max: 8.2 },
  },
  'cauliflower': {
    elevation: { min: 50, optMin: 100, optMax: 2200, max: 2600 },
    temp: { min: 8, optMin: 14, optMax: 22, max: 28 },
    water: { min: 300, optMin: 400, optMax: 600, max: 800 },
    ph: { min: 6.0, optMin: 6.5, optMax: 7.5, max: 8.0 },
  },
  'cabbage': {
    elevation: { min: 50, optMin: 100, optMax: 2400, max: 2800 },
    temp: { min: 6, optMin: 12, optMax: 22, max: 28 },
    water: { min: 300, optMin: 400, optMax: 600, max: 850 },
    ph: { min: 6.0, optMin: 6.5, optMax: 7.5, max: 8.0 },
  },
  'radish': {
    elevation: { min: 50, optMin: 100, optMax: 2600, max: 3200 },
    temp: { min: 6, optMin: 12, optMax: 24, max: 30 },
    water: { min: 200, optMin: 280, optMax: 450, max: 650 },
    ph: { min: 5.8, optMin: 6.2, optMax: 7.2, max: 7.8 },
  },
  'onion': {
    elevation: { min: 50, optMin: 100, optMax: 2000, max: 2400 },
    temp: { min: 10, optMin: 16, optMax: 26, max: 32 },
    water: { min: 350, optMin: 450, optMax: 650, max: 850 },
    ph: { min: 6.0, optMin: 6.5, optMax: 7.5, max: 8.0 },
  },
  'garlic': {
    elevation: { min: 50, optMin: 100, optMax: 2200, max: 2600 },
    temp: { min: 8, optMin: 14, optMax: 24, max: 30 },
    water: { min: 300, optMin: 400, optMax: 600, max: 800 },
    ph: { min: 6.0, optMin: 6.5, optMax: 7.5, max: 8.0 },
  },
  'chilli': {
    elevation: { min: 50, optMin: 100, optMax: 1600, max: 2000 },
    temp: { min: 15, optMin: 20, optMax: 30, max: 36 },
    water: { min: 350, optMin: 500, optMax: 750, max: 1000 },
    ph: { min: 5.8, optMin: 6.2, optMax: 7.2, max: 7.8 },
  },
  'ginger': {
    elevation: { min: 300, optMin: 600, optMax: 1600, max: 2000 },
    temp: { min: 18, optMin: 22, optMax: 30, max: 35 },
    water: { min: 1000, optMin: 1300, optMax: 1800, max: 2400 },
    ph: { min: 5.5, optMin: 5.8, optMax: 6.8, max: 7.5 },
  },
  'turmeric': {
    elevation: { min: 100, optMin: 300, optMax: 1400, max: 1800 },
    temp: { min: 18, optMin: 24, optMax: 32, max: 38 },
    water: { min: 800, optMin: 1100, optMax: 1600, max: 2200 },
    ph: { min: 5.5, optMin: 6.0, optMax: 7.2, max: 7.8 },
  },
  'eggplant': {
    elevation: { min: 50, optMin: 100, optMax: 1500, max: 1800 },
    temp: { min: 16, optMin: 22, optMax: 32, max: 36 },
    water: { min: 400, optMin: 500, optMax: 750, max: 1000 },
    ph: { min: 5.8, optMin: 6.2, optMax: 7.2, max: 7.8 },
  },
  'okra': {
    elevation: { min: 50, optMin: 100, optMax: 1300, max: 1600 },
    temp: { min: 18, optMin: 24, optMax: 35, max: 40 },
    water: { min: 350, optMin: 450, optMax: 700, max: 950 },
    ph: { min: 6.0, optMin: 6.5, optMax: 7.5, max: 8.0 },
  },
  'cucumber': {
    elevation: { min: 50, optMin: 100, optMax: 1800, max: 2200 },
    temp: { min: 15, optMin: 20, optMax: 30, max: 35 },
    water: { min: 350, optMin: 450, optMax: 650, max: 900 },
    ph: { min: 5.8, optMin: 6.2, optMax: 7.2, max: 7.8 },
  },
  'pumpkin': {
    elevation: { min: 50, optMin: 100, optMax: 2000, max: 2400 },
    temp: { min: 14, optMin: 20, optMax: 30, max: 36 },
    water: { min: 350, optMin: 500, optMax: 750, max: 1000 },
    ph: { min: 5.8, optMin: 6.2, optMax: 7.2, max: 7.8 },
  },
  'sugarcane': {
    elevation: { min: 50, optMin: 80, optMax: 800, max: 1200 },
    temp: { min: 18, optMin: 26, optMax: 36, max: 42 },
    water: { min: 1200, optMin: 1500, optMax: 2200, max: 2800 },
    ph: { min: 6.0, optMin: 6.5, optMax: 7.5, max: 8.2 },
  },
  'mandarin-orange': {
    elevation: { min: 600, optMin: 800, optMax: 1500, max: 1700 },
    temp: { min: 10, optMin: 18, optMax: 28, max: 34 },
    water: { min: 900, optMin: 1200, optMax: 1600, max: 2200 },
    ph: { min: 5.5, optMin: 6.0, optMax: 7.0, max: 7.5 },
  },
};

function scoreBoundedDimension(val: number, spec: { min: number; optMin: number; optMax: number; max: number }): number {
  if (val < spec.min || val > spec.max) return 0.05;
  if (val >= spec.optMin && val <= spec.optMax) return 1.0;
  if (val < spec.optMin) {
    return 0.2 + 0.8 * ((val - spec.min) / (spec.optMin - spec.min));
  }
  return 0.2 + 0.8 * ((spec.max - val) / (spec.max - spec.optMax));
}

/**
 * Sowing-month temperature and growing-season rainfall for a crop, taken from
 * the multi-year monthly climate record. Returns null when the record has no
 * usable values, so callers never score a crop on made-up inputs.
 */
export function seasonClimateFor(
  monthly: MonthlyAggregate[],
  sowingMonths: number[],
  harvestMonths: number[]
): { sowingMonthTemp: number; seasonRainfallMm: number } | null {
  const sow = sowingMonths[0];
  const harvest = harvestMonths[harvestMonths.length - 1];
  if (!sow || !harvest) return null;

  const normal = (month: number, key: 'tempMean' | 'precipitation'): number | null => {
    const vals = monthly.filter((m) => m.month === month).map((m) => m[key]).filter((v): v is number => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  const sowingMonthTemp = normal(sow, 'tempMean');
  if (sowingMonthTemp == null) return null;

  // Growing months run from sowing to harvest, wrapping past December.
  let seasonRainfallMm = 0;
  for (let m = sow, i = 0; i < 12; m = (m % 12) + 1, i++) {
    const rain = normal(m, 'precipitation');
    if (rain == null) return null;
    seasonRainfallMm += rain;
    if (m === harvest) break;
  }

  return { sowingMonthTemp, seasonRainfallMm };
}

export function predictCropSuitability(cropId: CropId, features: SuitabilityInputs): SuitabilityResult {
  const spec = CROP_MODELS[cropId] ?? CROP_MODELS['maize'];

  const elevScore = scoreBoundedDimension(features.elevationMeters, spec.elevation);
  const tempScore = scoreBoundedDimension(features.sowingMonthTemp, spec.temp);
  const phScore = scoreBoundedDimension(features.soilPh, spec.ph);

  // Effective water combines rainfall and irrigation
  const effectiveWater = features.seasonRainfallMm + (features.irrigationAvailable > 0 ? 300 : 0);
  const waterScore = scoreBoundedDimension(effectiveWater, spec.water);

  // Fixed expert weights (temperature and water matter most)
  const weighted = 0.35 * tempScore + 0.30 * waterScore + 0.20 * elevScore + 0.15 * phScore;
  const suitabilityScore = Math.round(weighted * 100) / 100;

  let suitabilityClass: SuitabilityResult['suitabilityClass'] = 'Marginal';
  if (suitabilityScore >= 0.78) suitabilityClass = 'Optimal';
  else if (suitabilityScore >= 0.60) suitabilityClass = 'Favorable';
  else if (suitabilityScore < 0.35) suitabilityClass = 'Unsuitable';

  const influences: SuitabilityResult['topFeatureInfluences'] = [];

  influences.push({
    featureName: 'Temperature Envelope',
    impact: tempScore >= 0.7 ? 'positive' : tempScore < 0.4 ? 'negative' : 'neutral',
    explanation: `Sowing month temperature (${features.sowingMonthTemp.toFixed(1)}°C) evaluated against ${spec.temp.optMin}–${spec.temp.optMax}°C optimal bounds.`,
  });

  influences.push({
    featureName: 'Water & Irrigation Balance',
    impact: waterScore >= 0.7 ? 'positive' : waterScore < 0.4 ? 'negative' : 'neutral',
    explanation: `Effective available moisture (~${Math.round(effectiveWater)} mm) vs ${spec.water.optMin}–${spec.water.optMax} mm required footprint.`,
  });

  influences.push({
    featureName: 'Elevation Adaptability',
    impact: elevScore >= 0.7 ? 'positive' : elevScore < 0.4 ? 'negative' : 'neutral',
    explanation: `Farm elevation (${Math.round(features.elevationMeters)} m) compared against optimal range of ${spec.elevation.optMin}–${spec.elevation.optMax} m.`,
  });

  return {
    cropId,
    suitabilityScore,
    suitabilityClass,
    topFeatureInfluences: influences,
  };
}
