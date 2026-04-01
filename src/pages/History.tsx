import React from 'react';
import { Calendar, ChevronRight, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { ScanResult } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface HistoryProps {
  scans: ScanResult[];
  onViewResult: (result: ScanResult) => void;
  onStartScan: () => void;
}

export default function History({ scans, onViewResult, onStartScan }: HistoryProps) {
  const { t } = useLanguage();

  return (
    <div className="pt-28 pb-12 max-w-5xl mx-auto px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold text-text-primary mb-3">{t('historyTitle')}</h1>
          <p className="text-text-secondary text-lg">{t('historySub')}</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4"
        >
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-text-secondary" />
            <input 
              type="text" 
              placeholder={t('searchCrops')}
              className="w-full pl-14 pr-6 py-4 bg-surface border border-divider rounded-full focus:outline-none focus:ring-4 focus:ring-accent-green/10 focus:border-muted-green transition-all shadow-soft text-lg"
            />
          </div>
          <button className="neumorphic-btn !p-4 text-deep-green">
            <Filter className="w-6 h-6" />
          </button>
        </motion.div>
      </div>

      {scans.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface-alt rounded-[3rem] p-20 text-center border-2 border-dashed border-divider shadow-soft"
        >
          <div className="w-24 h-24 bg-bg-nature rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Calendar className="w-12 h-12 text-deep-green" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-4">{t('noScans')}</h3>
          <p className="text-text-secondary mb-10 text-lg max-w-md mx-auto">{t('noScansSub')}</p>
          <button onClick={onStartScan} className="bg-deep-green text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-muted-green transition-all shadow-xl active:scale-95">
            {t('firstScan')}
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {scans.map((scan, idx) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onViewResult(scan)}
              className="group soft-card p-6 cursor-pointer flex items-center gap-8 border border-divider/50"
            >
              <div className="relative shrink-0">
                <img 
                  src={scan.image} 
                  alt={scan.leafType} 
                  className="w-24 h-24 rounded-[1.5rem] object-cover shadow-md group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                  scan.disease === 'Healthy' ? 'bg-accent-green' : 'bg-red-500'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    scan.disease === 'Healthy' ? 'bg-accent-green/20 text-deep-green' : 'bg-red-50 text-red-600'
                  }`}>
                    {scan.disease === 'Healthy' ? t('healthy') : t('diseased')}
                  </span>
                  <span className="text-xs text-text-secondary flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4" />
                    {scan.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-text-primary truncate mb-1">{scan.leafType}</h3>
                <p className="text-text-secondary truncate text-lg">{scan.disease}</p>
              </div>
              
              <div className="w-12 h-12 rounded-full bg-bg-nature flex items-center justify-center text-deep-green group-hover:bg-deep-green group-hover:text-white transition-all shadow-soft group-hover:translate-x-2">
                <ChevronRight className="w-6 h-6" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
