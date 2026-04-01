/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Results from './pages/Results';
import History from './pages/History';
import Agent from './pages/Agent';
import Shop from './pages/Shop';
import { Page, ScanResult } from './types';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';
import { ShoppingBag, X } from 'lucide-react';

function CartPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-bg-nature z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-divider">
              <h2 className="text-2xl font-bold text-deep-green flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                {t('cart')}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-muted-green/10 rounded-full transition-colors">
                <X className="w-6 h-6 text-deep-green" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-24 h-24 bg-muted-green/10 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-muted-green opacity-50" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">{t('emptyCart')}</h3>
                <p className="text-sm text-text-secondary">{t('heroSub')}</p>
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-deep-green text-white rounded-full font-bold shadow-lg hover:bg-muted-green transition-all"
              >
                {t('shopNow')}
              </button>
            </div>

            <div className="p-6 bg-surface border-t border-divider space-y-4">
              <div className="flex items-center justify-between text-lg font-bold text-deep-green">
                <span>{t('total')}</span>
                <span>$0.00</span>
              </div>
              <button className="w-full py-4 bg-deep-green text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-muted-green transition-all disabled:opacity-50" disabled>
                {t('checkout')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Dummy data for history
const DUMMY_HISTORY: ScanResult[] = [
  {
    id: '1',
    date: 'Oct 24, 2023',
    leafType: 'Tomato',
    disease: 'Early Blight',
    confidence: 94,
    image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=400',
    remedies: [
      'Remove infected lower leaves to prevent spread.',
      'Apply copper-based fungicides every 7-10 days.',
      'Improve air circulation by spacing plants properly.',
      'Water at the base of the plant to keep foliage dry.'
    ],
    recoveryTime: '14-21 days',
    details: 'Early blight is caused by the fungus Alternaria solani. It appears as small, dark spots on older leaves, which eventually develop concentric rings like a target.'
  },
  {
    id: '2',
    date: 'Oct 20, 2023',
    leafType: 'Potato',
    disease: 'Healthy',
    confidence: 99,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400',
    remedies: [
      'Continue regular watering and fertilization.',
      'Monitor for pests like potato beetles.',
      'Ensure good drainage in the soil.'
    ],
    recoveryTime: 'N/A',
    details: 'The leaf appears healthy with no visible signs of fungal or bacterial infection. Maintain current care routine.'
  }
];

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [history, setHistory] = useState<ScanResult[]>(DUMMY_HISTORY);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAnalyze = (image: string) => {
    // Simulate a result
    const newResult: ScanResult = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      leafType: 'Tomato',
      disease: 'Late Blight',
      confidence: 88,
      image: image,
      remedies: [
        'Destroy all infected plant parts immediately.',
        'Apply specialized fungicides containing chlorothalonil.',
        'Avoid overhead irrigation.',
        'Ensure plants are dry before nightfall.'
      ],
      recoveryTime: '10-15 days',
      details: 'Late blight is a devastating disease caused by the oomycete Phytophthora infestans. It spreads rapidly in cool, wet weather and can kill plants within days.'
    };

    setCurrentResult(newResult);
    setHistory(prev => [newResult, ...prev]);
    setCurrentPage('results');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onStartScan={() => setCurrentPage('scan')} />;
      case 'shop':
        return <Shop />;
      case 'scan':
        return <Scan onAnalyze={handleAnalyze} />;
      case 'results':
        return currentResult ? (
          <Results result={currentResult} onBack={() => setCurrentPage('scan')} />
        ) : (
          <Home onStartScan={() => setCurrentPage('scan')} />
        );
      case 'history':
        return (
          <History 
            scans={history} 
            onViewResult={(res) => {
              setCurrentResult(res);
              setCurrentPage('results');
            }} 
          />
        );
      case 'agent':
        return <Agent />;
      default:
        return <Home onStartScan={() => setCurrentPage('scan')} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-nature font-sans text-text-primary">
      <Navbar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        onOpenCart={() => setIsCartOpen(true)}
      />
      <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <main className="min-h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {currentPage !== 'agent' && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

