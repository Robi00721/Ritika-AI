/**
 * Ritika AI - Android Chat Assistant
 * A mobile-first AI companion app for Robi with a dark black-and-purple theme,
 * Hinglish personality, voice playback/recording controls, and local Termux HTTP integration.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Monitor, Sparkles } from 'lucide-react';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { ChatHeader } from './components/ChatHeader';
import { MessageBubble } from './components/MessageBubble';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { ChatInput } from './components/ChatInput';
import { VoiceInputModal } from './components/VoiceInputModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { DownloadModal } from './components/DownloadModal';
import {
  ChatMessage,
  ConnectionStatus,
  PersonalitySettings,
  TermuxConfig,
  VoiceSettings,
  RobiMemoryItem,
} from './types/chat';
import { memoryService, INITIAL_MESSAGES } from './services/memoryService';
import { termuxClient } from './services/termuxClient';
import { voiceService } from './services/voiceService';
import { apiKeysService } from './services/apiKeysService';

export default function App() {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const sessions = memoryService.getSessions();
    const activeId = memoryService.getActiveSessionId();
    const activeSession = sessions.find((s) => s.id === activeId) || sessions[0];
    return activeSession ? activeSession.messages : INITIAL_MESSAGES;
  });

  const [termuxConfig, setTermuxConfig] = useState<TermuxConfig>(() =>
    memoryService.getTermuxConfig()
  );
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() =>
    memoryService.getVoiceSettings()
  );
  const [memoryItems, setMemoryItems] = useState<RobiMemoryItem[]>(() =>
    memoryService.getMemoryItems()
  );
  const [personalitySettings, setPersonalitySettings] = useState<PersonalitySettings>(() =>
    memoryService.getPersonalitySettings()
  );

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    termuxConfig.mode === 'termux' ? 'connecting' : 'disconnected'
  );

  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  // Audio playback state
  const [activeSpeechMessageId, setActiveSpeechMessageId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initial connection test if in Termux mode
  useEffect(() => {
    if (termuxConfig.mode === 'termux') {
      termuxClient.pingServer(termuxConfig).then((res) => {
        setConnectionStatus(res.success ? 'connected' : 'error');
      });
    } else {
      setConnectionStatus('disconnected');
    }
  }, [termuxConfig.mode, termuxConfig.baseUrl]);

  // Voice service listener subscription
  useEffect(() => {
    const unsubscribe = voiceService.subscribe((event) => {
      if (event.state === 'playing') {
        setActiveSpeechMessageId(event.messageId);
        setIsSpeaking(true);
      } else if (event.state === 'paused') {
        setIsSpeaking(false);
      } else if (event.state === 'idle') {
        if (activeSpeechMessageId === event.messageId) {
          setActiveSpeechMessageId(null);
          setIsSpeaking(false);
          setActiveSpeechText('');
        }
      }
    });
    return () => unsubscribe();
  }, [activeSpeechMessageId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Save messages to persistent storage
  const persistMessages = (updatedMessages: ChatMessage[]) => {
    setMessages(updatedMessages);
    const sessions = memoryService.getSessions();
    const activeId = memoryService.getActiveSessionId();
    const updatedSessions = sessions.map((s) => {
      if (s.id === activeId) {
        return {
          ...s,
          updatedAt: Date.now(),
          messages: updatedMessages,
        };
      }
      return s;
    });
    memoryService.saveSessions(updatedSessions);
  };

  // Send message handler
  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'robi',
      text,
      timestamp: Date.now(),
      status: 'delivered',
    };

    const newHistory = [...messages, userMessage];
    persistMessages(newHistory);
    voiceService.playChime('send');
    setIsTyping(true);

    try {
      let replyText = '';
      const activeProvider = apiKeysService.getActiveProvider();

      if (activeProvider === 'gemini' || activeProvider === 'openrouter') {
        const historyFormatted = newHistory.map((m) => ({
          role: m.sender === 'robi' ? 'user' : 'assistant',
          content: m.text,
        }));
        const systemPrompt = `You are Ritika, an AI companion for Robi.
Strict Personality Guidelines:
- Tone: ${personalitySettings.attitude}. Sarcastic, teasing, slightly arrogant. Use casual Hinglish slang ("Abe Robi", "Dimag mat khaa", "Hatt").
- Length: ${personalitySettings.responseLength} (1-2 sentences SMS style unless Robi explicitly asks for code).
- Language: ${personalitySettings.language === 'hinglish' ? 'Hinglish (Hindi written in English alphabet)' : personalitySettings.language}.
- Rule: NEVER use asterisks or roleplay actions (*smiles*, *sighs*). Output only the spoken words.`;

        const res = await apiKeysService.executePrompt(
          activeProvider,
          systemPrompt,
          historyFormatted,
          text
        );
        replyText = res.text;
      } else if (termuxConfig.mode === 'termux') {
        const result = await termuxClient.sendMessage(text, newHistory, termuxConfig);
        replyText = result.reply;
      } else {
        throw new Error('Koi AI provider select nahi hai. Settings mein Gemini/OpenRouter ya Termux connect karo.');
      }

      const ritikaMessage: ChatMessage = {
        id: `msg_ritika_${Date.now()}`,
        sender: 'ritika',
        text: replyText,
        timestamp: Date.now(),
        status: 'delivered',
      };

      const finalMessages = [...newHistory, ritikaMessage];
      persistMessages(finalMessages);
      setIsTyping(false);
      voiceService.playChime('reply');

      // Auto-speak if enabled
      if (voiceSettings.autoSpeakReplies && !voiceSettings.isMuted) {
        handlePlaySpeech(ritikaMessage.id, ritikaMessage.text);
      }
    } catch (err: any) {
      setIsTyping(false);
      const fallbackMessage: ChatMessage = {
        id: `msg_ritika_err_${Date.now()}`,
        sender: 'ritika',
        text: `Abe Robi, request fail ho gayi: ${err?.message || 'Connection error'}. Settings mein API Key ya Termux check kar le.`,
        timestamp: Date.now(),
        status: 'delivered',
      };
      persistMessages([...newHistory, fallbackMessage]);
    }
  };

  // Speech controls
  const handlePlaySpeech = (messageId: string, text: string) => {
    setActiveSpeechText(text);
    voiceService.speak(messageId, text, voiceSettings);
  };

  const handlePauseSpeech = (messageId: string) => {
    voiceService.pause(messageId);
  };

  const handleStopSpeech = () => {
    voiceService.stop();
    setActiveSpeechMessageId(null);
    setIsSpeaking(false);
    setActiveSpeechText('');
  };

  const handleTogglePlayPauseAudio = () => {
    if (isSpeaking) {
      voiceService.pause();
    } else if (activeSpeechMessageId) {
      voiceService.resume();
    }
  };

  const handleChangeSpeed = (newSpeed: number) => {
    const updated = { ...voiceSettings, speed: newSpeed };
    setVoiceSettings(updated);
    memoryService.saveVoiceSettings(updated);
    if (activeSpeechMessageId && activeSpeechText) {
      voiceService.speak(activeSpeechMessageId, activeSpeechText, updated);
    }
  };

  const handleToggleMute = () => {
    const updated = { ...voiceSettings, isMuted: !voiceSettings.isMuted };
    setVoiceSettings(updated);
    memoryService.saveVoiceSettings(updated);
    if (updated.isMuted) {
      voiceService.stop();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Ritika ke saath ye chat saaf karni hai?')) {
      voiceService.stop();
      const fresh: ChatMessage[] = [
        {
          id: `msg_ritika_fresh_${Date.now()}`,
          sender: 'ritika',
          text: 'Pura chat history uda diya tune Robi? Chal koi na, ab bol kya naya shuru karna hai? 😏',
          timestamp: Date.now(),
          status: 'delivered',
        },
      ];
      persistMessages(fresh);
      setIsHistoryOpen(false);
    }
  };

  const handleStartNewChat = () => {
    voiceService.stop();
    const fresh: ChatMessage[] = [
      {
        id: `msg_ritika_new_${Date.now()}`,
        sender: 'ritika',
        text: 'Naya session start kiya hai Robi! Chal bata, aaj kaunsi nayi nautanki hai? 😂',
        timestamp: Date.now(),
        status: 'delivered',
      },
    ];
    persistMessages(fresh);
    setIsHistoryOpen(false);
  };

  const handleSaveTermuxConfig = (cfg: TermuxConfig) => {
    setTermuxConfig(cfg);
    memoryService.saveTermuxConfig(cfg);
    if (cfg.mode === 'termux') {
      termuxClient.pingServer(cfg).then((res) => {
        setConnectionStatus(res.success ? 'connected' : 'error');
      });
    } else {
      setConnectionStatus('disconnected');
    }
  };

  const handleSaveVoiceSettings = (stg: VoiceSettings) => {
    setVoiceSettings(stg);
    memoryService.saveVoiceSettings(stg);
  };

  const handleSavePersonalitySettings = (stg: PersonalitySettings) => {
    setPersonalitySettings(stg);
    memoryService.savePersonalitySettings(stg);
  };

  return (
    <div className="h-full w-full bg-[#05030a] text-slate-100 flex flex-col items-center justify-center p-0 md:p-3 relative overflow-hidden font-sans select-none">
      {/* Background subtle ambient purple glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-[350px] h-[350px] bg-fuchsia-950/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Frame Switcher for Desktop Testing (Top Floating Bar) */}
      <div className="hidden md:flex absolute top-3 right-4 z-40 items-center gap-1.5 bg-[#120d24]/90 backdrop-blur-md border border-purple-900/50 px-2.5 py-1 rounded-full text-xs text-slate-300 shadow-lg">
        <span className="text-[11px] text-purple-300 font-medium mr-1">Preview:</span>
        <button
          onClick={() => setIsPhoneFrame(true)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all cursor-pointer ${
            isPhoneFrame
              ? 'bg-purple-700 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Android Phone Mockup Frame"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Phone</span>
        </button>
        <button
          onClick={() => setIsPhoneFrame(false)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all cursor-pointer ${
            !isPhoneFrame
              ? 'bg-purple-700 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Edge-to-Edge Responsive View"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full</span>
        </button>
      </div>

      {/* Main Container: Android Phone Shell or Edge-to-Edge Container */}
      <div
        className={`w-full h-full flex flex-col bg-[#07050d] transition-all relative overflow-hidden ${
          isPhoneFrame
            ? 'md:max-w-[412px] md:h-[860px] md:max-h-[92vh] md:rounded-[44px] md:border-[10px] md:border-[#1d1633] md:shadow-2xl md:shadow-purple-950/60'
            : 'max-w-md sm:max-w-xl md:max-w-2xl md:h-full md:border-x md:border-purple-950/40'
        }`}
      >
        {/* Android Native Status Bar */}
        <AndroidStatusBar />

        {/* Top App Bar */}
        <ChatHeader
          connectionStatus={connectionStatus}
          termuxConfig={termuxConfig}
          voiceSettings={voiceSettings}
          onToggleMute={handleToggleMute}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenDownload={() => setIsDownloadModalOpen(true)}
        />

        {/* Chat Message Scrollable View */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-3 flex flex-col gap-1 select-text scroll-smooth"
        >
          {/* Date separator */}
          <div className="flex items-center justify-center my-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400/70 bg-purple-950/50 px-2.5 py-0.5 rounded-full border border-purple-900/40">
              Today · Ritika AI
            </span>
          </div>

          {/* Messages */}
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isPlaying={activeSpeechMessageId === message.id && isSpeaking}
              voiceSettings={voiceSettings}
              onPlaySpeech={handlePlaySpeech}
              onPauseSpeech={handlePauseSpeech}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2.5 my-2">
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-700/40 flex items-center justify-center shrink-0">
                <span className="text-[12px] font-bold text-purple-300 font-mono">R⚡</span>
              </div>
              <div className="bg-[#120e24] border border-purple-900/40 rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
                <span className="text-[11px] text-purple-300/80 ml-1 font-medium">
                  Ritika type kar rahi hai...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Audio Player Bar when actively speaking */}
        {activeSpeechMessageId && (
          <AudioPlayerBar
            isPlaying={isSpeaking}
            activeText={activeSpeechText}
            voiceSettings={voiceSettings}
            onTogglePlayPause={handleTogglePlayPauseAudio}
            onStop={handleStopSpeech}
            onChangeSpeed={handleChangeSpeed}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* Bottom Message Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onOpenVoiceInput={() => setIsVoiceModalOpen(true)}
          disabled={isTyping}
        />

        {/* Android Bottom Navigation Pill */}
        <div className="w-full bg-[#0d091a] pt-1 pb-2 flex justify-center items-center shrink-0">
          <div className="w-28 h-1 rounded-full bg-slate-700/80" />
        </div>
      </div>

      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendVoiceMessage={handleSendMessage}
        voiceLanguage={voiceSettings.language}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        messages={messages}
        memoryItems={memoryItems}
        onClearChat={handleClearChat}
        onStartNewChat={handleStartNewChat}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        termuxConfig={termuxConfig}
        onSaveTermuxConfig={handleSaveTermuxConfig}
        voiceSettings={voiceSettings}
        onSaveVoiceSettings={handleSaveVoiceSettings}
        personalitySettings={personalitySettings}
        onSavePersonalitySettings={handleSavePersonalitySettings}
        connectionStatus={connectionStatus}
        onStatusChange={setConnectionStatus}
      />

      {/* Download & Install Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
