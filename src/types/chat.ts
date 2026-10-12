export type MessageSender = 'robi' | 'ritika';

export type AudioPlaybackState = 'idle' | 'playing' | 'paused' | 'buffering';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered';
  audioState?: AudioPlaybackState;
  audioDuration?: number;
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export type ConnectionMode = 'mock' | 'termux';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface TermuxConfig {
  mode: ConnectionMode;
  baseUrl: string;
  chatEndpoint: string;
  healthEndpoint: string;
  sttEndpoint: string;
  ttsEndpoint: string;
  timeoutMs: number;
}

export type VoiceEngine = 'browser' | 'termux';

export interface VoiceSettings {
  enabled: boolean;
  autoSpeakReplies: boolean;
  engine: VoiceEngine;
  language: string; // e.g., 'hi-IN', 'en-IN', 'en-US'
  voiceName: string;
  speed: number; // 0.5 - 2.0
  pitch: number; // 0.5 - 1.5
  volume: number; // 0.0 - 1.0
  isMuted: boolean;
}

export interface RobiMemoryItem {
  id: string;
  key: string;
  value: string;
  category: 'preference' | 'habit' | 'nickname' | 'inside_joke';
  timestamp: number;
}

export interface TermuxHealthResponse {
  status: string;
  name?: string;
  version?: string;
  device?: string;
  battery?: number;
}

export interface PersonalitySettings {
  attitude: 'arrogant_playful' | 'super_sarcastic' | 'caring_teasing' | 'bossy';
  responseLength: 'concise' | 'normal' | 'detailed';
  language: 'hinglish' | 'hindi' | 'english';
}

