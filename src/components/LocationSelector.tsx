import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, X, Navigation, ChevronDown, Compass, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Button, Input, Card } from './ui';
import { useApp } from '../context/AppContext';
import { 
  searchLocation, 
  geocodingResultToLocation, 
  coordinatesToLocation, 
  presetToLocation, 
  formatCoordinates,
  reverseGeocodeCoordinates
} from '../services/geocoding';
import { NEPAL_PRESETS } from '../data/cropData';
import { TRANSLATIONS } from '../data/translations';
import type { GeocodingResult } from '../services/geocoding';
import type { Location } from '../types';

// ============================================================
// Location Selector Component
// ============================================================

interface LocationSelectorProps {
  compact?: boolean;
  onLocationSelected?: (location: Location) => void;
  showAutoDetect?: boolean;
}

export function LocationSelector({ 
  compact = false, 
  onLocationSelected,
  showAutoDetect = true
}: LocationSelectorProps) {
  const { state, setLocation, clearLocation } = useApp();
  const ne = state.language === 'ne';
  const t = TRANSLATIONS[state.language];

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  
  // Geolocation state
  const [detecting, setDetecting] = useState(false);
  const [geoMessage, setGeoMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      const found = await searchLocation(q);
      setResults(found);
      if (found.length === 0) {
        setSearchError(
          ne
            ? 'कुनै स्थान भेटिएन। जिल्लाको नाम लेख्नुहोस् वा तलका उदाहरण स्थानहरू छान्नुहोस्।'
            : 'No locations found. Try a district name or use the preset locations below.'
        );
      }
    } catch (err) {
      setSearchError(
        err instanceof Error
          ? err.message
          : (ne ? 'खोज असफल भयो।' : 'Search failed.')
      );
    } finally {
      setSearching(false);
    }
  }, [ne]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (query.trim().length >= 2) {
      searchTimer.current = setTimeout(() => handleSearch(query), 600);
    } else {
      setResults([]);
      setSearchError(null);
    }
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [query, handleSearch]);

  function selectResult(result: GeocodingResult) {
    const loc = geocodingResultToLocation(result);
    setLocation(loc);
    setQuery('');
    setResults([]);
    setShowPresets(false);
    setGeoMessage(null);
    onLocationSelected?.(loc);
  }

  // Auto-detect browser geolocation
  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoMessage({
        text: ne ? 'तपाईंको ब्राउजरमा जीपीएस/स्थान सुविधा उपलब्ध छैन।' : 'Geolocation is not supported by your browser.',
        type: 'error'
      });
      return;
    }

    setDetecting(true);
    setGeoMessage({
      text: t.location.detectingLocation,
      type: 'info'
    });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const loc = await reverseGeocodeCoordinates(latitude, longitude);
          setLocation(loc);
          setGeoMessage({
            text: `${t.location.locationDetectedSuccess} (${loc.name})`,
            type: 'success'
          });
          onLocationSelected?.(loc);
        } catch {
          const fallbackLoc = coordinatesToLocation(latitude, longitude);
          fallbackLoc.source = 'gps';
          setLocation(fallbackLoc);
          setGeoMessage({
            text: `${t.location.locationDetectedSuccess}`,
            type: 'success'
          });
          onLocationSelected?.(fallbackLoc);
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoMessage({
            text: t.location.locationPermissionDenied,
            type: 'error'
          });
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoMessage({
            text: t.location.locationUnavailable,
            type: 'error'
          });
        } else {
          setGeoMessage({
            text: t.location.locationTimeout,
            type: 'error'
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [ne, t.location, setLocation, onLocationSelected]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setManualError(null);
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon)) {
      setManualError(ne ? 'कृपया मान्य अङ्कीय निर्देशांकहरू प्रविष्ट गर्नुहोस्।' : 'Please enter valid numeric coordinates.');
      return;
    }
    if (lat < -90 || lat > 90) {
      setManualError(ne ? 'अक्षांश -९० र ९० को बीचमा हुनुपर्छ।' : 'Latitude must be between -90 and 90.');
      return;
    }
    if (lon < -180 || lon > 180) {
      setManualError(ne ? 'देशान्तर -१८० र १८० को बीचमा हुनुपर्छ।' : 'Longitude must be between -180 and 180.');
      return;
    }
    const loc = coordinatesToLocation(lat, lon);
    setLocation(loc);
    setShowManual(false);
    setManualLat('');
    setManualLon('');
    setGeoMessage(null);
    onLocationSelected?.(loc);
  }

  if (compact && state.location) {
    return (
      <div className="flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-forest flex-shrink-0" aria-hidden="true" />
        <span className="text-sm text-ink font-medium truncate">{state.location.name}</span>
        <span className="text-xs text-ink-muted font-mono">
          {formatCoordinates(state.location.latitude, state.location.longitude, 3)}
        </span>
        <button
          onClick={clearLocation}
          className="ml-auto p-1 text-ink-muted hover:text-sienna transition-colors"
          aria-label={ne ? 'स्थान मेटाउनुहोस्' : 'Clear location'}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* 1. Prominent "Use My Current Location" button */}
      {showAutoDetect && (
        <div className="bg-forest-50/70 border border-forest-200/90 rounded-lg p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-forest-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                {detecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Compass className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-forest-950">
                  {ne ? 'आफ्नो खेतको स्थान स्वतः पत्ता लगाउनुहोस्' : 'Detect your farm location automatically'}
                </p>
                <p className="text-2xs text-forest-700">
                  {ne ? 'ब्राउजरको जीपीएस प्रयोग गरेर १-क्लिकमा सिधै योजना बनाउनुहोस्' : 'Use your device GPS coordinates to immediately set up your farm'}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={detecting}
              leftIcon={<Compass className="w-3.5 h-3.5" />}
              onClick={handleDetectLocation}
              className="shrink-0 font-semibold"
            >
              {t.location.useMyLocation}
            </Button>
          </div>

          {/* Feedback message */}
          {geoMessage && (
            <div
              className={clsx(
                'mt-2.5 px-3 py-2 rounded text-xs font-medium border flex items-start gap-2',
                geoMessage.type === 'success' && 'bg-forest-100/90 text-forest-900 border-forest-300',
                geoMessage.type === 'error' && 'bg-sienna-50 text-sienna border-sienna-200',
                geoMessage.type === 'info' && 'bg-paper-200 text-ink border-paper-300'
              )}
            >
              {geoMessage.type === 'success' && <MapPin className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />}
              <span>{geoMessage.text}</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Manual text search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              ne
                ? 'गाउँपालिका, नगरपालिका, जिल्ला वा गाउँ खोज्नुहोस्...'
                : 'Search municipality, district, or village...'
            }
            className="w-full pl-9 pr-10 py-2.5 text-sm bg-paper border border-paper-300 rounded text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
            aria-label={ne ? 'नेपालको स्थान खोज्नुहोस्' : 'Search for a location in Nepal'}
            autoComplete="off"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-forest-200 border-t-forest rounded-full animate-spin" aria-hidden="true" />
            </div>
          )}
          {query && !searching && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              onClick={() => { setQuery(''); setResults([]); }}
              aria-label={ne ? 'खोज मेटाउनुहोस्' : 'Clear search'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {(results.length > 0 || searchError) && (
          <div
            ref={resultsRef}
            className="absolute top-full mt-1 left-0 right-0 z-50 bg-paper border border-paper-300 rounded shadow-lg overflow-hidden"
            role="listbox"
            aria-label={ne ? 'स्थान खोजी नतिजा' : 'Location search results'}
          >
            {searchError && (
              <div className="p-3 text-xs text-ink-muted">{searchError}</div>
            )}
            {results.map((r, i) => (
              <button
                key={i}
                className="w-full text-left px-3 py-2.5 hover:bg-paper-200 transition-colors border-b border-paper-200 last:border-0"
                onClick={() => selectResult(r)}
                role="option"
                aria-selected={false}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-forest flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{r.name}</p>
                    <p className="text-xs text-ink-muted truncate">{r.displayName}</p>
                  </div>
                  <span className="ml-auto text-2xs text-ink-subtle font-mono flex-shrink-0">
                    {r.latitude.toFixed(2)}°N
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Preset locations dropdown */}
      <div>
        <button
          className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
          onClick={() => setShowPresets(!showPresets)}
          aria-expanded={showPresets}
        >
          <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
          {ne ? 'नेपालका प्रमुख नमुना स्थानहरू' : 'Example locations'}
          <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', showPresets && 'rotate-180')} aria-hidden="true" />
        </button>

        {showPresets && (
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in">
            {NEPAL_PRESETS.map((preset) => (
              <button
                key={preset.name}
                className="text-left p-2.5 border border-paper-300 rounded hover:border-forest-200 hover:bg-forest-50 transition-all group"
                onClick={() => {
                  const loc = presetToLocation(preset);
                  setLocation(loc);
                  setShowPresets(false);
                  setGeoMessage(null);
                  onLocationSelected?.(loc);
                }}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-forest-300 group-hover:text-forest flex-shrink-0 mt-0.5 transition-colors" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink leading-tight">{preset.name}</p>
                    <p className="text-2xs text-ink-muted mt-0.5">{preset.district} · {preset.agroclimaticZone}</p>
                    <p className="text-2xs text-ink-subtle mt-0.5">{preset.primaryCrops.slice(0, 3).join(', ')}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Manual coordinate entry */}
      <div>
        <button
          className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
          onClick={() => setShowManual(!showManual)}
          aria-expanded={showManual}
        >
          <span className="font-mono">±</span>
          {ne ? 'अक्षांश र देशान्तर सिधै राख्नुहोस्' : 'Enter coordinates manually'}
          <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', showManual && 'rotate-180')} aria-hidden="true" />
        </button>

        {showManual && (
          <form onSubmit={handleManualSubmit} className="mt-2 space-y-2 animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-ink-muted mb-1" htmlFor="manual-lat">
                  {ne ? 'अक्षांश (Latitude °N)' : 'Latitude (N)'}
                </label>
                <Input
                  id="manual-lat"
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  placeholder="27.7172"
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1" htmlFor="manual-lon">
                  {ne ? 'देशान्तर (Longitude °E)' : 'Longitude (E)'}
                </label>
                <Input
                  id="manual-lon"
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  value={manualLon}
                  onChange={(e) => setManualLon(e.target.value)}
                  placeholder="85.3240"
                  className="text-xs"
                />
              </div>
            </div>
            {manualError && (
              <p className="text-xs text-sienna">{manualError}</p>
            )}
            <Button type="submit" variant="secondary" size="sm">
              {ne ? 'स्थान लागू गर्नुहोस्' : 'Set Location'}
            </Button>
          </form>
        )}
      </div>

      {/* 5. Current selection display */}
      {state.location && (
        <Card padding="sm" className="border-forest-200 bg-forest-50 animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-forest leading-tight">{state.location.name}</p>
                {state.location.district && (
                  <p className="text-xs text-forest-400 mt-0.5">{state.location.district}{state.location.province ? `, ${state.location.province}` : ''}</p>
                )}
                <p className="text-xs font-mono text-forest-400 mt-1">
                  {formatCoordinates(state.location.latitude, state.location.longitude)}
                  {state.location.elevation ? ` · ${state.location.elevation} m` : ''}
                </p>
                <p className="text-2xs text-forest-400 mt-0.5 capitalize">
                  {ne ? 'स्रोत:' : 'Source:'} {state.location.source}
                </p>
              </div>
            </div>
            <button
              onClick={clearLocation}
              className="p-1 text-forest-300 hover:text-sienna transition-colors"
              aria-label={ne ? 'स्थान मेटाउनुहोस्' : 'Clear location'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Attribution */}
      <p className="text-2xs text-ink-subtle">
        {ne ? 'स्थान खोज स्रोत:' : 'Location search:'} ©{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-muted">
          OpenStreetMap contributors
        </a>
        , Nominatim.
      </p>
    </div>
  );
}
