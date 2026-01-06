
import React, { useState } from 'react';
import { 
  Home, Zap, BarChart2, Users, ShoppingBag, Coins, 
  Bell, Flame, ChevronLeft, ChevronRight, Sparkles,
  Settings, User, X
} from 'lucide-react';
import { AppState, Notification } from '../types';
import { storage } from '../services/storageService';

interface NavProps {
  currentStep: AppState;
  setStep: (step: AppState, skipHistory?: boolean) => void;
  goBack: () => void;
  breadcrumb: string[];
}

export const Header: React.FC<NavProps> = ({ currentStep, setStep, goBack, breadcrumb }) => {
  const data = storage.get();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = data.notifications.filter(n => !n.isRead).length;

  return (
    <header className="flex flex-col border-b border-white/5 bg-[#050505]/60 backdrop-blur-2xl sticky top-0 z-[100]">
      <div className="h-16 flex items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {breadcrumb.length > 1 && (
            <button 
              onClick={goBack}
              className="p-2 hover:bg-white/5 rounded-xl text-cyan-400 transition-all flex items-center gap-1 group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Back</span>
            </button>
          )}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setStep(AppState.DASHBOARD)}>
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-magenta-500 rounded-lg flex items-center justify-center font-black italic text-black text-lg shadow-lg shadow-cyan-500/20 group-hover:rotate-6 transition-transform">
              F
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
              FitAI
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-orange-500/5 px-3 py-1.5 rounded-xl border border-orange-500/10">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="font-black text-xs text-orange-100">{data.streak}</span>
          </div>

          <div className="flex items-center gap-2 bg-cyan-400/5 px-3 py-1.5 rounded-xl border border-cyan-400/10 group cursor-help relative">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-black text-xs text-cyan-100">{data.tokens}</span>
            <div className="absolute top-full mt-2 right-0 w-48 bg-slate-900 border border-white/10 p-4 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-2xl">
              <p className="text-[10px] font-black uppercase text-cyan-400 mb-2">Daily Flow Tokens</p>
              <p className="text-[10px] leading-relaxed text-slate-400">Tokens refresh daily at midnight. Use them to initiate smart sessions and advanced AI coaching.</p>
            </div>
          </div>
          
          <button 
            onClick={() => setStep(AppState.STORE)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${currentStep === AppState.STORE ? 'bg-yellow-500/20 border-yellow-500/40' : 'bg-yellow-500/5 border-yellow-500/10 hover:border-yellow-500/30'}`}
          >
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-black text-xs text-yellow-100">{data.coins.toLocaleString()}</span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 transition-colors ${showNotifications ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border border-[#050505] text-[8px] font-black text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full mt-4 right-0 w-80 glass border border-white/10 rounded-[2rem] shadow-2xl z-[200] overflow-hidden animate-in slide-in-from-top-2 duration-300">
                 <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Neural Hub</span>
                    <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-slate-500" /></button>
                 </div>
                 <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {data.notifications.length > 0 ? (
                      data.notifications.map(notif => (
                        <div key={notif.id} className="p-5 border-b border-white/5 hover:bg-white/5 transition-all">
                           <div className="flex justify-between items-start mb-1">
                              <span className="text-[9px] font-black uppercase text-cyan-400">{notif.type}</span>
                              <span className="text-[8px] text-slate-600">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                           <h4 className="text-[11px] font-black text-white uppercase tracking-tight">{notif.title}</h4>
                           <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-[10px] text-slate-600 italic uppercase">No new alerts.</div>
                    )}
                 </div>
                 <button 
                   onClick={() => { storage.save({ notifications: data.notifications.map(n => ({...n, isRead: true})) }); setShowNotifications(false); }}
                   className="w-full py-4 text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all bg-white/5"
                 >
                   Clear All Alerts
                 </button>
              </div>
            )}
          </div>

          <div 
            className={`w-9 h-9 rounded-full border bg-slate-800 overflow-hidden cursor-pointer transition-all ${currentStep === AppState.PROFILE ? 'border-cyan-400 ring-2 ring-cyan-400/20' : 'border-white/10 hover:border-cyan-400'}`} 
            onClick={() => setStep(AppState.PROFILE)}
          >
            <img src={data.profile?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=FitFlow"} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Breadcrumb Bar */}
      <div className="h-8 flex items-center px-8 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          {breadcrumb.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className={idx === breadcrumb.length - 1 ? 'text-cyan-400' : ''}>{crumb}</span>
              {idx < breadcrumb.length - 1 && <ChevronRight className="w-3 h-3 text-slate-700" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </header>
  );
};

export const BottomNav: React.FC<Omit<NavProps, 'goBack' | 'breadcrumb'>> = ({ currentStep, setStep }) => {
  const items = [
    { id: AppState.DASHBOARD, icon: Home, label: 'Home' },
    { id: AppState.TRAIN_HUB, icon: Zap, label: 'Train' },
    { id: AppState.ANALYTICS, icon: BarChart2, label: 'Stats' },
    { id: AppState.SOCIAL, icon: Users, label: 'Social' },
    { id: AppState.STORE, icon: ShoppingBag, label: 'Store' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#050505]/80 backdrop-blur-3xl border-t border-white/5 px-4 flex justify-around items-center z-[100] sm:h-20 sm:px-6">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentStep === item.id || (currentStep === AppState.WORKOUT_EXECUTION && item.id === AppState.TRAIN_HUB);
        return (
          <button
            key={item.id}
            onClick={() => setStep(item.id)}
            className={`flex flex-col items-center gap-1 transition-all group ${isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-cyan-400/10' : 'group-hover:bg-white/5'}`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'fill-cyan-400/20' : ''}`} />
            </div>
            <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
