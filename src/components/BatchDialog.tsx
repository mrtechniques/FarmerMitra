import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Plus, ArrowLeftRight, Trash2, Check } from 'lucide-react';
import { FieldBatch } from '../types';

interface BatchDialogProps {
  previousBatch: FieldBatch | null;
  hasConsent: boolean;
  onAddToMap: () => void;
  onCompare: () => void;
  onStartFresh: () => void;
  onEnableAndLink: () => void;
  onCancel: () => void;
}

export default function BatchDialog({
  previousBatch,
  hasConsent,
  onAddToMap,
  onCompare,
  onStartFresh,
  onEnableAndLink,
  onCancel,
}: BatchDialogProps) {
  const zoneCount = previousBatch
    ? previousBatch.zones.length + previousBatch.unlocatedZones.length
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-6"
        style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.45)' }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, y: 30 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full"
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={onCancel} className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center mx-auto mb-5 text-green-700">
            {hasConsent && previousBatch ? <MapPin className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
          </div>

          {/* Title & subtitle */}
          {hasConsent && previousBatch ? (
            <>
              <h2 className="text-xl font-black text-text-primary text-center mb-1">Previous Scan Found</h2>
              <p className="text-sm text-text-secondary text-center mb-1">
                {previousBatch.farmName}
              </p>
              <p className="text-xs text-center text-text-secondary mb-6">
                {previousBatch.date} · {zoneCount} zone{zoneCount !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-text-secondary text-center mb-6 font-medium">
                What would you like to do with this new batch?
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onAddToMap}
                  className="w-full bg-deep-green text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-muted-green transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add to existing map</span>
                </button>
                <button
                  onClick={onCompare}
                  className="w-full bg-surface-alt border-2 border-deep-green text-deep-green py-3.5 rounded-2xl font-bold text-sm hover:bg-accent-green/10 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> Compare scans</span>
                </button>
                <button
                  onClick={onStartFresh}
                  className="w-full text-text-secondary py-2.5 rounded-2xl font-medium text-sm hover:bg-gray-100 transition-all active:scale-95"
                >
                  <span className="flex items-center gap-2 justify-center"><Trash2 className="w-4 h-4" /> Start fresh (discard old)</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-black text-text-primary text-center mb-2">Start New Batch</h2>
              <p className="text-sm text-text-secondary text-center mb-2">
                Your previous batch wasn't saved (scan history is off).
              </p>
              <p className="text-sm text-center text-text-secondary mb-6">
                Enable scan history to link and compare batches over time?
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
                <p className="text-xs text-amber-700 text-center leading-relaxed">
                  🔒 GPS data is stored <strong>on your device only</strong>. Nothing is sent to any server.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={onEnableAndLink}
                  className="w-full bg-deep-green text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-muted-green transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Enable & Link</span>
                </button>
                <button
                  onClick={onStartFresh}
                  className="w-full text-text-secondary py-2.5 rounded-2xl font-medium text-sm hover:bg-gray-100 transition-all active:scale-95"
                >
                  Start Fresh (keep off)
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
