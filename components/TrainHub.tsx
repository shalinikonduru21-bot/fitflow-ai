
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, Flame, Target, Heart, Play, RefreshCw, 
  Clock, Sparkles, ChevronRight, Settings2, RotateCcw,
  Timer, Award, ArrowUpRight, CheckCircle2, Info
} from 'lucide-react';
import { AppState, SessionIntent, WorkoutPlan, UserProfile, PartialWorkout } from '../types';
import { storage } from '../services/storageService';
import { generateWorkoutPlan } from '../services/geminiService';
import { voiceService } from '../services/voiceService';
import { integrationService } from '../services/integrationService';

interface TrainHubProps {
  onStartSession: (plan: WorkoutPlan, resume?: PartialWorkout) => void;
  profile: UserProfile;
  setStep: (s: AppState) => void;
}

const SESSION_COSTS: Record<SessionIntent, number> = {
  PEAK: 40,
  STAMINA: 30,
  STABILITY: 20,
  BREATH: 0
};

const TrainHub: React.FC<TrainHubProps> = ({ onStartSession, profile, setStep }) => {
  const [data, setData] = useState(storage.get());
  const [loading, setLoading] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customIntent, setCustomIntent] = useState<SessionIntent>('STAMINA');
  
  // Real-time ticker for the hub view
  const [displaySeconds, setDisplaySeconds] = useState(data.dailyActive.totalSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      const freshData = storage.get();
      setData(freshData);
      setDisplaySeconds(freshData.dailyActive.totalSeconds);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return {
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0')
    };
  };

  const time = formatTime(displaySeconds);

  const handleAction = async (type: string, intent?: SessionIntent) => {
    const cost = intent ? SESSION_COSTS[intent] : 0;
    
    if (data.tokens < cost) {
      voiceService.speak(`Insufficient Flow Tokens. You need ${cost} for this session.`);
      return;
    }

    setLoading(type);
    try {
      if (type === 'resume' && data.partialWorkout) {
        onStartSession(data.partialWorkout.plan, data.partialWorkout);
      } else {
        const plan = await generateWorkoutPlan(profile, intent || 'STAMINA');
        if (cost > 0) storage.useTokens(cost);
        // Track the token cost for potential refund later
        const resumeData: PartialWorkout = {
          plan,
          currentExIndex: 0,
          currentSet: 1,
          totalRepsDone: 0,
          timestamp: Date.now(),
          tokenCost: cost
        };
        onStartSession(plan, resumeData);
      }
    } catch (err) {
      console.error(err);
      voiceService.speak("AI calibration failure. Attempting local baseline recovery.");
    } finally {
      setLoading(null);
    }
  };

  const smartOptions = [
    { id: 'PEAK', title: "Power Yoga Flow", tag: "STRENGTH & FOCUS", intent: 'PEAK' as SessionIntent, color: 'cyan', icon: Zap },
    { id: 'STAMINA', title: "HIIT Explosion", tag: "ENDURANCE & LOAD", intent: 'STAMINA' as SessionIntent, color: 'magenta', icon: Flame },
    { id: 'STABILITY', title: "Core Calibration", tag: "BALANCE & SAFETY", intent: 'STABILITY' as SessionIntent, color: 'indigo', icon: Target },
    { id: 'BREATH', title: "60s Recovery", tag: "NERVOUS SYSTEM", intent: 'BREATH' as SessionIntent, color: 'green', icon: Heart },
  ];

  const recoveryScore = data.wearableData ? integrationService.getRecoveryScore(data.wearableData) : 100;

  return (
    <div className="flex-1 overflow-y-auto bg-[#050505] pb-32 custom-scrollbar">
      {/* 1. LARGE LIVE TIMER HUB */}
      <section className="relative px-8 pt-16 pb-12 overflow-hidden bg-gradient-to-b from-cyan-950/20 to-transparent">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400 mb-4 animate-pulse">
            Today's Active Signal
          </p>
          
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="flex flex-col items-center">
              <span className="text-7xl sm:text-9xl font-black tracking-tighter text-white font-mono leading-none">
                {time.h}
              </span>
              <span className="text-[10px] font-black text-slate-600 mt-2">HRS</span>
            </div>
            <span className="text-7xl sm:text-9xl font-black text-slate-800 -translate-y-2">:</span>
            <div className="flex flex-col items-center">
              <span className="text-7xl sm:text-9xl font-black tracking-tighter text-cyan-400 font-mono leading-none drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                {time.m}
              </span>
              <span className="text-[10px] font-black text-slate-600 mt-2">MIN</span>
            </div>
            <span className="text-7xl sm:text-9xl font-black text-slate-800 -translate-y-2">:</span>
            <div className="flex flex-col items-center">
              <span className="text-7xl sm:text-9xl font-black tracking-tighter text-white font-mono leading-none">
                {time.s}
              </span>
              <span className="text-[10px] font-black text-slate-600 mt-2">SEC</span>
            </div>
          </div>

          <div className="max-w-md mx-auto h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 mb-4">
             <div 
               className="h-full bg-gradient-to-r from-cyan-400 to-magenta-500 transition-all duration-1000" 
               style={{ width: `${Math.min(100, (displaySeconds / data.dailyActive.targetSeconds) * 100)}%` }}
             />
          </div>
          <div className="flex justify-between max-w-md mx-auto text-[9px] font-black text-slate-600 uppercase tracking-widest">
            <span>Progress to daily goal</span>
            <span className="text-white">{Math.floor((displaySeconds / data.dailyActive.targetSeconds) * 100)}%</span>
          </div>
        </div>
      </section>

      {/* 2. MULTI-STREAK HUD */}
      <section className="px-8 mb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass p-6 rounded-[2rem] border-white/5 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 fill-orange-500" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Consistency</p>
              <h4 className="text-xl font-black text-white">{data.multiStreaks.consistency} DAYS</h4>
            </div>
          </div>
          <div className="glass p-6 rounded-[2rem] border-white/5 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Time</p>
              <h4 className="text-xl font-black text-white">{data.multiStreaks.activeMinutes} DAYS</h4>
            </div>
          </div>
          <div className="glass p-6 rounded-[2rem] border-white/5 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Recovery Balance</p>
              <h4 className="text-xl font-black text-white">{data.multiStreaks.recovery} SESSIONS</h4>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN ACTION HUB */}
      <div className="px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          
          {/* Resume Last Session */}
          {data.partialWorkout && (
            <div className="group relative glass p-8 rounded-[3rem] border-cyan-400/20 bg-cyan-400/5 overflow-hidden animate-in zoom-in duration-500">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <RotateCcw className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Resume Session</h3>
                <p className="text-slate-400 text-xs mb-6 font-medium max-w-xs leading-relaxed italic">
                  "{data.partialWorkout.plan.title}" interrupted at phase {data.partialWorkout.currentExIndex + 1}.
                </p>
                <button 
                  onClick={() => handleAction('resume')}
                  className="px-8 py-4 bg-cyan-400 text-black font-black rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-cyan-500/20"
                >
                  <Play className="w-4 h-4 fill-black" /> RESUME SIGNAL
                </button>
              </div>
            </div>
          )}

          {/* Quick Start Card */}
          <div className="glass p-10 rounded-[3rem] border-magenta-500/20 bg-magenta-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-48 h-48" />
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-magenta-500 rounded-xl flex items-center justify-center text-white">
                   <Award className="w-6 h-6" />
                 </div>
                 <span className="text-[10px] font-black uppercase text-magenta-400 tracking-widest">Recommended Protocol</span>
               </div>
               <h2 className="text-4xl font-black mb-4 tracking-tight uppercase leading-none">Start Adaptive Workout</h2>
               <p className="text-slate-400 text-sm max-w-sm mb-10 font-medium leading-relaxed italic">
                 Optimized for your current recovery of {recoveryScore}%. Synthesizing custom pathways based on biological drift.
               </p>
               <button 
                onClick={() => handleAction('start', 'PEAK')}
                disabled={!!loading}
                className="group relative px-10 py-5 bg-white text-black font-black rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-white/10"
              >
                {loading === 'start' ? <RefreshCw className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5 fill-black" />}
                INITIALIZE CORE FLOW
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Intent Sessions Grid */}
          <div className="space-y-6">
            <div className="flex justify-between items-end px-4">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Smart Sessions</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Goal-oriented adaptive training</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smartOptions.map((opt) => {
                const cost = SESSION_COSTS[opt.intent];
                const canAfford = data.tokens >= cost;
                return (
                  <button 
                    key={opt.id}
                    onClick={() => handleAction('smart', opt.intent)}
                    disabled={!!loading || !canAfford}
                    className="group relative glass p-8 rounded-[2.5rem] border-white/5 hover:border-white/20 text-left transition-all overflow-hidden flex flex-col justify-between min-h-[180px] disabled:opacity-40"
                  >
                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-${opt.color}-400`}>
                      <opt.icon className="w-20 h-20" />
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-6">
                         <span className="text-[8px] font-black px-2 py-1 bg-white/10 rounded tracking-widest border border-white/10">{opt.tag}</span>
                         {cost > 0 && (
                           <span className={`text-[10px] font-black flex items-center gap-1 ${canAfford ? 'text-cyan-400' : 'text-red-500'}`}>
                             <Sparkles className="w-3 h-3" /> {cost}
                           </span>
                         )}
                      </div>
                      <h4 className="text-xl font-black group-hover:text-white transition-colors">{opt.title}</h4>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest mt-6">
                       Initialize Focus <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Utilities */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Quick Train Utility */}
          <div className="glass p-8 rounded-[3rem] border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-black mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Quick Train</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-8 italic">"High-impact 10min calibration for low-equipment environments."</p>
            <button 
              onClick={() => handleAction('quick', 'STABILITY')}
              className="w-full py-4 bg-indigo-500 text-black font-black text-[10px] rounded-xl uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-indigo-500/20"
            >
              Start 10m Blitz
            </button>
          </div>

          {/* Recovery Center */}
          <div className="glass p-8 rounded-[3rem] border-green-500/20 bg-green-500/5">
            <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white mb-6">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Recovery Center</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-8 italic">"Nervous system reset sessions. Essential for streak longevity."</p>
            <button 
              onClick={() => handleAction('recovery', 'BREATH')}
              className="w-full py-4 bg-green-500 text-white font-black text-[10px] rounded-xl uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-green-500/20"
            >
              Start Breath Cycle
            </button>
          </div>

          {/* Custom Settings Builder */}
          <div className="glass p-8 rounded-[3rem] border-white/5 relative group cursor-pointer hover:border-white/20 transition-all" onClick={() => setShowCustomForm(!showCustomForm)}>
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <Settings2 className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Signal Preset</h3>
               </div>
               <ChevronRight className={`w-5 h-5 transition-transform ${showCustomForm ? 'rotate-90' : ''}`} />
            </div>
            
            {showCustomForm && (
              <div className="mt-8 space-y-6 animate-in slide-in-from-top-4 duration-300" onClick={e => e.stopPropagation()}>
                 <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Manual Intensity Focus</label>
                   <div className="grid grid-cols-2 gap-2">
                      {(['PEAK', 'STAMINA', 'STABILITY'] as SessionIntent[]).map(i => (
                        <button 
                          key={i} 
                          onClick={() => setCustomIntent(i)}
                          className={`py-3 rounded-xl text-[9px] font-black border transition-all ${customIntent === i ? 'bg-cyan-400 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-slate-400'}`}
                        >
                          {i}
                        </button>
                      ))}
                   </div>
                 </div>
                 <button 
                   onClick={() => handleAction('custom', customIntent)}
                   className="w-full py-4 bg-white text-black font-black text-[10px] rounded-xl uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-xl"
                 >
                   Forge Custom Flow
                 </button>
              </div>
            )}
          </div>

          {/* FlowBot Live Context */}
          <div className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Assistant Telemetry</h4>
            </div>
            <p className="text-[12px] text-slate-300 leading-relaxed font-medium italic">
              "You've been active for <span className="text-cyan-400 font-black">{Math.floor(displaySeconds/60)} minutes</span> today. Your biological drift suggests an 8-minute Stability cycle to maintain metabolic balance."
            </p>
            <div className="mt-2 p-3 bg-cyan-400/10 rounded-xl border border-cyan-400/20 flex items-center gap-3">
               <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
               <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">Active minutes reset in 8h 12m</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrainHub;
