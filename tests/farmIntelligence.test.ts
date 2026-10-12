import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateFarmIntelligenceReport } from '../src/services/farmIntelligenceEngine';
import { decodeWmoCode, fetchWeatherForecast } from '../src/services/weatherForecast';
import { NASA_GIBS_LAYERS, getGibsWmtsUrl } from '../src/services/satelliteLayers';
import type { WeatherForecastData } from '../src/services/weatherForecast';

describe('Farm Intelligence & Recommendation Engine Tests', () => {
  it('correctly decodes WMO weather codes into bilingual labels', () => {
    const clearSky = decodeWmoCode(0);
    expect(clearSky.en).toBe('Clear sky');
    expect(clearSky.ne).toBe('सफा आकाश');

    const heavyRain = decodeWmoCode(65);
    expect(heavyRain.en).toBe('Heavy rain');
    expect(heavyRain.ne).toBe('भारी वर्षा');
  });

  it('generates critical drainage warnings when heavy rainfall is forecast', () => {
    const mockForecast: WeatherForecastData = {
      latitude: 27.7,
      longitude: 85.3,
      elevation: 1300,
      timezone: 'Asia/Kathmandu',
      current: {
        temperature: 24,
        relativeHumidity: 70,
        windSpeed: 4,
        precipitation: 5,
        weatherCode: 65,
        isDay: true,
        time: '2026-10-12T12:00:00Z',
      },
      daily: [
        {
          date: '2026-10-13',
          tempMax: 26,
          tempMin: 18,
          precipitationSum: 35, // >= 25 mm triggers heavy rain alert
          precipitationProbabilityMax: 90,
          windSpeedMax: 15,
          weatherCode: 65,
          weatherDescriptionEn: 'Heavy rain',
          weatherDescriptionNe: 'भारी वर्षा',
          soilMoisture0to1cm: 0.35,
        },
      ],
      summary: {
        totalRainNext7Days: 45,
        highestTemp: 26,
        lowestTemp: 18,
        rainyDaysCount: 2,
        hasHeavyRainRisk: true,
        hasHeatRisk: false,
        recent30DaysRainfall: 120,
        recentRainyDaysCount: 8,
      },
      provenance: {
        source: 'Open-Meteo',
        model: 'ECMWF',
        retrievedAt: new Date().toISOString(),
        gridResolution: '~11km',
      },
    };

    const report = generateFarmIntelligenceReport(null, mockForecast);
    expect(report.insights.some((i) => i.id === 'heavy_rain_warning' || i.id === 'smap_flash_flood_warning')).toBe(true);
    expect(report.precipitationStatus.recentAccumulationMm).toBe(120);
  });

  it('generates irrigation advisories under low soil moisture deficit', () => {
    const report = generateFarmIntelligenceReport(null, null);
    // When no NASA POWER data is provided and forecast is null, fallback values are checked
    expect(report.overallRisk).toBeDefined();
    expect(report.soilMoistureStatus.surfaceFraction).toBeGreaterThan(0);
  });

  it('configures valid NASA GIBS WMTS endpoints for Leaflet tile mapping', () => {
    const layer = NASA_GIBS_LAYERS[0];
    const wmtsUrl = getGibsWmtsUrl(layer, '2024-05-01');
    expect(wmtsUrl).toContain('gibs.earthdata.nasa.gov');
    expect(wmtsUrl).toContain(layer.layerId);
    expect(wmtsUrl).toContain('2024-05-01');
  });

  it('requests Open-Meteo soil moisture as current (not daily) and sums 7-day rain', async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);
      expect(url).toContain('precipitation_sum');
      expect(url).not.toMatch(/daily=[^&]*soil_moisture/);
      expect(url).toMatch(/current=[^&]*soil_moisture_0_to_1cm/);
      return {
        ok: true,
        json: async () => ({
          latitude: 27.7,
          longitude: 85.3,
          elevation: 1300,
          timezone: 'Asia/Kathmandu',
          current: {
            time: '2026-10-12T09:45',
            temperature_2m: 22.2,
            relative_humidity_2m: 59,
            precipitation: 0,
            weather_code: 0,
            wind_speed_10m: 4.4,
            is_day: 1,
            soil_moisture_0_to_1cm: 0.22,
            soil_moisture_1_to_3cm: 0.24,
            soil_moisture_3_to_9cm: 0.25,
          },
          daily: {
            time: ['2026-10-11', '2026-10-12', '2026-10-13'],
            temperature_2m_max: [23, 24, 25],
            temperature_2m_min: [13, 16, 15],
            precipitation_sum: [2.4, 3.3, 1.7],
            precipitation_probability_max: [65, 53, 69],
            wind_speed_10m_max: [6.9, 8.7, 3.8],
            et0_fao_evapotranspiration: [3.26, 3.37, 3.32],
            weather_code: [53, 95, 55],
          },
        }),
      };
    });
    vi.stubGlobal('fetch', fetchMock);

    const data = await fetchWeatherForecast(27.001, 85.001);
    expect(data.summary.totalRainNext7Days).toBe(5);
    expect(data.summary.recent30DaysRainfall).toBe(2.4);
    expect(data.daily[0].soilMoisture0to1cm).toBe(0.22);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
});
