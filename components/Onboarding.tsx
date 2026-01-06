
import React, { useState } from 'react';
import { Sparkles, ChevronRight, ShieldCheck, Heart, Zap } from 'lucide-react';

const slides = [
  {
    title: "AI Vision for Perfect Form",
    description: "Our advanced computer vision tracks 33 points on your body to ensure every rep is performed safely and effectively.",
    image: "https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&q=80&w=1000",
    icon: Zap,
    color: "cyan"
  },
  {
    title: "Personalized Coaching",
    description: "Gemini-powered intelligence creates routines tailored to your medical needs, injuries, and specific fitness goals.",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=1000",
    icon: Sparkles,
    color: "magenta"
  },
  {
    title: "Real-time Voice Feedback",
    description: "Never look at the screen again. Fit Flow AI speaks corrections directly to you, just like a personal trainer by your side.",
    image: "https://images.unsplash.com/photo-1543975200-8e313fb04f43?auto=format&fit=crop&q=80&w=1000",
    icon: Heart,
    color: "orange"
  }
];

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [view, setView] = useState<'intro' | 'slides'>('intro');
  const [currentSlide, setCurrentSlide] = useState(0);

  const FlowBotMascot = () => (
    <div className="relative w-48 h-48 mb-8 animate-in zoom-in duration-1000">
      {/* Floating Aura */}
      <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full animate-pulse scale-150" />
      
      {/* Main Body */}
      <div className="relative w-full h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-[3rem] border border-white/20 flex items-center justify-center overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/10 to-transparent" />
        
        {/* Face Display */}
        <div className="w-24 h-16 bg-slate-900 rounded-2xl flex items-center justify-center gap-4 border border-white/10 shadow-inner">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#00ffff]" />
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#00ffff]" />
        </div>
        
        {/* Floating "Limbs" */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-white/10 rounded-full border border-white/20 animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-white/10 rounded-full border border-white/20 animate-bounce" style={{ animationDuration: '4s' }} />
      </div>
      
      {/* Little Sparkles */}
      <Sparkles className="absolute -top-4 -right-4 text-yellow-400 w-8 h-8 animate-pulse" />
    </div>
  );

  if (view === 'intro') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#050505] relative overflow-hidden h-full">
        {/* Living Background Blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-magenta-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
        
        <div className="max-w-xl w-full flex flex-col items-center text-center relative z-10">
          <FlowBotMascot />
          
          <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
            <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic">
              FitFlow <span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Adaptive AI Fitness Coach</p>
          </div>
          
          <div className="mt-8 mb-12 animate-in fade-in duration-1000 delay-500 fill-mode-both">
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
              "Your workouts, adjusted to exactly how you feel right now."
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-6 w-full animate-in slide-in-from-bottom-12 duration-700 delay-700 fill-mode-both">
            <button 
              onClick={() => setView('slides')}
              className="group relative w-full sm:w-80 py-6 bg-white text-black font-black rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-magenta-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative z-10 flex items-center justify-center gap-3 text-lg uppercase tracking-tight">
                Initialize Journey <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Takes less than a minute
            </p>
            
            <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors mt-4">
              I already have a performance profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 h-full relative overflow-hidden">
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-full h-full bg-${slide.color}-500/5 blur-[120px] transition-colors duration-1000`} />
      
      <div className="max-w-4xl w-full relative z-10">
        <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 bg-black animate-in zoom-in-95 duration-700">
           <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-60" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-12">
              <div className={`w-14 h-14 rounded-2xl bg-${slide.color}-400 text-black flex items-center justify-center mb-6 shadow-xl`}>
                <Icon className="w-8 h-8" />
              </div>
              <h2 className="text-4xl font-black mb-4 text-white uppercase tracking-tighter leading-none">
                {slide.title}
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl font-medium leading-relaxed italic">
                "{slide.description}"
              </p>
           </div>
        </div>

        <div className="flex justify-between items-center mt-12 px-4">
          <div className="flex gap-3">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentSlide ? 'w-12 bg-white' : 'w-4 bg-white/10'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-4">
            <button
              onClick={onComplete}
              className="px-6 py-2 text-slate-500 font-bold hover:text-white transition-colors uppercase tracking-widest text-[10px]"
            >
              Skip Technical Briefing
            </button>
            <button
              onClick={() => {
                if (currentSlide < slides.length - 1) setCurrentSlide(prev => prev + 1);
                else onComplete();
              }}
              className="px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-cyan-400 transition-all shadow-xl shadow-white/5 flex items-center gap-2"
            >
              {currentSlide === slides.length - 1 ? "Start Calibration" : "Next Protocol"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
