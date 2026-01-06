
import React, { useState } from 'react';
import { 
  Users, Shield, Heart, Zap, Trophy, MessageSquare, 
  Info, Star, Flame, Sparkles, CheckCircle, 
  ChevronRight, Share2, Bell, HandHelping
} from 'lucide-react';
import { storage } from '../services/storageService';
import { AppState, ActivityUpdate, Partner, Circle, SocialChallenge } from '../types';
import { voiceService } from '../services/voiceService';

const CommunityView: React.FC<{ setStep: (s: AppState) => void }> = ({ setStep }) => {
  const [data, setData] = useState(storage.get());
  const [activeTab, setActiveTab] = useState<'feed' | 'partners' | 'circles' | 'challenges'>('feed');
  const social = data.social;

  const handleReact = (feedId: string, emoji: string) => {
    const updated = storage.reactToFeed(feedId, emoji);
    setData(updated);
    voiceService.speak("Reaction transmitted.");
  };

  const handleNudge = (partnerId: string) => {
    const updated = storage.nudgePartner(partnerId);
    setData(updated);
    voiceService.speak("Accountability nudge sent.");
  };

  const handleJoinChallenge = (chId: string) => {
    const updated = storage.joinChallenge(chId);
    setData(updated);
    voiceService.speak("Challenge initialized. Syncing goals.");
  };

  const renderFeed = () => (
    <div className="space-y-4 animate-in fade-in duration-500">
      {social.feed.length > 0 ? (
        social.feed.map((update) => (
          <div key={update.id} className="glass p-5 rounded-[2rem] border-white/5 flex gap-4 group hover:border-white/10 transition-all">
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-cyan-400/50 transition-all">
              <img src={update.avatar} alt={update.userName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-black text-sm text-white">{update.userName}</h4>
                <span className="text-[9px] font-bold text-slate-500 uppercase">
                  {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">{update.detail}</p>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {['🔥', '👏', '💪', '✨'].map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => handleReact(update.id, emoji)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] transition-all flex items-center gap-1.5 border border-white/5"
                  >
                    <span>{emoji}</span>
                    <span className="font-black text-[9px] opacity-60">{update.reactions[emoji] || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="py-20 text-center text-slate-600 italic">No recent transmissions in your local hub.</div>
      )}
    </div>
  );

  const renderPartners = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="p-6 bg-cyan-400/5 rounded-[2rem] border border-cyan-400/20 mb-8 flex items-center gap-4">
         <div className="w-12 h-12 rounded-xl bg-cyan-400 flex items-center justify-center text-black">
           <HandHelping className="w-6 h-6" />
         </div>
         <div>
            <h4 className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Accountability Protocol</h4>
            <p className="text-xs text-slate-400 font-medium">Partners boost consistency by 40%. Preset messages only for focused training.</p>
         </div>
      </div>
      
      <div className="grid gap-4">
        {social.partners.map((partner) => (
          <div key={partner.id} className="glass p-6 rounded-[2.5rem] border-white/5 flex items-center justify-between group hover:border-cyan-400/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 group-hover:border-cyan-400/50 transition-all relative">
                <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
                <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-[#050505] ${partner.status === 'completed' ? 'bg-green-500' : 'bg-slate-600'}`} />
              </div>
              <div>
                <h4 className="font-black text-lg text-white">{partner.name}</h4>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <span className={`${partner.status === 'completed' ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {partner.status === 'completed' ? 'Session Complete ✓' : 'Last Session: ' + partner.lastWorkout}
                  </span>
                  <span className="text-slate-800">•</span>
                  <span className="text-orange-500">{partner.streak}d Streak</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
               {partner.lastNudgeAt && Date.now() - partner.lastNudgeAt < 3600000 ? (
                 <span className="px-4 py-3 bg-white/5 text-slate-600 text-[10px] font-black uppercase rounded-xl border border-white/5">Nudged Recently</span>
               ) : (
                <button 
                  onClick={() => handleNudge(partner.id)}
                  className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-cyan-400/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-all border border-transparent hover:border-cyan-400/20"
                >
                  <Bell className="w-4 h-4" /> Nudge
                </button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCircles = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {social.circles.map((circle) => (
          <div key={circle.id} className="glass p-8 rounded-[3rem] border-white/5 hover:border-white/10 transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="w-24 h-24" />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Circle Goal: {circle.goal}</span>
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{circle.name}</h4>
                </div>
                <div className={`px-2 py-1 rounded bg-white/5 text-xs font-black uppercase ${circle.activityLevel === 'high' ? 'text-cyan-400 border border-cyan-400/20' : 'text-slate-500'}`}>
                  {circle.activityLevel} Load
                </div>
              </div>

              <div className="flex -space-x-3 mb-8">
                {circle.members.map(member => (
                  <div key={member.id} className="relative group/member">
                    <div className={`w-10 h-10 rounded-full border-2 border-[#050505] bg-slate-800 overflow-hidden ${member.activeToday ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-[#050505]' : 'grayscale'}`}>
                      <img src={member.avatar} alt={member.name} />
                    </div>
                    {member.activeToday && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-black" />
                    )}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-[#050505] bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-500">+2</div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
                 <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-2">Recent Wins</p>
                 {circle.recentWins.map((win, i) => (
                   <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 italic">
                      <Sparkles className="w-3 h-3 text-cyan-400" /> {win}
                   </div>
                 ))}
              </div>
            </div>
          </div>
        ))}
        
        {/* Create New Circle Placeholder */}
        <button className="glass p-8 rounded-[3rem] border-dashed border-white/10 hover:border-cyan-400/30 flex flex-col items-center justify-center text-center group transition-all min-h-[250px]">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-600 group-hover:text-cyan-400 transition-colors mb-4 border border-white/5">
            <Users className="w-8 h-8" />
          </div>
          <h4 className="font-black text-lg text-white uppercase tracking-tight">Create Circle</h4>
          <p className="text-xs text-slate-500 font-medium max-w-[180px] mt-2 leading-relaxed">Assemble 3-8 peers for shared trajectory alignment.</p>
        </button>
      </div>
    </div>
  );

  const renderChallenges = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {social.challenges.map((challenge) => (
          <div key={challenge.id} className={`glass p-8 rounded-[2.5rem] border transition-all flex flex-col ${challenge.isJoined ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-white/5 hover:border-white/10'}`}>
            <div className="flex justify-between items-start mb-6">
               <div className={`p-3 rounded-xl ${challenge.isJoined ? 'bg-yellow-400 text-black' : 'bg-white/5 text-slate-500'}`}>
                 <Trophy className="w-6 h-6" />
               </div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">
                 {challenge.daysRemaining}d Left
               </span>
            </div>
            
            <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{challenge.title}</h4>
            <p className="text-xs text-slate-500 font-medium mb-8">Join {challenge.participants.toLocaleString()} athletes in this {challenge.type} focus event.</p>
            
            {challenge.isJoined ? (
              <div className="space-y-3 mt-auto pt-6 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-yellow-500">Your Progress</span>
                  <span className="text-white">{challenge.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${challenge.progress}%` }} />
                </div>
                <div className="flex justify-center pt-2">
                   <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase">
                      <CheckCircle className="w-3 h-3 text-green-500" /> Goal: 3 Clean Form Cycles
                   </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => handleJoinChallenge(challenge.id)}
                className="w-full py-4 bg-white text-black font-black text-[11px] rounded-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl mt-auto"
              >
                Accept Challenge
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#050505] pb-32 custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase">Social Hub</h1>
            <p className="text-slate-500 font-medium max-w-xl">
              Cooperative performance systems. Sync with high-trajectory peers to optimize consistency and cognitive reinforcement.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-2.5 rounded-2xl border border-indigo-500/20">
               <Shield className="w-4 h-4 text-indigo-400" />
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Identity Secured</span>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-10 border-b border-white/5 mb-12 overflow-x-auto no-scrollbar">
          {[
            { id: 'feed', label: 'Activity Hub', icon: Zap },
            { id: 'partners', label: 'Accountability Partners', icon: Heart },
            { id: 'circles', label: 'Workout Circles', icon: Users },
            { id: 'challenges', label: 'Global Challenges', icon: Trophy }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 pb-5 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap relative
                ${activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-cyan-400 rounded-full animate-in fade-in duration-300" />}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            {activeTab === 'feed' && renderFeed()}
            {activeTab === 'partners' && renderPartners()}
            {activeTab === 'circles' && renderCircles()}
            {activeTab === 'challenges' && renderChallenges()}
          </div>

          {/* Sidebar Engagement Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Status Insight */}
            <div className="p-8 bg-slate-900/50 rounded-[2.5rem] border border-white/5 shadow-2xl">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Social Intelligence</h4>
               </div>
               <p className="text-[13px] text-slate-300 leading-relaxed font-medium italic">
                "System detect: 3 people in <span className="text-cyan-400">Endurance Elites</span> completed sessions in the last 2 hours. Your trajectory is currently 15% behind circle baseline. Suggested action: Initiate a 10min Stability Blitz."
               </p>
               <button 
                 onClick={() => setStep(AppState.TRAIN_HUB)}
                 className="w-full mt-8 py-5 bg-white text-black font-black text-[11px] rounded-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/10"
                >
                 Initialize Quick Train
               </button>
            </div>

            {/* Achievement Milestones */}
            <div className="glass p-8 rounded-[2.5rem] border-white/5">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-sm font-black uppercase tracking-widest text-white">Milestones</h3>
                   <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                         <Flame className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                         <p className="text-[9px] font-black text-slate-500 uppercase">Circle Heat</p>
                         <p className="text-xs font-black text-white">5-Day Group Streak</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 opacity-40">
                      <div className="w-8 h-8 rounded-lg bg-magenta-500/10 flex items-center justify-center text-magenta-400">
                         <Trophy className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                         <p className="text-[9px] font-black text-slate-500 uppercase">Global Rank</p>
                         <p className="text-xs font-black text-white">Top 12% Consistency</p>
                      </div>
                   </div>
                </div>
            </div>

            {/* Passive Encouragement Module */}
            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
               <Share2 className="w-6 h-6 text-slate-600 mb-3" />
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                 "Reflections shared with partners increase long-term adherence by 22%."
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityView;
