import React, { useMemo, useState } from 'react';
import { FieldZoneResult } from '../types';

interface Node {
  zone: FieldZoneResult;
  x: number;
  y: number;
}

interface FieldSVGMapProps {
  zones: FieldZoneResult[];
  previousZones?: FieldZoneResult[];
  selectedId?: string | null;
  onZoneSelect: (zone: FieldZoneResult) => void;
}

function severityColor(zone: FieldZoneResult): string {
  if (zone.adjacentRisk && zone.isHealthy) return '#f97316'; // orange at-risk
  if (zone.isHealthy) return '#22c55e';
  if (zone.severity === 'low') return '#eab308';
  if (zone.severity === 'medium') return '#f97316';
  return '#ef4444';
}

function projectNodes(zones: FieldZoneResult[], width: number, height: number, pad = 48): Node[] {
  const lats = zones.map(z => z.lat!);
  const lngs = zones.map(z => z.lng!);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  const usableW = width - pad * 2;
  const usableH = height - pad * 2;

  return zones.map(z => ({
    zone: z,
    x: pad + ((z.lng! - minLng) / lngRange) * usableW,
    // Lat increases upward on real maps, so invert Y
    y: pad + (1 - (z.lat! - minLat) / latRange) * usableH,
  }));
}

export default function FieldSVGMap({
  zones,
  previousZones = [],
  selectedId,
  onZoneSelect,
}: FieldSVGMapProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; disease: string } | null>(null);

  const W = 600;
  const H = 380;

  const locatedZones = useMemo(() => zones.filter(z => z.lat !== null && z.lng !== null), [zones]);
  const locatedPrev = useMemo(() => previousZones.filter(z => z.lat !== null && z.lng !== null), [previousZones]);

  // Combine both for a unified bounding box
  const allLocated = [...locatedZones, ...locatedPrev];

  const nodes = useMemo(() => {
    if (!locatedZones.length) return [];
    if (!allLocated.length) return [];
    // Project all but use combined bbox
    const lats = allLocated.map(z => z.lat!);
    const lngs = allLocated.map(z => z.lng!);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;
    const pad = 52;
    const usableW = W - pad * 2;
    const usableH = H - pad * 2;
    return locatedZones.map(z => ({
      zone: z,
      x: pad + ((z.lng! - minLng) / lngRange) * usableW,
      y: pad + (1 - (z.lat! - minLat) / latRange) * usableH,
    }));
  }, [locatedZones, allLocated]);

  const prevNodes = useMemo(() => {
    if (!locatedPrev.length || !allLocated.length) return [];
    const lats = allLocated.map(z => z.lat!);
    const lngs = allLocated.map(z => z.lng!);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;
    const pad = 52;
    const usableW = W - pad * 2;
    const usableH = H - pad * 2;
    return locatedPrev.map(z => ({
      zone: z,
      x: pad + ((z.lng! - minLng) / lngRange) * usableW,
      y: pad + (1 - (z.lat! - minLat) / latRange) * usableH,
    }));
  }, [locatedPrev, allLocated]);

  // Adjacent-risk edges
  const riskEdges = useMemo(() => {
    const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const diseased = nodes.filter(n => !n.zone.isHealthy);
    const atRisk = nodes.filter(n => n.zone.adjacentRisk);
    atRisk.forEach(rn => {
      diseased.forEach(dn => {
        edges.push({ x1: rn.x, y1: rn.y, x2: dn.x, y2: dn.y });
      });
    });
    return edges;
  }, [nodes]);

  if (locatedZones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-secondary gap-3">
        <span className="text-5xl">🗺️</span>
        <p className="font-semibold">No GPS data found in these photos</p>
        <p className="text-sm">Check the "Unlocated" tab for results</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded-3xl border border-divider bg-surface-alt"
        style={{ minHeight: 220 }}
      >
        {/* Grid background */}
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
          </pattern>
          {/* Glow filter for diseased nodes */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />

        {/* Previous batch nodes (faded) */}
        {prevNodes.map(n => (
          <g key={`prev-${n.zone.id}`} opacity={0.35}>
            <circle cx={n.x} cy={n.y} r={14} fill={severityColor(n.zone)} strokeDasharray="4 3" stroke="white" strokeWidth={2} />
            <text x={n.x} y={n.y + 28} textAnchor="middle" fontSize={9} fill="#9ca3af">{n.zone.label.slice(0, 14)}</text>
          </g>
        ))}

        {/* Risk edges */}
        {riskEdges.map((e, i) => (
          <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke="#f97316" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.6} />
        ))}

        {/* Current batch nodes */}
        {nodes.map(n => {
          const color = severityColor(n.zone);
          const isSelected = selectedId === n.zone.id;
          const isDiseased = !n.zone.isHealthy;

          return (
            <g
              key={n.zone.id}
              onClick={() => onZoneSelect(n.zone)}
              onMouseEnter={() => setTooltip({ x: n.x, y: n.y, label: n.zone.label, disease: n.zone.disease })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulse ring for diseased */}
              {isDiseased && (
                <circle cx={n.x} cy={n.y} r={22} fill={color} opacity={0.15}>
                  <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.15;0.04;0.15" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* At-risk ring */}
              {n.zone.adjacentRisk && n.zone.isHealthy && (
                <circle cx={n.x} cy={n.y} r={20} fill="none" stroke="#f97316" strokeWidth={2} strokeDasharray="4 3" opacity={0.7} />
              )}

              {/* Main node */}
              <circle
                cx={n.x} cy={n.y} r={isSelected ? 18 : 14}
                fill={color}
                stroke="white"
                strokeWidth={isSelected ? 3 : 2}
                filter={isDiseased ? 'url(#glow)' : undefined}
                style={{ transition: 'r 0.2s' }}
              />
              {/* Emoji in node */}
              <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={12} style={{ userSelect: 'none' }}>
                {n.zone.isHealthy ? (n.zone.adjacentRisk ? '⚠' : '✓') : '✕'}
              </text>

              {/* Label */}
              <text x={n.x} y={n.y + 30} textAnchor="middle" fontSize={10} fill="#374151" fontWeight={500}>
                {n.zone.label.slice(0, 16)}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect
              x={Math.min(tooltip.x - 60, W - 130)}
              y={tooltip.y - 52}
              width={120} height={40}
              rx={8} ry={8}
              fill="rgba(30,30,30,0.85)"
            />
            <text x={Math.min(tooltip.x - 60, W - 130) + 60} y={tooltip.y - 36} textAnchor="middle" fontSize={10} fill="white" fontWeight={600}>
              {tooltip.label.slice(0, 16)}
            </text>
            <text x={Math.min(tooltip.x - 60, W - 130) + 60} y={tooltip.y - 20} textAnchor="middle" fontSize={9} fill="#d1fae5">
              {tooltip.disease.slice(0, 20)}
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 px-2 text-xs text-text-secondary">
        {[
          { color: '#22c55e', label: 'Healthy' },
          { color: '#eab308', label: 'Mild issue' },
          { color: '#ef4444', label: 'Disease detected' },
          { color: '#f97316', label: 'At risk (adjacent)' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
        {prevNodes.length > 0 && (
          <div className="flex items-center gap-1.5 opacity-50">
            <div className="w-3 h-3 rounded-full border-2 border-gray-400" />
            <span>Previous batch</span>
          </div>
        )}
      </div>
    </div>
  );
}
