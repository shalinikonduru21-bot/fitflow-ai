
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { integrationService } from '../services/integrationService';
import { DailyRoulette, BlitzChallenge } from './DailyEngagement';
import { 
  Flame, Coins, Zap, Star, ChevronRight, 
  TrendingUp, Target, Users, Play,
  Award, Heart, Watch, RefreshCw, Sparkles,
  ShieldCheck, CheckCircle2, Brain
} from 'lucide-react';
import { AppState, SessionIntent } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';

const SocialDashboard: React.FC<{ setStep: (step: AppState) => void }> = ({ setStep }) => {
  const [data, setData] = useState(storage.get());
  const [tickerOffset, setTickerOffset] = useState(0);
  const [launching, setLaunching] = useState<SessionIntent | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerOffset(prev => (prev - 1) % 100);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const recoveryScore = integrationService.getRecoveryScore(data.wearableData);
  const recoveryInsight = integrationService.getRecoveryInsight(data.wearableData);

  const SESSION_COSTS: Record<SessionIntent, number> = {
    PEAK: 40,
    STAMINA: 30,
    STABILITY: 20,
    BREATH: 0
  };

  const handleStartSmartSession = async (intent: SessionIntent) => {
    const cost = SESSION_COSTS[intent];
    if (data.tokens < cost) {
      alert(`Insufficient Flow Tokens. Need ${cost} DFT.`);
      return;
    }

    setLaunching(intent);
    try {
      const plan = await generateWorkoutPlan(data.profile || {} as any, intent);
      storage.useTokens(cost);
      storage.save({ workoutPlan: plan });
      setStep(AppState.WORKOUT_EXECUTION);
    } catch (err) {
      console.error("Failed to generate", err);
    } finally {
      setLaunching(null);
    }
  };

  const tickerItems = [
    { icon: Users, text: "5,241 athletes training live" },
    { icon: Target, text: "150M reps globally today" },
    { icon: Award, text: "Next Global Challenge in 2h" },
    { icon: Zap, text: "New PR set by @FlexAI" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#050505] pb-32 custom-scrollbar">
      <section className="relative px-8 pt-12 pb-16 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                  <Flame className="w-3 h-3 fill-orange-500" /> {data.streak}-DAY STREAK
                </span>
                <button 
                  onClick={() => setStep(AppState.INTEGRATIONS)}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 transition-all ${recoveryScore < 50 ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}
                >
                  <Watch className="w-3 h-3" /> RECOVERY: {recoveryScore}%
                </button>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white uppercase">
                Hello, <br />
                <span className="bg-gradient-to-r from-cyan-400 via-white to-magenta-400 bg-clip-text text-transparent">{data.profile?.name || 'Athlete'}</span>
              </h1>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 max-w-xl backdrop-blur-sm">
                 <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
                   "{recoveryInsight}"
                 </p>
              </div>
            </div>

            <button 
              onClick={() => handleStartSmartSession('PEAK')}
              disabled={!!launching || data.tokens < 40}
              className="px-10 py-6 bg-cyan-400 text-black font-black rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(0,255,255,0.2)] flex items-center gap-4 disabled:opacity-50"
            >
              {launching === 'PEAK' ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Play className="w-6 h-6 fill-black" />}
              <div className="flex flex-col items-start">
                 <span className="text-xl leading-none">PEAK FLOW</span>
                 <span className="text-[10px] opacity-60">40 Tokens</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <div className="w-full bg-white/5 border-y border-white/5 py-3 overflow-hidden whitespace-nowrap relative">
        <div className="flex animate-ticker" style={{ transform: `translateX(${tickerOffset}px)` }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <item.icon className="w-3 h-3 text-cyan-400" />
              {item.text}
              <span className="ml-12 text-slate-800">|</span>
            </div>
          ))}
        </div>
      </div>

      <section className="px-8 py-12 max-w-7xl mx-auto space-y-12">
        <div className="space-y-6">
          <h3 className="text-3xl font-black uppercase tracking-tight">Adaptive Protocols</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'PEAK', title: "Power Yoga", tag: "STRENGTH", intent: 'PEAK', color: 'cyan', icon: Zap },
              { id: 'STAMINA', title: "HIIT Session", tag: "ENDURANCE", intent: 'STAMINA', color: 'magenta', icon: Flame },
              { id: 'STABILITY', title: "Core Reset", tag: "BALANCE", intent: 'STABILITY', color: 'indigo', icon: Target },
              { id: 'BREATH', title: "Nervous Reset", tag: "RECOVERY", intent: 'BREATH', color: 'green', icon: Heart },
            ].map((workout, i) => {
              const cost = SESSION_COSTS[workout.intent as SessionIntent];
              const canAfford = data.tokens >= cost;
              return (
                <div 
                  key={i} 
                  onClick={() => handleStartSmartSession(workout.intent as SessionIntent)}
                  className={`group relative glass rounded-[2rem] border-white/10 overflow-hidden hover:border-white/30 transition-all cursor-pointer ${launching === workout.id || !canAfford ? 'opacity-50' : ''}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-${workout.color}-500/10 to-transparent opacity-50`} />
                  <div className="relative p-8 h-full flex flex-col justify-between min-h-[200px]">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[8px] font-black px-2 py-1 bg-white/10 rounded-md text-white border border-white/10 uppercase tracking-widest">{workout.tag}</span>
                        <div className={`text-[10px] font-black ${canAfford ? 'text-cyan-400' : 'text-red-500'}`}>{cost} DFT</div>
                      </div>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                         {workout.title} <workout.icon className="w-4 h-4" />
                      </h4>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform self-end">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DailyRoulette />
          <div className="glass p-8 rounded-[2rem] border-white/10 relative overflow-hidden group">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full" />
            <TrendingUp className="text-indigo-400 w-8 h-8 mb-6" />
            <h3 className="text-xl font-black text-white uppercase mb-2">Consistency Vector</h3>
            <p className="text-slate-500 text-xs font-medium italic mb-8">"Neural trajectory is stabilizing. Maintain 15m active minutes to preserve streak."</p>
            <div className="space-y-2">
               <div className="flex justify-between text-[9px] font-black uppercase">
                  <span className="text-indigo-400">Stability Index</span>
                  <span className="text-white">88%</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[88%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
               </div>
            </div>
          </div>
          <BlitzChallenge onStart={() => handleStartSmartSession('STAMINA')} />
        </div>
      </section>

      <button 
        onClick={() => setStep(AppState.INTEGRATIONS)}
        className="fixed bottom-24 right-8 w-16 h-16 bg-gradient-to-br from-cyan-400 to-indigo-500 rounded-full shadow-2xl flex items-center justify-center z-[70] hover:scale-110 active:scale-95 transition-all"
      >
        <Watch className="text-black w-8 h-8" />
      </button>
    </div>
  );
};

export default SocialDashboard;
