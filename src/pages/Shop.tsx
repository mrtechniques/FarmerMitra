import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Search, Filter, ChevronRight, Star, Plus } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Monstera Deliciosa', category: 'indoor', price: 45, image: 'https://picsum.photos/seed/monstera/400/500', rating: 4.8 },
  { id: 2, name: 'Snake Plant', category: 'indoor', price: 25, image: 'https://picsum.photos/seed/snakeplant/400/500', rating: 4.9 },
  { id: 3, name: 'Fiddle Leaf Fig', category: 'indoor', price: 65, image: 'https://picsum.photos/seed/fiddleleaf/400/500', rating: 4.7 },
  { id: 4, name: 'Aloe Vera', category: 'succulents', price: 15, image: 'https://picsum.photos/seed/aloe/400/500', rating: 4.6 },
  { id: 5, name: 'Lavender', category: 'outdoor', price: 20, image: 'https://picsum.photos/seed/lavender/400/500', rating: 4.5 },
  { id: 6, name: 'Jade Plant', category: 'succulents', price: 30, image: 'https://picsum.photos/seed/jade/400/500', rating: 4.9 },
];

export default function Shop() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = PRODUCTS.filter(p => 
    (activeCategory === 'all' || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-deep-green">{t('categories')}</h3>
            <div className="space-y-2">
              {['all', 'indoor', 'outdoor', 'succulents'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-4 py-2 rounded-xl transition-all ${
                    activeCategory === cat 
                      ? 'bg-deep-green text-white shadow-lg' 
                      : 'text-text-secondary hover:bg-muted-green/10'
                  }`}
                >
                  {t(cat)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-muted-green/10 rounded-2xl space-y-4">
            <h4 className="font-bold text-deep-green">{t('ecoLifestyle')}</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t('footerDesc')}
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-8">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
              <input
                type="text"
                placeholder={t('searchCrops')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface rounded-2xl shadow-neumorphic focus:outline-none focus:ring-2 focus:ring-accent-green"
              />
            </div>
            <button className="sm:hidden flex items-center justify-center gap-2 px-6 py-3 bg-surface rounded-2xl shadow-neumorphic text-deep-green font-bold">
              <Filter className="w-5 h-5" />
              {t('categories')}
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="soft-card group"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-deep-green">{product.rating}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-muted-green font-bold">
                        {t(product.category)}
                      </span>
                      <h3 className="text-lg font-bold text-text-primary group-hover:text-deep-green transition-colors">
                        {product.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-deep-green">${product.price}</span>
                      <button className="p-3 bg-deep-green text-white rounded-xl shadow-lg hover:bg-muted-green transition-all active:scale-95">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
