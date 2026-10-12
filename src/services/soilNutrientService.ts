// ============================================================
// FarmShift Nepal — Soil Testing & Fertilizer Decision Support
// Based on Nepal MoALD & NARC Standard Agronomic Standards
// ============================================================

import type { SoilTexture, CropId } from '../types';

export interface SoilTestInput {
  areaUnit: 'ropani' | 'bigha' | 'hectare';
  areaSize: number;
  ph: number | null;
  organicMatterPct: number | null; // % (OM)
  availableNitrogenKgHa?: number | null; // N rating
  availablePhosphorusKgHa?: number | null; // P2O5 rating
  availablePotassiumKgHa?: number | null; // K2O rating
  texture: SoilTexture;
  cropId: CropId;
  previousCropLegume?: boolean;
  compostAppliedKg?: number; // Farmyard manure already planned/applied
}

export interface NutrientDose {
  nitrogenKgHa: number;
  phosphorusKgHa: number;
  potassiumKgHa: number;
}

export interface CommercialFertilizerPlan {
  ureaKg: number; // 46% N
  dapKg: number;  // 18% N, 46% P2O5
  mopKg: number;  // 60% K2O
  compostKg: number; // Farmyard manure / organic compost
  agriculturalLimeKg: number; // For acidic soils (pH < 5.5)
}

export interface FertilizerRecommendation {
  cropId: CropId;
  soilDiagnosisEn: string[];
  soilDiagnosisNe: string[];
  recommendedNutrientsKgHa: NutrientDose;
  commercialFertilizerTotal: CommercialFertilizerPlan;
  applicationSchedule: {
    stage: string;
    stageNe: string;
    timing: string;
    timingNe: string;
    instructionsEn: string;
    instructionsNe: string;
  }[];
  cautionsEn: string[];
  cautionsNe: string[];
  citations: string[];
}

// ============================================================
// Standard Crop Baseline Requirements (MoALD / NARC Standards)
// Values in kg/ha of pure N : P2O5 : K2O
// ============================================================

const CROP_NUTRIENT_BASELINES: Record<CropId, { n: number; p: number; k: number; targetPhMin: number; targetPhMax: number }> = {
  'rice-transplanted': { n: 100, p: 40, k: 30, targetPhMin: 5.5, targetPhMax: 7.0 },
  'rice-direct-seeded': { n: 90, p: 40, k: 30, targetPhMin: 5.5, targetPhMax: 7.0 },
  'wheat': { n: 100, p: 50, k: 40, targetPhMin: 6.0, targetPhMax: 7.5 },
  'maize': { n: 120, p: 60, k: 40, targetPhMin: 5.8, targetPhMax: 7.2 },
  'lentil': { n: 20, p: 40, k: 20, targetPhMin: 6.0, targetPhMax: 7.8 },
  'chickpea': { n: 20, p: 40, k: 20, targetPhMin: 6.0, targetPhMax: 7.8 },
  'blackgram': { n: 20, p: 40, k: 20, targetPhMin: 6.0, targetPhMax: 7.5 },
  'soybean': { n: 25, p: 50, k: 30, targetPhMin: 6.0, targetPhMax: 7.2 },
  'mustard': { n: 60, p: 40, k: 20, targetPhMin: 5.5, targetPhMax: 7.5 },
  'potato': { n: 120, p: 80, k: 80, targetPhMin: 5.0, targetPhMax: 6.5 },
  'millet-finger': { n: 50, p: 30, k: 20, targetPhMin: 5.0, targetPhMax: 7.5 },
  'buckwheat': { n: 40, p: 30, k: 20, targetPhMin: 4.8, targetPhMax: 7.0 },
  'tomato-winter': { n: 120, p: 80, k: 60, targetPhMin: 6.0, targetPhMax: 7.0 },
  'spinach': { n: 60, p: 30, k: 30, targetPhMin: 6.5, targetPhMax: 7.5 },
  'barley': { n: 60, p: 30, k: 20, targetPhMin: 6.0, targetPhMax: 8.0 },
  'pigeonpea': { n: 25, p: 50, k: 20, targetPhMin: 5.5, targetPhMax: 7.5 },
  'cowpea': { n: 25, p: 50, k: 25, targetPhMin: 5.5, targetPhMax: 7.2 },
  'fieldpea': { n: 25, p: 50, k: 30, targetPhMin: 6.0, targetPhMax: 7.5 },
  'rajma-bean': { n: 40, p: 60, k: 40, targetPhMin: 5.8, targetPhMax: 7.2 },
  'sesame': { n: 40, p: 30, k: 20, targetPhMin: 5.8, targetPhMax: 7.5 },
  'groundnut': { n: 25, p: 50, k: 40, targetPhMin: 5.8, targetPhMax: 7.0 },
  'sunflower': { n: 60, p: 40, k: 40, targetPhMin: 6.0, targetPhMax: 7.5 },
  'cauliflower': { n: 120, p: 80, k: 60, targetPhMin: 6.0, targetPhMax: 7.2 },
  'cabbage': { n: 120, p: 80, k: 60, targetPhMin: 6.0, targetPhMax: 7.2 },
  'radish': { n: 80, p: 50, k: 50, targetPhMin: 5.8, targetPhMax: 7.2 },
  'onion': { n: 100, p: 60, k: 80, targetPhMin: 6.0, targetPhMax: 7.5 },
  'garlic': { n: 100, p: 60, k: 60, targetPhMin: 6.0, targetPhMax: 7.5 },
  'chilli': { n: 100, p: 60, k: 60, targetPhMin: 5.8, targetPhMax: 7.2 },
  'ginger': { n: 75, p: 50, k: 50, targetPhMin: 5.5, targetPhMax: 6.8 },
  'turmeric': { n: 75, p: 50, k: 50, targetPhMin: 5.5, targetPhMax: 7.0 },
  'eggplant': { n: 100, p: 60, k: 60, targetPhMin: 5.8, targetPhMax: 7.2 },
  'okra': { n: 80, p: 50, k: 50, targetPhMin: 6.0, targetPhMax: 7.5 },
  'cucumber': { n: 80, p: 50, k: 50, targetPhMin: 5.8, targetPhMax: 7.2 },
  'pumpkin': { n: 80, p: 50, k: 50, targetPhMin: 5.8, targetPhMax: 7.2 },
  'sugarcane': { n: 150, p: 60, k: 60, targetPhMin: 6.0, targetPhMax: 7.8 },
  'mandarin-orange': { n: 100, p: 50, k: 80, targetPhMin: 5.5, targetPhMax: 7.0 },
};

