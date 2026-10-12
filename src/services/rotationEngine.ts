// ============================================================
// Crop Rotation Engine
// Transparent, rule-based scoring for FarmShift Nepal
// All scoring logic is documented here and visible to users
// ============================================================

import type {
  FarmInputs,
  RotationAnalysisResult,
  RotationCandidate,
  RotationSequence,
  SequencedCrop,
  ScoreBreakdown,
  RiskFactor,
  ClimateDataset,
  Crop,
  CropId,
  PriorityMode,
  SoilInfo,
} from '../types';
import { getCropById } from '../data/cropData';
import { computeMonthlyNormals } from './nasaPower';

// ============================================================
// Priority weights — user-selectable, fully documented
// ============================================================

const PRIORITY_WEIGHTS: Record<PriorityMode, Record<string, number>> = {
  'balanced': {
    climateSuitability: 0.25,
    waterCompatibility: 0.25,
    rotationDiversity: 0.20,
    soilHealthBenefit: 0.15,
    seasonalFeasibility: 0.15,
  },
  'climate-suitability': {
    climateSuitability: 0.40,
    waterCompatibility: 0.25,
    rotationDiversity: 0.15,
    soilHealthBenefit: 0.10,
    seasonalFeasibility: 0.10,
  },
  'water-conservation': {
    climateSuitability: 0.20,
    waterCompatibility: 0.40,
    rotationDiversity: 0.15,
    soilHealthBenefit: 0.10,
    seasonalFeasibility: 0.15,
  },
  'soil-health': {
    climateSuitability: 0.20,
    waterCompatibility: 0.15,
    rotationDiversity: 0.20,
    soilHealthBenefit: 0.35,
    seasonalFeasibility: 0.10,
  },
};

// ============================================================
// Climate Suitability Scoring
// Compares crop temperature and water needs vs. observed data
// Score: 0 = unsuitable, 1 = optimal
// ============================================================

