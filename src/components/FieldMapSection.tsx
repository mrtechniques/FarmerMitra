import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tractor, Database, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { FieldPhoto, FieldZoneResult, FieldBatch, LocationConsent } from '../types';
import { useBatchHistory } from '../hooks/useBatchHistory';
import FieldUploadGrid from './FieldUploadGrid';
import FieldAnalysisProgress from './FieldAnalysisProgress';
import FieldMapResults from './FieldMapResults';
import BatchDialog from './BatchDialog';

type Stage = 'idle' | 'upload' | 'analyzing' | 'results';

// ─── Consent Banner ───────────────────────────────────────────────────────────
function ConsentBanner({ onAllow, onDeny }: { onAllow: () => void; onDeny: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-deep-green/20 rounded-3xl p-5 shadow-soft flex flex-col sm:flex-row gap-4 items-start sm:items-center"
    >
      <div className="text-3xl flex-shrink-0">💾</div>
      <div className="flex-1">
        <p className="font-bold text-text-primary text-sm">Save & link your farm scans across sessions?</p>
        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
          GPS data is stored <strong>on your device only</strong> — never sent to any server. You can revoke this anytime.
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={onDeny} className="px-4 py-2 rounded-xl text-sm font-bold text-text-secondary border border-divider hover:bg-bg-nature transition-all">
          No Thanks
        </button>
        <button onClick={onAllow} className="px-4 py-2 rounded-xl text-sm font-bold bg-deep-green text-white hover:bg-muted-green transition-all shadow-lg">
          Allow
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Controller ──────────────────────────────────────────────────────────
export default function FieldMapSection() {
  const {
    consent, grantConsent, denyConsent,
    batches, saveBatch, clearAll, getLatestBatch,
  } = useBatchHistory();

  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [photos, setPhotos] = useState<FieldPhoto[]>([]);
  const [farmName, setFarmName] = useState('');
  const [analysisResults, setAnalysisResults] = useState<Record<string, FieldZoneResult | 'error'>>({});
  const [currentBatch, setCurrentBatch] = useState<FieldBatch | null>(null);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [mergeMode, setMergeMode] = useState(false); // true = add-to-map, false = fresh

  const prevBatch = getLatestBatch();

  // ── Analysis ──────────────────────────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    const readyPhotos = photos.filter(p => p.status === 'ready');
    if (!readyPhotos.length) return;

    setStage('analyzing');
    setAnalysisResults({});

    const batchId = `batch-${Date.now()}`;
    const batchDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const resolvedFarm = farmName.trim() || `Farm Survey — ${batchDate}`;

    const resultsMap: Record<string, FieldZoneResult | 'error'> = {};

    // Process photos concurrently in groups of 3 to avoid overwhelming the backend
    const CONCURRENCY = 3;
    for (let i = 0; i < readyPhotos.length; i += CONCURRENCY) {
      const chunk = readyPhotos.slice(i, i + CONCURRENCY);
      await Promise.allSettled(
        chunk.map(async (photo) => {
          try {
            const res = await fetch('/api/predict', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: photo.dataUrl }),
            });
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const data = await res.json();

            const isHealthy = data.rawClass?.includes('healthy') ?? false;
            const severity = isHealthy ? 'none' :
              (data.confidence ?? 0) > 80 ? 'high' :
              (data.confidence ?? 0) > 60 ? 'medium' : 'low';

            const zone: FieldZoneResult = {
              id: photo.id,
              label: photo.label,
              lat: photo.lat,
              lng: photo.lng,
              disease: data.disease ?? 'Unknown',
              leafType: data.leafType ?? 'Unknown',
              confidence: data.confidence ?? 0,
              isHealthy,
              severity,
              remedies: data.remedies ?? [],
              recoveryTime: data.recoveryTime ?? 'Varies',
              details: data.details ?? '',
              adjacentRisk: false, // computed after all results
              protectiveActions: [],
              image: photo.dataUrl,
              rawClass: data.rawClass ?? '',
              batchId,
              batchDate,
            };

            resultsMap[photo.id] = zone;
            setAnalysisResults(prev => ({ ...prev, [photo.id]: zone }));
          } catch {
            resultsMap[photo.id] = 'error';
            setAnalysisResults(prev => ({ ...prev, [photo.id]: 'error' }));
          }
        })
      );
    }

    // ── Post-processing: compute adjacent risk ────────────────────────────
    const RISK_RADIUS_M = 100; // 100 metres

    function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
      const R = 6371000;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const allZones = Object.values(resultsMap).filter(r => r !== 'error') as FieldZoneResult[];
    const diseased = allZones.filter(z => !z.isHealthy && z.lat !== null);
    const healthy = allZones.filter(z => z.isHealthy && z.lat !== null);

    healthy.forEach(hz => {
      const atRisk = diseased.some(dz =>
        haversine(hz.lat!, hz.lng!, dz.lat!, dz.lng!) <= RISK_RADIUS_M
      );
      if (atRisk) {
        hz.adjacentRisk = true;
        hz.protectiveActions = [
          'Apply preventive fungicide spray immediately.',
          'Install physical barriers (nets/mulch) between fields.',
          'Remove infected plant debris from nearby areas.',
          'Monitor daily for early disease symptoms.',
          'Avoid sharing tools between healthy and diseased sections.',
        ];
        resultsMap[hz.id] = hz;
      }
    });

    // ── Build batch object ────────────────────────────────────────────────
    const locatedZones = allZones.filter(z => z.lat !== null && z.lng !== null);
    const unlocatedZones = allZones.filter(z => z.lat === null || z.lng === null);

    const batch: FieldBatch = {
      id: batchId,
      date: batchDate,
      farmName: resolvedFarm,
      zones: locatedZones,
      unlocatedZones,
    };

    if (mergeMode && prevBatch && consent === 'granted') {
      // Merge: combine located zones from prev batch (dedup by proximity)
      batch.zones = [...locatedZones, ...prevBatch.zones].filter((zone, idx, arr) => {
        if (zone.batchId === batchId) return true; // always keep current
        // Keep prev zone only if no current zone is within 15m
        return !locatedZones.some(c =>
          c.lat !== null && zone.lat !== null &&
          haversine(c.lat!, c.lng!, zone.lat!, zone.lng!) < 15
        );
      });
    }

    setCurrentBatch(batch);
    if (consent === 'granted') saveBatch(batch);
    setStage('results');
  }, [photos, farmName, consent, saveBatch, prevBatch, mergeMode]);

  // ── New Batch flow ────────────────────────────────────────────────────────
  const handleNewBatch = () => {
    if (prevBatch || consent === 'pending') {
      setShowBatchDialog(true);
    } else {
      resetToUpload(false);
    }
  };

  const resetToUpload = (merge: boolean) => {
    setMergeMode(merge);
    setPhotos([]);
    setFarmName('');
    setAnalysisResults({});
    setCurrentBatch(null);
    setShowBatchDialog(false);
    setShowCompare(false);
    setStage('upload');
  };

  const handleDiscard = () => {
    clearAll();
    resetToUpload(false);
  };

  // ── Privacy toggle ────────────────────────────────────────────────────────
  const renderPrivacyToggle = () => (
    <button
      onClick={consent === 'granted' ? denyConsent : grantConsent}
      className="flex items-center gap-2 text-xs text-text-secondary hover:text-deep-green transition-colors"
      title={consent === 'granted' ? 'Click to disable scan history' : 'Click to enable scan history'}
    >
      {consent === 'granted'
        ? <><ToggleRight className="w-4 h-4 text-deep-green" /><span>Scan history: <strong className="text-deep-green">On</strong></span></>
        : <><ToggleLeft className="w-4 h-4" /><span>Scan history: Off</span></>
      }
    </button>
  );

  // ── Idle card ─────────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <div
        onClick={() => { setIsOpen(true); setStage('upload'); }}
        className="group cursor-pointer"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-deep-green via-muted-green to-accent-green/80 rounded-3xl p-8 text-white shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-1 active:scale-[0.99]">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Tractor className="w-9 h-9 text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3">
                🌾 Large Farm Feature
              </div>
              <h3 className="text-2xl font-black mb-2">Survey Multiple Fields at Once</h3>
              <p className="text-white/85 text-sm leading-relaxed max-w-lg">
                Upload up to <strong>15 photos</strong> from different field sections. We extract GPS coordinates from each photo and generate a colour-coded disease map of your entire farm.
              </p>
            </div>
            <div className="bg-white/20 group-hover:bg-white/30 transition-all rounded-2xl px-5 py-3 font-bold text-sm flex-shrink-0">
              Start Survey →
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-divider rounded-3xl shadow-soft overflow-hidden">
      {/* Section header */}
      <div className="hero-gradient px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tractor className="w-6 h-6 text-white" />
          <h3 className="text-lg font-black text-white">Large Farm Survey</h3>
          {batches.length > 0 && consent === 'granted' && (
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Database className="w-3 h-3" /> {batches.length} saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {stage === 'results' && renderPrivacyToggle()}
          <button
            onClick={() => { setIsOpen(false); setStage('idle'); }}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Consent banner */}
        {consent === 'pending' && stage === 'upload' && (
          <ConsentBanner onAllow={grantConsent} onDeny={denyConsent} />
        )}

        {/* Stage content */}
        <AnimatePresence mode="wait">
          {stage === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldUploadGrid
                photos={photos}
                onPhotosChange={setPhotos}
                farmName={farmName}
                onFarmNameChange={setFarmName}
                onAnalyze={runAnalysis}
                isAnalyzing={false}
              />
            </motion.div>
          )}

          {stage === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldAnalysisProgress
                photos={photos.filter(p => p.status === 'ready')}
                results={analysisResults}
                total={photos.filter(p => p.status === 'ready').length}
              />
            </motion.div>
          )}

          {stage === 'results' && currentBatch && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FieldMapResults
                batch={currentBatch}
                previousBatch={mergeMode ? prevBatch : null}
                onNewBatch={handleNewBatch}
                showCompare={showCompare}
                onCloseCompare={() => setShowCompare(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Batch Dialog */}
      <AnimatePresence>
        {showBatchDialog && (
          <BatchDialog
            previousBatch={consent === 'granted' ? prevBatch : null}
            hasConsent={consent === 'granted'}
            onAddToMap={() => resetToUpload(true)}
            onCompare={() => { resetToUpload(false); setShowCompare(true); }}
            onStartFresh={handleDiscard}
            onEnableAndLink={() => { grantConsent(); resetToUpload(true); }}
            onCancel={() => setShowBatchDialog(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
