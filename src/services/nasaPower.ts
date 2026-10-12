// ============================================================
// NASA POWER API Client
// https://power.larc.nasa.gov/api/temporal/
// Community: AG (Agroclimatology)
// No authentication required for point-based queries
// Rate limit: reasonable use, no defined limit for educational use
// ============================================================

import type {
  PowerApiResponse,
  ClimateDataset,
  DailyObservation,
  MonthlyAggregate,
  SeasonalAggregate,
  ClimateSummary,
  DataSource,
  Location,
} from '../types';

// API Constants
const POWER_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
const FILL_VALUE = -999.0; // NASA POWER missing data indicator

// Parameters to request
const PARAMETERS = [
  'PRECTOTCORR',       // Precipitation Corrected (mm/day)
  'T2M',               // Temperature at 2m (°C)
  'T2M_MAX',           // Max Temperature at 2m (°C)
  'T2M_MIN',           // Min Temperature at 2m (°C)
  'RH2M',              // Relative Humidity at 2m (%)
  'ALLSKY_SFC_SW_DWN', // Solar Irradiance (MJ/m²/day)
  'GWETTOP',           // Surface Soil Wetness 0-1 (SMAP / MERRA-2)
  'GWETROOT',          // Root-Zone Soil Wetness 0-1
  'TS',                // Earth Skin Temperature (°C)
].join(',');

// Default date range: last 5 complete years
function getDefaultDateRange(): { start: string; end: string } {
  const now = new Date();
  // POWER data has ~5-7 day lag, so use previous year as safe end
  const endYear = now.getFullYear() - 1;
  const startYear = endYear - 4;
  return {
    start: `${startYear}0101`,
    end: `${endYear}1231`,
  };
}

// In-memory cache to avoid redundant API calls
const responseCache = new Map<string, { data: ClimateDataset; timestamp: number }>();
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

function cacheKey(lat: number, lon: number, start: string, end: string): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)},${start},${end}`;
}

// Validate coordinates for Nepal region (with margin)
function validateCoordinates(lat: number, lon: number): { valid: boolean; error?: string } {
  if (isNaN(lat) || isNaN(lon)) {
    return { valid: false, error: 'Latitude and longitude must be valid numbers.' };
  }
  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90.' };
  }
  if (lon < -180 || lon > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180.' };
  }
  return { valid: true };
}

// Parse NASA POWER date key "YYYYMMDD" to Date
function parsePowerDate(key: string): Date {
  const year = parseInt(key.slice(0, 4), 10);
  const month = parseInt(key.slice(4, 6), 10) - 1; // 0-indexed
  const day = parseInt(key.slice(6, 8), 10);
  return new Date(year, month, day);
}

// Null if fill value, otherwise the actual value
function parseValue(v: number): number | null {
  return v === FILL_VALUE || v === null || v === undefined || isNaN(v) ? null : v;
}

// Calculate monthly aggregates from daily observations
function computeMonthlyAggregates(daily: DailyObservation[]): MonthlyAggregate[] {
  // Group by year-month
  const groups = new Map<string, DailyObservation[]>();
  for (const obs of daily) {
    const key = `${obs.date.getFullYear()}-${obs.date.getMonth() + 1}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(obs);
  }

  const months: MonthlyAggregate[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (const [key, obs] of groups.entries()) {
    const [year, month] = key.split('-').map(Number);
    const totalDays = obs.length;

    // Precipitation: sum
    const validPrec = obs.filter((o) => o.precipitation !== null);
    const precipitation =
      validPrec.length > 0
        ? validPrec.reduce((sum, o) => sum + o.precipitation!, 0)
        : null;

    // Temperatures: mean
    const validTemp = obs.filter((o) => o.tempMean !== null);
    const tempMean =
      validTemp.length > 0
        ? validTemp.reduce((sum, o) => sum + o.tempMean!, 0) / validTemp.length
        : null;

    const validMax = obs.filter((o) => o.tempMax !== null);
    const tempMax =
      validMax.length > 0
        ? validMax.reduce((sum, o) => sum + o.tempMax!, 0) / validMax.length
        : null;

    const validMin = obs.filter((o) => o.tempMin !== null);
    const tempMin =
      validMin.length > 0
        ? validMin.reduce((sum, o) => sum + o.tempMin!, 0) / validMin.length
        : null;

    const validRH = obs.filter((o) => o.humidity !== null);
    const humidity =
      validRH.length > 0
        ? validRH.reduce((sum, o) => sum + o.humidity!, 0) / validRH.length
        : null;

    const validSolar = obs.filter((o) => o.solarRadiation !== null);
    const solarRadiation =
      validSolar.length > 0
        ? validSolar.reduce((sum, o) => sum + o.solarRadiation!, 0) / validSolar.length
        : null;

    const validSMTop = obs.filter((o) => o.soilMoistureSurface !== null && o.soilMoistureSurface !== undefined);
    const soilMoistureSurface =
      validSMTop.length > 0
        ? validSMTop.reduce((sum, o) => sum + o.soilMoistureSurface!, 0) / validSMTop.length
        : null;

    const validSMRoot = obs.filter((o) => o.soilMoistureRootZone !== null && o.soilMoistureRootZone !== undefined);
    const soilMoistureRootZone =
      validSMRoot.length > 0
        ? validSMRoot.reduce((sum, o) => sum + o.soilMoistureRootZone!, 0) / validSMRoot.length
        : null;

    const validTS = obs.filter((o) => o.surfaceTemp !== null && o.surfaceTemp !== undefined);
    const surfaceTemp =
      validTS.length > 0
        ? validTS.reduce((sum, o) => sum + o.surfaceTemp!, 0) / validTS.length
        : null;

    const dataCompleteness =
      validTemp.length > 0 ? validTemp.length / totalDays : 0;

    months.push({
      year,
      month,
      monthLabel: `${monthNames[month - 1]} ${year}`,
      precipitation,
      tempMean,
      tempMax,
      tempMin,
      humidity,
      solarRadiation,
      soilMoistureSurface,
      soilMoistureRootZone,
      surfaceTemp,
      dataCompleteness,
    });
  }

  // Sort chronologically
  months.sort((a, b) => a.year - b.year || a.month - b.month);
  return months;
}

