import React, { useState, useMemo } from 'react';
import { Calendar, ChevronRight, Search, Filter, SortAsc, SortDesc, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanResult } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface HistoryProps {
  scans: ScanResult[];
  onViewResult: (result: ScanResult) => void;
  onStartScan: () => void;
}

type SortOption = 'date-newest' | 'date-oldest' | 'name-az' | 'name-za';

export default function History({ scans, onViewResult, onStartScan }: HistoryProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-newest');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filteredAndSortedScans = useMemo(() => {
    let result = [...scans];

    // Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.leafType.toLowerCase().includes(query) || 
        s.disease.toLowerCase().includes(query)
      );
    }

    // Sort Logic
    result.sort((a, b) => {
      switch (sortOption) {
        case 'date-newest':
          return parseInt(b.id) - parseInt(a.id);
        case 'date-oldest':
          return parseInt(a.id) - parseInt(b.id);
        case 'name-az':
          return a.leafType.localeCompare(b.leafType);
        case 'name-za':
          return b.leafType.localeCompare(a.leafType);
        default:
          return 0;
      }
    });

    return result;
  }, [scans, searchQuery, sortOption]);

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'date-newest', label: 'Newest First', icon: <SortDesc className="w-4 h-4" /> },
    { value: 'date-oldest', label: 'Oldest First', icon: <SortAsc className="w-4 h-4" /> },
    { value: 'name-az', label: 'Plant A-Z', icon: <Type className="w-4 h-4" /> },
    { value: 'name-za', label: 'Plant Z-A', icon: <Type className="w-4 h-4" /> },
  ];

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
          className="flex gap-4 items-center"
        >
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-text-secondary" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchCrops')}
              className="w-full pl-14 pr-6 py-4 bg-surface border border-divider rounded-full focus:outline-none focus:ring-4 focus:ring-accent-green/10 focus:border-muted-green transition-all shadow-soft text-lg"
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`neumorphic-btn !p-4 transition-colors ${isSortOpen ? 'bg-deep-green text-white ring-4 ring-deep-green/20' : 'text-deep-green'}`}
            >
              <Filter className="w-6 h-6" />
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-surface border border-divider rounded-2xl shadow-xl overflow-hidden z-20"
                >
                  <div className="py-2">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortOption(opt.value);
                          setIsSortOpen(false);
                        }}
                        className={`w-full px-5 py-3 text-left text-sm font-semibold flex items-center justify-between transition-colors hover:bg-bg-nature ${
                          sortOption === opt.value ? 'text-deep-green bg-accent-green/5' : 'text-text-secondary'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          {opt.icon}
                          {opt.label}
                        </span>
                        {sortOption === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-deep-green" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
      ) : filteredAndSortedScans.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 text-center"
        >
          <div className="w-16 h-16 bg-bg-nature rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-text-secondary opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No results found</h3>
          <p className="text-text-secondary">No scans match your search "{searchQuery}"</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-6 text-deep-green font-bold hover:underline"
          >
            Clear search
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAndSortedScans.map((scan, idx) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onViewResult(scan)}
              className="group soft-card p-6 cursor-pointer flex items-center gap-8 border border-divider/50 hover:border-deep-green transition-all duration-300"
            >
              <div className="relative shrink-0">
                <img 
                  src={scan.image} 
                  alt={scan.leafType} 
                  className="w-24 h-24 rounded-[1.5rem] object-cover shadow-md group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm ${
                  scan.rawClass?.includes('healthy') ? 'bg-accent-green' : 'bg-red-500'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    scan.rawClass?.includes('healthy') ? 'bg-accent-green/20 text-deep-green' : 'bg-red-50 text-red-600'
                  }`}>
                    {scan.rawClass?.includes('healthy') ? t('healthy') : t('diseased')}
                  </span>
                  <span className="text-xs text-text-secondary flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {scan.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-text-primary truncate mb-0.5 group-hover:text-deep-green transition-colors">{scan.leafType}</h3>
                <p className="text-text-secondary truncate text-base">{scan.disease}</p>
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
