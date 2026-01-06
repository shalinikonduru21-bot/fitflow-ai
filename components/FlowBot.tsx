
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Mic, Volume2, VolumeX, 
  Sparkles, ShieldCheck, User, Bot
} from 'lucide-react';
import { ChatMessage, AppState } from '../types';
import { storage } from '../services/storageService';
import { getFlowBotResponse } from '../services/geminiService';
import { voiceService } from '../services/voiceService';

interface FlowBotProps {
  currentStep: AppState;
}

const FlowBot: React.FC<FlowBotProps> = ({ currentStep }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Systems online. Biometric telemetry integrated. I am monitoring your performance pathways—how can I optimize your current session?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const data = storage.get();
    try {
      // Dynamic context inject based on timer
      const activeMins = Math.floor(data.dailyActive.totalSeconds / 60);
      const contextualMessage = text + ` (System Context: I have been active for ${activeMins} minutes today against a goal of ${Math.floor(data.dailyActive.targetSeconds/60)} minutes.)`;

      const responseText = await getFlowBotResponse(contextualMessage, messages, {
        profile: data.profile || null,
        metrics: data.wearableData || null,
        streak: data.streak,
        coins: data.coins,
        tokens: data.tokens
      });

      const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      
      if (isVoiceEnabled) {
        voiceService.speak(responseText);
      }
    } catch (error) {
      console.error("Assistant Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Browser speech recognition API unavailable.");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const hiddenOn = [AppState.ONBOARDING, AppState.QUESTIONNAIRE];
  if (hiddenOn.includes(currentStep)) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-8 w-16 h-16 rounded-full shadow-2xl transition-all z-[100] flex items-center justify-center group
          ${isOpen ? 'scale-0' : 'scale-100'}
          bg-gradient-to-br from-cyan-400 to-indigo-500 hover:scale-110 active:scale-95
        `}
      >
        <div className="absolute inset-0 bg-cyan-400/30 rounded-full animate-ping group-hover:animate-none" />
        <MessageSquare className="w-8 h-8 text-black relative z-10" />
      </button>

      <div className={`fixed inset-y-0 right-0 w-full sm:w-[400px] glass border-l border-white/10 z-[200] flex flex-col transition-transform duration-500 ease-in-out shadow-2xl
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-400 flex items-center justify-center text-black">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight uppercase">Flow Architect</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Locked</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`p-2 rounded-lg transition-all ${isVoiceEnabled ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:text-white'}`}
            >
              {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center
                  ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-cyan-500/10 text-cyan-400'}
                `}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed
                  ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-tr-none' : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none'}
                `}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white/5 border-t border-white/5">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <div className="flex-1 relative group">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Query bio-telemetry..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-cyan-500/50 transition-all placeholder-slate-600"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all disabled:opacity-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlowBot;