// Compute seasonal aggregates (Nepal seasons)
function computeSeasonalAggregates(monthly: MonthlyAggregate[]): SeasonalAggregate[] {
  const nepalSeasons: {
    season: SeasonalAggregate['season'];
    months: number[];
    notes: string;
  }[] = [
    {
      season: 'Winter',
      months: [12, 1, 2],
      notes: 'Dec-Feb: Cool and dry. Rabi crop growing season.',
    },
    {
      season: 'Pre-monsoon',
      months: [3, 4, 5],
      notes: 'Mar-May: Warming, occasional convective rains. Critical crop transition.',
    },
    {
      season: 'Monsoon',
      months: [6, 7, 8, 9],
      notes: 'Jun-Sep: 70-80% of annual rainfall. Kharif crop season.',
    },
    {
      season: 'Post-monsoon',
      months: [10, 11],
      notes: 'Oct-Nov: Rainfall retreating. Harvest and land preparation.',
    },
  ];

  return nepalSeasons.map(({ season, months, notes }) => {
    const seasonalMonths = monthly.filter((m) => months.includes(m.month));

    const validPrec = seasonalMonths.filter((m) => m.precipitation !== null);
    const totalPrec =
      validPrec.length > 0
        ? validPrec.reduce((sum, m) => sum + m.precipitation!, 0) / (validPrec.length / months.length)
        : null;

    const validTemp = seasonalMonths.filter((m) => m.tempMean !== null);
    const meanTemp =
      validTemp.length > 0
        ? validTemp.reduce((sum, m) => sum + m.tempMean!, 0) / validTemp.length
        : null;

    const validRH = seasonalMonths.filter((m) => m.humidity !== null);
    const meanHumidity =
      validRH.length > 0
        ? validRH.reduce((sum, m) => sum + m.humidity!, 0) / validRH.length
        : null;

    return {
      season,
      months,
      precipitation: totalPrec ? Math.round(totalPrec) : null,
      tempMean: meanTemp ? Math.round(meanTemp * 10) / 10 : null,
      humidity: meanHumidity ? Math.round(meanHumidity) : null,
      notes,
    };
  });
}

