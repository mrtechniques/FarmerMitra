import React from 'react';
import {
  ShieldCheck, Clock, AlertCircle, CheckCircle2,
  ArrowLeft, Leaf, MessageSquare, Camera
} from 'lucide-react';
import { motion } from 'motion/react';
import { ScanResult } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface ResultsProps {
  result: ScanResult;
  onBack: () => void;
  onScanAgain: () => void;
  onAskAgent: () => void;
  onViewHistory: () => void;
}

export default function Results({ result, onBack, onScanAgain, onAskAgent, onViewHistory }: ResultsProps) {
  const { t } = useLanguage();
  const isHealthy = result.rawClass?.includes('healthy') || result.disease.toLowerCase().includes('healthy');
  const statusColor = isHealthy ? '#4a8c2a' : '#ef4444';

  return (
    <div className="pt-20 min-h-screen bg-bg-nature">

      {/* ── Full-width Hero Image ─────────────────────────────────────── */}
      <div className="relative w-full" style={{ height: '58vh', minHeight: 320 }}>
        <img
          src={result.image}
          alt="Scanned leaf"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.78)' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(10,25,10,0.95) 100%)'
        }} />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all hover:bg-white/15"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToScan')}
        </button>

        {/* Status badge */}
        <div
          className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest"
          style={{
            background: isHealthy ? 'rgba(74,140,42,0.3)' : 'rgba(239,68,68,0.3)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${statusColor}80`,
            color: isHealthy ? '#86efac' : '#fca5a5'
          }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: isHealthy ? '#86efac' : '#fca5a5' }} />
          {isHealthy ? <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />{t('healthyPlant')}</span> : t('diseaseDetected')}
        </div>

        {/* Title over image */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-accent-green" />
              <span className="text-accent-green font-semibold text-sm uppercase tracking-widest">{result.leafType}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{result.disease}</h1>
          </div>
        </div>
      </div>

      {/* ── Page Body ────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-8 py-10 space-y-6">

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* Plant */}
          <div className="p-6 rounded-xl border border-divider bg-surface" style={{ borderLeft: `4px solid ${statusColor}` }}>
            <p className="text-xs text-text-secondary uppercase tracking-widest mb-1 font-semibold">Plant</p>
            <p className="text-2xl font-bold text-text-primary">{result.leafType}</p>
          </div>

          {/* Recovery */}
          <div className="p-6 rounded-xl border border-divider bg-surface">
            <p className="text-xs text-text-secondary uppercase tracking-widest mb-1 font-semibold">{t('expRecovery')}</p>
            <p className="text-xl font-bold text-text-primary leading-tight">{result.recoveryTime || t('recoveryVaries')}</p>
          </div>

          {/* AI Confidence */}
          <div className="p-6 rounded-xl border border-divider bg-surface col-span-2 lg:col-span-1">
            <p className="text-xs text-text-secondary uppercase tracking-widest mb-1 font-semibold">AI Confidence</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-text-primary">{result.confidence}%</p>
              <div className="flex-1 h-2 bg-divider rounded-full overflow-hidden ml-2">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${result.confidence}%`,
                    backgroundColor: result.confidence > 85 ? '#4a8c2a' : (result.confidence > 60 ? '#f59e0b' : '#ef4444')
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Two-column: Diagnosis & Recovery | Remedies */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left (2 cols): Diagnosis + Recovery */}
          <div className="lg:col-span-2 space-y-6">

            {/* Diagnosis Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-xl border border-divider bg-surface overflow-hidden"
            >
              <div className="flex items-center gap-3 px-6 py-4 border-b border-divider bg-surface-alt">
                <div className="p-2 rounded-lg bg-accent-green/20">
                  <AlertCircle className="w-5 h-5 text-deep-green" />
                </div>
                <h2 className="font-bold text-text-primary">{t('diagDetails')}</h2>
              </div>
              <div className="px-6 py-6">
                <p className="text-text-secondary leading-relaxed">{result.details || t('noDetails')}</p>
              </div>
            </motion.div>

            {/* Recovery Timeline */}
            {!isHealthy && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="rounded-xl border border-divider bg-surface overflow-hidden"
              >
                <div className="flex items-center gap-3 px-6 py-4 border-b border-divider bg-surface-alt">
                  <div className="p-2 rounded-lg bg-accent-green/20">
                    <Clock className="w-5 h-5 text-deep-green" />
                  </div>
                  <h2 className="font-bold text-text-primary">{t('expRecovery')}</h2>
                </div>
                <div className="px-6 py-6">
                  <p className="text-3xl font-black text-deep-green mb-2">{result.recoveryTime || t('recoveryVaries')}</p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {t('recoveryIn')} prompt treatment and proper care.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3"
            >
              <button
                onClick={onAskAgent}
                className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 border-2 border-deep-green text-deep-green hover:bg-deep-green hover:text-white transition-all active:scale-95 bg-white shadow-sm sm:col-span-2 lg:col-span-1"
              >
                <MessageSquare className="w-5 h-5" />
                {t('askHelp')}
              </button>
              
              <button
                onClick={onScanAgain}
                className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 bg-surface-alt text-text-primary hover:bg-deep-green hover:text-white hover:border-deep-green border-2 border-divider transition-all active:scale-95 shadow-sm"
              >
                <Camera className="w-5 h-5" />
                {t('scanAnother')}
              </button>

              <button
                onClick={onViewHistory}
                className="w-full py-6 rounded-2xl font-black text-2xl flex items-center justify-center gap-4 bg-white text-text-primary hover:bg-deep-green hover:text-white hover:border-deep-green transition-all active:scale-95 shadow-xl border-2 border-divider"
              >
                <Clock className="w-7 h-7" />
                {t('historyTitle')}
              </button>
            </motion.div>
          </div>

          {/* Right (3 cols): Remedies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-3 rounded-xl border border-divider bg-surface overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-divider bg-surface-alt">
              <div className="p-2 rounded-lg bg-accent-green/20">
                <ShieldCheck className="w-5 h-5 text-deep-green" />
              </div>
              <h2 className="font-bold text-text-primary text-lg">{t('recRemedies')}</h2>
              <span className="ml-auto text-xs font-bold text-text-secondary bg-bg-nature px-2 py-1 rounded-full border border-divider">
                {result.remedies.length} steps
              </span>
            </div>
            <div className="divide-y divide-divider">
              {result.remedies.map((remedy, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.07 }}
                  className="flex items-start gap-4 px-6 py-5 hover:bg-surface-alt transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-deep-green/10 border border-deep-green/20 flex items-center justify-center mt-0.5">
                    <span className="text-xs font-black text-deep-green">{idx + 1}</span>
                  </div>
                  <p className="flex-1 text-text-primary leading-relaxed">{remedy}</p>
                  <CheckCircle2 className="w-4 h-4 text-accent-green flex-shrink-0 mt-1" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
