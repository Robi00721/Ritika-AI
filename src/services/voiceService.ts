import { VoiceSettings } from '../types/chat';

export interface VoicePlaybackEvent {
  messageId: string;
  state: 'idle' | 'playing' | 'paused' | 'buffering';
  error?: string;
}

export type VoiceStateListener = (event: VoicePlaybackEvent) => void;
export type SpeechRecognitionListener = (transcript: string, isFinal: boolean) => void;

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeMessageId: string | null = null;
  private listeners: Set<VoiceStateListener> = new Set();
  private availableVoices: SpeechSynthesisVoice[] = [];
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.lang = 'hi-IN'; // Default Hinglish / Hindi speech recognition
        } catch {
          this.recognition = null;
        }
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.availableVoices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.availableVoices.length === 0) {
      this.availableVoices = this.synth.getVoices();
    }
    return this.availableVoices;
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(messageId: string, state: 'idle' | 'playing' | 'paused' | 'buffering', error?: string) {
    this.listeners.forEach((l) => l({ messageId, state, error }));
  }

  public isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isMicSupported(): boolean {
    return this.recognition !== null;
  }

  public speak(
    messageId: string,
    text: string,
    settings: VoiceSettings
  ): boolean {
    if (!this.synth || settings.isMuted) {
      return false;
    }

    // If already playing this message, pause or toggle
    if (this.activeMessageId === messageId && this.synth.speaking) {
      if (this.synth.paused) {
        this.synth.resume();
        this.notify(messageId, 'playing');
        return true;
      }
    }

    // Cancel current speech
    this.stop();

    // Clean text: strip emojis or asterisks for clean speech
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[*_#`~]/g, '')
      .trim();

    if (!cleanText) return false;

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance = utterance;
      this.activeMessageId = messageId;

      utterance.rate = Math.max(0.5, Math.min(2.0, settings.speed));
      utterance.pitch = Math.max(0.5, Math.min(1.5, settings.pitch));
      utterance.volume = Math.max(0, Math.min(1, settings.volume));

      // Choose best voice: Hindi, Indian English, or user preference
      const voices = this.getVoices();
      let matchedVoice = voices.find((v) => v.name === settings.voiceName);

      if (!matchedVoice && settings.language) {
        matchedVoice = voices.find((v) =>
          v.lang.toLowerCase().startsWith(settings.language.toLowerCase().slice(0, 2))
        );
      }

      if (!matchedVoice) {
        // Preferred female Indian/Hindi voices
        matchedVoice = voices.find(
          (v) =>
            (v.lang.includes('hi') || v.lang.includes('IN') || v.name.toLowerCase().includes('india')) &&
            (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('veena'))
        ) || voices.find((v) => v.lang.includes('hi') || v.lang.includes('IN')) || voices[0];
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      }

      utterance.onstart = () => {
        this.notify(messageId, 'playing');
      };

      utterance.onpause = () => {
        this.notify(messageId, 'paused');
      };

      utterance.onresume = () => {
        this.notify(messageId, 'playing');
      };

      utterance.onend = () => {
        this.activeMessageId = null;
        this.currentUtterance = null;
        this.notify(messageId, 'idle');
      };

      utterance.onerror = (e) => {
        // Interrupted is normal when user cancels
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('SpeechSynthesis error:', e.error);
        }
        this.activeMessageId = null;
        this.currentUtterance = null;
        this.notify(messageId, 'idle', e.error);
      };

      // Workaround for Chrome/Android SpeechSynthesis bug where it stays paused
      this.synth.cancel();
      this.synth.resume();
      this.synth.speak(utterance);
      return true;
    } catch (err: any) {
      console.warn('Speech exception:', err);
      this.activeMessageId = null;
      this.notify(messageId, 'idle', err?.message);
      return false;
    }
  }

  /**
   * Subtle Web Audio chime for tactile haptic feedback
   */
  public playChime(type: 'send' | 'reply' | 'mic') {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (type === 'send') {
        osc.frequency.setValueAtTime(540, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      } else if (type === 'reply') {
        osc.frequency.setValueAtTime(680, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(920, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      } else {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  public pause(messageId?: string) {
    if (!this.synth) return;
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      const targetId = messageId || this.activeMessageId || '';
      this.notify(targetId, 'paused');
    }
  }

  public resume(messageId?: string) {
    if (!this.synth) return;
    if (this.synth.paused) {
      this.synth.resume();
      const targetId = messageId || this.activeMessageId || '';
      this.notify(targetId, 'playing');
    }
  }

  public stop() {
    if (!this.synth) return;
    const oldId = this.activeMessageId;
    this.synth.cancel();
    this.activeMessageId = null;
    this.currentUtterance = null;
    if (oldId) {
      this.notify(oldId, 'idle');
    }
  }

  public getActiveMessageId(): string | null {
    return this.activeMessageId;
  }

  public isSpeaking(): boolean {
    return !!this.synth && this.synth.speaking && !this.synth.paused;
  }

  // --- Voice Input (Speech-To-Text / Microphone) ---
  public startListening(
    onResult: SpeechRecognitionListener,
    onError: (err: string) => void,
    onEnd: () => void,
    lang: string = 'hi-IN'
  ): boolean {
    if (!this.recognition) {
      onError('Browser Speech Recognition not supported on this device/browser.');
      return false;
    }

    if (this.isListening) {
      try {
        this.recognition.abort();
      } catch {}
    }

    this.recognition.lang = lang;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = final || interim;
      onResult(text, Boolean(final));
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || 'Microphone capture error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (e: any) {
      this.isListening = false;
      onError(e.message || 'Could not start microphone');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }
}

export const voiceService = new VoiceService();
