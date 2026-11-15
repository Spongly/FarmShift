// ============================================================
// Weather Forecast Service via Open-Meteo API
// Free, CORS-friendly, non-key agricultural and meteorological forecast
// Separates 7-day weather predictions from NASA historical observations
// ============================================================

export interface DailyForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  et0FaoEvapotranspiration?: number;
  soilMoisture0to1cm?: number; // m³/m³
  soilMoisture1to3cm?: number; // m³/m³
  soilMoisture3to9cm?: number; // m³/m³
  weatherCode: number;
  weatherDescriptionEn: string;
  weatherDescriptionNe: string;
}

export interface CurrentWeather {
  temperature: number;
  relativeHumidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
}

export interface WeatherForecastData {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  current: CurrentWeather;
  daily: DailyForecastDay[];
  summary: {
    totalRainNext7Days: number;
    highestTemp: number;
    lowestTemp: number;
    rainyDaysCount: number;
    hasHeavyRainRisk: boolean;
    hasHeatRisk: boolean;
    recent30DaysRainfall: number;
    recentRainyDaysCount: number;
  };
  provenance: {
    source: string;
    model: string;
    retrievedAt: string;
    gridResolution: string;
  };
}

// Map WMO weather codes to readable descriptions
export function decodeWmoCode(code: number): { en: string; ne: string } {
  switch (code) {
    case 0:
      return { en: 'Clear sky', ne: 'सफा आकाश' };
    case 1:
      return { en: 'Mainly clear', ne: 'अधिकांश सफा' };
    case 2:
      return { en: 'Partly cloudy', ne: 'आंशिक बदली' };
    case 3:
      return { en: 'Overcast', ne: 'बादल लागेको' };
    case 45:
    case 48:
      return { en: 'Foggy', ne: 'कुहिरो / हुस्सु' };
    case 51:
    case 53:
    case 55:
      return { en: 'Drizzle', ne: 'सिमसिमे पानी' };
    case 61:
      return { en: 'Slight rain', ne: 'हल्का वर्षा' };
    case 63:
      return { en: 'Moderate rain', ne: 'मध्यम वर्षा' };
    case 65:
      return { en: 'Heavy rain', ne: 'भारी वर्षा' };
    case 71:
    case 73:
    case 75:
      return { en: 'Snowfall', ne: 'हिमपात' };
    case 80:
    case 81:
    case 82:
      return { en: 'Rain showers', ne: 'क्षणिक वर्षा / झरी' };
    case 95:
    case 96:
    case 99:
      return { en: 'Thunderstorm', ne: 'चट्याङसहित वर्षा' };
    default:
      return { en: 'Variable conditions', ne: 'परिवर्तनशील मौसम' };
  }
}