// Compute climate summary statistics
function computeClimateSummary(
  monthly: MonthlyAggregate[],
  daily: DailyObservation[]
): ClimateSummary {
  // Annual precipitation: mean monthly * 12 (using last complete year if possible)
  const years = [...new Set(monthly.map((m) => m.year))].sort();

  // Annual total precipitation per year
  const annualPrec: number[] = [];
  for (const year of years) {
    const yearMonths = monthly.filter((m) => m.year === year && m.precipitation !== null);
    if (yearMonths.length >= 10) {
      // Only count years with ≥ 10 months of data
      annualPrec.push(yearMonths.reduce((sum, m) => sum + m.precipitation!, 0));
    }
  }
  const annualPrecipitation =
    annualPrec.length > 0
      ? Math.round(annualPrec.reduce((a, b) => a + b, 0) / annualPrec.length)
      : null;

  // Mean annual temperature
  const validTemps = monthly.filter((m) => m.tempMean !== null);
  const meanAnnualTemp =
    validTemps.length > 0
      ? Math.round((validTemps.reduce((s, m) => s + m.tempMean!, 0) / validTemps.length) * 10) / 10
      : null;

  // Summer mean (Jun-Aug)
  const summerMonths = monthly.filter((m) => [6, 7, 8].includes(m.month) && m.tempMean !== null);
  const meanSummerTemp =
    summerMonths.length > 0
      ? Math.round((summerMonths.reduce((s, m) => s + m.tempMean!, 0) / summerMonths.length) * 10) / 10
      : null;

  // Winter mean (Dec-Feb)
  const winterMonths = monthly.filter(
    (m) => [12, 1, 2].includes(m.month) && m.tempMean !== null
  );
  const meanWinterTemp =
    winterMonths.length > 0
      ? Math.round((winterMonths.reduce((s, m) => s + m.tempMean!, 0) / winterMonths.length) * 10) / 10
      : null;

  // Compute mean monthly precipitation across all years
  const meanMonthlyPrec: number[] = Array(13).fill(0);
  const countMonthlyPrec: number[] = Array(13).fill(0);
  for (const m of monthly) {
    if (m.precipitation !== null) {
      meanMonthlyPrec[m.month] += m.precipitation;
      countMonthlyPrec[m.month]++;
    }
  }
  const avgMonthlyPrec = meanMonthlyPrec.map((total, idx) =>
    countMonthlyPrec[idx] > 0 ? total / countMonthlyPrec[idx] : null
  );

  const drySeasonMonths: number[] = [];
  const wetSeasonMonths: number[] = [];
  for (let m = 1; m <= 12; m++) {
    if (avgMonthlyPrec[m] !== null) {
      if (avgMonthlyPrec[m]! < 60) drySeasonMonths.push(m);
      if (avgMonthlyPrec[m]! > 100) wetSeasonMonths.push(m);
    }
  }

  // Frost risk months: mean min temp < 2°C
  const meanMonthlyMin: number[] = Array(13).fill(0);
  const countMonthlyMin: number[] = Array(13).fill(0);
  for (const m of monthly) {
    if (m.tempMin !== null) {
      meanMonthlyMin[m.month] += m.tempMin;
      countMonthlyMin[m.month]++;
    }
  }
  const frostRiskMonths: number[] = [];
  for (let m = 1; m <= 12; m++) {
    if (countMonthlyMin[m] > 0) {
      const avgMin = meanMonthlyMin[m] / countMonthlyMin[m];
      if (avgMin < 2) frostRiskMonths.push(m);
    }
  }

  // Heat stress months: mean max temp > 35°C
  const meanMonthlyMax: number[] = Array(13).fill(0);
  const countMonthlyMax: number[] = Array(13).fill(0);
  for (const m of monthly) {
    if (m.tempMax !== null) {
      meanMonthlyMax[m.month] += m.tempMax;
      countMonthlyMax[m.month]++;
    }
  }
  const heatStressMonths: number[] = [];
  for (let m = 1; m <= 12; m++) {
    if (countMonthlyMax[m] > 0) {
      const avgMax = meanMonthlyMax[m] / countMonthlyMax[m];
      if (avgMax > 35) heatStressMonths.push(m);
    }
  }

  const validDays = daily.filter((d) => d.tempMean !== null).length;
  const dataCompleteness = daily.length > 0 ? validDays / daily.length : 0;

  return {
    annualPrecipitation,
    meanAnnualTemp,
    meanSummerTemp,
    meanWinterTemp,
    drySeasonMonths,
    wetSeasonMonths,
    frostRiskMonths,
    heatStressMonths,
    dataCompleteness: Math.round(dataCompleteness * 100) / 100,
    yearsIncluded: years,
  };
}

// ============================================================
// Main API function
// ============================================================

