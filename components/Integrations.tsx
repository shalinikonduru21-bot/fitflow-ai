
import React, { useState } from 'react';
import { Watch, Activity, ShieldCheck, RefreshCw, Smartphone, Info, Lock, Trash2 } from 'lucide-react';
import { storage } from '../services/storageService';
import { integrationService, WatchAdapter, StravaAdapter, DemoAdapter } from '../services/integrationService';

const Integrations: React.FC = () => {
  const [data, setData] = useState(storage.get());
  const [syncing, setSyncing] = useState<string | null>(null);

  const toggleSimulationMode = () => {
    const updated = storage.save({ 
      integrations: { ...data.integrations, useDemoData: !data.integrations.useDemoData } 
    });
    setData(updated);
  };

  const handleSync = async (source: 'Watch' | 'Strava' | 'Demo') => {
    setSyncing(source);
    try {
      const adapter = source === 'Watch' ? WatchAdapter : source === 'Strava' ? StravaAdapter : DemoAdapter;
      await integrationService.sync(adapter);
      setData(storage.get());
    } finally {
      setSyncing(null);
    }
  };

  const purgeData = () => {
    if (confirm("This will irreversibly delete all health metrics from local storage.")) {
      storage.save({ wearableData: undefined });
      setData(storage.get());
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#050505] pb-32 custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-400/20">
                <ShieldCheck className="w-6 h-6" />
             </div>
             <h1 className="text-5xl font-black tracking-tighter text-white uppercase">Health Data Hub</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
            Configure secure biometric pipelines. FitFlow AI leverages physiological signals strictly to adjust workout intensity and prevent overtraining.
          </p>
        </header>

        <div className="grid gap-8">
          {/* Physiological Metrics Card */}
          <div className={`glass p-8 rounded-[3rem] border transition-all ${data.integrations.watchConnected ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/5'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${data.integrations.watchConnected ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-slate-500'}`}>
                  <Watch className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Wearable Telemetry</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${data.integrations.watchConnected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {data.integrations.watchConnected ? `Connected via ${data.wearableData?.dataSource || 'Watch'}` : 'Signal Inactive'}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => storage.save({ integrations: { ...data.integrations, watchConnected: !data.integrations.watchConnected }})}
                className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${data.integrations.watchConnected ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white text-black'}`}
              >
                {data.integrations.watchConnected ? 'Disable Pipeline' : 'Connect Device'}
              </button>
            </div>

            {data.integrations.watchConnected && data.wearableData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
                <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-2">Sleep Index</span>
                  <p className="text-2xl font-black text-white">{data.wearableData.sleepHours}h</p>
                </div>
                <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-2">Resting HR</span>
                  <p className="text-2xl font-black text-white">{data.wearableData.restingHeartRate}bpm</p>
                </div>
                <div className="p-5 bg-cyan-400/5 rounded-3xl border border-cyan-400/20">
                  <span className="text-[9px] text-cyan-500 font-black uppercase tracking-widest block mb-2">Recovery</span>
                  <p className="text-2xl font-black text-cyan-400">{integrationService.getRecoveryScore(data.wearableData)}%</p>
                </div>
                <button 
                  onClick={() => handleSync('Watch')}
                  className="p-5 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all group"
                >
                  <RefreshCw className={`w-5 h-5 text-slate-400 group-hover:text-white ${syncing === 'Watch' ? 'animate-spin' : ''}`} />
                  <span className="text-[9px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest">Refresh</span>
                </button>
              </div>
            )}
          </div>

          {/* Activity Aggregator Card */}
          <div className={`glass p-8 rounded-[3rem] border transition-all ${data.integrations.stravaConnected ? 'border-orange-500/30 bg-orange-500/5' : 'border-white/5'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${data.integrations.stravaConnected ? 'bg-[#FC4C02] text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 text-slate-500'}`}>
                  <Activity className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Strava Aggregator</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    {data.integrations.stravaConnected ? 'Sync Established' : 'Integration Offline'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => storage.save({ integrations: { ...data.integrations, stravaConnected: !data.integrations.stravaConnected }})}
                className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${data.integrations.stravaConnected ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#FC4C02] text-white'}`}
              >
                {data.integrations.stravaConnected ? 'Terminate Sync' : 'Link Strava'}
              </button>
            </div>

            {data.integrations.stravaConnected && (
              <div className="p-8 bg-white/5 rounded-[2rem] animate-in fade-in border border-white/5">
                <div className="flex justify-between items-center mb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[11px] font-black uppercase text-slate-300 tracking-widest">Last Activity: {data.wearableData?.lastActivityType || 'Endurance'}</span>
                   </div>
                   <button onClick={() => handleSync('Strava')} className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                     Re-pull Feed <RefreshCw className={`w-3 h-3 ${syncing === 'Strava' ? 'animate-spin' : ''}`} />
                   </button>
                </div>
                <div className="grid grid-cols-3 gap-6">
                   <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Load Impact</span>
                      <span className="text-xl font-black text-white uppercase">{data.wearableData?.lastActivityIntensity}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Duration</span>
                      <span className="text-xl font-black text-white">{data.wearableData?.activityDuration}m</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Fatigue Marker</span>
                      <span className="text-xl font-black text-orange-400">Moderate</span>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Privacy & Simulation Policy */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="p-8 bg-indigo-500/10 rounded-[3rem] border border-indigo-500/30 flex flex-col justify-between">
                <div>
                   <div className="flex items-center gap-3 mb-6">
                      <Smartphone className="text-indigo-400" />
                      <h3 className="text-xl font-black text-white uppercase">Simulator</h3>
                   </div>
                   <p className="text-xs text-slate-400 leading-relaxed mb-8">
                     Evaluate the adaptive capabilities of FitFlow AI by simulating specific physiological anomalies. Verifies how the engine responds to low recovery states.
                   </p>
                </div>
                <div className="flex gap-3">
                   <button 
                     onClick={() => handleSync('Demo')}
                     className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
                   >
                     Trigger Simulation
                   </button>
                   <label className="relative inline-flex items-center cursor-pointer p-4 bg-white/5 rounded-2xl">
                      <input type="checkbox" checked={data.integrations.useDemoData} onChange={toggleSimulationMode} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[18px] after:left-[18px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                   </label>
                </div>
             </div>

             <div className="p-8 bg-white/5 rounded-[3rem] border border-white/5 flex flex-col justify-between">
                <div>
                   <div className="flex items-center gap-3 mb-6">
                      <Lock className="text-slate-500" />
                      <h3 className="text-xl font-black text-white uppercase">Privacy Shield</h3>
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed mb-8">
                     Biometric processing is executed on the edge. Raw physiological data is normalized locally and deleted post-session analysis. FitFlow AI never persists raw heart rate streams.
                   </p>
                </div>
                <button 
                  onClick={purgeData}
                  className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Purge Synced Biometrics
                </button>
             </div>
          </div>

          <div className="mt-12 p-8 bg-cyan-400/5 rounded-[3rem] border border-cyan-400/10 flex items-center gap-6">
             <Info className="text-cyan-500 w-10 h-10 flex-shrink-0" />
             <p className="text-xs text-slate-400 italic leading-relaxed">
               "System Architecture Note: Future updates will include a native Apple Health bridge. Current web sync relies on standardized REST interfaces for Google Fit and Fitbit."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
