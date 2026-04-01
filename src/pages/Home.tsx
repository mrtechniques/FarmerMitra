import React from 'react';
import { ArrowRight, Scan, ShieldCheck, History, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';

interface HomeProps {
  onStartScan: () => void;
  onChatAgent: () => void;
}

export default function Home({ onStartScan, onChatAgent }: HomeProps) {
  const { t } = useLanguage();

  const features = [
    {
      icon: Scan,
      title: t('feat1Title'),
      description: t('feat1Sub')
    },
    {
      icon: ShieldCheck,
      title: t('feat2Title'),
      description: t('feat2Sub')
    },
    {
      icon: History,
      title: t('feat3Title'),
      description: t('feat3Sub')
    }
  ];

  return (
    <div className="pt-24 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface-alt rounded-[2.5rem] mx-4 md:mx-8 mb-16 shadow-soft">
        <div className="max-w-7xl mx-auto px-8 py-20 md:py-32 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-center md:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-5 py-2 bg-accent-green/20 text-deep-green rounded-full text-xs font-bold tracking-widest uppercase mb-8">
                {t('tagline')}
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-text-primary leading-[1.1] mb-8">
                {t('heroTitle')}
              </h1>
              <p className="text-lg text-text-secondary mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed">
                {t('heroSub')}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <button
                  onClick={onStartScan}
                  className="inline-flex items-center gap-3 bg-deep-green text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-muted-green transition-all shadow-xl hover:-translate-y-1 active:scale-95"
                >
                  {t('startScan')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
          
          <div className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 2 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10"
            >
              <div className="relative p-4 bg-white rounded-[3rem] shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&q=80&w=800" 
                  alt="Healthy tomato plant" 
                  className="rounded-[2.5rem] w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-green/30 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-muted-green/20 blur-3xl rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-8 mb-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text-primary mb-6">{t('whyTitle')}</h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            {t('whySub')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="soft-card p-10 group"
            >
              <div className="w-16 h-16 bg-bg-nature rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3">
                <feature.icon className="w-8 h-8 text-deep-green" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">{feature.title}</h3>
              <p className="text-text-secondary leading-relaxed text-lg">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Actions / Featured */}
      <section className="max-w-7xl mx-auto px-8 mb-24">
        <div className="hero-gradient rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">{t('needAdvice')}</h2>
            <p className="text-white/80 mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
              {t('adviceSub')}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <button onClick={onChatAgent} className="bg-white text-deep-green px-10 py-5 rounded-full font-bold text-lg hover:bg-surface-alt transition-all shadow-xl flex items-center gap-3">
                <MessageSquare className="w-6 h-6" />
                {t('chatAgent')}
              </button>
              <button className="glass text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-3">
                {t('aboutUs')}
              </button>
            </div>
          </div>
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-green/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      </section>
    </div>
  );
}
