
import React, { useState } from 'react';
import { 
  User, Settings, Shield, Bell, AppWindow, 
  LogOut, Save, RefreshCw, Smartphone, Monitor,
  Camera, EyeOff, CheckSquare, Trash2, Download
} from 'lucide-react';
import { storage } from '../services/storageService';
import { UserSettings, UserProfile } from '../types';

const ProfileView: React.FC = () => {
  const [data, setData] = useState(storage.get());
  const [activeSection, setActiveSection] = useState<'info' | 'settings' | 'notifications' | 'privacy'>('info');
  const [localSettings, setLocalSettings] = useState<UserSettings>(data.settings);

  const saveSettings = () => {
    storage.save({ settings: localSettings });
    setData(storage.get());
    alert("Profile configurations persisted.");
  };

  const menuItems = [
    { id: 'info', label: 'Identity', icon: User },
    { id: 'settings', label: 'Core Prefs', icon: Settings },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'privacy', label: 'Data Hub', icon: Shield },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#050505] pb-32 custom-scrollbar p-6 sm:p-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Nav */}
        <div className="lg:col-span-3 space-y-2">
           <div className="p-8 mb-6 glass rounded-[2.5rem] border-white/5 flex flex-col items-center text-center">
              <div className="relative mb-6">
                 <div className="w-24 h-24 rounded-3xl bg-slate-800 overflow-hidden border border-white/10 group cursor-pointer">
                    <img src={data.profile?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=FitFlow"} alt="Avatar" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Camera className="text-white w-6 h-6" />
                    </div>
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-cyan-400 rounded-xl flex items-center justify-center text-black border-4 border-[#050505]">
                    <span className="text-[10px] font-black">Lvl 8</span>
                 </div>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{data.profile?.name || "Active Athlete"}</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{data.profile?.fitnessLevel} Level</p>
           </div>

           {menuItems.map(item => (
             <button
               key={item.id}
               onClick={() => setActiveSection(item.id as any)}
               className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeSection === item.id ? 'bg-white text-black' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
             >
               <item.icon className="w-4 h-4" /> {item.label}
             </button>
           ))}

           <div className="pt-10">
              <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all">
                 <LogOut className="w-4 h-4" /> Termination Hub
              </button>
           </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-9 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          
          {activeSection === 'info' && (
            <div className="glass p-10 rounded-[3rem] border-white/10 space-y-10">
               <div>
                  <h3 className="text-2xl font-black text-white uppercase mb-6 tracking-tight">Athlete Bio-Profile</h3>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weight (kg)</label>
                        <input type="number" defaultValue={data.profile?.weight} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-400 transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Height (cm)</label>
                        <input type="number" defaultValue={data.profile?.height} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-cyan-400 transition-all" />
                     </div>
                  </div>
               </div>

               <div>
                  <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tight">Active Goals</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.profile?.goals.map(goal => (
                      <span key={goal} className="px-4 py-2 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 rounded-xl text-[10px] font-black uppercase">{goal}</span>
                    ))}
                    <button className="px-4 py-2 border border-dashed border-white/10 text-slate-500 rounded-xl text-[10px] font-black uppercase hover:text-white hover:border-white/20 transition-all">+ Add Goal</button>
                  </div>
               </div>

               <button onClick={saveSettings} className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all">
                  <Save className="w-5 h-5" /> Persist Metadata
               </button>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
               <div className="glass p-10 rounded-[3rem] border-white/10">
                  <h3 className="text-2xl font-black text-white uppercase mb-8 tracking-tight">Visual Interface</h3>
                  <div className="space-y-8">
                     <div className="flex justify-between items-center">
                        <div>
                           <p className="font-black text-sm uppercase text-white">App Theme</p>
                           <p className="text-xs text-slate-500">Select the primary rendering engine.</p>
                        </div>
                        <div className="flex gap-2">
                           {['dark', 'neon', 'oled'].map(t => (
                             <button 
                               key={t} 
                               onClick={() => setLocalSettings({...localSettings, appearance: {...localSettings.appearance, theme: t as any}})}
                               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${localSettings.appearance.theme === t ? 'bg-cyan-400 border-cyan-400 text-black' : 'bg-white/5 border-white/10 text-slate-500'}`}
                             >
                               {t}
                             </button>
                           ))}
                        </div>
                     </div>
                     <div className="flex justify-between items-center">
                        <div>
                           <p className="font-black text-sm uppercase text-white">Motion Effects</p>
                           <p className="text-xs text-slate-500">Enable smooth UI transitions and parallax.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={localSettings.appearance.motionEnabled} 
                          onChange={e => setLocalSettings({...localSettings, appearance: {...localSettings.appearance, motionEnabled: e.target.checked}})} 
                          className="w-10 h-10 accent-cyan-400"
                        />
                     </div>
                  </div>
               </div>
               <button onClick={saveSettings} className="w-full py-5 bg-white text-black font-black rounded-2xl">UPDATE SETTINGS</button>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="glass p-10 rounded-[3rem] border-white/10 space-y-10">
               <h3 className="text-2xl font-black text-white uppercase tracking-tight">Alert Protocols</h3>
               <div className="space-y-6">
                  {[
                    { key: 'reminders', label: 'Workout Reminders', desc: 'Notify based on circadian performance peaks.' },
                    { key: 'recoveryNudges', label: 'Recovery Nudges', desc: 'Alert when physiological markers suggest rest.' },
                    { key: 'social', label: 'Social Interactions', desc: 'Partner nudges and circle milestones.' },
                    { key: 'tokens', label: 'Flow Token Alerts', desc: 'Daily refresh and bonus earn notifications.' },
                  ].map(item => (
                    <div key={item.key} className="flex justify-between items-center p-6 bg-white/5 rounded-[2rem] border border-white/5">
                       <div>
                          <p className="font-black text-sm uppercase text-white">{item.label}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-widest">{item.desc}</p>
                       </div>
                       <input 
                         type="checkbox" 
                         checked={(localSettings.notifications as any)[item.key]} 
                         onChange={e => setLocalSettings({...localSettings, notifications: {...localSettings.notifications, [item.key]: e.target.checked}})} 
                         className="w-8 h-8 accent-magenta-500" 
                       />
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-8">
               <div className="glass p-10 rounded-[3rem] border-white/10">
                  <h3 className="text-2xl font-black text-white uppercase mb-8 tracking-tight">Data Integrity Hub</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <button className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group hover:bg-cyan-400/5 transition-all">
                        <Download className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                        <span className="font-black text-sm uppercase">Export Biometrics</span>
                        <span className="text-[9px] text-slate-500 mt-1">Download raw JSON history</span>
                     </button>
                     <button className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group hover:bg-red-500/5 transition-all">
                        <Trash2 className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
                        <span className="font-black text-sm uppercase">Purge Local Data</span>
                        <span className="text-[9px] text-slate-500 mt-1">Irreversible wipe of history</span>
                     </button>
                  </div>
               </div>

               <div className="p-8 bg-indigo-500/10 rounded-[2.5rem] border border-indigo-500/30">
                  <div className="flex items-center gap-4 mb-4">
                     <EyeOff className="text-indigo-400" />
                     <h4 className="text-sm font-black text-white uppercase">Neural Privacy Shield</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                     Computer vision processing is performed locally via WebGL/MediaPipe. Visual streams are never transmitted. Joint coordinate vectors are deleted post-analysis.
                  </p>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfileView;
