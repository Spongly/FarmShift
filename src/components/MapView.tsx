import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { NEPAL_PRESETS } from '../data/cropData';
import { presetToLocation, coordinatesToLocation, formatCoordinates } from '../services/geocoding';

// We dynamically handle Leaflet via CDN / global or window.L if loaded, or standard leaflet import
import L from 'leaflet';

export function MapView({ height = '400px' }: { height?: string }) {
  const { state, setLocation } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center: Nepal (Kathmandu latitude/longitude)
    const defaultLat = state.location?.latitude ?? 27.7172;
    const defaultLng = state.location?.longitude ?? 85.324;
    const defaultZoom = state.location ? 8 : 7;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: defaultZoom,
      zoomControl: true,
      attributionControl: true,
    });

    // Standard OpenStreetMap tiles (free, no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom marker icon using inline SVG / styled div
    const createCustomIcon = (isSelected: boolean) =>
      L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            width: ${isSelected ? '24px' : '16px'};
            height: ${isSelected ? '24px' : '16px'};
            background-color: ${isSelected ? '#2D5016' : '#7DB34C'};
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translate(-50%, -50%);
          ">
            ${isSelected ? '<div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>' : ''}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

    // Click on map to pick location
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setLocation(coordinatesToLocation(Number(lat.toFixed(4)), Number(lng.toFixed(4))));
    });

    // Add preset reference markers
    NEPAL_PRESETS.forEach((preset) => {
      const presetMarker = L.marker([preset.latitude, preset.longitude], {
        icon: createCustomIcon(false),
        title: preset.name,
      }).addTo(map);

      presetMarker.bindTooltip(
        `<strong>${preset.name}</strong><br/><span style="font-size:10px">${preset.district} (${preset.agroclimaticZone})</span>`,
        { direction: 'top', offset: [0, -10] }
      );

      presetMarker.on('click', (ev) => {
        L.DomEvent.stopPropagation(ev);
        setLocation(presetToLocation(preset));
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update selected marker position when state.location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (state.location) {
      const { latitude, longitude } = state.location;

      const activeIcon = L.divIcon({
        className: 'active-farm-marker',
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background-color: #2D5016;
            border: 3px solid #F7F4EF;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(45,80,22,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            transform: translate(-50%, -50%);
          ">
            <div style="width: 8px; height: 8px; background: #A8CC87; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      if (!markerRef.current) {
        markerRef.current = L.marker([latitude, longitude], { icon: activeIcon }).addTo(map);
      } else {
        markerRef.current.setLatLng([latitude, longitude]);
        markerRef.current.setIcon(activeIcon);
      }

      markerRef.current
        .bindPopup(
          `<div style="font-family: Inter, sans-serif; padding: 4px;">
            <div style="font-weight: 600; font-size: 13px; color: #1A1714;">${state.location.name}</div>
            <div style="font-size: 11px; color: #7A7570; font-family: monospace; margin-top: 2px;">
              ${formatCoordinates(latitude, longitude)}
            </div>
          </div>`
        )
        .openPopup();

      map.flyTo([latitude, longitude], Math.max(map.getZoom(), 8), {
        duration: 1.2,
      });
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [state.location]);

  return (
    <div className="relative border border-paper-300 rounded overflow-hidden shadow-sm">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      <div className="absolute bottom-2 left-2 z-[400] bg-paper/90 backdrop-blur border border-paper-300 px-2.5 py-1.5 rounded text-2xs text-ink-secondary shadow-sm pointer-events-none">
        <span className="font-semibold text-forest">
          {state.language === 'ne' ? 'अन्तर्क्रियात्मक नक्सा:' : 'Interactive Map:'}
        </span>{' '}
        {state.language === 'ne'
          ? 'निर्देशांक छान्न नेपालको कुनै पनि ठाउँमा क्लिक गर्नुहोस् वा पूर्व-निर्धारित विन्दु छान्नुहोस्।'
          : 'Click any location in Nepal to select coordinates or choose a preset point.'}
      </div>
    </div>
  );
}