// In-memory cache
const forecastCache = new Map<string, { data: WeatherForecastData; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 mins

export async function fetchWeatherForecast(lat: number, lon: number): Promise<WeatherForecastData> {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = forecastCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lon.toString());
  // Soil moisture is an hourly/current variable on Open-Meteo — requesting it as
  // daily (soil_moisture_0_to_1cm etc.) returns HTTP 400 and the UI falls back to 0 mm.
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm'
  );
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,et0_fao_evapotranspiration'
  );
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('past_days', '30');

  const res = await fetch(url.toString());
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(json.reason || `Open-Meteo forecast API error: ${res.status} ${res.statusText}`);
  }

  const daily: DailyForecastDay[] = [];
  const times: string[] = json.daily?.time || [];
  const maxTemps: number[] = json.daily?.temperature_2m_max || [];
  const minTemps: number[] = json.daily?.temperature_2m_min || [];
  const precipSums: number[] = json.daily?.precipitation_sum || [];
  const precipProbs: number[] = json.daily?.precipitation_probability_max || [];
  const winds: number[] = json.daily?.wind_speed_10m_max || [];
  const et0: number[] = json.daily?.et0_fao_evapotranspiration || [];
  const codes: number[] = json.daily?.weather_code || [];
  const currentSoil0to1 = json.current?.soil_moisture_0_to_1cm;
  const currentSoil1to3 = json.current?.soil_moisture_1_to_3cm;
  const currentSoil3to9 = json.current?.soil_moisture_3_to_9cm;

  // Use the forecast location's local calendar date, not UTC, so Nepal (UTC+5:45)
  // does not drop "today" or include an extra past day.
  const todayStr = (typeof json.current?.time === 'string' ? json.current.time : new Date().toISOString()).slice(0, 10);
  let past30DaysRain = 0;
  let past30RainyDays = 0;

  for (let i = 0; i < times.length; i++) {
    const dateStr = times[i];
    const rain = precipSums[i] ?? 0;
    if (dateStr < todayStr) {
      past30DaysRain += rain;
      if (rain >= 1.0) past30RainyDays++;
    }
  }

  let totalRain = 0;
  let highestT = -999;
  let lowestT = 999;
  let rainyDays = 0;

  for (let i = 0; i < times.length; i++) {
    const dateStr = times[i];
    // Only include today and the next 7 forecast days in the daily forecast array
    if (dateStr < todayStr) continue;

    const code = codes[i] ?? 0;
    const decoded = decodeWmoCode(code);
    const rain = precipSums[i] ?? 0;
    const tMax = maxTemps[i] ?? 0;
    const tMin = minTemps[i] ?? 0;

    totalRain += rain;
    if (tMax > highestT) highestT = tMax;
    if (tMin < lowestT) lowestT = tMin;
    if (rain >= 2.0) rainyDays++;

    daily.push({
      date: times[i],
      tempMax: tMax,
      tempMin: tMin,
      precipitationSum: rain,
      precipitationProbabilityMax: precipProbs[i] ?? 0,
      windSpeedMax: winds[i] ?? 0,
      et0FaoEvapotranspiration: et0[i],
      soilMoisture0to1cm: dateStr === todayStr ? currentSoil0to1 : undefined,
      soilMoisture1to3cm: dateStr === todayStr ? currentSoil1to3 : undefined,
      soilMoisture3to9cm: dateStr === todayStr ? currentSoil3to9 : undefined,
      weatherCode: code,
      weatherDescriptionEn: decoded.en,
      weatherDescriptionNe: decoded.ne,
    });
  }

  const currentWeather: CurrentWeather = {
    temperature: json.current?.temperature_2m ?? 20,
    relativeHumidity: json.current?.relative_humidity_2m ?? 60,
    windSpeed: json.current?.wind_speed_10m ?? 5,
    precipitation: json.current?.precipitation ?? 0,
    weatherCode: json.current?.weather_code ?? 0,
    isDay: json.current?.is_day === 1,
    time: json.current?.time ?? new Date().toISOString(),
  };

  const result: WeatherForecastData = {
    latitude: json.latitude,
    longitude: json.longitude,
    elevation: json.elevation,
    timezone: json.timezone,
    current: currentWeather,
    daily,
    summary: {
      totalRainNext7Days: Math.round(totalRain * 10) / 10,
      highestTemp: Math.round(highestT * 10) / 10,
      lowestTemp: Math.round(lowestT * 10) / 10,
      rainyDaysCount: rainyDays,
      hasHeavyRainRisk: daily.some((d) => d.precipitationSum >= 25),
      hasHeatRisk: highestT >= 34,
      recent30DaysRainfall: Math.round(past30DaysRain * 10) / 10,
      recentRainyDaysCount: past30RainyDays,
    },
    provenance: {
      source: 'Open-Meteo Numerical Weather Prediction API',
      model: 'ECMWF IFS / DWD ICON Ensemble blend',
      retrievedAt: new Date().toISOString(),
      gridResolution: '~11 km global grid',
    },
  };

  forecastCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}
