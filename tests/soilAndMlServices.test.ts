import { describe, it, expect } from 'vitest';
import { calculateFertilizerGuidance } from '../src/services/soilNutrientService';
import { searchKnowledgeBase } from '../src/services/agriculturalKnowledgeService';
import { predictCropSuitability } from '../src/services/cropMlModel';
import { generateWeeklyFarmPlan } from '../src/services/farmActionPlanner';

describe('Soil Health & Fertilizer Guidance Tests', () => {
  it('correctly calculates DAP, Urea and MOP for 1 Ropani of Rice', () => {
    const res = calculateFertilizerGuidance({
      areaUnit: 'ropani',
      areaSize: 1,
      ph: 6.2,
      organicMatterPct: 2.0,
      texture: 'loam',
      cropId: 'rice-transplanted',
      previousCropLegume: false,
    });

    expect(res.commercialFertilizerTotal.dapKg).toBeGreaterThan(0);
    expect(res.commercialFertilizerTotal.ureaKg).toBeGreaterThan(0);
    expect(res.commercialFertilizerTotal.mopKg).toBeGreaterThan(0);
    expect(res.applicationSchedule.length).toBe(3);
  });

  it('triggers agricultural lime recommendation when soil pH is acidic (<5.5)', () => {
    const res = calculateFertilizerGuidance({
      areaUnit: 'ropani',
      areaSize: 1,
      ph: 4.8,
      organicMatterPct: 1.5,
      texture: 'sandy-loam',
      cropId: 'maize',
    });

    expect(res.commercialFertilizerTotal.agriculturalLimeKg).toBeGreaterThan(0);
    expect(res.cautionsEn.length).toBeGreaterThan(0);
  });

  it('gives nitrogen credit when preceding crop was a legume', () => {
    const standard = calculateFertilizerGuidance({
      areaUnit: 'ropani',
      areaSize: 1,
      ph: 6.5,
      organicMatterPct: 2.0,
      texture: 'loam',
      cropId: 'wheat',
      previousCropLegume: false,
    });

    const withLegume = calculateFertilizerGuidance({
      areaUnit: 'ropani',
      areaSize: 1,
      ph: 6.5,
      organicMatterPct: 2.0,
      texture: 'loam',
      cropId: 'wheat',
      previousCropLegume: true,
    });

    expect(withLegume.recommendedNutrientsKgHa.nitrogenKgHa).toBeLessThan(
      standard.recommendedNutrientsKgHa.nitrogenKgHa
    );
  });
});

describe('Agricultural Knowledge & Document Retrieval Tests', () => {
  it('retrieves relevant NARC passages for wheat queries', () => {
    const passages = searchKnowledgeBase({ cropId: 'wheat', query: 'heat stress' });
    expect(passages.length).toBeGreaterThan(0);
    expect(passages[0].cropTags).toContain('wheat');
    expect(passages[0].sourceTitle).toContain('Wheat');
  });

  it('filters passages by topic tag correctly', () => {
    const passages = searchKnowledgeBase({ topic: 'soil' });
    expect(passages.length).toBeGreaterThan(0);
    expect(passages.every((p) => p.topicTags.includes('soil'))).toBe(true);
  });
});

describe('Crop Suitability ML Model Tests', () => {
  it('predicts high suitability for transplanted rice in warm, water-abundant Terai conditions', () => {
    const pred = predictCropSuitability('rice-transplanted', {
      elevationMeters: 180,
      meanAnnualTemp: 24,
      annualPrecipitation: 1600,
      sowingMonthTemp: 28,
      seasonRainfallMm: 1100,
      soilPh: 6.5,
      soilTextureScore: 4,
      irrigationAvailable: 1,
    });

    expect(pred.predictedProbability).toBeGreaterThanOrEqual(0.75);
    expect(pred.suitabilityClass).toBe('Optimal');
  });

  it('predicts lower suitability for transplanted rice in high, dry, cold elevations', () => {
    const pred = predictCropSuitability('rice-transplanted', {
      elevationMeters: 3100,
      meanAnnualTemp: 8,
      annualPrecipitation: 300,
      sowingMonthTemp: 10,
      seasonRainfallMm: 200,
      soilPh: 6.0,
      soilTextureScore: 2,
      irrigationAvailable: 0,
    });

    expect(pred.predictedProbability).toBeLessThan(0.40);
    expect(pred.suitabilityClass).toBe('Unsuitable');
  });
});

describe('Weekly Actionable Farm Plan Tests', () => {
  it('creates drainage warnings when upcoming rainfall is heavy', () => {
    const dummyForecast = {
      latitude: 27.5,
      longitude: 84.5,
      elevation: 250,
      timezone: 'Asia/Kathmandu',
      current: {
        temperature: 25,
        relativeHumidity: 80,
        windSpeed: 5,
        precipitation: 2,
        weatherCode: 61,
        isDay: true,
        time: '2026-10-12T12:00',
      },
      daily: [],
      summary: {
        totalRainNext7Days: 65,
        highestTemp: 30,
        lowestTemp: 18,
        rainyDaysCount: 4,
        hasHeavyRainRisk: true,
        hasHeatRisk: false,
        recent30DaysRainfall: 120,
        recentRainyDaysCount: 10,
      },
      provenance: {
        source: 'Open-Meteo',
        model: 'best_match',
        retrievedAt: new Date().toISOString(),
        gridResolution: '1km',
      },
    };

    const plan = generateWeeklyFarmPlan(
      'maize',
      { texture: 'loam', ph: 6.5, organicMatter: 2.0, drainage: 'well-drained', irrigationAvailable: true, notes: '', provenance: 'user-entered' },
      dummyForecast
    );

    expect(plan.weeklyTasks.some((t) => t.category === 'protection')).toBe(true);
  });
});
