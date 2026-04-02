import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { FieldPhoto, FieldZoneResult } from '../types';

interface FieldAnalysisProgressProps {
  photos: FieldPhoto[];
  results: Record<string, FieldZoneResult | 'error'>;
  total: number;
}

export default function FieldAnalysisProgress({ photos, results, total }: FieldAnalysisProgressProps) {
  const done = Object.keys(results).length;
  const actualProgress = total > 0 ? (done / total) * 100 : 0;
  const [visualProgress, setVisualProgress] = useState(actualProgress);

  useEffect(() => {
    if (total === 0) {
      setVisualProgress(0);
      return;
    }

    if (done >= total) {
      setVisualProgress(100);
      return;
    }

    const timer = window.setInterval(() => {
      setVisualProgress(prev => {
        const baseline = Math.max(prev, actualProgress);
        if (baseline >= 92) return baseline;

        // Keep the bar moving during batch inference even when the backend
        // only returns all results at the end.
        const step = baseline < 20 ? 8 : baseline < 45 ? 5 : baseline < 70 ? 3 : 1.5;
        return Math.min(92, baseline + step);
      });
    }, 350);

    return () => window.clearInterval(timer);
  }, [actualProgress, done, total]);

  useEffect(() => {
    setVisualProgress(prev => {
      if (done >= total && total > 0) return 100;
      return Math.max(prev, actualProgress);
    });
  }, [actualProgress, done, total]);

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">Analyzing fields</span>
          <span className="text-sm font-black text-deep-green">
            {done < total ? `${Math.round(visualProgress)}%` : `${done} / ${total}`}
          </span>
        </div>
        <div className="w-full bg-bg-nature h-3 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full rounded-full hero-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${visualProgress}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
        {done < total && (
          <p className="text-xs text-text-secondary mt-2">
            Please wait — running disease detection on each photo and preparing the field map…
          </p>
        )}
      </div>

      {/* Photo cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map(photo => {
          const result = results[photo.id];
          const isDone = result !== undefined;
          const isError = result === 'error';
          const isHealthy = isDone && !isError && (result as FieldZoneResult).isHealthy;
          const severity = isDone && !isError ? (result as FieldZoneResult).severity : null;

          const statusColor = isError ? 'bg-red-500' :
            isDone && isHealthy ? 'bg-green-500' :
            isDone && severity === 'high' ? 'bg-red-500' :
            isDone ? 'bg-yellow-500' :
            'bg-gray-300';

          return (
            <motion.div
              key={photo.id}
              layout
              className="relative bg-surface rounded-2xl overflow-hidden border border-divider shadow-soft"
            >
              {/* Top color band */}
              <div className={`h-1.5 w-full ${statusColor} transition-all duration-500`} />

              {/* Thumbnail */}
              <div className="relative h-24 bg-bg-nature">
                {photo.dataUrl && (
                  <img src={photo.dataUrl} alt={photo.label} className="w-full h-full object-cover" />
                )}
                {/* Status overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isDone ? 'bg-black/0' : 'bg-black/20'}`}>
                  {!isDone ? (
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow">
                      <Loader2 className="w-5 h-5 text-deep-green animate-spin" />
                    </div>
                  ) : isError ? (
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow">
                      <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                  ) : isHealthy ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Label & result */}
              <div className="p-2.5">
                <p className="text-xs font-bold text-text-primary truncate">{photo.label}</p>
                <p className={`text-xs mt-0.5 font-medium ${
                  isError ? 'text-red-500' :
                  isDone && isHealthy ? 'text-green-600' :
                  isDone ? 'text-red-600' :
                  'text-text-secondary'
                }`}>
                  {isError ? 'Analysis failed' :
                   isDone ? (result as FieldZoneResult).disease :
                   'Analyzing…'}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
