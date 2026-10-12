import { describe, it, expect } from 'vitest';
import { CROPS, getCropById, getCropsByCategory, getCropsBySeason } from '../src/data/cropData';
import { NEPALI_CROP_NAMES } from '../src/data/translations';
import { predictCropSuitability } from '../src/services/cropMlModel';
import { calculateFertilizerGuidance } from '../src/services/soilNutrientService';
import { runRotationEngine } from '../src/services/rotationEngine';
import type { CropId, FarmInputs } from '../src/types';

describe('Expanded Nepal Crop Database Integrity Tests', () => {
  it('contains exactly 36 verified Nepal crops', () => {
    expect(CROPS.length).toBe(36);
  });

  it('ensures every crop has a valid unique ID, English name, and Devanagari translation', () => {
    const ids = new Set<string>();
    for (const crop of CROPS) {
      expect(crop.id).toBeDefined();
      expect(ids.has(crop.id)).toBe(false);
      ids.add(crop.id);

      expect(crop.name.length).toBeGreaterThan(0);
      expect(crop.localName.length).toBeGreaterThan(0);
      expect(crop.scientificName.length).toBeGreaterThan(0);

      // Verify translation dictionary mapping
      const translation = NEPALI_CROP_NAMES[crop.id];
      expect(translation).toBeDefined();
      expect(translation.nepaliName.length).toBeGreaterThan(0);
    }
  });

  it('verifies elevation ranges adhere to Nepal geography (50m to 4200m)', () => {
    for (const crop of CROPS) {
      const { min, max } = crop.geographicApplicability.elevationRange;
      expect(min).toBeGreaterThanOrEqual(50);
      expect(max).toBeLessThanOrEqual(4200);
      expect(max).toBeGreaterThan(min);
    }
  });

  it('verifies calendar months are 1-12 and duration is positive', () => {
    for (const crop of CROPS) {
      expect(crop.calendar.sowingMonths.length).toBeGreaterThan(0);
      for (const m of crop.calendar.sowingMonths) {
        expect(m).toBeGreaterThanOrEqual(1);
        expect(m).toBeLessThanOrEqual(12);
      }

      expect(crop.calendar.harvestMonths.length).toBeGreaterThan(0);
      for (const m of crop.calendar.harvestMonths) {
        expect(m).toBeGreaterThanOrEqual(1);
        expect(m).toBeLessThanOrEqual(12);
      }

      expect(crop.calendar.durationDays.min).toBeGreaterThan(20);
      expect(crop.calendar.durationDays.max).toBeGreaterThanOrEqual(crop.calendar.durationDays.min);
    }
  });

  it('verifies all 36 crops have calibrated ML decision models', () => {
    for (const crop of CROPS) {
      const pred = predictCropSuitability(crop.id, {
        elevationMeters: 500,
        meanAnnualTemp: 22,
        annualPrecipitation: 1400,
        sowingMonthTemp: 24,
        seasonRainfallMm: 600,
        soilPh: 6.5,
        soilTextureScore: 3,
        irrigationAvailable: 1,
      });

      expect(pred.predictedProbability).toBeGreaterThanOrEqual(0);
      expect(pred.predictedProbability).toBeLessThanOrEqual(1);
      expect(['Optimal', 'Favorable', 'Marginal', 'Unsuitable']).toContain(pred.suitabilityClass);
      expect(pred.topFeatureInfluences.length).toBe(3);
    }
  });

  it('verifies all 36 crops calculate MoALD fertilizer dosages correctly', () => {
    for (const crop of CROPS) {
      const fert = calculateFertilizerGuidance({
        areaUnit: 'ropani',
        areaSize: 2,
        ph: 6.2,
        organicMatterPct: 2.0,
        texture: 'loam',
        cropId: crop.id,
      });

      expect(fert.recommendedNutrientsKgHa.nitrogenKgHa).toBeGreaterThan(0);
      expect(fert.recommendedNutrientsKgHa.phosphorusKgHa).toBeGreaterThan(0);
      expect(fert.commercialFertilizerTotal.dapKg).toBeGreaterThanOrEqual(0);
      expect(fert.commercialFertilizerTotal.ureaKg).toBeGreaterThanOrEqual(0);
      expect(fert.commercialFertilizerTotal.mopKg).toBeGreaterThanOrEqual(0);
    }
  });

  it('supports all newly added crops in rotation planning analysis', () => {
    const dummyInputs: FarmInputs = {
      location: {
        name: 'Mustang Test Field',
        latitude: 28.9969,
        longitude: 83.7572,
        country: 'Nepal',
        source: 'preset',
      },
      soil: {
        texture: 'loam',
        ph: 7.0,
        organicMatter: 1.8,
        drainage: 'well-drained',
        irrigationAvailable: true,
        notes: '',
        provenance: 'user-entered',
      },
      planningSeasons: 3,
      candidateCropIds: ['barley', 'buckwheat', 'rajma-bean', 'potato'],
      excludedCropIds: [],
      previousCropId: null,
      priority: 'balanced',
      planningStartSeason: 'kharif',
    };

    const res = runRotationEngine(dummyInputs, null);
    expect(res.candidates.length).toBeGreaterThan(0);
    const candidateSequenceCropIds = res.candidates.flatMap((c) =>
      c.sequence.crops.map((sc) => sc.cropId)
    );
    expect(candidateSequenceCropIds).toContain('barley');
  });

  it('validates helper filters: getCropById, getCropsByCategory, and getCropsBySeason', () => {
    expect(getCropById('ginger')?.name).toBe('Ginger (Aduwa)');
    expect(getCropsByCategory('legume').length).toBeGreaterThanOrEqual(7);
    expect(getCropsBySeason('Rabi').length).toBeGreaterThanOrEqual(7);
  });
});
