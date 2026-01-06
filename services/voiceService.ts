
class VoiceService {
  private synth: SpeechSynthesis;
  private lastSpoken: string = '';
  private lastSpeakTime: number = 0;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  speak(text: string, force: boolean = false) {
    // Prevent overlapping of same message or too frequent messages
    const now = Date.now();
    if (!force && (text === this.lastSpoken || now - this.lastSpeakTime < 1500)) return;

    this.synth.cancel(); // Interrupt current if needed
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Find a good voice if possible
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    this.synth.speak(utterance);
    this.lastSpoken = text;
    this.lastSpeakTime = now;
  }
}

export const voiceService = new VoiceService();
