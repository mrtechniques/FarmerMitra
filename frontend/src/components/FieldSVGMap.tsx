import React, { useEffect, useRef, useState } from 'react';
import { FieldZoneResult } from '../types';
import { Map as MapIcon } from 'lucide-react';

interface FieldSVGMapProps {
  zones: FieldZoneResult[];
  previousZones?: FieldZoneResult[];
  selectedId?: string | null;
  onZoneSelect: (zone: FieldZoneResult) => void;
}

declare global {
  interface Window {
    L?: any;
    __leafletDemoPromise?: Promise<any>;
  }
}

const LEAFLET_CSS_ID = 'leaflet-demo-css';
const LEAFLET_SCRIPT_ID = 'leaflet-demo-script';
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_SCRIPT_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

function severityColor(zone: FieldZoneResult): string {
  if (zone.isHealthy) return '#22c55e';
  if (zone.severity === 'low') return '#eab308';
  if (zone.severity === 'medium') return '#f97316';
  return '#ef4444';
}

function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.L) return Promise.resolve(window.L);
  if (window.__leafletDemoPromise) return window.__leafletDemoPromise;

  window.__leafletDemoPromise = new Promise((resolve, reject) => {
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement('link');
      link.id = LEAFLET_CSS_ID;
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS_URL;
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById(LEAFLET_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L));
      existingScript.addEventListener('error', () => reject(new Error('Leaflet script failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.id = LEAFLET_SCRIPT_ID;
    script.src = LEAFLET_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('Leaflet script failed to load'));
    document.body.appendChild(script);
  });

  return window.__leafletDemoPromise;
}

export default function FieldSVGMap({
  zones,
  previousZones = [],
  selectedId,
  onZoneSelect,
}: FieldSVGMapProps) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<globalThis.Map<string, any>>(new globalThis.Map());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tilesReady, setTilesReady] = useState(false);

  const locatedZones = zones.filter(z => z.lat !== null && z.lng !== null);
  const locatedPrev = previousZones.filter(z => z.lat !== null && z.lng !== null);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapElRef.current || mapRef.current) return;

      try {
        const L = await loadLeaflet();
        if (!L || cancelled || !mapElRef.current) return;

        const map = L.map(mapElRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView([20, 78], 5); // Default view (India) so tiles start loading

        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        });

        tileLayer.on('load', () => setTilesReady(true));
        tileLayer.on('tileerror', () => setTilesReady(false));
        tileLayer.addTo(map);

        tileLayerRef.current = tileLayer;
        mapRef.current = map;
        map.whenReady(() => {
          window.requestAnimationFrame(() => {
            map.invalidateSize();
          });
        });
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setLoadError('Leaflet demo map could not load.');
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      tileLayerRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const invalidate = () => map.invalidateSize();

    invalidate();
    // Multiple delays to handle Framer Motion animation phases
    const t1 = window.setTimeout(invalidate, 150);
    const t2 = window.setTimeout(invalidate, 400);
    const t3 = window.setTimeout(invalidate, 800);
    window.addEventListener('resize', invalidate);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener('resize', invalidate);
    };
  }, [locatedZones.length, selectedId]);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    const map = mapRef.current;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    const bounds: [number, number][] = [];

    locatedPrev.forEach(zone => {
      const marker = L.circleMarker([zone.lat, zone.lng], {
        radius: 8,
        color: '#94a3b8',
        weight: 2,
        fillColor: severityColor(zone),
        fillOpacity: 0.25,
        dashArray: '4 4',
      }).addTo(map);

      marker.bindTooltip(`${zone.label} (previous batch)`, { direction: 'top' });
      bounds.push([zone.lat, zone.lng]);
    });

    locatedZones.forEach(zone => {
      const marker = L.circleMarker([zone.lat, zone.lng], {
        radius: selectedId === zone.id ? 13 : 10,
        color: zone.adjacentRisk && zone.isHealthy ? '#f97316' : '#ffffff',
        weight: selectedId === zone.id ? 4 : 3,
        fillColor: severityColor(zone),
        fillOpacity: 0.95,
      }).addTo(map);

      marker.bindPopup(`
        <div style="min-width:160px">
          <strong>${zone.label}</strong><br/>
          <span>${zone.disease}</span><br/>
          <span style="color:#6b7280">${zone.confidence.toFixed(1)}% confidence</span>
        </div>
      `);

      marker.on('click', () => onZoneSelect(zone));
      markersRef.current.set(zone.id, marker);
      bounds.push([zone.lat, zone.lng]);
    });

    if (bounds.length > 0) {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 18 });
      // Re-fit after Framer Motion animation settles
      window.setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
          mapRef.current.fitBounds(bounds, { padding: [36, 36], maxZoom: 18 });
        }
      }, 500);
    }
  }, [locatedPrev, locatedZones, onZoneSelect, selectedId]);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;

    const marker = markersRef.current.get(selectedId);
    if (!marker) return;

    const latLng = marker.getLatLng();
    mapRef.current.flyTo(latLng, Math.max(mapRef.current.getZoom(), 17), {
      duration: 0.6,
    });
    marker.openPopup();
  }, [selectedId]);

  if (locatedZones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-secondary gap-3">
        <MapIcon className="w-12 h-12" />
        <p className="font-semibold">No GPS data found in these photos</p>
        <p className="text-sm">Check the "Unlocated" tab for results</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-secondary gap-3 rounded-3xl border border-divider bg-surface-alt">
        <MapIcon className="w-12 h-12" />
        <p className="font-semibold">{loadError}</p>
        <p className="text-sm">This demo uses Leaflet from a CDN.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-3xl overflow-hidden border border-divider shadow-soft">
        <div ref={mapElRef} className="h-[420px] w-full bg-surface-alt" />
        {!tilesReady && (
          <div className="pointer-events-none absolute left-4 top-4">
            <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-text-secondary shadow-soft backdrop-blur-sm">
              <p className="font-semibold text-text-primary">Loading map tiles...</p>
              <p>The survey points will still appear as soon as the map repaints.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 px-2 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#22c55e] flex-shrink-0" />
          <span>Healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#eab308] flex-shrink-0" />
          <span>Mild issue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ef4444] flex-shrink-0" />
          <span>Disease detected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-[#f97316] bg-white flex-shrink-0" />
          <span>At risk (adjacent)</span>
        </div>
        {locatedPrev.length > 0 && (
          <div className="flex items-center gap-1.5 opacity-70">
            <div className="w-3 h-3 rounded-full border border-dashed border-slate-400 bg-slate-300/40 flex-shrink-0" />
            <span>Previous batch</span>
          </div>
        )}
      </div>
    </div>
  );
}
