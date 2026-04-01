import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { FieldZoneResult, FieldBatch } from '../types';

interface FieldCompareDiffProps {
  currentBatch: FieldBatch;
  previousBatch: FieldBatch;
  onBack: () => void;
}

// Haversine distance in metres
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MATCH_RADIUS_M = 15;

type ChangeType = 'new-infection' | 'recovered' | 'unchanged-healthy' | 'unchanged-diseased' | 'new-location';

interface ZoneDiff {
  zone: FieldZoneResult;
  changeType: ChangeType;
  matched?: FieldZoneResult;
}

function computeDiff(current: FieldZoneResult[], previous: FieldZoneResult[]): ZoneDiff[] {
  const located = (zones: FieldZoneResult[]) => zones.filter(z => z.lat !== null && z.lng !== null);
  const locCurrent = located(current);
  const locPrev = located(previous);

  return locCurrent.map(zone => {
    // Find nearest previous zone within match radius
    const matches = locPrev
      .map(p => ({ zone: p, dist: haversine(zone.lat!, zone.lng!, p.lat!, p.lng!) }))
      .filter(m => m.dist <= MATCH_RADIUS_M)
      .sort((a, b) => a.dist - b.dist);

    const closest = matches[0];

    if (!closest) return { zone, changeType: 'new-location' as ChangeType };

    const wasHealthy = closest.zone.isHealthy;
    const isNowHealthy = zone.isHealthy;

    if (!wasHealthy && isNowHealthy) return { zone, changeType: 'recovered', matched: closest.zone };
    if (wasHealthy && !isNowHealthy) return { zone, changeType: 'new-infection', matched: closest.zone };
    if (isNowHealthy) return { zone, changeType: 'unchanged-healthy', matched: closest.zone };
    return { zone, changeType: 'unchanged-diseased', matched: closest.zone };
  });
}

const CHANGE_META: Record<ChangeType, { label: string; emoji: string; color: string; bg: string }> = {
  'new-infection': { label: 'New infection', emoji: '🆕', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  'recovered':     { label: 'Recovered', emoji: '✅', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  'unchanged-healthy': { label: 'Stable healthy', emoji: '🔄', color: 'text-green-600', bg: 'bg-green-50/50 border-green-100' },
  'unchanged-diseased': { label: 'Still diseased', emoji: '⚠️', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'new-location': { label: 'New location', emoji: '➕', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
};

export default function FieldCompareDiff({ currentBatch, previousBatch, onBack }: FieldCompareDiffProps) {
  const allCurrent = [...currentBatch.zones, ...currentBatch.unlocatedZones];
  const allPrev = [...previousBatch.zones, ...previousBatch.unlocatedZones];

  const diffs = useMemo(() => computeDiff(allCurrent, allPrev), [allCurrent, allPrev]);

  const summary = useMemo(() => ({
    newInfections: diffs.filter(d => d.changeType === 'new-infection').length,
    recovered: diffs.filter(d => d.changeType === 'recovered').length,
    newLocations: diffs.filter(d => d.changeType === 'new-location').length,
    stillDiseased: diffs.filter(d => d.changeType === 'unchanged-diseased').length,
  }), [diffs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-text-primary">Scan Comparison</h3>
          <p className="text-sm text-text-secondary">{previousBatch.date} → {currentBatch.date}</p>
        </div>
        <button onClick={onBack} className="text-sm font-bold text-deep-green hover:underline">← Back to Map</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'New infections', val: summary.newInfections, emoji: '🆕', color: 'text-red-600' },
          { label: 'Recovered', val: summary.recovered, emoji: '✅', color: 'text-green-600' },
          { label: 'Still diseased', val: summary.stillDiseased, emoji: '⚠️', color: 'text-amber-600' },
          { label: 'New spots', val: summary.newLocations, emoji: '➕', color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-2xl p-4 text-center border border-divider shadow-soft">
            <div className="text-3xl mb-1">{s.emoji}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-xs text-text-secondary mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Zone-by-zone diff */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-text-secondary uppercase tracking-wider">Zone Changes</p>
        {diffs.map((d, i) => {
          const meta = CHANGE_META[d.changeType];
          return (
            <motion.div
              key={d.zone.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-start gap-3 p-4 rounded-2xl border ${meta.bg}`}
            >
              <span className="text-2xl flex-shrink-0">{meta.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm text-text-primary truncate">{d.zone.label}</p>
                  <span className={`text-xs font-bold flex-shrink-0 ${meta.color}`}>{meta.label}</span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  {d.changeType === 'new-infection'
                    ? `Was healthy → now: ${d.zone.disease}`
                    : d.changeType === 'recovered'
                    ? `Was: ${d.matched?.disease} → now Healthy`
                    : d.changeType === 'new-location'
                    ? `${d.zone.disease} · New GPS point`
                    : d.zone.disease}
                </p>
              </div>
              {d.zone.image && (
                <img src={d.zone.image} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
        {diffs.length === 0 && (
          <p className="text-center text-text-secondary py-8">No GPS-located zones to compare.</p>
        )}
      </div>
    </div>
  );
}
