import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FieldZoneResult } from '../types';
import { Map as MapIcon, LocateFixed, Radar, Sparkles, ShieldAlert, Waves } from 'lucide-react';

interface FieldSVGMapProps {
  zones: FieldZoneResult[];
  previousZones?: FieldZoneResult[];
  selectedId?: string | null;
  onZoneSelect: (zone: FieldZoneResult) => void;
}

interface ProjectedNode {
  zone: FieldZoneResult;
  x: number;
  y: number;
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

function projectZones(zones: FieldZoneResult[], boundsSource: FieldZoneResult[], width: number, height: number, pad = 52): ProjectedNode[] {
  const lats = boundsSource.map(z => z.lat!);
  const lngs = boundsSource.map(z => z.lng!);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  const usableWidth = width - pad * 2;
  const usableHeight = height - pad * 2;

  return zones.map(zone => ({
    zone,
    x: pad + ((zone.lng! - minLng) / lngRange) * usableWidth,
    y: pad + (1 - (zone.lat! - minLat) / latRange) * usableHeight,
  }));
}

function makeBoundaryPath(nodes: ProjectedNode[], width: number, height: number): string {
  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.max(24, Math.min(...xs) - 46);
  const maxX = Math.min(width - 24, Math.max(...xs) + 46);
  const minY = Math.max(24, Math.min(...ys) - 38);
  const maxY = Math.min(height - 24, Math.max(...ys) + 38);
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  return [
    `M ${minX} ${midY}`,
    `Q ${minX} ${minY} ${midX - 28} ${minY}`,
    `Q ${maxX} ${minY} ${maxX} ${midY - 24}`,
    `Q ${maxX} ${maxY} ${midX + 30} ${maxY}`,
    `Q ${minX} ${maxY} ${minX} ${midY}`,
    'Z',
  ].join(' ');
}

function buildFieldInsight(zones: FieldZoneResult[]) {
  const total = zones.length;
  const diseased = zones.filter(zone => !zone.isHealthy).length;
  const atRisk = zones.filter(zone => zone.isHealthy && zone.adjacentRisk).length;
  const healthy = zones.filter(zone => zone.isHealthy && !zone.adjacentRisk).length;
  const severe = zones.filter(zone => zone.severity === 'high').length;
  const dominantDisease = zones
    .filter(zone => !zone.isHealthy)
    .reduce<Record<string, number>>((acc, zone) => {
      acc[zone.disease] = (acc[zone.disease] || 0) + 1;
      return acc;
    }, {});
  const topDisease = Object.entries(dominantDisease).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'mixed disease activity';

  const spreadScore = Math.min(100, Math.round((diseased / Math.max(total, 1)) * 58 + (atRisk / Math.max(total, 1)) * 32 + severe * 6));
  const spreadLabel = spreadScore >= 65 ? 'High' : spreadScore >= 35 ? 'Moderate' : 'Low';
  const riskLine =
    spreadLabel === 'High'
      ? 'Disease activity is concentrated enough that nearby spread should be treated as an immediate operational risk.'
      : spreadLabel === 'Moderate'
        ? 'The farm shows localized disease pressure with meaningful spillover risk into nearby healthy zones.'
        : 'Current spread pressure looks contained, but continued monitoring is important to keep it that way.';

  const summary =
    diseased === 0
      ? 'Most surveyed points are healthy right now, with no active disease cluster dominating the map.'
      : `${topDisease} is the main signal in this survey, with ${diseased} affected point${diseased !== 1 ? 's' : ''} and ${atRisk} nearby healthy point${atRisk !== 1 ? 's' : ''} that may need preventive action.`;

  return {
    spreadScore,
    spreadLabel,
    healthy,
    diseased,
    atRisk,
    summary,
    riskLine,
  };
}

export default function FieldSVGMap({
  zones,
  previousZones = [],
  selectedId,
  onZoneSelect,
}: FieldSVGMapProps) {
  const miniMapRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<globalThis.Map<string, any>>(new globalThis.Map());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tilesReady, setTilesReady] = useState(false);

