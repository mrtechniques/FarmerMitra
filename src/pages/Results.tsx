import React from 'react';
import { ShieldCheck, Clock, AlertCircle, CheckCircle2, ArrowLeft, Leaf, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { ScanResult } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface ResultsProps {
  result: ScanResult;
  onBack: () => void;
  onScanAgain: () => void;
  onAskAgent: () => void;
}

export default function Results({ result, onBack, onScanAgain, onAskAgent }: ResultsProps) {
  const { t } = useLanguage();
  const isHealthy = result.rawClass?.includes('healthy') || result.disease.toLowerCase().includes('healthy');

  return (
    <div className="pt-28 pb-12 max-w-5xl mx-auto px-8">
      <button
        onClick={onBack}
        className="flex items-center gap-3 text-deep-green font-bold mb-10 hover:text-muted-green transition-all group"
      >
        <div className="p-2 bg-surface rounded-full shadow-soft group-hover:-translate-x-1 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </div>
        {t('backToScan')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-5 rounded-[3rem] shadow-soft border border-divider"
          >
            <img
              src={result.image}
              alt="Scanned Leaf"
              className="w-full aspect-square object-cover rounded-[2.5rem] shadow-inner"
            />
          </motion.div>

          {/* Confidence card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hero-gradient text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <span className="text-accent-green text-xs font-bold uppercase tracking-[0.2em]">{t('confidence')}</span>
                <span className="text-3xl font-black">{result.confidence}%</span>
              </div>
              <div className="w-full bg-white/20 h-4 rounded-full overflow-hidden mb-6 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className="bg-accent-green h-full rounded-full shadow-[0_0_15px_rgba(163,199,109,0.5)]"
                />
              </div>
              <p className="text-white/70 text-sm text-center leading-relaxed">{t('confSub')}</p>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          </motion.div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="soft-card p-10"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 ${
                  isHealthy
                    ? 'bg-accent-green/20 text-deep-green'
                    : 'bg-red-50 text-red-600'
                }`}>
                  {isHealthy ? '✅ Healthy Plant' : t('diseaseDetected')}
                </span>
                <h1 className="text-4xl font-bold text-text-primary mb-2 leading-tight">{result.disease}</h1>
                <p className="text-text-secondary text-lg font-medium">
                  <Leaf className="inline w-4 h-4 mr-1" />
                  {result.leafType}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-5 p-6 bg-surface-alt rounded-[2rem] border border-divider">
                <div className="w-14 h-14 bg-accent-green/20 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <AlertCircle className="w-8 h-8 text-deep-green" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-text-primary mb-2">{t('diagDetails')}</h4>
                  <p className="text-text-secondary leading-relaxed text-lg">{result.details}</p>
                </div>
              </div>

              {!isHealthy && (
                <div className="flex items-start gap-5 p-6 bg-surface-alt rounded-[2rem] border border-divider">
                  <div className="w-14 h-14 bg-muted-green/20 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-8 h-8 text-muted-green" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-text-primary mb-2">{t('expRecovery')}</h4>
                    <p className="text-text-secondary text-lg">
                      {t('recoveryIn')} <span className="text-deep-green font-black">{result.recoveryTime}</span>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {!isHealthy && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="soft-card p-10"
            >
              <h3 className="text-2xl font-bold text-text-primary mb-8 flex items-center gap-4">
                <div className="p-2 bg-bg-nature rounded-xl">
                  <ShieldCheck className="w-8 h-8 text-deep-green" />
                </div>
                {t('recRemedies')}
              </h3>
              <div className="grid grid-cols-1 gap-5">
                {result.remedies.map((remedy, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (idx * 0.1) }}
                    className="flex items-start gap-5 p-5 bg-bg-nature/50 border border-divider rounded-[1.5rem] hover:bg-surface transition-all group"
                  >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-soft group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-5 h-5 text-accent-green" />
                    </div>
                    <p className="text-text-primary leading-relaxed text-lg">{remedy}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-5">
            <button
              onClick={onScanAgain}
              className="flex-1 bg-deep-green text-white py-5 rounded-full font-bold text-xl shadow-xl hover:bg-muted-green transition-all active:scale-95"
            >
              {t('saveHistory')}
            </button>
            <button
              onClick={onAskAgent}
              className="flex-1 neumorphic-btn font-bold text-xl text-deep-green flex items-center justify-center gap-3"
            >
              <MessageSquare className="w-6 h-6" />
              {t('askHelp')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
