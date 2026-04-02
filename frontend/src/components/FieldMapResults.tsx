import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, MapPin, AlertTriangle, CheckCircle2, ChevronRight, Shield, Leaf as LeafIcon, Plus, AlertCircle, Map as MapIcon } from 'lucide-react';
import { FieldBatch, FieldZoneResult } from '../types';
import FieldSVGMap from './FieldSVGMap';
import FieldCompareDiff from './FieldCompareDiff';

interface FieldMapResultsProps {
  batch: FieldBatch;
  previousBatch?: FieldBatch | null;
  onNewBatch: () => void;
  showCompare?: boolean;
  onCloseCompare?: () => void;
}

function severityLabel(z: FieldZoneResult): string {
  if (z.adjacentRisk && z.isHealthy) return 'At Risk';
  if (z.isHealthy) return 'Healthy';
  if (z.severity === 'high') return 'Severe';
  if (z.severity === 'medium') return 'Moderate';
  return 'Mild';
}

function zoneBucket(z: FieldZoneResult): 'healthy' | 'diseased' | 'atRisk' {
  if (z.isHealthy && z.adjacentRisk) return 'atRisk';
  if (z.isHealthy) return 'healthy';
  return 'diseased';
}

export default function FieldMapResults({
  batch,
  previousBatch,
  onNewBatch,
  showCompare,
  onCloseCompare,
}: FieldMapResultsProps) {
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'unlocated'>('map');
  const [selectedZone, setSelectedZone] = useState<FieldZoneResult | null>(null);
  const allZones = [...batch.zones, ...batch.unlocatedZones];

  const stats = {
    total: allZones.length,
    healthy: allZones.filter(z => zoneBucket(z) === 'healthy').length,
    diseased: allZones.filter(z => zoneBucket(z) === 'diseased').length,
    atRisk: allZones.filter(z => zoneBucket(z) === 'atRisk').length,
  };

  const exportReport = () => {
    const json = JSON.stringify(batch, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${batch.farmName.replace(/\s+/g, '_')}_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // If compare mode, show diff view
  if (showCompare && previousBatch) {
    return <FieldCompareDiff currentBatch={batch} previousBatch={previousBatch} onBack={onCloseCompare!} />;
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-xl font-black text-text-primary">{batch.farmName}</h3>
          <p className="text-sm text-text-secondary">{batch.date} · {stats.total} photo{stats.total !== 1 ? 's' : ''} analysed</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportReport} className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-divider rounded-xl text-sm font-bold text-text-secondary hover:text-deep-green hover:border-deep-green transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={onNewBatch} className="flex items-center gap-1.5 px-4 py-2 bg-deep-green text-white rounded-xl text-sm font-bold hover:bg-muted-green transition-all shadow-lg">
            <Plus className="w-4 h-4" /> New Batch
          </button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { val: stats.healthy, label: 'Healthy', color: 'text-green-600', bg: 'bg-green-50', Icon: CheckCircle2 },
          { val: stats.diseased, label: 'Diseased', color: 'text-red-600', bg: 'bg-red-50', Icon: AlertCircle },
          { val: stats.atRisk, label: 'At Risk', color: 'text-amber-600', bg: 'bg-amber-50', Icon: AlertTriangle },
        ].map(s => {
          const Icon = s.Icon;
          return (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center border border-white/50`}>
            <div className="flex justify-center mb-1"><Icon className="w-6 h-6 text-text-secondary" /></div>
            <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-xs text-text-secondary">{s.label}</div>
          </div>
        )})}
      </div>

      {/* Tab bar */}
      <div className="flex bg-bg-nature rounded-2xl p-1 gap-1">
        {(['map', 'list', 'unlocated'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
              activeTab === tab ? 'bg-white text-deep-green shadow' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab === 'unlocated' ? `No GPS (${batch.unlocatedZones.length})` : tab === 'list' ? 'List' : <span className="flex items-center justify-center gap-1.5"><MapIcon className="w-4 h-4" /> Map</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'map' && (
          <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <FieldSVGMap
              zones={batch.zones}
              previousZones={previousBatch?.zones}
              selectedId={selectedZone?.id}
              onZoneSelect={setSelectedZone}
            />
            {/* Side panel */}
            <AnimatePresence>
              {selectedZone && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-surface border border-divider rounded-3xl overflow-hidden shadow-soft"
                >
                  {/* Image banner */}
                  {selectedZone.image && (
                    <div className="h-32 overflow-hidden">
                      <img src={selectedZone.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-black text-lg text-text-primary">{selectedZone.label}</h4>
                        <p className="text-sm text-text-secondary">{selectedZone.leafType} · {severityLabel(selectedZone)}</p>
                      </div>
                      <button onClick={() => setSelectedZone(null)} className="text-text-secondary hover:text-red-500 transition-colors text-lg leading-none">✕</button>
                    </div>

                    {/* Disease badge */}
                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl ${selectedZone.isHealthy ? 'bg-green-50' : 'bg-red-50'}`}>
                      {selectedZone.isHealthy ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                      <span className={`font-bold text-sm ${selectedZone.isHealthy ? 'text-green-700' : 'text-red-700'}`}>{selectedZone.disease}</span>
                      <span className="ml-auto text-xs font-bold text-text-secondary">{selectedZone.confidence.toFixed(1)}%</span>
                    </div>

                    {/* At-risk banner */}
                    {selectedZone.adjacentRisk && (
                      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex gap-2">
                        <Shield className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-orange-700">Adjacent Risk Warning</p>
                          <p className="text-xs text-orange-600">This healthy field is near a diseased zone. Protective action recommended.</p>
                        </div>
                      </div>
                    )}

                    {/* Protective actions */}
                    {selectedZone.protectiveActions.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Protective Actions</p>
                        <ul className="space-y-1.5">
                          {selectedZone.protectiveActions.map((action, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <span className="text-amber-500 flex-shrink-0">•</span>
                              <span className="text-text-secondary">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Remedies */}
                    {!selectedZone.isHealthy && selectedZone.remedies.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Remedies</p>
                        <ul className="space-y-1.5">
                          {selectedZone.remedies.map((r, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <span className="text-deep-green flex-shrink-0">✓</span>
                              <span className="text-text-secondary">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedZone.lat !== null && (
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedZone.lat.toFixed(5)}, {selectedZone.lng!.toFixed(5)}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {activeTab === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {[...batch.zones, ...batch.unlocatedZones].map((zone, i) => (
              <motion.button
                key={zone.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { setSelectedZone(zone); setActiveTab('map'); }}
                className="w-full flex gap-3 p-4 bg-surface rounded-2xl border border-divider shadow-soft hover:border-deep-green transition-all text-left group items-center"
              >
                {zone.image && <img src={zone.image} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-primary truncate">{zone.label}</p>
                  <p className="text-sm text-text-secondary">{zone.leafType} · {zone.disease}</p>
                  <p className="text-xs mt-0.5">{severityLabel(zone)}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-deep-green transition-colors" />
              </motion.button>
            ))}
          </motion.div>
        )}

        {activeTab === 'unlocated' && (
          <motion.div key="unlocated" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {batch.unlocatedZones.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <LeafIcon className="w-12 h-12 mx-auto mb-3 text-accent-green" />
                <p className="font-semibold">All photos had GPS data!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-sm text-amber-700 font-medium">These photos had no GPS data and couldn't be placed on the map.</p>
                </div>
                {batch.unlocatedZones.map((zone, i) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex gap-3 p-4 bg-surface rounded-2xl border border-divider shadow-soft items-center"
                  >
                    {zone.image && <img src={zone.image} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-primary truncate">{zone.label}</p>
                      <p className="text-sm text-text-secondary">{zone.leafType} · {zone.disease}</p>
                      <p className="text-xs mt-0.5">{severityLabel(zone)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
