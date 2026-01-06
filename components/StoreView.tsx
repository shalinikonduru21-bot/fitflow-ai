
import React, { useState } from 'react';
import { 
  ShoppingBag, Coins, Sparkles, Zap, Eye, Settings, 
  Heart, Palette, Lock, CheckCircle2, Info 
} from 'lucide-react';
import { storage } from '../services/storageService';
import { StoreItem } from '../types';

const STORE_ITEMS: StoreItem[] = [
  { id: 'peak_adv', name: 'Peak Flow Advanced', description: 'Unlock progressive hold phases and dynamic tempo adaptations in PEAK sessions.', cost: 500, currency: 'coins', category: 'session' },
  { id: 'stamina_hiit', name: 'HIIT Protocol 2.0', description: 'Advanced STAMINA sessions with minimized rest intervals and power targets.', cost: 750, currency: 'coins', category: 'session' },
  { id: 'form_deep_dive', name: 'Form Deep Intelligence', description: 'Get detailed biomechanic heatmaps and joint-specific improvement insights.', cost: 1000, currency: 'coins', category: 'insight' },
  { id: 'custom_presets', name: 'Custom Preset Slots', description: 'Save up to 5 custom workout configurations for rapid initialization.', cost: 300, currency: 'coins', category: 'preset' },
  { id: 'theme_neon', name: 'Neon Horizon Theme', description: 'A high-contrast visual override with hyper-glow effects.', cost: 200, currency: 'coins', category: 'cosmetic' },
  { id: 'theme_oled', name: 'Pure Onyx OLED', description: 'Optimized for energy efficiency and deep blacks.', cost: 200, currency: 'coins', category: 'cosmetic' },
  { id: 'recovery_boost', name: 'Metabolic Shield', description: 'Emergency BREATH session unlock when daily tokens are exhausted.', cost: 50, currency: 'tokens', category: 'recovery' },
];

const StoreView: React.FC = () => {
  const [data, setData] = useState(storage.get());
  const [activeCategory, setActiveCategory] = useState<StoreItem['category'] | 'all'>('all');

  const handlePurchase = (item: StoreItem) => {
    if (data.purchasedItems.includes(item.id)) return;
    const success = storage.purchaseItem(item);
    if (success) {
      setData(storage.get());
    } else {
      alert(`Insufficient ${item.currency === 'coins' ? 'FitCoins' : 'Tokens'}.`);
    }
  };

  const filteredItems = STORE_ITEMS.filter(item => activeCategory === 'all' || item.category === activeCategory);

  const categories = [
    { id: 'all', label: 'All Items', icon: ShoppingBag },
    { id: 'session', label: 'Sessions', icon: Zap },
    { id: 'insight', label: 'Insights', icon: Eye },
    { id: 'recovery', label: 'Recovery', icon: Heart },
    { id: 'cosmetic', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#050505] pb-32 custom-scrollbar p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase mb-2">Marketplace</h1>
            <p className="text-slate-500 font-medium">Reinvest your performance tokens into advanced intelligence.</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-xl border border-yellow-500/20">
                <Coins className="text-yellow-500 w-4 h-4" />
                <span className="text-sm font-black text-white">{data.coins.toLocaleString()}</span>
             </div>
             <div className="flex items-center gap-2 bg-cyan-400/10 px-4 py-2 rounded-xl border border-cyan-400/20">
                <Sparkles className="text-cyan-400 w-4 h-4" />
                <span className="text-sm font-black text-white">{data.tokens}</span>
             </div>
          </div>
        </header>

        <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-white text-black' : 'bg-white/5 text-slate-500 hover:text-white border border-white/5'}`}
            >
              <cat.icon className="w-3.5 h-3.5" /> {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const isUnlocked = data.purchasedItems.includes(item.id);
            return (
              <div key={item.id} className={`glass p-8 rounded-[2.5rem] flex flex-col justify-between border-white/5 transition-all group ${isUnlocked ? 'opacity-60 grayscale' : 'hover:border-white/20'}`}>
                <div>
                   <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform`}>
                         {item.category === 'session' && <Zap className="text-cyan-400 w-6 h-6" />}
                         {item.category === 'insight' && <Eye className="text-magenta-400 w-6 h-6" />}
                         {item.category === 'cosmetic' && <Palette className="text-indigo-400 w-6 h-6" />}
                         {item.category === 'recovery' && <Heart className="text-green-400 w-6 h-6" />}
                         {item.category === 'preset' && <Settings className="text-yellow-400 w-6 h-6" />}
                      </div>
                      {isUnlocked && <CheckCircle2 className="text-green-500 w-6 h-6" />}
                   </div>
                   <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{item.name}</h3>
                   <p className="text-xs text-slate-500 leading-relaxed mb-8">{item.description}</p>
                </div>

                <button
                  onClick={() => handlePurchase(item)}
                  disabled={isUnlocked}
                  className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isUnlocked ? 'bg-white/5 text-slate-600' : 'bg-white text-black hover:scale-[1.02]'}`}
                >
                  {isUnlocked ? 'Already Unlocked' : (
                    <>
                      {item.currency === 'coins' ? <Coins className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                      {item.cost} {item.currency.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-16 p-8 bg-white/5 rounded-[3rem] border border-white/5 flex items-center gap-6">
           <Info className="text-slate-500 w-8 h-8 flex-shrink-0" />
           <p className="text-sm text-slate-400 italic">
            "FitFlow AI remains strictly focused on performance advancement. Visual customizations and insight deep-dives are unlocked solely via effort-derived tokens and coins. No external currency is accepted."
           </p>
        </div>
      </div>
    </div>
  );
};

export default StoreView;
