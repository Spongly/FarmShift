// ============================================================
// Geocoding Service
// Uses Nominatim (OpenStreetMap) — free, no auth required
// Usage policy: max 1 request/second, must include User-Agent
// Attribution: © OpenStreetMap contributors
// ============================================================

import type { Location } from '../types';
import { NEPAL_PRESETS } from '../data/cropData';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'FarmShiftNepal/1.0 (NASA Space Apps Challenge 2026; agricultural planning tool)';

export interface GeocodingResult {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  country: string;
  district?: string;
  province?: string;
  boundingBox?: [number, number, number, number]; // [minLat, maxLat, minLon, maxLon]
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    village?: string;
    town?: string;
    city?: string;
    district?: string;
    state?: string;
    county?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: string[];
}

// Rate limiting: track last request time
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1200; // Slightly more than 1s to be safe

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();

  return fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });
}

export async function searchLocation(query: string): Promise<GeocodingResult[]> {
  if (!query.trim() || query.trim().length < 2) return [];

  const url = new URL(NOMINATIM_BASE);
  url.searchParams.set('q', `${query}, Nepal`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '8');
  url.searchParams.set('countrycodes', 'np');
  url.searchParams.set('addressdetails', '1');

  try {
    const resp = await rateLimitedFetch(url.toString());
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const data: NominatimResult[] = await resp.json();

    return data.map((r) => {
      const addr = r.address ?? {};
      const name = addr.city ?? addr.town ?? addr.village ?? r.display_name.split(',')[0];

      return {
        name,
        displayName: r.display_name,
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
        country: 'Nepal',
        district: addr.district ?? addr.county,
        province: addr.state,
        boundingBox: r.boundingbox
          ? [
              parseFloat(r.boundingbox[0]),
              parseFloat(r.boundingbox[1]),
              parseFloat(r.boundingbox[2]),
              parseFloat(r.boundingbox[3]),
            ]
          : undefined,
      };
    });
  } catch (err) {
    console.error('Geocoding error:', err);
    throw new Error(
      'Location search is temporarily unavailable. Use the map to click a location, or enter coordinates manually.'
    );
  }
}

export async function reverseGeocodeCoordinates(lat: number, lon: number): Promise<Location> {
  const url = new URL(NOMINATIM_REVERSE);
  url.searchParams.set('lat', lat.toString());
  url.searchParams.set('lon', lon.toString());
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');

  try {
    const resp = await rateLimitedFetch(url.toString());
    if (resp.ok) {
      const data: NominatimResult = await resp.json();
      const addr = data.address ?? {};
      const placeName = addr.village || addr.town || addr.city || addr.county || data.display_name?.split(',')[0] || 'My Current Farm';
      return {
        name: placeName,
        district: addr.district || addr.county,
        province: addr.state,
        country: 'Nepal',
        latitude: lat,
        longitude: lon,
        source: 'gps',
      };
    }
  } catch (err) {
    console.warn('Reverse geocoding failed, falling back to coordinate name:', err);
  }

  return {
    name: `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`,
    country: 'Nepal',
    latitude: lat,
    longitude: lon,
    source: 'gps',
  };
}

export function geocodingResultToLocation(result: GeocodingResult): Location {
  return {
    name: result.name,
    district: result.district,
    province: result.province,
    country: 'Nepal',
    latitude: result.latitude,
    longitude: result.longitude,
    source: 'geocoded',
  };
}

export function coordinatesToLocation(lat: number, lon: number): Location {
  return {
    name: `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`,
    country: 'Nepal',
    latitude: lat,
    longitude: lon,
    source: 'manual',
  };
}

export function presetToLocation(preset: (typeof NEPAL_PRESETS)[0]): Location {
  return {
    name: preset.name,
    district: preset.district,
    province: preset.province,
    country: 'Nepal',
    latitude: preset.latitude,
    longitude: preset.longitude,
    source: 'preset',
  };
}

export function validateNepalCoordinates(lat: number, lon: number): boolean {
  // Nepal bounding box (with margin): 26.35 - 30.45 N, 80.06 - 88.20 E
  return lat >= 26.0 && lat <= 31.0 && lon >= 79.5 && lon <= 88.5;
}

export function formatCoordinates(lat: number, lon: number, precision = 4): string {
  return `${Math.abs(lat).toFixed(precision)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(precision)}°${lon >= 0 ? 'E' : 'W'}`;
}
