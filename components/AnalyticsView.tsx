import React, { useState, useMemo } from 'react';
import { 
  BarChart2, TrendingUp, Calendar, Zap, Target, 
  Award, Clock, Sparkles, ChevronRight, Info,
  Flame, Heart, ShieldCheck, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { storage } from '../services/storageService';
import { WorkoutRecord, SessionIntent } from '../types';

const AnalyticsView: React.FC = () => {
  const data = storage.get();
  const history = data.workoutHistory;
  const [activeTab, setActiveTab] = useState<'overview' | 'form' | 'sessions' | 'achievements'>('overview');

  const stats = useMemo(() => {
    const totalDuration = history.reduce((acc, curr) => acc + curr.duration, 0);
    const avgForm = history.length > 0 
      ? Math.round(history.reduce((acc, curr) => acc + curr.avgFormQuality, 0) / history.length) 
      : 0;
    const totalReps = history.reduce((acc, curr) => acc + curr.reps, 0);
    const lifetimeTokens = history.reduce((acc, curr) => acc + curr.tokensEarned, 0);
    
    const intentCounts = history.reduce((acc, curr) => {
      acc[curr.intent] = (acc[curr.intent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalDuration, avgForm, totalReps, lifetimeTokens, intentCounts };
  }, [history]);

  // Chart Rendering Helpers
  const renderLineChart = (data: number[], label: string, color: string) => {
    if (data.length < 2) return (
      <div className="h-40 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Insufficient Data for Trending</p>
      </div>
    );

    const max = Math.max(...data, 100);
    const min = Math.min(...data, 0);
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / (max - min)) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative h-40 w-full mt-4">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
            className="drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
          />
          {data.map((val, i) => (
             <circle 
               key={i} 
               cx={(i / (data.length - 1)) * 100} 
               cy = {100 - ((val - min) / (max - min)) * 100} 
               r="1.5" 
               fill={color} 
             />
          ))}
        </svg>
      </div>
    );
  };

  const renderIntentBar = (intent: SessionIntent, color: string) => {
    const count = stats.intentCounts[intent] || 0;
    const percentage = history.length > 0 ? (count / history.length) * 100 : 0;
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase">
          <span className="text-slate-400">{intent}</span>
          <span className="text-white">{count} sessions</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full bg-${color}-400 transition-all duration-1000 shadow-[0_0_10px_rgba(0,255,255,0.3)]`} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  };

  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#050505]">
        <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-white/10 group hover:scale-110 transition-all">
          <BarChart2 className="w-10 h-10 text-slate-700 group-hover:text-cyan-400 transition-colors" />
        </div>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Neural Data Missing</h2>
        <p className="text-slate-500 max-w-sm font-medium leading-relaxed italic mb-8">
          "The performance engine requires at least one completed session to initialize analytics telemetry."
        </p>
        <button 
          onClick={() => window.location.hash = 'train'} // Fallback navigation logic
          className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
        >
          START INITIAL SESSION
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#050505] pb-32 custom-scrollbar p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white uppercase mb-2">Analytics Hub</h1>
            <p className="text-slate-500 font-medium">Deriving intelligence from {history.length} performance cycles.</p>
          </div>
          <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
            {[
                { id: 'overview', label: 'Overview', icon: Target },
                { id: 'form', label: 'Form', icon: ShieldCheck },
                { id: 'sessions', label: 'Intelligence', icon: Zap },
                { id: 'achievements', label: 'Milestones', icon: Award },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20' : 'text-slate-500 hover:text-white'}`}
                >
                    <tab.icon className="w-3 h-3" /> {tab.label}
                </button>
            ))}
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass p-8 rounded-[2.5rem] border-white/10 flex flex-col items-center text-center group">
                 <Clock className="text-cyan-400 w-6 h-6 mb-4 group-hover:scale-110 transition-transform" />
                 <span className="text-3xl font-black text-white">{stats.totalDuration}</span>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Minutes</span>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-white/10 flex flex-col items-center text-center group">
                 <Flame className="text-orange-500 w-6 h-6 mb-4 group-hover:scale-110 transition-transform" />
                 <span className="text-3xl font-black text-white">{data.streak}</span>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Current Streak</span>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-white/10 flex flex-col items-center text-center group">
                 <TrendingUp className="text-magenta-400 w-6 h-6 mb-4 group-hover:scale-110 transition-transform" />
                 <span className="text-3xl font-black text-white">{stats.totalReps}</span>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Lifetime Reps</span>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-white/10 flex flex-col items-center text-center group">
                 <Sparkles className="text-yellow-400 w-6 h-6 mb-4 group-hover:scale-110 transition-transform" />
                 <span className="text-3xl font-black text-white">{stats.lifetimeTokens.toLocaleString()}</span>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Earned</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Consistency Section */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="glass p-10 rounded-[3rem] border-white/10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">Consistency Vector</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Last 7 Performance Cycles</p>
                            </div>
                            <Calendar className="text-slate-700 w-6 h-6" />
                        </div>
                        {renderLineChart(history.slice(0, 7).reverse().map(h => h.reps), 'Volume', '#22d3ee')}
                        <div className="mt-8 flex items-center gap-4 bg-cyan-400/5 p-5 rounded-2xl border border-cyan-400/20">
                            <Info className="text-cyan-400 w-5 h-5 flex-shrink-0" />
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                "Volume density has stabilized. You train most consistently on {new Date(history[0].date).toLocaleDateString('en-US', { weekday: 'long' })}s."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Insight Sidebar */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="p-8 bg-slate-900/50 rounded-[2.5rem] border border-white/5">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">AI Performance Insight</h4>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400 flex-shrink-0">
                                    <Target className="w-5 h-5" />
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                    Your form score is currently <span className="text-cyan-400">8% higher</span> than the platform baseline for your age group.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-magenta-500/10 rounded-xl flex items-center justify-center text-magenta-400 flex-shrink-0">
                                    <Heart className="w-5 h-5" />
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                    Recovery sessions are used effectively. Your efficiency climbs after every <span className="text-magenta-400">BREATH</span> session.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-8 rounded-[2.5rem] border-white/10">
                         <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Lifetime Milestones</span>
                         <div className="mt-6 flex flex-wrap gap-3">
                             {data.badges.map((badge, i) => (
                                 <div key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-300">
                                     {badge}
                                 </div>
                             ))}
                             <button className="px-4 py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-xl text-[10px] font-black uppercase text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all">
                                 View All
                             </button>
                         </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="glass p-10 rounded-[3rem] border-white/10">
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Form Quality Trend</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-10">Historical accuracy thresholds</p>
                    {renderLineChart(history.slice(0, 10).reverse().map(h => h.avgFormQuality), 'Form', '#facc15')}
                    <div className="grid grid-cols-3 gap-4 mt-12">
                         <div className="text-center">
                             <p className="text-[9px] text-slate-500 font-black uppercase">AVERAGE</p>
                             <p className="text-2xl font-black text-white">{stats.avgForm}%</p>
                         </div>
                         <div className="text-center">
                             <p className="text-[9px] text-slate-500 font-black uppercase">PEAK</p>
                             <p className="text-2xl font-black text-cyan-400">{Math.max(...history.map(h => h.avgFormQuality))}%</p>
                         </div>
                         <div className="text-center">
                             <p className="text-[9px] text-slate-500 font-black uppercase">DELTA</p>
                             <p className="text-2xl font-black text-green-400">+{Math.max(0, history[0].avgFormQuality - stats.avgForm)}%</p>
                         </div>
                    </div>
                </div>

                <div className="glass p-10 rounded-[3rem] border-white/10">
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Rep Intelligence</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-10">Movement quality distribution</p>
                    <div className="space-y-8">
                        {(() => {
                            const total = history.reduce((acc, curr) => acc + curr.reps, 0);
                            const clean = history.reduce((acc, curr) => acc + curr.cleanReps, 0);
                            const rushed = history.reduce((acc, curr) => acc + curr.rushedReps, 0);
                            const unsafe = history.reduce((acc, curr) => acc + curr.unsafeReps, 0);
                            
                            return (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase">
                                            <span className="text-cyan-400">Clean Reps</span>
                                            <span className="text-slate-500">{Math.round((clean/total)*100)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-cyan-400" style={{ width: `${(clean/total)*100}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase">
                                            <span className="text-yellow-400">Rushed / Low Control</span>
                                            <span className="text-slate-500">{Math.round((rushed/total)*100)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-400" style={{ width: `${(rushed/total)*100}%` }} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase">
                                            <span className="text-red-500">Unsafe Thresholds</span>
                                            <span className="text-slate-500">{Math.round((unsafe/total)*100)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${(unsafe/total)*100}%` }} />
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                    <p className="mt-12 text-[11px] text-slate-500 leading-relaxed italic text-center">
                        "Your <span className="text-cyan-400">STABILITY</span> sessions are significantly reducing unsafe rep counts."
                    </p>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="glass p-10 rounded-[3rem] border-white/10">
                 <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Performance Intent Breakdown</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-8">
                        {renderIntentBar('PEAK', 'cyan')}
                        {renderIntentBar('STAMINA', 'magenta')}
                        {renderIntentBar('STABILITY', 'indigo')}
                        {renderIntentBar('BREATH', 'green')}
                     </div>
                     <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex flex-col justify-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Dominant Intent</span>
                        <h4 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
                           {/* Fix arithmetic operation by explicitly casting Object.entries values to number */}
                           {Object.entries(stats.intentCounts).sort((a: [string, any], b: [string, any]) => (b[1] as number) - (a[1] as number))[0][0]}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                            "You prioritize systemic load. Consider increasing BREATH sessions to prevent metabolic overreach and stabilize form scores."
                        </p>
                     </div>
                 </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {history.slice(0, 6).map((rec, i) => (
                     <div key={rec.id} className="glass p-6 rounded-[2rem] border-white/5 group hover:border-white/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[8px] font-black px-2 py-1 bg-white/10 rounded tracking-widest text-slate-400 uppercase">{rec.intent}</span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase">{new Date(rec.date).toLocaleDateString()}</span>
                        </div>
                        <h5 className="font-black text-white text-lg group-hover:text-cyan-400 transition-colors mb-4">{rec.title}</h5>
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-500 uppercase">Efficiency</span>
                                <span className="text-xl font-black text-white">{rec.avgFormQuality}%</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-slate-500 uppercase">Volume</span>
                                <span className="text-xl font-black text-white">{rec.reps} Reps</span>
                            </div>
                        </div>
                     </div>
                 ))}
             </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[
                    { title: 'First Step', desc: 'Initialize your first AI cycle.', icon: Zap, unlocked: true },
                    { title: 'Form King', desc: '95%+ average form quality in a session.', icon: Award, unlocked: stats.avgForm >= 90 },
                    { title: 'Consistency Pro', desc: 'Maintain a 7-day performance streak.', icon: Flame, unlocked: data.streak >= 7 },
                    { title: 'Volume Master', desc: 'Complete 1,000 lifetime reps.', icon: Target, unlocked: stats.totalReps >= 1000 },
                    { title: 'Balanced Soul', desc: 'Complete sessions in all 4 intents.', icon: Heart, unlocked: Object.keys(stats.intentCounts).length === 4 },
                    { title: 'Early Bird', desc: 'Start a session before 8:00 AM.', icon: Clock, unlocked: history.some(h => new Date(h.date).getHours() < 8) },
                    { title: 'Form Streak', desc: '5 clean reps in a row.', icon: ShieldCheck, unlocked: true },
                    { title: 'Recovery God', desc: 'Complete 5 BREATH sessions.', icon: Sparkles, unlocked: (stats.intentCounts['BREATH'] || 0) >= 5 },
                ].map((badge, i) => (
                    <div key={i} className={`glass p-6 rounded-[2.5rem] flex flex-col items-center text-center border-white/5 transition-all group ${!badge.unlocked ? 'opacity-30 grayscale' : 'hover:border-cyan-400/30'}`}>
                         <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-4 transition-all ${badge.unlocked ? 'bg-cyan-400/10 text-cyan-400 group-hover:scale-110' : 'bg-white/5 text-slate-700'}`}>
                            <badge.icon className="w-8 h-8" />
                         </div>
                         <h5 className="font-black text-sm uppercase tracking-tight text-white mb-1 leading-tight">{badge.title}</h5>
                         <p className="text-[10px] text-slate-500 leading-tight">{badge.desc}</p>
                         {badge.unlocked && <CheckCircle2 className="w-4 h-4 text-green-500 mt-4" />}
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsView;