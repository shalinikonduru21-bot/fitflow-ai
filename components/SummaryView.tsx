
import React, { useState } from 'react';
import { storage } from '../services/storageService';
import { 
  Trophy, Coins, Star, Share2, Home, MessageSquare, 
  Check, Users, Sparkles, ChevronRight, CheckCircle 
} from 'lucide-react';
import { WorkoutRecord, ActivityUpdate } from '../types';
import { voiceService } from '../services/voiceService';

interface SummaryProps {
  onHome: () => void;
}

const SummaryView: React.FC<SummaryProps> = ({ onHome }) => {
  const [reflection, setReflection] = useState('');
  const [score, setScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const handleShareReflection = () => {
    if (!reflection.trim()) return;
    
    const data = storage.get();
    const newFeedItem: ActivityUpdate = {
      id: Math.random().toString(36).substr(2, 9),
      userName: 'You',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FitFlow',
      type: 'reflection',
      detail: `Shared a neural reflection: "${reflection}"`,
      timestamp: Date.now(),
      reactions: {}
    };

    storage.save({
      social: {
        ...data.social,
        feed: [newFeedItem, ...data.social.feed]
      }
    });

    setIsShared(true);
    voiceService.speak("Reflection shared with your circle.");
  };

  const handleSubmitReflection = () => {
    const data = storage.get();
    
    // Save Reflection locally
    const newReflections = [...data.reflections, { date: new Date().toISOString(), score, note: reflection }];
    storage.save({ reflections: newReflections });
    
    // Save Workout Data
    const plan = data.workoutPlan;
    if (plan) {
        // Fix: Added missing completedPercent property to satisfy WorkoutRecord interface
        const record: WorkoutRecord = {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            title: plan.title,
            intent: plan.intent,
            duration: plan.totalDuration || 20,
            reps: 25 + Math.floor(Math.random() * 50),
            avgFormQuality: 85 + Math.floor(Math.random() * 10),
            cleanReps: 20 + Math.floor(Math.random() * 30),
            rushedReps: 2 + Math.floor(Math.random() * 5),
            unsafeReps: 0 + Math.floor(Math.random() * 2),
            tokensEarned: 15,
            completedPercent: 100
        };
        storage.saveWorkout(record);
        storage.addCoins(50);
        // Fix: Call storage.addTokens which is now implemented in storageService.ts.
        storage.addTokens(15);
    }

    setIsSubmitted(true);
    voiceService.speak("Calibration data persisted successfully.");
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950 custom-scrollbar pb-32">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="relative mt-12 mb-16">
          <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-magenta-500 rounded-full flex items-center justify-center text-6xl shadow-[0_0_80px_rgba(0,255,255,0.4)] relative z-10 animate-bounce">
            🔥
          </div>
          <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-150 animate-pulse" />
        </div>

        <h1 className="text-6xl font-black mb-4 tracking-tighter text-center uppercase text-white">Phase Complete</h1>
        <p className="text-xl text-slate-400 mb-12 max-w-md font-medium leading-relaxed italic text-center">
          "Systemic output optimized. Neural and physiological markers anchored."
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-16">
          <div className="glass p-6 rounded-[2rem] flex flex-col items-center text-center border-white/5">
            <Coins className="text-yellow-500 w-6 h-6 mb-3" />
            <span className="text-[9px] text-slate-500 font-black uppercase block mb-1">FitCoins</span>
            <span className="text-2xl font-black text-white">+50</span>
          </div>
          <div className="glass p-6 rounded-[2rem] flex flex-col items-center text-center border-white/5">
            <Star className="text-cyan-400 w-6 h-6 mb-3" />
            <span className="text-[9px] text-slate-500 font-black uppercase block mb-1">Quality</span>
            <span className="text-2xl font-black text-white">94%</span>
          </div>
          <div className="glass p-6 rounded-[2rem] flex flex-col items-center text-center border-white/5">
            <Trophy className="text-magenta-400 w-6 h-6 mb-3" />
            <span className="text-[9px] text-slate-500 font-black uppercase block mb-1">XP Earned</span>
            <span className="text-2xl font-black text-white">+1.5k</span>
          </div>
          <div className="glass p-6 rounded-[2rem] flex flex-col items-center text-center border-white/5">
            <Sparkles className="text-yellow-400 w-6 h-6 mb-3" />
            <span className="text-[9px] text-slate-500 font-black uppercase block mb-1">Tokens</span>
            <span className="text-2xl font-black text-white">+15</span>
          </div>
        </div>

        {/* Cognitive Reflection & Social Share Module */}
        <div className="w-full glass p-10 rounded-[3rem] border-white/10 mb-12">
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Post-Session Reflection</h3>
                <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-widest">Subjective Effort Calibration</p>
              </div>
           </div>

           {!isSubmitted ? (
             <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Perceived Exertion (1-10)</label>
                  <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar py-2">
                    {[1,2,3,4,5,6,7,8,9,10].map(val => (
                      <button 
                        key={val} 
                        onClick={() => setScore(val)}
                        className={`min-w-[40px] flex-1 py-3 rounded-xl border font-black text-sm transition-all ${score === val ? 'bg-cyan-400 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Brief Reflection (Optional)</label>
                  <textarea 
                    value={reflection}
                    onChange={e => setReflection(e.target.value)}
                    placeholder="e.g., Focus was high, but left knee felt slightly unstable..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm outline-none focus:border-cyan-500/50 min-h-[120px] transition-all text-white"
                  />
                </div>
                <button 
                  onClick={handleSubmitReflection}
                  disabled={score === 0}
                  className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  SAVE TELEMETRY
                </button>
             </div>
           ) : (
             <div className="flex flex-col items-center text-center animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6 border border-green-500/20">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black mb-2 uppercase text-white">Insight Anchored</h4>
                
                {reflection.trim() && !isShared && (
                  <div className="mt-8 p-6 bg-cyan-400/5 rounded-[2rem] border border-cyan-400/20 w-full animate-in slide-in-from-bottom-4">
                     <p className="text-xs text-slate-400 font-medium mb-6 italic">"Sharing reflections with your circle reinforces accountability and emotional alignment."</p>
                     <button 
                       onClick={handleShareReflection}
                       className="w-full py-4 bg-cyan-400 text-black font-black text-[10px] rounded-xl uppercase tracking-widest flex items-center justify-center gap-2"
                     >
                       <Users className="w-4 h-4" /> Share with Circle
                     </button>
                  </div>
                )}

                {isShared && (
                  <div className="mt-6 flex items-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-widest animate-in fade-in">
                     <CheckCircle className="w-4 h-4" /> Reflection Shared Globally
                  </div>
                )}
             </div>
           )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button 
            onClick={onHome}
            className="flex-1 py-6 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            <Home className="w-5 h-5" /> HOME BASE
          </button>
          <button 
            className="flex-1 py-6 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-3 border border-white/5 hover:bg-slate-800 transition-all"
          >
            <Share2 className="w-5 h-5" /> EXPORT STATUS
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
