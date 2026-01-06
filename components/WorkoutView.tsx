
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PoseAnalysis, WorkoutPlan, RepQuality, Exercise, PartialWorkout } from '../types';
import PoseCanvas from './PoseCanvas';
import { voiceService } from '../services/voiceService';
import { storage } from '../services/storageService';
import { Info, AlertTriangle, CheckCircle, ChevronRight, Pause, Play, LogOut, SkipForward, Sparkles, Layers, Timer } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface WorkoutViewProps {
  plan: WorkoutPlan;
  profile: any;
  resumeData?: PartialWorkout | null;
  onComplete: () => void;
  onExit: () => void;
}

const WorkoutView: React.FC<WorkoutViewProps> = ({ plan, profile, resumeData, onComplete, onExit }) => {
  const [currentExIndex, setCurrentExIndex] = useState(resumeData?.currentExIndex || 0);
  const [currentSet, setCurrentSet] = useState(resumeData?.currentSet || 1);
  const [analysis, setAnalysis] = useState<PoseAnalysis | null>(null);
  const [showAdaptation, setShowAdaptation] = useState(true);
  const [repHistory, setRepHistory] = useState<RepQuality[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [adaptationEvent, setAdaptationEvent] = useState<string | null>(null);
  const [totalRepsDone, setTotalRepsDone] = useState(resumeData?.totalRepsDone || 0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  
  const lastSpeakTimeRef = useRef<number>(0);
  const repsAtStartOfSetRef = useRef<number>(0);
  
  // Timer Logic: Sync with Global Active Time
  useEffect(() => {
    let interval: any;
    if (!isPaused) {
      interval = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
        storage.addActiveSeconds(1); // Real-time global update
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  const baseExercise = plan.exercises[currentExIndex];

  const currentExercise = useMemo((): Exercise => {
    if (!baseExercise.variations || baseExercise.variations.length === 0) return baseExercise;
    const availableVariations = baseExercise.variations.filter(v => 
      !v.equipmentRequired || profile.equipment.includes(v.equipmentRequired)
    );
    if (availableVariations.length === 0) return baseExercise;
    const rotationIndex = (currentSet - 1) % (availableVariations.length + 1);
    if (rotationIndex === 0) return baseExercise;
    const variation = availableVariations[rotationIndex - 1];
    return { ...baseExercise, name: variation.name, description: variation.description };
  }, [baseExercise, currentSet, profile.equipment]);

  useEffect(() => {
    const saveProgress = () => {
      storage.save({
        partialWorkout: {
          plan,
          currentExIndex,
          currentSet,
          totalRepsDone,
          timestamp: Date.now(),
          tokenCost: resumeData?.tokenCost
        }
      });
    };
    const interval = setInterval(saveProgress, 5000);
    return () => clearInterval(interval);
  }, [plan, currentExIndex, currentSet, totalRepsDone]);

  useEffect(() => {
    if (analysis && analysis.formQuality < 75 && !adaptationEvent) {
      if (plan.intent === 'STAMINA') {
        setAdaptationEvent("Form threshold deficit: Adding 15s recovery buffer.");
        voiceService.speak("Quality declining. Adding recovery interval.");
      } else if (plan.intent === 'STABILITY') {
        setAdaptationEvent("Micro-instability detected: Adjusting tempo thresholds.");
        voiceService.speak("Slow down. Prioritize spinal neutrality.");
      }
    }
  }, [analysis, plan.intent, adaptationEvent]);

  const handleAnalysis = (data: PoseAnalysis) => {
    if (isPaused) return;
    setAnalysis(data);
    const repsInThisSet = data.repCount - repsAtStartOfSetRef.current;
    if (!data.isSafe && Date.now() - lastSpeakTimeRef.current > 4000) {
      voiceService.speak("Safety Shield Active. Realignment required.", true);
      lastSpeakTimeRef.current = Date.now();
    }
    if (repsInThisSet > repHistory.length) {
      const quality = data.lastRepQuality || 'clean';
      setRepHistory(prev => [...prev, quality]);
      setTotalRepsDone(prev => prev + 1);
      if (quality === 'clean') voiceService.speak("Form optimal.");
      else if (quality === 'rushed') voiceService.speak("Rushed movement. Control your descent.");
    }
    if (repsInThisSet >= currentExercise.reps) {
      if (currentSet < baseExercise.sets) {
        voiceService.speak(`Set ${currentSet} complete. Prepare for Set ${currentSet + 1}.`);
        setCurrentSet(prev => prev + 1);
        repsAtStartOfSetRef.current = data.repCount;
        setRepHistory([]);
        setAdaptationEvent(null);
      } else if (currentExIndex < plan.exercises.length - 1) {
        voiceService.speak("Movement phase verified. Calibrating next trajectory.");
        setCurrentExIndex(prev => prev + 1);
        setCurrentSet(1);
        repsAtStartOfSetRef.current = data.repCount;
        setRepHistory([]);
        setAdaptationEvent(null);
      } else {
        // Workout Finished
        const record = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          title: plan.title,
          intent: plan.intent,
          duration: Math.floor(sessionSeconds / 60),
          reps: totalRepsDone,
          avgFormQuality: 92, // Logic placeholder
          cleanReps: totalRepsDone, 
          rushedReps: 0,
          unsafeReps: 0,
          tokensEarned: 20,
          completedPercent: 100
        };
        storage.saveWorkout(record as any, resumeData?.tokenCost);
        onComplete();
      }
    }
  };

  const handleManualExit = () => {
    const percent = Math.round((currentExIndex / plan.exercises.length) * 100);
    const record = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      title: plan.title,
      intent: plan.intent,
      duration: Math.floor(sessionSeconds / 60),
      reps: totalRepsDone,
      avgFormQuality: 85,
      cleanReps: totalRepsDone,
      rushedReps: 0,
      unsafeReps: 0,
      tokensEarned: Math.floor(percent / 5),
      completedPercent: percent
    };
    storage.saveWorkout(record as any, resumeData?.tokenCost);
    onExit();
  };

  const skipExercise = () => {
    if (currentExIndex < plan.exercises.length - 1) {
      setCurrentExIndex(prev => prev + 1);
      setCurrentSet(1);
      setRepHistory([]);
      setIsPaused(false);
    } else {
      onComplete();
    }
  };

  const formatSessionTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const intentColor = { PEAK: 'cyan', STAMINA: 'magenta', STABILITY: 'indigo', BREATH: 'green' }[plan.intent || 'PEAK'];
  const repsInThisSet = analysis ? analysis.repCount - repsAtStartOfSetRef.current : 0;

  return (
    <div className="flex-1 flex bg-slate-950 overflow-hidden relative">
      <div className="flex-[7.5] p-6 flex flex-col relative">
        <header className="flex justify-between items-center mb-6 px-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsPaused(true)}
                className={`p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-${intentColor}-400 border border-white/5`}
              >
                <Pause className={`w-5 h-5 fill-${intentColor}-400`} />
              </button>
              <div className="flex flex-col">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
                  {currentExercise.name}
                  <span className={`px-2 py-1 rounded bg-${intentColor}-500/20 text-${intentColor}-400 text-[10px] font-black uppercase`}>
                    {plan.intent}
                  </span>
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Set {currentSet} of {baseExercise.sets}</span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Timer className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{formatSessionTime(sessionSeconds)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-5xl sm:text-7xl font-black text-white leading-none">{repsInThisSet}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Rep Focus</div>
          </div>
        </header>

        <div className="flex-1 relative">
           <PoseCanvas onAnalysis={handleAnalysis} exercise={currentExercise} />
           {adaptationEvent && (
             <div className={`absolute top-10 left-10 right-10 z-[60] bg-${intentColor}-500 text-black p-6 rounded-[2rem] flex items-center justify-between shadow-2xl animate-in slide-in-from-top-4`}>
                <div className="flex items-center gap-4">
                  <Sparkles className="w-8 h-8" />
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest opacity-70">Adaptive Optimization</h4>
                    <p className="font-bold text-lg leading-tight italic">"{adaptationEvent}"</p>
                  </div>
                </div>
                <button onClick={() => setAdaptationEvent(null)} className="p-2 hover:bg-black/10 rounded-full transition-all">
                   <ChevronRight className="w-6 h-6" />
                </button>
             </div>
           )}
        </div>

        <div className="mt-6 flex gap-4">
           <div className={`flex-1 p-6 rounded-3xl border transition-all duration-500 flex items-center gap-4 ${analysis?.isSafe ? `bg-${intentColor}-500/5 border-${intentColor}-500/20` : 'bg-red-500/10 border-red-500/30'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${analysis?.isSafe ? `bg-${intentColor}-500/20 text-${intentColor}-400` : 'bg-red-500/20 text-red-500'}`}>
                 {analysis?.isSafe ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6 animate-pulse" />}
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Biological Shield</p>
                 <p className="text-lg font-bold">{analysis?.isSafe ? 'Alignment Optimal' : 'Critical Drift Detected'}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-[2.5] glass border-l border-white/10 p-8 flex-col gap-8">
        <section>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Live Telemetry</h3>
          <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Session Integrity</span>
            <div className={`text-3xl font-black text-${intentColor}-400 mt-1`}>{analysis?.formQuality || 0}%</div>
            <div className="w-full h-1.5 bg-white/5 mt-4 rounded-full overflow-hidden">
               <div className={`h-full bg-${intentColor}-400`} style={{ width: `${analysis?.formQuality || 0}%` }} />
            </div>
          </div>
        </section>

        {showAdaptation && (
          <section className="animate-in fade-in slide-in-from-right-4 duration-500">
             <div className={`bg-gradient-to-br from-${intentColor}-400 to-${intentColor}-600 p-8 rounded-[2.5rem] text-black shadow-xl`}>
                <h4 className="text-[10px] font-black uppercase mb-3 opacity-70">Adaptive Logic</h4>
                <p className="text-base font-bold leading-tight italic">"{plan.aiInsight}"</p>
                <div className="mt-6 space-y-2">
                   <p className="text-[8px] font-black uppercase opacity-60">Strategy Protocol</p>
                   <p className="text-xs font-medium leading-relaxed">{plan.adaptationRules}</p>
                </div>
             </div>
          </section>
        )}

        <section className="mt-auto p-6 bg-slate-900/50 rounded-3xl border border-white/5 backdrop-blur-sm">
           <span className="text-[10px] text-slate-500 font-black block mb-4 uppercase tracking-widest">Session Vault</span>
           <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300">Phase Active</span>
              <span className={`px-3 py-1 bg-${intentColor}-500/10 text-${intentColor}-400 text-[10px] font-black rounded-lg uppercase`}>{plan.intent}</span>
           </div>
        </section>
      </div>

      {isPaused && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="w-full max-md p-10 flex flex-col items-center text-center animate-in zoom-in duration-300">
            <div className={`w-20 h-20 bg-${intentColor}-400 rounded-3xl flex items-center justify-center text-black mb-8 shadow-2xl shadow-${intentColor}-500/20`}>
              <Pause className="w-10 h-10 fill-black" />
            </div>
            <h2 className="text-5xl font-black mb-2 tracking-tighter uppercase">Signal Paused</h2>
            <p className="text-slate-400 font-medium mb-12 max-w-sm">Performance tracking state preserved. Deep biological reset active.</p>
            <div className="flex flex-col w-full gap-4 max-w-sm">
              <button onClick={() => setIsPaused(false)} className={`w-full py-6 bg-${intentColor}-400 text-black font-black rounded-[2rem] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl`}>
                <Play className="w-5 h-5 fill-black" /> RESUME FLOW
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={skipExercise} className="py-5 bg-white/5 text-slate-300 font-black rounded-2xl flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 transition-all">
                  <SkipForward className="w-4 h-4" /> SKIP
                </button>
                <button onClick={() => setIsExitModalOpen(true)} className="py-5 bg-red-500/10 text-red-400 font-black rounded-2xl flex items-center justify-center gap-2 border border-red-500/20 hover:bg-red-500/20 transition-all">
                  <LogOut className="w-4 h-4" /> EXIT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={isExitModalOpen}
        title="Abort Adaptive Session?"
        message={`Ending this ${plan.intent} session early. Physiological marker progress will be saved. Refund logic applied for sessions <20% complete.`}
        confirmText="Confirm Exit"
        cancelText="Resume Session"
        onConfirm={handleManualExit}
        onCancel={() => setIsExitModalOpen(false)}
      />
    </div>
  );
};

export default WorkoutView;