// Unit conversions to Hectares
const AREA_TO_HECTARES: Record<'ropani' | 'bigha' | 'hectare', number> = {
  ropani: 0.05087, // 1 Ropani ≈ 508.7 m² = 0.05087 ha
  bigha: 0.67726,  // 1 Bigha ≈ 6772.6 m² = 0.67726 ha
  hectare: 1.0,
};

export function calculateFertilizerGuidance(input: SoilTestInput): FertilizerRecommendation {
  const baseline = CROP_NUTRIENT_BASELINES[input.cropId] ?? { n: 80, p: 40, k: 30, targetPhMin: 5.5, targetPhMax: 7.0 };
  const areaHa = input.areaSize * (AREA_TO_HECTARES[input.areaUnit] ?? 0.05087);

  const diagnosisEn: string[] = [];
  const diagnosisNe: string[] = [];
  const cautionsEn: string[] = [];
  const cautionsNe: string[] = [];

  let adjN = baseline.n;
  let adjP = baseline.p;
  const adjK = baseline.k;
  let limeKgHa = 0;

  // 1. pH Evaluation & Liming
  if (input.ph !== null) {
    if (input.ph < 5.0) {
      diagnosisEn.push(`Strongly acidic soil (pH ${input.ph.toFixed(1)}). High aluminum toxicity and severe phosphorus fixation.`);
      diagnosisNe.push(`माटो अत्यधिक अम्लीय छ (पीएच ${input.ph.toFixed(1)})। बिरुवाले फस्फोरस सोस्न नसक्ने जोखिम छ।`);
      limeKgHa = 2500; // ~125 kg per ropani
      cautionsEn.push('Broadcast agricultural lime 3-4 weeks prior to seeding and till into soil.');
      cautionsNe.push('बीउ रोप्नुभन्दा ३-४ हप्ता अगावै कृषि चुन माटोमा मिसाउनुहोस्।');
    } else if (input.ph < 5.5) {
      diagnosisEn.push(`Moderately acidic soil (pH ${input.ph.toFixed(1)}). Lime recommended for optimal nutrient availability.`);
      diagnosisNe.push(`माटो मध्यम अम्लीय छ (पीएच ${input.ph.toFixed(1)})। कृषि चुन प्रयोग गर्न सिफारिस गरिन्छ।`);
      limeKgHa = 1500;
    } else if (input.ph > 7.8) {
      diagnosisEn.push(`Alkaline soil (pH ${input.ph.toFixed(1)}). Micronutrient (zinc, iron) availability is restricted.`);
      diagnosisNe.push(`माटो क्षारीय छ (पीएच ${input.ph.toFixed(1)})। जिंक र फलाम तत्वको कमी हुन सक्छ।`);
      adjP = adjP * 1.15; // compensate for alkaline fixation
    } else {
      diagnosisEn.push(`Soil pH (${input.ph.toFixed(1)}) is well-balanced for most field crops.`);
      diagnosisNe.push(`माटोको पीएच (${input.ph.toFixed(1)}) बाली उत्पादनका लागि उत्तम छ।`);
    }
  }

  // 2. Organic Matter Credit
  if (input.organicMatterPct !== null) {
    if (input.organicMatterPct < 1.5) {
      diagnosisEn.push(`Low soil organic matter (${input.organicMatterPct}%). Soil requires generous farmyard manure.`);
      diagnosisNe.push(`माटोमा प्राङ्गारिक पदार्थ निकै कम (${input.organicMatterPct}%) छ। गोबरमल बढाउनु आवश्यक छ।`);
      adjN += 15;
    } else if (input.organicMatterPct >= 3.0) {
      diagnosisEn.push(`High soil organic matter (${input.organicMatterPct}%). Natural nitrogen mineralization is active.`);
      diagnosisNe.push(`माटोमा प्राङ्गारिक पदार्थ राम्रो (${input.organicMatterPct}%) छ।`);
      adjN = Math.max(20, adjN - 20); // 20 kg N credit
    }
  }

  // 3. Preceding Legume Credit
  if (input.previousCropLegume) {
    diagnosisEn.push('Preceding crop was a nitrogen-fixing legume. Nitrogen requirement reduced by 25 kg/ha.');
    diagnosisNe.push('अघिल्लो बाली दलहन (कोसे) भएकाले नाइट्रोजन मल २५ केजी/हेक्टर घटाउन सकिन्छ।');
    adjN = Math.max(15, adjN - 25);
  }

  // 4. Commercial Fertilizer Quantities Calculation (DAP -> Urea -> MOP)
  // DAP = 18% N, 46% P2O5
  // MOP = 60% K2O
  // Urea = 46% N
  const totalP2O5Req = adjP * areaHa;
  const dapTotalKg = Math.round(totalP2O5Req / 0.46);
  const nSuppliedByDap = dapTotalKg * 0.18;

  const totalNReq = adjN * areaHa;
  const nRemaining = Math.max(0, totalNReq - nSuppliedByDap);
  const ureaTotalKg = Math.round(nRemaining / 0.46);

  const totalK2OReq = adjK * areaHa;
  const mopTotalKg = Math.round(totalK2OReq / 0.60);

  const compostKg = Math.round(areaHa * 10000); // 10 ton/ha standard FYM
  const agriculturalLimeKg = Math.round(limeKgHa * areaHa);

  // Application Schedules (Split applications according to NARC practices)
  const applicationSchedule = [
    {
      stage: 'Basal Application (At Land Preparation / Sowing)',
      stageNe: 'आधारभूत प्रयोग (खेत तयारी वा बीउ छर्ने बेला)',
      timing: 'At or 1-2 days before sowing',
      timingNe: 'बीउ छर्नुअघि वा छर्ने दिन',
      instructionsEn: `Apply 100% of Compost (${compostKg} kg), 100% of DAP (${dapTotalKg} kg), 100% of MOP (${mopTotalKg} kg), and 50% of Urea (${Math.round(ureaTotalKg * 0.5)} kg).`,
      instructionsNe: `सम्पूर्ण गोबरमल (${compostKg} केजी), सम्पूर्ण डीएपी (${dapTotalKg} केजी), सम्पूर्ण पोटास (${mopTotalKg} केजी) र आधा युरिया (${Math.round(ureaTotalKg * 0.5)} केजी) माटोमा मिलाउनुहोस्।`,
    },
    {
      stage: 'First Top-Dressing (Active Vegetative / Tillering)',
      stageNe: 'पहिलो टप-ड्रेसिङ (गाँज आउने वा तीव्र वृद्धिको बेला)',
      timing: '25-35 days after sowing/transplanting',
      timingNe: 'रोपेको २५ देखि ३५ दिनपछि',
      instructionsEn: `Top-dress 25% of Urea (${Math.round(ureaTotalKg * 0.25)} kg) after first weeding and light irrigation.`,
      instructionsNe: `पहिलो गोडमेल र हल्का सिंचाइपछि बाँकी युरियाको २५% (${Math.round(ureaTotalKg * 0.25)} केजी) छर्नुहोस्।`,
    },
    {
      stage: 'Second Top-Dressing (Panicle / Flowering Initiation)',
      stageNe: 'दोस्रो टप-ड्रेसिङ (बाला वा फूल लाग्ने सुरुवाती अवस्था)',
      timing: '45-60 days after sowing',
      timingNe: 'रोपेको ४५ देखि ६० दिनपछि',
      instructionsEn: `Top-dress remaining 25% of Urea (${Math.round(ureaTotalKg * 0.25)} kg) in moist soil. Avoid during heavy rain to prevent leaching.`,
      instructionsNe: `बाँकी २५% युरिया (${Math.round(ureaTotalKg * 0.25)} केजी) माटोमा चिस्यान हुँदा छर्नुहोस्। वर्षातको पानी बगिरहँदा मल नछर्नुहोस्।`,
    },
  ];

  return {
    cropId: input.cropId,
    soilDiagnosisEn: diagnosisEn,
    soilDiagnosisNe: diagnosisNe,
    recommendedNutrientsKgHa: {
      nitrogenKgHa: Math.round(adjN),
      phosphorusKgHa: Math.round(adjP),
      potassiumKgHa: Math.round(adjK),
    },
    commercialFertilizerTotal: {
      ureaKg: ureaTotalKg,
      dapKg: dapTotalKg,
      mopKg: mopTotalKg,
      compostKg,
      agriculturalLimeKg,
    },
    applicationSchedule,
    cautionsEn,
    cautionsNe,
    citations: [
      'MoALD National Fertilizer Guideline (2022)',
      'NARC Soil Science Division Technical Recommendation Bull. 14',
    ],
  };
}