  const locatedZones = useMemo(() => zones.filter(z => z.lat !== null && z.lng !== null), [zones]);
  const locatedPrev = useMemo(() => previousZones.filter(z => z.lat !== null && z.lng !== null), [previousZones]);
  const allLocated = useMemo(() => [...locatedZones, ...locatedPrev], [locatedZones, locatedPrev]);

  const svgWidth = 860;
  const svgHeight = 460;
  const currentNodes = useMemo(
    () => (allLocated.length ? projectZones(locatedZones, allLocated, svgWidth, svgHeight) : []),
    [allLocated, locatedZones]
  );
  const previousNodes = useMemo(
    () => (allLocated.length ? projectZones(locatedPrev, allLocated, svgWidth, svgHeight) : []),
    [allLocated, locatedPrev]
  );
  const farmBoundary = useMemo(
    () => (currentNodes.length ? makeBoundaryPath(currentNodes, svgWidth, svgHeight) : ''),
    [currentNodes]
  );
  const riskEdges = useMemo(() => {
    const diseased = currentNodes.filter(node => !node.zone.isHealthy);
    const atRisk = currentNodes.filter(node => node.zone.isHealthy && node.zone.adjacentRisk);
    return atRisk.flatMap(riskNode =>
      diseased.map(diseasedNode => ({
        x1: riskNode.x,
        y1: riskNode.y,
        x2: diseasedNode.x,
        y2: diseasedNode.y,
      }))
    );
  }, [currentNodes]);
  const insight = useMemo(() => buildFieldInsight(locatedZones), [locatedZones]);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!miniMapRef.current || mapRef.current) return;

      try {
        const L = await loadLeaflet();
        if (!L || cancelled || !miniMapRef.current) return;

        const map = L.map(miniMapRef.current, {
          zoomControl: false,
          scrollWheelZoom: false,
          dragging: true,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          tap: false,
        }).setView([20, 78], 4);

        const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        });
        tiles.on('load', () => setTilesReady(true));
        tiles.on('tileerror', () => setTilesReady(false));
        tiles.addTo(map);

        mapRef.current = map;
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setLoadError('Leaflet mini map could not load.');
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
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    const map = mapRef.current;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    const bounds: [number, number][] = [];

    locatedPrev.forEach(zone => {
      const marker = L.circleMarker([zone.lat, zone.lng], {
        radius: 5,
        color: '#94a3b8',
        weight: 1.5,
        fillColor: severityColor(zone),
        fillOpacity: 0.22,
        dashArray: '3 3',
      }).addTo(map);
      bounds.push([zone.lat, zone.lng]);
      marker.bindTooltip(`${zone.label} (previous)`, { direction: 'top' });
    });

    locatedZones.forEach(zone => {
      const marker = L.circleMarker([zone.lat, zone.lng], {
        radius: selectedId === zone.id ? 7 : 5,
        color: zone.adjacentRisk && zone.isHealthy ? '#f97316' : '#ffffff',
        weight: selectedId === zone.id ? 2.5 : 2,
        fillColor: severityColor(zone),
        fillOpacity: 0.95,
      }).addTo(map);

      marker.on('click', () => onZoneSelect(zone));
      marker.bindPopup(`
        <div style="min-width:150px">
          <strong>${zone.label}</strong><br/>
          <span>${zone.disease}</span>
        </div>
      `);
      markersRef.current.set(zone.id, marker);
      bounds.push([zone.lat, zone.lng]);
    });

    if (bounds.length > 0) {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [88, 88], maxZoom: 16 });
      const fartherZoom = Math.max(3, map.getZoom() - 1);
      map.setZoom(fartherZoom);
    }
  }, [locatedPrev, locatedZones, onZoneSelect, selectedId]);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const marker = markersRef.current.get(selectedId);
    if (!marker) return;

    const map = mapRef.current;
    const latLng = marker.getLatLng();
    map.flyTo(latLng, Math.max(5, map.getZoom()), { duration: 0.4 });
    marker.openPopup();
  }, [selectedId]);

  if (locatedZones.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-text-secondary">
        <MapIcon className="h-12 w-12" />
        <p className="font-semibold">No GPS data found in these photos</p>
        <p className="text-sm">Check the "Unlocated" tab for results</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-divider bg-surface-alt text-text-secondary">
        <MapIcon className="h-12 w-12" />
        <p className="font-semibold">{loadError}</p>
        <p className="text-sm">This demo uses Leaflet from a CDN.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-divider bg-[linear-gradient(135deg,#ffffff_0%,#f8faf5_100%)] p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-deep-green/70">Hybrid Farm Intelligence View</p>
            <h4 className="text-2xl font-black tracking-tight text-text-primary">Real-world GPS context with a clearer farm operations layout</h4>
            <p className="max-w-3xl text-sm leading-relaxed text-text-secondary">
              The top map proves where the survey was taken in the real world, while the farm layout below is optimized for readability, spread detection, and action planning.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 rounded-[1.5rem] border border-divider bg-white/90 p-3 text-center shadow-sm">
            <div className="rounded-2xl bg-bg-nature px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Healthy</p>
              <p className="mt-1 text-xl font-black text-green-600">{insight.healthy}</p>
            </div>
            <div className="rounded-2xl bg-bg-nature px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Disease</p>
              <p className="mt-1 text-xl font-black text-red-600">{insight.diseased}</p>
            </div>
            <div className="rounded-2xl bg-bg-nature px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-secondary">Spread Risk</p>
              <p className="mt-1 text-xl font-black text-amber-600">{insight.spreadLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-divider bg-surface p-4 shadow-soft">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-text-secondary">Real Location</p>
            <h4 className="mt-1 flex items-center gap-2 text-xl font-black text-text-primary">
              <LocateFixed className="h-4 w-4 text-deep-green" />
              GPS Location Verified
            </h4>
          </div>
          <span className="self-start rounded-full border border-divider bg-bg-nature px-3 py-1 text-[11px] font-bold text-text-secondary">
            Zoomed out context
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="relative h-[260px] overflow-hidden rounded-[1.5rem] border border-divider bg-surface-alt">
            <div ref={miniMapRef} className="h-full w-full bg-surface-alt" />
            {!tilesReady && (
              <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/70 bg-white/90 px-3 py-2 text-xs text-text-secondary shadow-soft">
                Loading location map...
              </div>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-divider bg-[linear-gradient(180deg,#ffffff_0%,#f8faf5_100%)] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-deep-green/10 p-3 text-deep-green">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-secondary">AI Field Interpretation</p>
                <h5 className="text-lg font-black text-text-primary">Operational risk summary</h5>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-divider bg-white px-4 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-text-primary">Likelihood of spread</span>
                  <span className="text-sm font-black text-amber-600">{insight.spreadScore}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-divider">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#22c55e_0%,#f59e0b_55%,#ef4444_100%)]" style={{ width: `${insight.spreadScore}%` }} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-4 border border-divider">
                  <div className="mb-2 flex items-center gap-2 text-text-primary">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-bold">Current risk</span>
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">{insight.riskLine}</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4 border border-divider">
                  <div className="mb-2 flex items-center gap-2 text-text-primary">
                    <Waves className="h-4 w-4 text-deep-green" />
                    <span className="text-sm font-bold">Survey insight</span>
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">{insight.summary}</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-text-secondary">
                This hybrid presentation makes the survey stronger than a normal pin map because it combines verified GPS placement with a cleaner decision-friendly field layout and an interpretable risk explanation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-divider bg-surface p-4 shadow-soft">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-text-secondary">Operational View</p>
            <h4 className="mt-1 flex items-center gap-2 text-xl font-black text-text-primary">
              <Radar className="h-4 w-4 text-deep-green" />
              Farm Survey Layout
            </h4>
          </div>
          <span className="self-start rounded-full border border-deep-green/10 bg-accent-green/10 px-3 py-1 text-[11px] font-bold text-deep-green">
            Easier to act on
          </span>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-divider bg-[linear-gradient(180deg,#fbfcfa_0%,#f4f6f1_100%)]">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full" style={{ minHeight: 380 }}>
              <defs>
                <pattern id="field-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                  <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#dde5d4" strokeWidth="1" />
                </pattern>
                <filter id="zone-shadow">
                  <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#3F5D1F" floodOpacity="0.12" />
                </filter>
              </defs>

              <rect width={svgWidth} height={svgHeight} fill="url(#field-grid)" />
              <circle cx="130" cy="95" r="64" fill="rgba(163,199,109,0.13)" />
              <circle cx="720" cy="360" r="96" fill="rgba(110,139,61,0.09)" />

              {farmBoundary && (
                <>
                  <path d={farmBoundary} fill="rgba(163,199,109,0.18)" stroke="#6E8B3D" strokeWidth="2.5" strokeDasharray="8 8" filter="url(#zone-shadow)" />
                  <text x="58" y="42" fill="#3F5D1F" fontSize="14" fontWeight="800">
                    Farm survey boundary
                  </text>
                </>
              )}

              {previousNodes.map(node => (
                <g key={`previous-${node.zone.id}`} opacity="0.5">
                  <circle cx={node.x} cy={node.y} r="11" fill={severityColor(node.zone)} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 3" />
                </g>
              ))}

              {riskEdges.map((edge, index) => (
                <line
                  key={index}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke="#f97316"
                  strokeWidth="1.5"
                  strokeDasharray="6 5"
                  opacity="0.55"
                />
              ))}

              {currentNodes.map(node => {
                const isSelected = selectedId === node.zone.id;
                const color = severityColor(node.zone);
                return (
                  <g
                    key={node.zone.id}
                    onClick={() => onZoneSelect(node.zone)}
                    style={{ cursor: 'pointer' }}
                  >
                    {node.zone.adjacentRisk && node.zone.isHealthy && (
                      <circle cx={node.x} cy={node.y} r="19" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" opacity="0.75" />
                    )}
                    {!node.zone.isHealthy && (
                      <circle cx={node.x} cy={node.y} r="22" fill={color} opacity="0.12">
                        <animate attributeName="r" values="18;24;18" dur="2.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.12;0.04;0.12" dur="2.2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 14 : 11}
                      fill={color}
                      stroke={isSelected ? '#1E1E1E' : '#ffffff'}
                      strokeWidth={isSelected ? 4 : 3}
                    />
                    <text x={node.x} y={node.y + 4.5} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">
                      {node.zone.isHealthy ? (node.zone.adjacentRisk ? '!' : 'H') : 'D'}
                    </text>
                    <text x={node.x} y={node.y + 28} textAnchor="middle" fill="#334155" fontSize="10" fontWeight="700">
                      {node.zone.label.slice(0, 16)}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-text-secondary">
          This custom field layout uses the same survey coordinates but presents them in a more readable operating view, so disease clusters, nearby risk, and coverage gaps are easier to understand at a glance.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 px-2 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#22c55e] flex-shrink-0" />
          <span>Healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#eab308] flex-shrink-0" />
          <span>Mild issue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ef4444] flex-shrink-0" />
          <span>Disease detected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full border-2 border-[#f97316] bg-white flex-shrink-0" />
          <span>At risk (adjacent)</span>
        </div>
        {previousNodes.length > 0 && (
          <div className="flex items-center gap-1.5 opacity-70">
            <div className="h-3 w-3 rounded-full border border-dashed border-slate-400 bg-slate-300/40 flex-shrink-0" />
            <span>Previous batch</span>
          </div>
        )}
      </div>
    </div>
  );
}