function scoreClimateSuitability(
  crop: Crop,
  climateData: ClimateDataset | null,
  sowingMonths: number[]
): { score: number; notes: string[] } {
  if (!climateData) {
    return {
      score: 0.5, // Insufficient data — neutral score, will flag as uncertainty
      notes: ['Climate data not available — suitability cannot be assessed from observations.'],
    };
  }

  const normals = computeMonthlyNormals(climateData.monthly);
  const notes: string[] = [];
  const subScores: number[] = [];

  // 1. Temperature suitability during growing season
  const growingMonths = sowingMonths.length > 0 ? sowingMonths : crop.calendar.sowingMonths;
  const relevantMonths = normals.filter((n) => growingMonths.includes(n.month));

  if (relevantMonths.length > 0) {
    const validTemps = relevantMonths.filter((n) => n.tempMean !== null);
    if (validTemps.length > 0) {
      const avgTemp = validTemps.reduce((s, n) => s + n.tempMean!, 0) / validTemps.length;
      const { min, optimal_low, optimal_high, max } = crop.temperature;

      let tempScore: number;
      if (avgTemp >= optimal_low && avgTemp <= optimal_high) {
        tempScore = 1.0; // Optimal range
        notes.push(`Temperature in sowing season (${avgTemp.toFixed(1)}°C mean) is within optimal range (${optimal_low}–${optimal_high}°C).`);
      } else if (avgTemp >= min && avgTemp < optimal_low) {
        tempScore = 0.5 + 0.5 * ((avgTemp - min) / (optimal_low - min));
        notes.push(`Temperature (${avgTemp.toFixed(1)}°C mean) is below optimal but within tolerable range.`);
      } else if (avgTemp > optimal_high && avgTemp <= max) {
        tempScore = 0.5 + 0.5 * ((max - avgTemp) / (max - optimal_high));
        notes.push(`Temperature (${avgTemp.toFixed(1)}°C mean) is above optimal but within tolerable range.`);
      } else if (avgTemp < min) {
        tempScore = Math.max(0, 1 - (min - avgTemp) / 5); // Penalty for each degree below min
        notes.push(`Temperature (${avgTemp.toFixed(1)}°C mean) is below minimum threshold (${min}°C) for this crop.`);
      } else {
        tempScore = Math.max(0, 1 - (avgTemp - max) / 5);
        notes.push(`Temperature (${avgTemp.toFixed(1)}°C mean) exceeds maximum threshold (${max}°C) for this crop.`);
      }
      subScores.push(tempScore);
    }
  }

  // 2. Precipitation availability during season
  const harvestMonths = crop.calendar.harvestMonths;
  const allSeasonMonths = [...new Set([...growingMonths, ...harvestMonths])];
  const seasonMonths = normals.filter((n) => allSeasonMonths.includes(n.month));
  const validPrec = seasonMonths.filter((n) => n.precipitation !== null);

  if (validPrec.length > 0) {
    const totalSeasonPrec = validPrec.reduce((s, n) => s + n.precipitation!, 0);
    const scaledSeasonPrec = (totalSeasonPrec / validPrec.length) * allSeasonMonths.length;
    const { low: reqLow, high: reqHigh } = crop.waterRequirement.totalMm;

    let precipScore: number;
    if (scaledSeasonPrec >= reqLow && scaledSeasonPrec <= reqHigh) {
      precipScore = 1.0;
      notes.push(`Estimated seasonal precipitation (~${Math.round(scaledSeasonPrec)} mm) is within expected range for this crop (${reqLow}–${reqHigh} mm).`);
    } else if (scaledSeasonPrec < reqLow) {
      precipScore = Math.max(0, scaledSeasonPrec / reqLow);
      if (!crop.waterRequirement.toleratesDrought) {
        notes.push(`Precipitation may be insufficient (~${Math.round(scaledSeasonPrec)} mm vs. ${reqLow}–${reqHigh} mm needed). Irrigation may be required.`);
      } else {
        precipScore = Math.min(precipScore + 0.3, 1.0); // Drought-tolerant bonus
        notes.push(`Precipitation may be low but this crop has some drought tolerance.`);
      }
    } else {
      // Excess water — check waterlogging tolerance
      if (crop.waterRequirement.toleratesWaterlogging) {
        precipScore = 0.9;
        notes.push(`Precipitation exceeds crop need but this crop tolerates waterlogging.`);
      } else {
        precipScore = Math.max(0.3, 1 - (scaledSeasonPrec - reqHigh) / reqHigh);
        notes.push(`Precipitation (~${Math.round(scaledSeasonPrec)} mm) significantly exceeds expected range — drainage or waterlogging risk.`);
      }
    }
    subScores.push(precipScore);
  }

  // 3. Frost risk check
  const frostMonths = climateData.summary.frostRiskMonths;
  const frostDuringGrowth = growingMonths.some((m) => frostMonths.includes(m));
  if (frostDuringGrowth && crop.temperature.min > 5) {
    notes.push(`Frost risk months overlap with sowing season — this crop is sensitive to frost.`);
    subScores.push(0.4);
  }

  const score = subScores.length > 0 ? subScores.reduce((a, b) => a + b, 0) / subScores.length : 0.5;
  return { score: Math.min(1, Math.max(0, score)), notes };
}

// ============================================================
// Water Compatibility Scoring
// Assesses how well crop water needs match available moisture
// considering irrigation availability
// ============================================================

