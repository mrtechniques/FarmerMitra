import React, { useState } from 'react';
import { Leaf, Home, History, MessageSquare, Scan, Globe, ChevronDown, ShoppingBag, Bot } from 'lucide-react';
import { Page } from '../types';
import { useLanguage, Language } from '../hooks/useLanguage';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onOpenCart: () => void;
}

export default function Navbar({ currentPage, onPageChange, onOpenCart }: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'shop', label: t('shop'), icon: ShoppingBag },
    { id: 'scan', label: t('scan'), icon: Scan },
    { id: 'history', label: t('history'), icon: History },
    { id: 'agent', label: t('agent'), icon: Bot },
  ];

  const languages: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'हिंदी' },
    { id: 'kn', label: 'ಕನ್ನಡ' },
    { id: 'ml', label: 'മലയാളം' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto glass rounded-2xl shadow-soft flex items-center justify-between px-6 py-3">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onPageChange('home')}
        >
          <div className="bg-deep-green p-2 rounded-xl transition-transform group-hover:rotate-12">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-deep-green tracking-tight hidden sm:block">FarmerMitra</span>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id as Page)}
                  className={`flex items-center gap-2 transition-colors font-bold text-sm ${
                    isActive ? 'text-deep-green' : 'text-text-secondary hover:text-deep-green'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Cart Button */}
            <button 
              onClick={onOpenCart}
              className="p-2.5 bg-surface rounded-xl shadow-neumorphic text-deep-green hover:bg-muted-green hover:text-white transition-all active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface text-deep-green rounded-xl text-xs font-bold shadow-neumorphic hover:bg-surface-alt transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase hidden sm:inline">{language}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-32 bg-surface border border-divider rounded-2xl shadow-xl overflow-hidden"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => {
                          setLanguage(lang.id);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-muted-green/10 transition-colors ${
                          language === lang.id ? 'text-deep-green font-bold bg-muted-green/5' : 'text-text-secondary'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 glass rounded-2xl shadow-xl flex justify-around items-center p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id as Page)}
              className={`p-3 rounded-xl transition-all ${
                isActive ? 'bg-deep-green text-white shadow-lg' : 'text-text-secondary hover:bg-muted-green/10'
              }`}
            >
              <Icon className="w-6 h-6" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
