import { ChatMessage, ConversationSession, PersonalitySettings, RobiMemoryItem, TermuxConfig, VoiceSettings } from '../types/chat';

const SESSIONS_STORAGE_KEY = 'ritika_ai_sessions_v1';
const ACTIVE_SESSION_ID_KEY = 'ritika_ai_active_session_id';
const TERMUX_CONFIG_KEY = 'ritika_ai_termux_config';
const VOICE_SETTINGS_KEY = 'ritika_ai_voice_settings';
const MEMORY_ITEMS_KEY = 'ritika_ai_memory_items';
const PERSONALITY_SETTINGS_KEY = 'ritika_ai_personality_settings';

export const DEFAULT_PERSONALITY_SETTINGS: PersonalitySettings = {
  attitude: 'arrogant_playful',
  responseLength: 'concise',
  language: 'hinglish',
};

export const DEFAULT_TERMUX_CONFIG: TermuxConfig = {
  mode: 'mock',
  baseUrl: 'http://127.0.0.1:8000',
  chatEndpoint: '/chat',
  healthEndpoint: '/health',
  sttEndpoint: '/api/stt',
  ttsEndpoint: '/api/tts',
  timeoutMs: 5000,
};

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: true,
  autoSpeakReplies: true,
  engine: 'browser',
  language: 'hi-IN',
  voiceName: '',
  speed: 1.05,
  pitch: 1.15, // feminine, lively pitch for Ritika
  volume: 1.0,
  isMuted: false,
};

export const DEFAULT_MEMORY_ITEMS: RobiMemoryItem[] = [
  {
    id: 'mem_1',
    key: 'User Identity',
    value: 'Robi (Android & Python Coder, uses Termux)',
    category: 'preference',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'mem_2',
    key: 'Ritika Persona',
    value: 'Proud, sarcastic, stubborn, teasing, speaks strictly in Hinglish.',
    category: 'habit',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'mem_3',
    key: 'Relationship Dynamics',
    value: 'Never acts like a generic assistant. Teases Robi about his coding & bugs.',
    category: 'inside_joke',
    timestamp: Date.now() - 43200000,
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_init_1',
    sender: 'ritika',
    text: 'Abe Robi, aa gaya tu? Bol ab kya naya dimaag kharab karna hai mera? 😏',
    timestamp: Date.now() - 120000,
    status: 'delivered',
  },
  {
    id: 'msg_init_2',
    sender: 'robi',
    text: 'Arre Ritika, thoda pyaar se bhi baat kar sakti hai kabhi!',
    timestamp: Date.now() - 90000,
    status: 'delivered',
  },
  {
    id: 'msg_init_3',
    sender: 'ritika',
    text: 'Pyaar se? Sapne mat dekh samjha na 😂 Chal bol kya kaam hai, jaldi.',
    timestamp: Date.now() - 60000,
    status: 'delivered',
  },
];

class MemoryService {
  public getSessions(): ConversationSession[] {
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (!raw) {
        const defaultSession: ConversationSession = {
          id: 'session_default',
          title: 'Chit-chat with Robi',
          createdAt: Date.now() - 120000,
          updatedAt: Date.now(),
          messages: INITIAL_MESSAGES,
        };
        this.saveSessions([defaultSession]);
        return [defaultSession];
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveSessions(sessions: ConversationSession[]): void {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions to localStorage', e);
    }
  }

  public getActiveSessionId(): string {
    const stored = localStorage.getItem(ACTIVE_SESSION_ID_KEY);
    if (stored) return stored;
    const sessions = this.getSessions();
    if (sessions.length > 0) return sessions[0].id;
    return 'session_default';
  }

  public setActiveSessionId(id: string): void {
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, id);
  }

  public getTermuxConfig(): TermuxConfig {
    try {
      const raw = localStorage.getItem(TERMUX_CONFIG_KEY);
      if (!raw) return DEFAULT_TERMUX_CONFIG;
      return { ...DEFAULT_TERMUX_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_TERMUX_CONFIG;
    }
  }

  public saveTermuxConfig(cfg: TermuxConfig): void {
    localStorage.setItem(TERMUX_CONFIG_KEY, JSON.stringify(cfg));
  }

  public getVoiceSettings(): VoiceSettings {
    try {
      const raw = localStorage.getItem(VOICE_SETTINGS_KEY);
      if (!raw) return DEFAULT_VOICE_SETTINGS;
      return { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_VOICE_SETTINGS;
    }
  }

  public saveVoiceSettings(stg: VoiceSettings): void {
    localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(stg));
  }

  public getMemoryItems(): RobiMemoryItem[] {
    try {
      const raw = localStorage.getItem(MEMORY_ITEMS_KEY);
      if (!raw) return DEFAULT_MEMORY_ITEMS;
      return JSON.parse(raw);
    } catch {
      return DEFAULT_MEMORY_ITEMS;
    }
  }

  public saveMemoryItems(items: RobiMemoryItem[]): void {
    localStorage.setItem(MEMORY_ITEMS_KEY, JSON.stringify(items));
  }

  public getPersonalitySettings(): PersonalitySettings {
    try {
      const raw = localStorage.getItem(PERSONALITY_SETTINGS_KEY);
      if (!raw) return DEFAULT_PERSONALITY_SETTINGS;
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PERSONALITY_SETTINGS;
    }
  }

  public savePersonalitySettings(settings: PersonalitySettings): void {
    localStorage.setItem(PERSONALITY_SETTINGS_KEY, JSON.stringify(settings));
  }

  public exportChatAsText(messages: ChatMessage[]): string {
    return messages
      .map((m) => {
        const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const name = m.sender === 'robi' ? 'Robi' : 'Ritika';
        return `[${time}] ${name}: ${m.text}`;
      })
      .join('\n\n');
  }
}

export const memoryService = new MemoryService();