function scoreWaterCompatibility(
  crop: Crop,
  soil: SoilInfo,
  climateData: ClimateDataset | null,
  season: string
): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 0.5;

  const hasIrrigation = soil.irrigationAvailable;
  const reqLow = crop.waterRequirement.totalMm.low;

  if (!climateData) {
    notes.push('Climate data unavailable — water compatibility is estimated from crop characteristics only.');
    // Irrigation compensates for unknown rainfall
    score = hasIrrigation ? 0.7 : 0.5;
    return { score, notes };
  }

  // Dry season score modifier
  const isRabi = season === 'Rabi';

  if (isRabi) {
    // Rabi crops grown in dry/winter season
    if (hasIrrigation) {
      if (reqLow <= 300) {
        score = 0.85;
        notes.push('Low water demand crop in dry season — irrigation available, good fit.');
      } else if (reqLow <= 500) {
        score = 0.70;
        notes.push('Moderate water demand in dry season — irrigation covers deficit.');
      } else {
        score = 0.55;
        notes.push('High water demand in dry season — significant irrigation required.');
      }
    } else {
      // Rainfed Rabi
      if (crop.waterRequirement.toleratesDrought && reqLow <= 250) {
        score = 0.65;
        notes.push('Drought-tolerant crop with low water demand — may survive on residual soil moisture.');
      } else if (reqLow <= 200) {
        score = 0.60;
        notes.push('Low water demand — may be feasible on residual soil moisture in Rabi.');
      } else {
        score = 0.30;
        notes.push('High water demand without irrigation in dry season — significant risk.');
      }
    }
  } else {
    // Kharif — monsoon season
    const normals = computeMonthlyNormals(climateData.monthly);
    const monsoonMonths = normals.filter((n) => [6, 7, 8, 9].includes(n.month) && n.precipitation !== null);
    const monsoonPrec = monsoonMonths.reduce((s, n) => s + n.precipitation!, 0);

    if (monsoonPrec >= reqLow) {
      score = 0.85;
      notes.push(`Monsoon precipitation (~${Math.round(monsoonPrec)} mm) is sufficient for this crop.`);
    } else if (hasIrrigation) {
      score = 0.70;
      notes.push(`Monsoon precipitation may be marginal — irrigation provides supplemental water.`);
    } else {
      const ratio = monsoonPrec / reqLow;
      score = Math.max(0.2, ratio * 0.8);
      notes.push(`Monsoon precipitation (~${Math.round(monsoonPrec)} mm) may be insufficient for seasonal water demand (${reqLow} mm minimum).`);
    }

    if (!crop.waterRequirement.toleratesWaterlogging && monsoonPrec > 1200) {
      score = Math.max(0.3, score - 0.2);
      notes.push('High monsoon rainfall may cause waterlogging — this crop is sensitive to excess water.');
    }
  }

  // Soil drainage modifier
  if (
    ['poorly-drained', 'somewhat-poorly-drained'].includes(soil.drainage) &&
    !crop.waterRequirement.toleratesWaterlogging
  ) {
    score = Math.max(0.1, score - 0.15);
    notes.push(`Poor soil drainage is a risk for this crop.`);
  }

  return { score: Math.min(1, Math.max(0, score)), notes };
}

// ============================================================
// Rotation Diversity Scoring
// Rewards sequences that vary crop families and break pest cycles
// ============================================================

function scoreRotationDiversity(sequence: SequencedCrop[]): { score: number; notes: string[] } {
  const notes: string[] = [];
  if (sequence.length <= 1) {
    return { score: 0.5, notes: ['Single crop — no rotation sequence to evaluate.'] };
  }

  const crops = sequence.map((s) => getCropById(s.cropId)).filter(Boolean) as Crop[];
  const categories = crops.map((c) => c.category);

  // Unique categories
  const uniqueCategories = new Set(categories);
  const diversityRatio = uniqueCategories.size / sequence.length;

  // Check for immediate repeats
  let hasImmediateRepeat = false;
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i].cropId === sequence[i - 1].cropId) {
      hasImmediateRepeat = true;
      break;
    }
  }

  // Check for legume inclusion
  const hasLegume = crops.some((c) => c.category === 'legume');

  // Check rotation rule compliance
  let rotationViolations = 0;
  for (let i = 1; i < crops.length; i++) {
    const prev = crops[i - 1];
    const curr = crops[i];
    if (curr.rotationBenefit.avoidAfter.includes(prev.id)) {
      rotationViolations++;
      notes.push(`${curr.name} should ideally not follow ${prev.name} (disease/pest carryover risk).`);
    }
  }

  let score = diversityRatio * 0.5;

  if (hasLegume) {
    score += 0.3;
    notes.push('Sequence includes a nitrogen-fixing legume — beneficial for soil fertility.');
  }

  if (!hasImmediateRepeat) {
    score += 0.1;
  } else {
    score -= 0.2;
    notes.push('Immediate crop repeat detected — increases pest and disease risk.');
  }

  if (rotationViolations > 0) {
    score -= rotationViolations * 0.15;
  }

  if (uniqueCategories.size >= 3) {
    notes.push('Good crop family diversity across the sequence.');
  } else if (uniqueCategories.size === 2) {
    notes.push('Moderate diversity — consider adding a third crop type in future seasons.');
  }

  return { score: Math.min(1, Math.max(0, score)), notes };
}

// ============================================================
// Soil Health Benefit Scoring
// Rewards legumes, organic matter builders, rotation rules
// ============================================================

