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
import { Page, ScanResult } from './types';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [agentContext, setAgentContext] = useState<ScanResult | null>(null);
  const { language } = useLanguage();

  const handleAnalyze = async (image: string): Promise<void> => {
    setAnalyzeError(null);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, language }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      const newResult: ScanResult = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        leafType: data.leafType || 'Unknown Plant',
        disease: data.disease || 'Unknown Disease',
        confidence: data.confidence ?? 0,
        image: image,
        remedies: data.remedies || ['Consult a local agricultural expert.'],
        recoveryTime: data.recoveryTime || 'Varies',
        details: data.details || 'No additional details available.',
        rawClass: data.rawClass,
        top3: data.top3,
      };

      setCurrentResult(newResult);
      setHistory(prev => [newResult, ...prev]);
      setCurrentPage('results');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error('Analysis failed:', msg);
      setAnalyzeError(msg);
    }
  };

  const handleAskAgent = (result: ScanResult) => {
    setAgentContext(result);
    setCurrentPage('agent');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            onStartScan={() => setCurrentPage('scan')}
            onChatAgent={() => setCurrentPage('agent')}
          />
        );
      case 'scan':
        return <Scan onAnalyze={handleAnalyze} analyzeError={analyzeError} />;
      case 'results':
        return currentResult ? (
          <Results
            result={currentResult}
            onBack={() => setCurrentPage('scan')}
            onScanAgain={() => setCurrentPage('scan')}
            onAskAgent={() => handleAskAgent(currentResult)}
            onViewHistory={() => setCurrentPage('history')}
          />
        ) : (
          <Home onStartScan={() => setCurrentPage('scan')} onChatAgent={() => setCurrentPage('agent')} />
        );
      case 'history':
        return (
          <History
            scans={history}
            onViewResult={(res) => {
              setCurrentResult(res);
              setCurrentPage('results');
            }}
            onStartScan={() => setCurrentPage('scan')}
          />
        );
      case 'agent':
        return <Agent initialContext={agentContext} onClearContext={() => setAgentContext(null)} />;
      default:
        return <Home onStartScan={() => setCurrentPage('scan')} onChatAgent={() => setCurrentPage('agent')} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-nature font-sans text-text-primary">
      <Navbar
        currentPage={currentPage}
        onPageChange={(page) => {
          if (page !== 'agent') setAgentContext(null);
          setCurrentPage(page);
        }}
      />

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
