import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPinned, Wheat, Sparkles } from 'lucide-react';
import FieldMapSection from '../components/FieldMapSection';

interface LargeFarmProps {
  onBack: () => void;
}

export default function LargeFarm({ onBack }: LargeFarmProps) {
  return (
    <div className="pt-24 pb-16">
      <section className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.75rem] border border-divider bg-[linear-gradient(135deg,#ffffff_0%,#fbfcfa_58%,rgba(163,199,109,0.12)_100%)] px-8 py-8 shadow-soft"
        >
          <div className="absolute -right-10 top-0 h-36 w-36 rounded-full bg-accent-green/18 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-28 w-28 rounded-full bg-deep-green/6 blur-3xl" />

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col gap-4 border-b border-divider/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 self-start rounded-full border border-divider bg-white px-4 py-2 text-sm font-bold text-text-secondary transition-all hover:border-deep-green hover:text-deep-green"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Scan
              </button>

              <div className="inline-flex items-center gap-2 self-start rounded-full bg-deep-green/8 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-deep-green">
                <Wheat className="h-4 w-4" />
                Large Farm Survey
              </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-black tracking-tight text-text-primary md:text-5xl">
                  Farm-scale disease survey, designed for clarity
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
                  Analyze multiple geotagged crop photos in a dedicated workflow with farm mapping, spread visibility, and batch comparison built in.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    'Multi-photo survey',
                    'GPS-linked mapping',
                    'Spread-risk visibility',
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-divider bg-white/90 px-4 py-2 text-sm font-semibold text-text-secondary shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {[
                  { icon: MapPinned, label: 'GPS-linked', note: 'Anchors detections to real field locations.' },
                  { icon: Sparkles, label: 'Risk-aware', note: 'Highlights spread pressure and nearby exposure.' },
                  { icon: Wheat, label: 'Farm-scale', note: 'Built for large surveys, not just single leaves.' },
                ].map(({ icon: Icon, label, note }) => (
                  <div key={label} className="rounded-[1.5rem] border border-divider bg-white/92 px-5 py-4 shadow-sm">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-nature text-deep-green">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-black text-text-primary">{label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-8"
        >
          <FieldMapSection />
        </motion.div>
      </section>
    </div>
  );
}