function scoreSoilHealthBenefit(
  sequence: SequencedCrop[],
  soil: SoilInfo
): { score: number; notes: string[] } {
  const notes: string[] = [];
  const crops = sequence.map((s) => getCropById(s.cropId)).filter(Boolean) as Crop[];

  if (crops.length === 0) return { score: 0, notes: [] };

  const subScores: number[] = [];

  // N-fixing legumes
  const nFixers = crops.filter((c) => c.rotationBenefit.nitrogenFixation);
  if (nFixers.length > 0) {
    subScores.push(Math.min(1, 0.5 + nFixers.length * 0.25));
    notes.push(
      `${nFixers.map((c) => c.name).join(', ')} fix atmospheric nitrogen — reduces fertilizer need.`
    );
  } else {
    subScores.push(0.3);
    notes.push('No nitrogen-fixing crops in sequence — consider adding a legume.');
  }

  // Organic matter benefits
  const omBenefactors = crops.filter((c) => c.soilPreference.organicMatterBenefit);
  if (omBenefactors.length > 0) {
    subScores.push(0.7);
    notes.push(`${omBenefactors.map((c) => c.name).join(', ')} benefit from and contribute to soil organic matter.`);
  } else {
    subScores.push(0.5);
  }

  // pH compatibility
  const phProblems = crops.filter((c) => {
    if (soil.ph === null) return false;
    return soil.ph < c.soilPreference.phRange.min || soil.ph > c.soilPreference.phRange.max;
  });
  if (phProblems.length > 0) {
    subScores.push(0.3);
    notes.push(
      `Soil pH (${soil.ph}) may be outside optimal range for ${phProblems.map((c) => c.name).join(', ')}.`
    );
  } else if (soil.ph !== null) {
    subScores.push(0.9);
    notes.push(`Soil pH (${soil.ph}) is compatible with selected crops.`);
  } else {
    subScores.push(0.6); // Unknown pH — neutral
  }

  // Positive rotation relationships
  let positiveRelations = 0;
  for (let i = 1; i < crops.length; i++) {
    const prev = crops[i - 1];
    const curr = crops[i];
    if (curr.rotationBenefit.afterCrop.includes(prev.id)) {
      positiveRelations++;
    }
  }
  if (positiveRelations > 0) {
    subScores.push(Math.min(1, 0.6 + positiveRelations * 0.15));
    notes.push(`${positiveRelations} beneficial crop sequence relationship(s) in this rotation.`);
  } else {
    subScores.push(0.5);
  }

  const score = subScores.reduce((a, b) => a + b, 0) / subScores.length;
  return { score: Math.min(1, Math.max(0, score)), notes };
}

// ============================================================
// Seasonal Feasibility Scoring
// Checks calendar fit and crop sequence timing
// ============================================================

function scoreSeasonalFeasibility(
  sequence: SequencedCrop[],
  climateData: ClimateDataset | null
): { score: number; notes: string[] } {
  const notes: string[] = [];
  if (sequence.length === 0) return { score: 0, notes: [] };

  const crops = sequence.map((s) => getCropById(s.cropId)).filter(Boolean) as Crop[];
  const subScores: number[] = [];

  // Check for timing conflicts
  for (let i = 1; i < sequence.length; i++) {
    const prev = crops[i - 1];
    const curr = crops[i];

    // Check if harvest of prev overlaps with sowing of curr
    const prevHarvest = prev.calendar.harvestMonths;
    const currSowing = curr.calendar.sowingMonths;
    const overlap = prevHarvest.some((m) => currSowing.includes(m));

    if (overlap) {
      subScores.push(0.5);
      notes.push(
        `${prev.name} harvest months overlap with ${curr.name} sowing — field transition timing may be tight.`
      );
    } else {
      subScores.push(0.9);
    }
  }

  // Check frost risk if data available
  if (climateData) {
    const frostMonths = climateData.summary.frostRiskMonths;
    for (const { cropId, estimatedSowingMonths } of sequence) {
      const crop = getCropById(cropId);
      if (!crop) continue;
      const frostOverlap = estimatedSowingMonths.filter((m) => frostMonths.includes(m));
      if (frostOverlap.length > 0 && crop.temperature.min > 5) {
        subScores.push(0.4);
        notes.push(`Frost risk in ${frostOverlap.join(', ')} months overlaps with ${crop.name} sowing window.`);
      } else {
        subScores.push(0.85);
      }
    }

    // Heat stress check
    const heatMonths = climateData.summary.heatStressMonths;
    for (const { cropId } of sequence) {
      const crop = getCropById(cropId);
      if (!crop) continue;
      const heatOverlap = crop.calendar.harvestMonths.filter((m) => heatMonths.includes(m));
      if (heatOverlap.length > 0 && crop.temperature.max < 38) {
        subScores.push(0.5);
        notes.push(`Heat stress months overlap with ${crop.name} harvest — grain fill may be affected.`);
      }
    }
  }

  if (subScores.length === 0) subScores.push(0.75);

  const score = subScores.reduce((a, b) => a + b, 0) / subScores.length;
  return { score: Math.min(1, Math.max(0, score)), notes };
}

