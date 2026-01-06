
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { Sparkles, Target, RefreshCcw, Trophy, Check } from 'lucide-react';

export const DailyRoulette = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const data = storage.get();

  const spin = () => {
    if (spinning || data.challenges.spinCompleted) return;
    if (data.coins < 10) return alert("Need 10 FitCoins to spin!");
    
    storage.addCoins(-10);
    setSpinning(true);
    
    setTimeout(() => {
      const prizes = ["50 FitCoins", "Streak Freeze", "Double XP", "100 FitCoins", "Exclusive Badge"];
      const win = prizes[Math.floor(Math.random() * prizes.length)];
      setResult(win);
      setSpinning(false);
      
      const newChallenges = { ...data.challenges, spinCompleted: true };
      storage.save({ challenges: newChallenges });
      
      if (win.includes("FitCoins")) {
        storage.addCoins(parseInt(win));
      }
    }, 4000);
  };

  return (
    <div className="glass p-6 rounded-[2rem] relative overflow-hidden h-full flex flex-col items-center text-center group">
      <div className={`w-32 h-32 rounded-full border-4 border-cyan-500/30 flex items-center justify-center transition-all duration-[4s] ${spinning ? 'spin-anim rotate-[3600deg]' : ''} relative`}>
        <div className="absolute top-0 w-2 h-6 bg-cyan-400 rounded-full -translate-y-2 z-10" />
        <Sparkles className="text-cyan-400 w-12 h-12 group-hover:scale-110 transition-transform" />
      </div>
      
      <h3 className="text-xl font-black mt-6 tracking-tight">Fitness Roulette</h3>
      <p className="text-slate-500 text-xs mb-6 font-medium">One spin per day. Resets at midnight.</p>
      
      {result ? (
        <div className="animate-in zoom-in duration-500 text-cyan-400 font-black text-lg">
          WINNER: {result.toUpperCase()}
        </div>
      ) : (
        <button 
          onClick={spin}
          disabled={spinning || data.challenges.spinCompleted}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
            ${data.challenges.spinCompleted 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-cyan-500 text-black hover:scale-105 active:scale-95 shadow-xl shadow-cyan-500/20'}
          `}
        >
          {spinning ? 'SPINNING...' : data.challenges.spinCompleted ? 'COMPLETED ✓' : 'SPIN FOR 10 COINS'}
        </button>
      )}
    </div>
  );
};

export const FitnessBingo = () => {
  const [data, setData] = useState(storage.get());
  
  const tasks = [
    "Morning Session", "50 Squats", "Perfect Form", "Try New", "Share XP",
    "Streak Save", "Night Owl", "Burn 200", "Full Body", "Hydrate",
    "Kudos Given", "Blitz Hero", "Record Set", "3-Day Streak", "Zen Mode",
    "Leg Day", "Push Pro", "Core King", "Yoga Flow", "Power Set",
    "Elite Form", "Social Hub", "Store Buy", "Profile Pic", "Level Up"
  ];

  const toggleCell = (idx: number) => {
    const newBingo = [...data.challenges.bingoProgress];
    newBingo[idx] = !newBingo[idx];
    const updated = storage.save({ 
      challenges: { ...data.challenges, bingoProgress: newBingo } 
    });
    setData(updated);
    if (newBingo[idx]) storage.addCoins(20);
  };

  return (
    <div className="glass p-8 rounded-[2rem] h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <Target className="text-magenta-400" /> Weekly Bingo
          </h3>
          <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">Complete lines for 1000 FitCoins</p>
        </div>
        <div className="bg-magenta-500/10 text-magenta-400 px-4 py-2 rounded-xl text-xs font-black">
          {data.challenges.bingoProgress.filter(b => b).length}/25
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-2 flex-1">
        {tasks.map((task, i) => (
          <button
            key={i}
            onClick={() => toggleCell(i)}
            className={`aspect-square rounded-xl text-[9px] font-black transition-all flex items-center justify-center text-center p-2 leading-tight uppercase
              ${data.challenges.bingoProgress[i] 
                ? 'bg-gradient-to-br from-cyan-400 to-magenta-400 text-black shadow-lg shadow-magenta-500/20' 
                : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white border border-white/5'}
            `}
          >
            {data.challenges.bingoProgress[i] ? <Check className="w-4 h-4" /> : task}
          </button>
        ))}
      </div>
    </div>
  );
};

export const BlitzChallenge = ({ onStart }: { onStart: () => void }) => {
  const data = storage.get();
  
  return (
    <div className="glass p-8 rounded-[2rem] bg-gradient-to-br from-indigo-950/20 to-slate-900 border-indigo-500/20 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
      <h3 className="text-2xl font-black text-indigo-300 flex items-center gap-3 mb-4">
        <RefreshCcw className="w-6 h-6" /> 60s Blitz Challenge
      </h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">Push your limits! Complete as many reps as possible in 60 seconds. Top 10% earn 200 FitCoins.</p>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-black uppercase">Best Score</span>
          <span className="text-2xl font-black text-white">42 REPS</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-black uppercase">Attempts Left</span>
          <span className="text-2xl font-black text-indigo-400">{data.challenges.blitzAttempts}/3</span>
        </div>
      </div>

      <button 
        onClick={onStart}
        disabled={data.challenges.blitzAttempts === 0}
        className="w-full py-5 bg-indigo-500 text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ENTER THE BLITZ
      </button>
    </div>
  );
};
