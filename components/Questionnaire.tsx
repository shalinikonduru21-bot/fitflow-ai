

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ChevronRight, ChevronLeft, Activity, ShieldAlert, Award, Zap } from 'lucide-react';

interface QuestionnaireProps {
  onSubmit: (profile: UserProfile) => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  // Fixed: Added name and avatar to satisfy UserProfile interface
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FitFlow',
    age: 25, weight: 70, height: 175, gender: 'Other',
    fitnessLevel: 'beginner', goals: [], medicalConditions: '',
    injuries: '', limitations: [], equipment: [], duration: 30, frequency: 3,
    focusAreas: [], motivationStyle: 'encouraging'
  });

  const GOALS = ["Weight Loss", "Muscle Gain", "Endurance", "Flexibility", "Better Health", "Stress Relief"];
  const LIMITATIONS = ["Knee Pain", "Lower Back Sensitivity", "Balance Issues", "Wrist Strain", "Shoulder Impingement", "Full Mobility"];
  const EQUIPMENT = ["Bodyweight", "Dumbbells", "Resistance Bands", "Pull-up Bar", "Bench", "Yoga Mat"];

  const toggleItem = (list: string[], item: string) => 
    list.includes(item) ? list.filter(i => i !== item) : [...list, item];

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4 mb-4">
              <Activity className="text-cyan-400 w-8 h-8" />
              <h3 className="text-3xl font-black text-white">Bio-Baseline</h3>
            </div>
            {/* Added name input for profile completeness */}
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-black uppercase text-slate-500">Full Name</label>
              <input type="text" value={profile.name} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-cyan-500 outline-none" onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Age</label>
                <input type="number" value={profile.age} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-cyan-500 outline-none" onChange={e => setProfile({...profile, age: +e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Gender</label>
                <select className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl outline-none" onChange={e => setProfile({...profile, gender: e.target.value})}>
                  <option>Male</option><option>Female</option><option>Non-binary</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Weight (kg)</label>
                <input type="number" value={profile.weight} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-cyan-500 outline-none" onChange={e => setProfile({...profile, weight: +e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Height (cm)</label>
                <input type="number" value={profile.height} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-cyan-500 outline-none" onChange={e => setProfile({...profile, height: +e.target.value})} />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4">
              <Award className="text-magenta-400 w-8 h-8" />
              <h3 className="text-3xl font-black text-white">Ambitions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map(goal => (
                <button key={goal} onClick={() => setProfile({...profile, goals: toggleItem(profile.goals, goal)})}
                  className={`p-4 rounded-2xl border text-sm font-bold transition-all ${profile.goals.includes(goal) ? 'bg-magenta-500 border-magenta-400 text-black' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                  {goal}
                </button>
              ))}
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">Fitness Level</label>
                <div className="flex gap-2">
                  {['beginner', 'intermediate', 'advanced'].map(level => (
                    <button key={level} onClick={() => setProfile({...profile, fitnessLevel: level as any})}
                      className={`flex-1 py-3 rounded-xl border text-xs font-black uppercase ${profile.fitnessLevel === level ? 'bg-cyan-400 border-cyan-300 text-black' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                      {level}
                    </button>
                  ))}
                </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4">
              <ShieldAlert className="text-red-400 w-8 h-8" />
              <h3 className="text-3xl font-black text-white">Safe-Form Shield</h3>
            </div>
            <p className="text-slate-400 text-sm">Select any areas with chronic pain or mobility restrictions. Our AI will automatically modify exercises.</p>
            <div className="flex flex-wrap gap-2">
              {LIMITATIONS.map(lim => (
                <button key={lim} onClick={() => setProfile({...profile, limitations: toggleItem(profile.limitations, lim)})}
                  className={`px-6 py-3 rounded-full border text-xs font-bold transition-all ${profile.limitations.includes(lim) ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                  {lim}
                </button>
              ))}
            </div>
            <textarea placeholder="Any specific injuries or surgeries? (Optional)" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl h-24 focus:border-red-500 outline-none" onChange={e => setProfile({...profile, injuries: e.target.value})} />
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4">
              <Zap className="text-yellow-400 w-8 h-8" />
              <h3 className="text-3xl font-black text-white">Gear & Schedule</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {EQUIPMENT.map(gear => (
                <button key={gear} onClick={() => setProfile({...profile, equipment: toggleItem(profile.equipment, gear)})}
                  className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${profile.equipment.includes(gear) ? 'bg-yellow-400 border-yellow-300 text-black' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                  {gear}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Preferred Session Length</span>
                <span className="text-cyan-400 font-black">{profile.duration}m</span>
              </div>
              <input type="range" min="15" max="90" step="15" value={profile.duration} className="w-full accent-cyan-400" onChange={e => setProfile({...profile, duration: +e.target.value})} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
      <div className="max-w-2xl w-full bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-magenta-400 transition-all duration-500" style={{ width: `${(step/4)*100}%` }} />
        </div>
        
        {renderStep()}

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
          {step > 1 ? (
            <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-white transition-all">
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
          ) : <div />}
          
          <button onClick={step === 4 ? () => onSubmit(profile) : handleNext} 
            className="px-10 py-4 bg-white text-black font-black rounded-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl">
            {step === 4 ? "CALIBRATE AI" : "Next Step"} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