export interface FetchClimateOptions {
  startDate?: string; // YYYYMMDD
  endDate?: string;   // YYYYMMDD
}

export interface FetchClimateError {
  type: 'network' | 'api' | 'parse' | 'validation';
  message: string;
  retry: boolean;
}

export type FetchClimateResult =
  | { success: true; data: ClimateDataset }
  | { success: false; error: FetchClimateError };

export async function fetchClimateData(
  location: Location,
  options: FetchClimateOptions = {}
): Promise<FetchClimateResult> {
  // Validate coordinates
  const validation = validateCoordinates(location.latitude, location.longitude);
  if (!validation.valid) {
    return {
      success: false,
      error: {
        type: 'validation',
        message: validation.error!,
        retry: false,
      },
    };
  }

  const dateRange = getDefaultDateRange();
  const start = options.startDate ?? dateRange.start;
  const end = options.endDate ?? dateRange.end;

  // Check cache
  const key = cacheKey(location.latitude, location.longitude, start, end);
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return { success: true, data: cached.data };
  }

  // Build URL
  const url = new URL(POWER_BASE_URL);
  url.searchParams.set('parameters', PARAMETERS);
  url.searchParams.set('community', 'AG');
  url.searchParams.set('longitude', location.longitude.toFixed(4));
  url.searchParams.set('latitude', location.latitude.toFixed(4));
  url.searchParams.set('start', start);
  url.searchParams.set('end', end);
  url.searchParams.set('format', 'JSON');

  // Fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  let rawResponse: PowerApiResponse;

  try {
    const resp = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return {
        success: false,
        error: {
          type: 'api',
          message: `NASA POWER API returned HTTP ${resp.status}. ${text.slice(0, 200)}`,
          retry: resp.status >= 500 || resp.status === 429,
        },
      };
    }

    rawResponse = await resp.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        success: false,
        error: {
          type: 'network',
          message: 'Request timed out after 30 seconds. Please try again.',
          retry: true,
        },
      };
    }
    return {
      success: false,
      error: {
        type: 'network',
        message: `Network error: ${err instanceof Error ? err.message : 'Unknown error'}. Check your internet connection.`,
        retry: true,
      },
    };
  }

  // Validate response structure
  if (!rawResponse?.properties?.parameter) {
    return {
      success: false,
      error: {
        type: 'parse',
        message: 'NASA POWER response was missing expected data structure.',
        retry: true,
      },
    };
  }

  // Parse daily observations
  const params = rawResponse.properties.parameter;
  const dateKeys = Object.keys(params.T2M ?? params.PRECTOTCORR ?? {});

  const daily: DailyObservation[] = dateKeys
    .map((dk): DailyObservation => ({
      date: parsePowerDate(dk),
      dateKey: dk,
      precipitation: parseValue(params.PRECTOTCORR?.[dk] ?? FILL_VALUE),
      tempMean: parseValue(params.T2M?.[dk] ?? FILL_VALUE),
      tempMax: parseValue(params.T2M_MAX?.[dk] ?? FILL_VALUE),
      tempMin: parseValue(params.T2M_MIN?.[dk] ?? FILL_VALUE),
      humidity: parseValue(params.RH2M?.[dk] ?? FILL_VALUE),
      solarRadiation: parseValue(params.ALLSKY_SFC_SW_DWN?.[dk] ?? FILL_VALUE),
      soilMoistureSurface: parseValue(params.GWETTOP?.[dk] ?? FILL_VALUE),
      soilMoistureRootZone: parseValue(params.GWETROOT?.[dk] ?? FILL_VALUE),
      surfaceTemp: parseValue(params.TS?.[dk] ?? FILL_VALUE),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (daily.length === 0) {
    return {
      success: false,
      error: {
        type: 'parse',
        message: 'No daily observations found in the API response.',
        retry: false,
      },
    };
  }

  // Compute aggregates
  const monthly = computeMonthlyAggregates(daily);
  const seasonal = computeSeasonalAggregates(monthly);
  const summary = computeClimateSummary(monthly, daily);

  // Elevation from geometry
  const elevation =
    rawResponse.geometry?.coordinates?.[2] !== undefined
      ? Math.round(rawResponse.geometry.coordinates[2])
      : location.elevation;

  const enrichedLocation: Location = {
    ...location,
    elevation,
  };

  const source: DataSource = {
    name: 'NASA POWER',
    version: rawResponse.header?.api?.version ?? 'unknown',
    endpoint: POWER_BASE_URL,
    parameters: PARAMETERS.split(','),
    startDate: rawResponse.header?.start ?? start,
    endDate: rawResponse.header?.end ?? end,
    attribution:
      'NASA/POWER CERES/MERRA2 Native Resolution Meteorological and Solar Data, NASA Langley Research Center (LaRC) POWER Project funded through the NASA Earth Science/Applied Science Program.',
    license: 'Publicly available, no authentication required. Please cite NASA POWER when publishing.',
  };

  const dataset: ClimateDataset = {
    location: enrichedLocation,
    daily,
    monthly,
    seasonal,
    summary,
    source,
    retrievedAt: new Date(),
  };

  // Store in cache
  responseCache.set(key, { data: dataset, timestamp: Date.now() });

  return { success: true, data: dataset };
}

// ============================================================
// Utility: compute average monthly values across all years
// Used for charts comparing crop needs vs. climate norms
// ============================================================

export interface MonthlyNormal {
  month: number;
  monthShort: string;
  precipitation: number | null;
  tempMean: number | null;
  tempMax: number | null;
  tempMin: number | null;
  humidity: number | null;
  solarRadiation: number | null;
  soilMoistureSurface?: number | null; // 0-1
  soilMoistureRootZone?: number | null; // 0-1
  surfaceTemp?: number | null; // °C
  sampleYears: number;
}

const MONTH_SHORTS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function computeMonthlyNormals(monthly: MonthlyAggregate[]): MonthlyNormal[] {
  const normals: MonthlyNormal[] = [];

  for (let m = 1; m <= 12; m++) {
    const monthData = monthly.filter((mo) => mo.month === m);

    const validPrec = monthData.filter((mo) => mo.precipitation !== null);
    const validTemp = monthData.filter((mo) => mo.tempMean !== null);
    const validMax = monthData.filter((mo) => mo.tempMax !== null);
    const validMin = monthData.filter((mo) => mo.tempMin !== null);
    const validRH = monthData.filter((mo) => mo.humidity !== null);
    const validSolar = monthData.filter((mo) => mo.solarRadiation !== null);
    const validSMTop = monthData.filter((mo) => mo.soilMoistureSurface !== null && mo.soilMoistureSurface !== undefined);
    const validSMRoot = monthData.filter((mo) => mo.soilMoistureRootZone !== null && mo.soilMoistureRootZone !== undefined);
    const validTS = monthData.filter((mo) => mo.surfaceTemp !== null && mo.surfaceTemp !== undefined);

    normals.push({
      month: m,
      monthShort: MONTH_SHORTS[m - 1],
      precipitation:
        validPrec.length > 0
          ? Math.round(validPrec.reduce((s, mo) => s + mo.precipitation!, 0) / validPrec.length)
          : null,
      tempMean:
        validTemp.length > 0
          ? Math.round((validTemp.reduce((s, mo) => s + mo.tempMean!, 0) / validTemp.length) * 10) / 10
          : null,
      tempMax:
        validMax.length > 0
          ? Math.round((validMax.reduce((s, mo) => s + mo.tempMax!, 0) / validMax.length) * 10) / 10
          : null,
      tempMin:
        validMin.length > 0
          ? Math.round((validMin.reduce((s, mo) => s + mo.tempMin!, 0) / validMin.length) * 10) / 10
          : null,
      humidity:
        validRH.length > 0
          ? Math.round(validRH.reduce((s, mo) => s + mo.humidity!, 0) / validRH.length)
          : null,
      solarRadiation:
        validSolar.length > 0
          ? Math.round((validSolar.reduce((s, mo) => s + mo.solarRadiation!, 0) / validSolar.length) * 10) / 10
          : null,
      soilMoistureSurface:
        validSMTop.length > 0
          ? Math.round((validSMTop.reduce((s, mo) => s + mo.soilMoistureSurface!, 0) / validSMTop.length) * 100) / 100
          : null,
      soilMoistureRootZone:
        validSMRoot.length > 0
          ? Math.round((validSMRoot.reduce((s, mo) => s + mo.soilMoistureRootZone!, 0) / validSMRoot.length) * 100) / 100
          : null,
      surfaceTemp:
        validTS.length > 0
          ? Math.round((validTS.reduce((s, mo) => s + mo.surfaceTemp!, 0) / validTS.length) * 10) / 10
          : null,
      sampleYears: monthData.length,
    });
  }

  return normals;
}