// ============================================================
// Rotation Sequence Generation
// Generates feasible sequences from candidate crops
// ============================================================

function generateSequences(
  candidateIds: CropId[],
  excludedIds: CropId[],
  previousCropId: CropId | null,
  planningSeasons: number,
  startSeason: 'kharif' | 'rabi'
): RotationSequence[] {
  const available = candidateIds
    .filter((id) => !excludedIds.includes(id))
    .map((id) => getCropById(id))
    .filter(Boolean) as Crop[];

  if (available.length === 0) return [];

  // Separate by season type
  const kharifCrops = available.filter(
    (c) => c.calendar.season === 'Kharif' || c.calendar.season === 'Zaid'
  );
  const rabiCrops = available.filter(
    (c) => c.calendar.season === 'Rabi' || c.calendar.season === 'Zaid'
  );

  const sequences: RotationSequence[] = [];
  const MAX_SEQUENCES = 12; // Limit to avoid explosion

  // Build sequences season by season
  function buildSequence(
    current: Crop[],
    seasonNum: number,
    currentSeason: 'kharif' | 'rabi'
  ): void {
    if (seasonNum >= planningSeasons || sequences.length >= MAX_SEQUENCES) {
      if (current.length > 0) {
        sequences.push(createSequence(current, startSeason));
      }
      return;
    }

    const pool = currentSeason === 'kharif' ? kharifCrops : rabiCrops;
    const lastCrop = current.length > 0 ? current[current.length - 1] : null;
    const prevCrop = seasonNum === 0 && previousCropId ? getCropById(previousCropId) : lastCrop;

    // Filter out crops that should be avoided after previous
    const eligible = pool.filter((c) => {
      if (prevCrop && c.rotationBenefit.avoidAfter.includes(prevCrop.id)) return false;
      return true;
    });

    const candidates = eligible.length > 0 ? eligible : pool; // Fall back to all if none eligible
    const nextSeason: 'kharif' | 'rabi' = currentSeason === 'kharif' ? 'rabi' : 'kharif';

    // Try top crops (prioritize legumes then others)
    const sorted = [...candidates].sort((a, b) => {
      const aLeg = a.category === 'legume' ? -1 : 0;
      const bLeg = b.category === 'legume' ? -1 : 0;
      return aLeg - bLeg;
    });

    // Generate branching sequences (limited)
    const limit = Math.min(3, sorted.length);
    for (let i = 0; i < limit; i++) {
      buildSequence([...current, sorted[i]], seasonNum + 1, nextSeason);
    }
  }

  // Also generate "best single pool" sequences without branching
  buildSequence([], 0, startSeason);

  // Deduplicate by crop id sequence
  const seen = new Set<string>();
  return sequences.filter((seq) => {
    const key = seq.crops.map((c) => c.cropId).join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createSequence(crops: Crop[], startSeason: 'kharif' | 'rabi'): RotationSequence {
  const id = `seq-${crops.map((c) => c.id).join('-')}`;
  let currentSeason = startSeason;

  const sequencedCrops: SequencedCrop[] = crops.map((crop) => {
    const seasonLabel = currentSeason === 'kharif' ? 'Kharif (Summer)' : 'Rabi (Winter)';
    const nextSeason: 'kharif' | 'rabi' = currentSeason === 'kharif' ? 'rabi' : 'kharif';
    currentSeason = nextSeason;

    return {
      cropId: crop.id,
      season: seasonLabel,
      estimatedSowingMonths: crop.calendar.sowingMonths,
      estimatedHarvestMonths: crop.calendar.harvestMonths,
    };
  });

  return {
    id,
    crops: sequencedCrops,
    totalSeasons: crops.length,
  };
}

// ============================================================
// Main Engine Entry Point
// ============================================================

export function runRotationEngine(
  inputs: FarmInputs,
  climateData: ClimateDataset | null
): RotationAnalysisResult {
  const weights = PRIORITY_WEIGHTS[inputs.priority];
  const methodologyNotes: string[] = [
    'This analysis uses a rule-based multi-criteria scoring approach. No machine learning or statistical prediction is applied.',
    'Climate data is sourced from NASA POWER (1° × 1° gridded estimates, not point measurements).',
    'Crop thresholds are from published NARC and FAO literature — local variety performance varies.',
    `Priority mode: "${inputs.priority}". Weights: ${Object.entries(weights).map(([k, v]) => `${k}=${v}`).join(', ')}.`,
    'Scores are comparative indices, not predictions of yield or guaranteed success.',
  ];

  const limitations: string[] = [
    'Market prices, input availability, and labor are not considered in this analysis.',
    'Pest and disease pressure are not explicitly modeled.',
    'Soil nutrient status beyond texture and pH is not incorporated.',
    'Climate projections are not included — historical observations are used as a proxy.',
    'Results are most reliable for established cropping zones at similar elevations to reference sites.',
  ];

  const sequences = generateSequences(
    inputs.candidateCropIds,
    inputs.excludedCropIds,
    inputs.previousCropId,
    inputs.planningSeasons,
    inputs.planningStartSeason
  );

  if (sequences.length === 0) {
    return {
      inputs,
      candidates: [],
      analysisTimestamp: new Date(),
      climateDataPeriod: climateData
        ? { start: climateData.source.startDate, end: climateData.source.endDate }
        : { start: 'N/A', end: 'N/A' },
      methodologyNotes,
      limitations: [
        ...limitations,
        'No feasible crop sequences could be generated from the selected candidates.',
      ],
    };
  }

  const candidates: RotationCandidate[] = sequences.map((seq) => {
    const crops = seq.crops.map((s) => getCropById(s.cropId)).filter(Boolean) as Crop[];
    const firstCrop = crops[0];

    // Per-dimension scores
    const climateResult = scoreClimateSuitability(
      firstCrop,
      climateData,
      seq.crops[0]?.estimatedSowingMonths ?? []
    );
    const waterResult = scoreWaterCompatibility(
      firstCrop,
      inputs.soil,
      climateData,
      firstCrop?.calendar.season ?? 'Kharif'
    );
    const diversityResult = scoreRotationDiversity(seq.crops);
    const soilResult = scoreSoilHealthBenefit(seq.crops, inputs.soil);
    const feasibilityResult = scoreSeasonalFeasibility(seq.crops, climateData);

    const overall =
      weights.climateSuitability * climateResult.score +
      weights.waterCompatibility * waterResult.score +
      weights.rotationDiversity * diversityResult.score +
      weights.soilHealthBenefit * soilResult.score +
      weights.seasonalFeasibility * feasibilityResult.score;

    const score: ScoreBreakdown = {
      climateSuitability: Math.round(climateResult.score * 100) / 100,
      waterCompatibility: Math.round(waterResult.score * 100) / 100,
      rotationDiversity: Math.round(diversityResult.score * 100) / 100,
      soilHealthBenefit: Math.round(soilResult.score * 100) / 100,
      seasonalFeasibility: Math.round(feasibilityResult.score * 100) / 100,
      overall: Math.round(overall * 100) / 100,
      weights,
    };

    // Collect risks
    const risks: RiskFactor[] = [];

    if (score.climateSuitability < 0.4) {
      risks.push({
        severity: 'high',
        description: 'Climate conditions appear poorly suited to this crop during the growing season.',
        mitigation: 'Consider a different crop or season, or use protective measures.',
      });
    } else if (score.climateSuitability < 0.65) {
      risks.push({
        severity: 'medium',
        description: 'Climate suitability is moderate — watch for temperature or rainfall extremes.',
      });
    }

    if (score.waterCompatibility < 0.4) {
      risks.push({
        severity: 'high',
        description: 'Water availability may be significantly below this crop\'s requirements.',
        mitigation: 'Install irrigation or select a more drought-tolerant crop.',
      });
    }

    if (!climateData) {
      risks.push({
        severity: 'medium',
        description: 'Climate data not loaded — suitability scores are based on crop properties only.',
        mitigation: 'Load climate data for your location to improve recommendation quality.',
      });
    }

    if (inputs.soil.drainage === 'poorly-drained' && !firstCrop.waterRequirement.toleratesWaterlogging) {
      risks.push({
        severity: 'medium',
        description: 'Soil drainage may cause waterlogging for this crop.',
        mitigation: 'Improve drainage or choose a waterlogging-tolerant crop.',
      });
    }

    // Collect benefits
    const benefits: string[] = [];
    const nFixers = crops.filter((c) => c.rotationBenefit.nitrogenFixation);
    if (nFixers.length > 0) {
      benefits.push(`Nitrogen fixation from ${nFixers.map((c) => c.name).join(', ')} reduces fertilizer requirements.`);
    }
    crops.forEach((c, i) => {
      if (i > 0 && c.rotationBenefit.afterCrop.includes(crops[i - 1].id)) {
        benefits.push(`${c.name} benefits from the preceding ${crops[i - 1].name} crop.`);
      }
    });
    if (score.rotationDiversity >= 0.7) {
      benefits.push('Good crop diversity reduces disease and pest buildup.');
    }

    // Uncertainties
    const uncertainties: string[] = [];
    if (!climateData) {
      uncertainties.push('Climate assessment is incomplete without observed data.');
    }
    if (inputs.soil.texture === 'unknown') {
      uncertainties.push('Soil texture is unknown — soil compatibility scores are approximate.');
    }
    if (inputs.soil.ph === null) {
      uncertainties.push('Soil pH unknown — pH compatibility cannot be assessed.');
    }
    if ((climateData?.summary.dataCompleteness ?? 0) < 0.9) {
      uncertainties.push('Climate data completeness is < 90% — some estimates may be less reliable.');
    }

    // Data gaps
    const dataGaps: string[] = [];
    if (!inputs.soil.organicMatter) {
      dataGaps.push('Soil organic matter content — would improve soil health scoring.');
    }
    if (!climateData) {
      dataGaps.push('NASA POWER climate data for this location.');
    }
    dataGaps.push('Local variety performance data for selected crops.');
    dataGaps.push('Actual soil test results from this specific field.');

    // Ranking explanation
    const topFactor = Object.entries(weights).sort(([, a], [, b]) => b - a)[0][0];
    const rankingExplanation = `Ranked by ${inputs.priority.replace(/-/g, ' ')} priority. The highest-weighted factor is ${topFactor.replace(/([A-Z])/g, ' $1').trim()} (weight: ${(weights[topFactor as keyof typeof weights] * 100).toFixed(0)}%). Overall score: ${(score.overall * 100).toFixed(0)}/100.`;

    // References
    const references = crops
      .flatMap((c) => c.references)
      .filter((ref, idx, arr) => arr.findIndex((r) => r.title === ref.title) === idx);

    return {
      id: seq.id,
      sequence: seq,
      score,
      risks,
      benefits,
      climateSuitabilityNotes: climateResult.notes,
      waterNotes: waterResult.notes,
      soilNotes: [...soilResult.notes, ...diversityResult.notes],
      rankingExplanation,
      uncertainties,
      dataGaps,
      references,
    };
  });

  // Rank by overall score descending
  candidates.sort((a, b) => b.score.overall - a.score.overall);

  return {
    inputs,
    candidates,
    analysisTimestamp: new Date(),
    climateDataPeriod: climateData
      ? { start: climateData.source.startDate, end: climateData.source.endDate }
      : { start: 'N/A', end: 'N/A' },
    methodologyNotes,
    limitations,
  };
}

// ============================================================
// Exported scoring utilities for testing
// ============================================================

export {
  scoreClimateSuitability,
  scoreWaterCompatibility,
  scoreRotationDiversity,
  scoreSoilHealthBenefit,
  scoreSeasonalFeasibility,
  PRIORITY_WEIGHTS,
};
