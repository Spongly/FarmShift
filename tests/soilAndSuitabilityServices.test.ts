import { describe, it, expect } from 'vitest';
import { calculateFertilizerGuidance } from '../src/services/soilNutrientService';
import { searchKnowledgeBase } from '../src/services/agriculturalKnowledgeService';
import { predictCropSuitability, seasonClimateFor } from '../src/services/cropSuitabilityIndex';
import type { MonthlyAggregate } from '../src/types';
import { generateWeeklyFarmPlan, getCropStage } from '../src/services/farmActionPlanner';
import { CROPS } from '../src/data/cropData';
import type { WeatherForecastData } from '../src/services/weatherForecast';

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

describe('Crop Suitability Index Tests', () => {
  it('scores transplanted rice high in warm, water-abundant Terai conditions', () => {
    const pred = predictCropSuitability('rice-transplanted', {
      elevationMeters: 180,
      sowingMonthTemp: 28,
      seasonRainfallMm: 1100,
      soilPh: 6.5,
      irrigationAvailable: 1,
    });

    expect(pred.suitabilityScore).toBeGreaterThanOrEqual(0.75);
    expect(pred.suitabilityClass).toBe('Optimal');
  });

  it('scores transplanted rice low in high, dry, cold elevations', () => {
    const pred = predictCropSuitability('rice-transplanted', {
      elevationMeters: 3100,
      sowingMonthTemp: 10,
      seasonRainfallMm: 200,
      soilPh: 6.0,
      irrigationAvailable: 0,
    });

    expect(pred.suitabilityScore).toBeLessThan(0.40);
    expect(pred.suitabilityClass).toBe('Unsuitable');
  });

  it('derives sowing temperature and season rainfall from the monthly record', () => {
    const month = (m: number, year: number, precipitation: number | null, tempMean: number | null) =>
      ({ year, month: m, precipitation, tempMean }) as MonthlyAggregate;
    const monthly = [
      month(11, 2023, 10, 18), month(11, 2024, 20, 20),
      month(12, 2023, 5, 14), month(1, 2024, 15, 12), month(2, 2024, 25, 15),
      month(6, 2024, 300, 27),
    ];

    // Nov sowing, Feb harvest: wraps past December
    expect(seasonClimateFor(monthly, [11], [1, 2])).toEqual({ sowingMonthTemp: 19, seasonRainfallMm: 60 });
    // A month with no data gives no result rather than a guess
    expect(seasonClimateFor(monthly, [6], [9])).toBeNull();
    expect(seasonClimateFor([], [6], [9])).toBeNull();
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

  const soil = { texture: 'loam', ph: 6.5, organicMatter: 2.0, drainage: 'well-drained', irrigationAvailable: true, notes: '', provenance: 'user-entered' } as const;
  const rice = CROPS.find((c) => c.id === 'rice-transplanted')!;

  it('places a crop in the right stage for each month of its calendar', () => {
    const { sowingMonths, harvestMonths } = rice.calendar;
    expect(getCropStage(rice, sowingMonths[0])).toBe('pre_sowing');
    expect(getCropStage(rice, harvestMonths[harvestMonths.length - 1])).toBe('harvest');
    const stages = Array.from({ length: 12 }, (_, i) => getCropStage(rice, i + 1));
    expect(stages).toContain('growing');
    expect(stages).toContain('off_season');
  });

  it('gives every stage a task in each of the four weeks, even with no forecast', () => {
    for (const stage of ['pre_sowing', 'growing', 'harvest', 'off_season'] as const) {
      const plan = generateWeeklyFarmPlan('wheat', soil, null, { stage });
      expect(plan.stage).toBe(stage);
      for (const week of [1, 2, 3, 4]) {
        expect(plan.weeklyTasks.some((t) => t.weekNumber === week)).toBe(true);
      }
    }
  });

  it('tells legume growers to skip urea but not cereal growers', () => {
    const topdress = (cropId: 'lentil' | 'wheat') =>
      generateWeeklyFarmPlan(cropId, soil, null, { stage: 'growing' }).weeklyTasks.find((t) => t.id.endsWith('weeding_topdress'))!;
    expect(topdress('lentil').instructionsEn).toContain('no urea');
    expect(topdress('wheat').titleEn).toContain('Urea');
  });

  it('only raises weather tasks when a forecast exists, and flags heat above the crop limit', () => {
    const noForecast = generateWeeklyFarmPlan('wheat', soil, null, { stage: 'growing' });
    expect(noForecast.weeklyTasks.some((t) => t.weatherTriggerEn)).toBe(false);

    const hot = {
      daily: [{ date: '2026-04-02', tempMax: 41, tempMin: 22, precipitationSum: 0, windSpeedMax: 8 }],
      summary: { totalRainNext7Days: 0, highestTemp: 41, lowestTemp: 22 },
    } as WeatherForecastData;
    const ids = generateWeeklyFarmPlan('wheat', soil, hot, { stage: 'growing' }).weeklyTasks.map((t) => t.id);
    expect(ids).toEqual(expect.arrayContaining(['task_w1_heat', 'task_w1_dry_week', 'task_w1_field_day']));
  });
});
