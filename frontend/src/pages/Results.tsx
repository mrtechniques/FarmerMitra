import React from 'react';
import {
  ShieldCheck, Clock, AlertCircle, CheckCircle2,
  ArrowLeft, Leaf, MessageSquare, Camera,
  TrendingUp, Target, Activity, BarChart3
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

const validationRows = [
  [1, 0.9683, 0.9695, 0.9686],
  [2, 0.9760, 0.9770, 0.9761],
  [3, 0.9701, 0.9711, 0.9705],
  [4, 0.9811, 0.9818, 0.9813],
  [5, 0.9813, 0.9822, 0.9812],
  [6, 0.9796, 0.9813, 0.9800],
  [7, 0.9714, 0.9738, 0.9716],
  [8, 0.9790, 0.9798, 0.9793],
  [9, 0.9809, 0.9817, 0.9812],
  [10, 0.9805, 0.9809, 0.9809]
] as const;

const matrixLabels = [
  'Apple Scab',
  'Apple Healthy',
  'Grape Black Rot',
  'Grape Healthy',
  'Tomato Early Blight',
  'Tomato Leaf Mold',
  'Tomato Mosaic',
  'Tomato Healthy'
];

function ConfusionMatrixPreview() {
  const values = [
    [0.82, 0.12, 0.02, 0.01, 0.01, 0.01, 0.00, 0.01],
    [0.05, 0.94, 0.00, 0.00, 0.00, 0.00, 0.00, 0.01],
    [0.01, 0.01, 0.91, 0.03, 0.01, 0.01, 0.00, 0.02],
    [0.00, 0.00, 0.04, 0.92, 0.00, 0.01, 0.00, 0.03],
    [0.01, 0.00, 0.00, 0.00, 0.88, 0.07, 0.02, 0.02],
    [0.00, 0.00, 0.00, 0.01, 0.06, 0.90, 0.01, 0.02],
    [0.00, 0.00, 0.00, 0.00, 0.01, 0.02, 0.93, 0.04],
    [0.00, 0.01, 0.00, 0.00, 0.01, 0.01, 0.03, 0.94]
  ];

  const cell = 42;
  const labelSpace = 132;
  const chartSize = cell * values.length;
  const width = labelSpace + chartSize + 88;
  const height = 58 + chartSize + 96;

  return (
    <div className="rounded-[2rem] border border-divider bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-divider bg-[linear-gradient(135deg,rgba(163,199,109,0.12),rgba(255,255,255,0.95))] px-6 py-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-deep-green/70">Validation View</p>
          <h3 className="text-xl font-black text-text-primary">Confusion Matrix</h3>
        </div>
        <div className="rounded-full border border-deep-green/15 bg-white px-3 py-1 text-xs font-bold text-text-secondary">
          Demo visualization
        </div>
      </div>

      <div className="overflow-x-auto bg-[linear-gradient(180deg,#ffffff_0%,#f8faf5_100%)] p-5">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[640px] w-full">
          <text x={width / 2} y="24" textAnchor="middle" className="fill-text-primary" style={{ fontSize: 16, fontWeight: 800 }}>
            Model Confusion Matrix
          </text>

          {matrixLabels.map((label, colIndex) => (
            <g key={`col-${label}`} transform={`translate(${labelSpace + colIndex * cell + 26}, ${46}) rotate(-55)`}>
              <text textAnchor="end" className="fill-[#64748b]" style={{ fontSize: 9.5, fontWeight: 700 }}>
                {label}
              </text>
            </g>
          ))}

          {matrixLabels.map((label, rowIndex) => (
            <text
              key={`row-${label}`}
              x={labelSpace - 10}
              y={84 + rowIndex * cell + 24}
              textAnchor="end"
              className="fill-[#334155]"
              style={{ fontSize: 10.5, fontWeight: 700 }}
            >
              {label}
            </text>
          ))}

          {values.map((row, rowIndex) =>
            row.map((value, colIndex) => {
              const intensity = 0.08 + value * 0.92;
              const x = labelSpace + colIndex * cell;
              const y = 66 + rowIndex * cell;
              return (
                <g key={`${rowIndex}-${colIndex}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cell - 2}
                    height={cell - 2}
                    rx="10"
                    fill={`rgba(26, 99, 171, ${intensity})`}
                  />
                  <text
                    x={x + (cell - 2) / 2}
                    y={y + 24}
                    textAnchor="middle"
                    className={value > 0.6 ? 'fill-white' : 'fill-[#0f172a]'}
                    style={{ fontSize: 10.5, fontWeight: 800 }}
                  >
                    {Math.round(value * 100)}
                  </text>
                </g>
              );
            })
          )}

          <text x={labelSpace + chartSize / 2} y={height - 20} textAnchor="middle" className="fill-[#475569]" style={{ fontSize: 11, fontWeight: 700 }}>
            Predicted Label
          </text>
          <text
            x="18"
            y={66 + chartSize / 2}
            textAnchor="middle"
            className="fill-[#475569]"
            transform={`rotate(-90 18 ${66 + chartSize / 2})`}
            style={{ fontSize: 11, fontWeight: 700 }}
          >
            True Label
          </text>

          <defs>
            <linearGradient id="matrixScale" x1="0%" x2="0%" y1="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(26,99,171,0.08)" />
              <stop offset="100%" stopColor="rgba(26,99,171,0.95)" />
            </linearGradient>
          </defs>

          <rect x={labelSpace + chartSize + 26} y="68" width="22" height={chartSize - 2} rx="10" fill="url(#matrixScale)" />
          <text x={labelSpace + chartSize + 58} y="76" className="fill-[#64748b]" style={{ fontSize: 10, fontWeight: 700 }}>High</text>
          <text x={labelSpace + chartSize + 58} y={66 + chartSize} className="fill-[#64748b]" style={{ fontSize: 10, fontWeight: 700 }}>Low</text>
        </svg>
      </div>
    </div>
  );
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
            <p className="text-xs text-text-secondary uppercase tracking-widest mb-1 font-semibold">{t('plant')}</p>
            <p className="text-2xl font-bold text-text-primary">{result.leafType}</p>
          </div>

          {/* Recovery */}
          <div className="p-6 rounded-xl border border-divider bg-surface">
            <p className="text-xs text-text-secondary uppercase tracking-widest mb-1 font-semibold">{t('expRecovery')}</p>
            <p className="text-xl font-bold text-text-primary leading-tight">{result.recoveryTime || t('recoveryVaries')}</p>
          </div>

          {/* AI Confidence */}
          <div className="p-6 rounded-xl border border-divider bg-surface col-span-2 lg:col-span-1">
            <p className="text-xs text-text-secondary uppercase tracking-widest mb-1 font-semibold">{t('aiConfidence')}</p>
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

      {/* ── Training Metrics Section ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2.5rem] border border-divider bg-surface overflow-hidden shadow-soft"
        >
          <div className="border-b border-divider bg-[linear-gradient(135deg,#f8faf5_0%,#ffffff_60%,rgba(163,199,109,0.08)_100%)] px-8 py-10 md:px-10">
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-accent-green/20 text-deep-green shadow-sm">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-deep-green/70">AI Validation</p>
                  <h2 className="text-3xl font-black text-text-primary tracking-tight leading-none">{t('metricsTitle')}</h2>
                </div>
              </div>
              <p className="text-base leading-relaxed text-text-secondary">
                A simplified view of model quality. The cards below summarize overall performance, the confusion matrix shows class-level accuracy, and the final table tracks how the model improved during training.
              </p>
            </div>
          </div>

          <div className="px-8 py-8 md:px-10 md:py-10">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                ['Top F1', '98.1%', 'Best validation score', 'text-deep-green'],
                ['Precision', '97.8%', 'Low false positives', 'text-blue-700'],
                ['Recall', '97.6%', 'Strong disease capture', 'text-amber-600'],
                ['Classes', '30+', 'Apple, grape, tomato', 'text-text-primary']
              ].map(([label, value, note, color]) => (
                <div key={label} className="rounded-3xl border border-divider bg-white px-5 py-5 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-text-secondary">{label}</p>
                  <p className={`mt-3 text-3xl font-black ${color}`}>{value}</p>
                  <p className="mt-2 text-sm text-text-secondary">{note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-divider px-8 py-8 md:px-10 md:py-10">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-text-secondary">Class Accuracy</p>
                <h3 className="text-2xl font-black text-text-primary">Confusion Matrix</h3>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary md:text-right">
                Darker diagonal cells indicate strong class recognition. Lighter off-diagonal cells reveal the few places where similar leaf symptoms can still be confused.
              </p>
            </div>
            <ConfusionMatrixPreview />
          </div>

          <div className="border-t border-divider bg-surface-alt/35 px-8 py-8 md:px-10 md:py-10">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-text-secondary">Training Progress</p>
                  <h3 className="text-2xl font-black text-text-primary">Recent Epoch Performance</h3>
                </div>
              </div>
              <div className="rounded-2xl border border-deep-green/10 bg-white px-4 py-3 text-sm text-text-secondary">
                The final epochs stay tightly grouped, which suggests stable convergence and consistent model quality.
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-divider bg-white shadow-sm">
              <div className="grid grid-cols-4 gap-4 border-b border-divider bg-bg-nature/50 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary md:px-6">
                <div>Epoch</div>
                <div>{t('f1ScoreLabel')}</div>
                <div>{t('precisionLabel')}</div>
                <div>{t('recallLabel')}</div>
              </div>

              <div className="divide-y divide-divider/70">
                {validationRows.slice(-5).map(([epoch, f1, prec, rec]) => (
                  <div key={epoch} className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-4 md:items-center md:px-6">
                    <div className="flex items-center justify-between md:block">
                      <span className="rounded-full bg-bg-nature px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-text-secondary">
                        Epoch {epoch}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-lg font-black text-text-primary">{(f1 * 100).toFixed(2)}%</span>
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-text-secondary md:hidden">{t('f1ScoreLabel')}</span>
                      </div>
                      <div className="h-2 rounded-full bg-divider overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${f1 * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                          className="h-full rounded-full bg-deep-green"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:block">
                      <span className="text-base font-black text-blue-700">{(prec * 100).toFixed(2)}%</span>
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-text-secondary md:hidden">{t('precisionLabel')}</span>
                    </div>
                    <div className="flex items-center justify-between md:block">
                      <span className="text-base font-black text-amber-600">{(rec * 100).toFixed(2)}%</span>
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-text-secondary md:hidden">{t('recallLabel')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-divider bg-deep-green p-6 text-white shadow-[0_18px_48px_-26px_rgba(63,93,31,0.8)]">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <Target className="h-5 w-5 text-accent-green" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/60">Interpretation</p>
                  <h3 className="text-xl font-black">Readable and transparent validation</h3>
                </div>
              </div>
              <p className="max-w-4xl text-sm leading-relaxed text-white/80">
                This layout separates overall performance, class-level validation, and training history into distinct blocks so users can understand the model without getting lost in overlapping details.
              </p>
            </div>
          </div>
          
          <div className="px-10 py-6 bg-surface-alt/50 border-t border-divider text-[11px] text-text-secondary flex justify-between items-center font-medium">
            <span className="tracking-wide">© FarmerMitra-v2 Intelligence Dashboard</span>
            <span className="opacity-60">Data precision: 10^-4</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
