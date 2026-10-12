import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { SatelliteLayerOption } from '../services/satelliteLayers';
import { getGibsWmtsUrl } from '../services/satelliteLayers';
import type { Location } from '../types';
import { Eye, EyeOff } from 'lucide-react';

// Fix Leaflet's default marker icon paths in Vite bundles
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
}

/** Leaflet only measures its container once; reflow on narrow screens leaves a blank/clipped map. */
function InvalidateMapSize() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const sync = () => map.invalidateSize();
    sync();
    const frame = window.requestAnimationFrame(sync);
    const observer = new ResizeObserver(sync);
    observer.observe(container);
    window.addEventListener('orientationchange', sync);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('orientationchange', sync);
    };
  }, [map]);
  return null;
}

function SatelliteLayerControls({
  language,
  selectedLayer,
  overlayOpacity,
  showBaseMap,
  onOpacityChange,
  onToggleBaseMap,
}: {
  language: 'en' | 'ne';
  selectedLayer: SatelliteLayerOption;
  overlayOpacity: number;
  showBaseMap: boolean;
  onOpacityChange: (value: number) => void;
  onToggleBaseMap: () => void;
}) {
  return (
    <div className="bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-lg border border-stone-200 shadow-md text-xs space-y-2 sm:max-w-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 font-bold text-ink min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate">{language === 'ne' ? selectedLayer.nameNe : selectedLayer.nameEn}</span>
        </div>
        <button
          type="button"
          onClick={onToggleBaseMap}
          className="p-2 sm:p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0 touch-manipulation"
          title={showBaseMap ? (language === 'ne' ? 'सडक नक्सा लुकाउनुहोस्' : 'Hide road map') : (language === 'ne' ? 'सडक नक्सा देखाउनुहोस्' : 'Show road map')}
        >
          {showBaseMap ? <EyeOff className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> : <Eye className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
        </button>
      </div>

      <div className="space-y-1 pt-1 border-t border-stone-200 text-[11px] text-stone-600">
        <div className="flex justify-between">
          <span>{language === 'ne' ? 'उपग्रह पत्र पारदर्शिता:' : 'Satellite Opacity:'}</span>
          <span className="font-mono font-bold text-ink">{(overlayOpacity * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={overlayOpacity}
          onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          className="w-full h-2 sm:h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-forest-700"
        />
      </div>

      <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-200 flex justify-between gap-2">
        <span className="truncate">{selectedLayer.instrument}</span>
        <span className="shrink-0">{language === 'ne' ? 'अधिकतम रिजोल्युसन:' : 'Native grid:'} {selectedLayer.resolution}</span>
      </div>
    </div>
  );
}

interface InteractiveSatelliteMapProps {
  location: Location;
  selectedLayer: SatelliteLayerOption;
  dateStr: string;
  language?: 'en' | 'ne';
}

export function InteractiveSatelliteMap({
  location,
  selectedLayer,
  dateStr,
  language = 'en',
}: InteractiveSatelliteMapProps) {
  const lat = location.latitude;
  const lon = location.longitude;
  const wmtsUrl = getGibsWmtsUrl(selectedLayer, dateStr);

  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.85);
  const [showBaseMap, setShowBaseMap] = useState<boolean>(true);

  const controlProps = {
    language,
    selectedLayer,
    overlayOpacity,
    showBaseMap,
    onOpacityChange: setOverlayOpacity,
    onToggleBaseMap: () => setShowBaseMap((visible) => !visible),
  };

  return (
    <div className="@container flex flex-col gap-2">
    <div className="relative w-full h-[min(52svh,360px)] @[28rem]:h-[440px] @[42rem]:h-[480px] min-h-[240px] rounded-xl overflow-hidden border border-stone-300 shadow-sm z-0 touch-manipulation">
      <MapContainer
        center={[lat, lon]}
        zoom={7}
        minZoom={2}
        maxZoom={12}
        scrollWheelZoom={false}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        bounceAtZoomLimits={false}
        className="w-full h-full"
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <RecenterMap lat={lat} lon={lon} />
        <InvalidateMapSize />

        {/* 1. Base OpenStreetMap layer (toggleable) */}
        {showBaseMap && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
          />
        )}

        {/* 2. NASA GIBS WMTS Satellite Overlay Tile Layer */}
        {/* maxNativeZoom ensures Leaflet auto-scales tiles when user zooms past the layer max level */}
        <TileLayer
          key={`${selectedLayer.id}-${dateStr}-${selectedLayer.maxNativeZoom}`}
          url={wmtsUrl}
          attribution={selectedLayer.attribution}
          opacity={overlayOpacity}
          maxNativeZoom={selectedLayer.maxNativeZoom}
          maxZoom={14}
          minZoom={1}
          tileSize={256}
        />

        {/* 3. Farm Location Marker */}
        <Marker position={[lat, lon]}>
          <Popup>
            <div className="text-xs p-1">
              <strong className="text-forest-800 text-sm block">{location.name}</strong>
              <div className="text-stone-600 mt-1">
                {language === 'ne' ? 'अक्षांश' : 'Lat'}: {lat.toFixed(4)}°, {language === 'ne' ? 'देशान्तर' : 'Lon'}: {lon.toFixed(4)}°
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                {language === 'ne' ? 'सक्रिय उपग्रह पत्र:' : 'Active Layer:'} {language === 'ne' ? selectedLayer.nameNe : selectedLayer.nameEn}
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      <div className="hidden @[28rem]:block absolute top-3 right-3 z-[1000] pointer-events-auto max-w-[min(100%-4.5rem,20rem)]">
        <SatelliteLayerControls {...controlProps} />
      </div>
    </div>
    <div className="@[28rem]:hidden">
      <SatelliteLayerControls {...controlProps} />
    </div>
    <p className="@[28rem]:hidden text-[11px] text-stone-500 px-0.5">
      {language === 'ne'
        ? 'नक्सा सार्न एक औंलाले तान्नुहोस्। जुम गर्न दुई औंला प्रयोग गर्नुहोस् वा + / − थिच्नुहोस्।'
        : 'Drag with one finger to pan. Pinch to zoom, or use + / −.'}
    </p>
    </div>
  );
}
