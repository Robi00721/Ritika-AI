import React from 'react';
import { Settings, History, Volume2, VolumeX, Terminal, Download } from 'lucide-react';
import { ConnectionStatus, TermuxConfig, VoiceSettings } from '../types/chat';

interface ChatHeaderProps {
  connectionStatus: ConnectionStatus;
  termuxConfig: TermuxConfig;
  voiceSettings: VoiceSettings;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenDownload: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  connectionStatus,
  termuxConfig,
  voiceSettings,
  onToggleMute,
  onOpenSettings,
  onOpenHistory,
  onOpenDownload,
}) => {
  const isMock = termuxConfig.mode === 'mock';
  const isConnected = connectionStatus === 'connected' && !isMock;

  return (
    <header className="w-full bg-[#0d091a]/95 backdrop-blur-md border-b border-purple-950/60 px-4 py-3 flex items-center justify-between shrink-0 select-none z-20 transition-colors">
      {/* Left: Avatar + Identity */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-800 via-indigo-900 to-purple-600 p-[1.5px] shadow-lg shadow-purple-900/30 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#0d091a] flex items-center justify-center overflow-hidden">
              <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-200 to-purple-400 font-mono tracking-tighter">
                R⚡
              </span>
            </div>
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0d091a] ${
              isConnected
                ? 'bg-emerald-400'
                : isMock
                ? 'bg-purple-400'
                : 'bg-amber-400'
            }`}
            title={
              isConnected
                ? 'Termux Connected'
                : isMock
                ? 'Mock Engine Active'
                : 'Termux Disconnected'
            }
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
              Ritika AI
              <span className="text-[10px] font-mono font-semibold text-purple-300 bg-purple-900/70 border border-purple-700/60 px-1.5 py-0.2 rounded-md">
                v1.0.0
              </span>
              <span className="text-[10px] font-medium text-purple-400 bg-purple-950/70 border border-purple-800/40 px-1.5 py-0.2 rounded-md hidden xs:inline">
                Hinglish
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="text-purple-300/80 truncate max-w-[130px] sm:max-w-[200px]">
              {isConnected
                ? 'Termux Live'
                : isMock
                ? 'Sarcastic Mode'
                : 'Termux Offline'}
            </span>
            <span className="text-slate-600">·</span>
            <button
              onClick={onOpenSettings}
              className="text-[10px] font-medium text-purple-400 hover:text-purple-300 underline decoration-purple-600/50 cursor-pointer"
            >
              {isMock ? 'Mock' : 'Config'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Install / Download button */}
        <button
          onClick={onOpenDownload}
          className="flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-medium bg-purple-950/60 text-purple-200 border border-purple-800/50 hover:bg-purple-900/60 transition-all cursor-pointer"
          title="Download App / Termux Script"
        >
          <Download className="w-3.5 h-3.5 text-purple-300 shrink-0" />
          <span className="hidden xs:inline text-[10px]">Download</span>
        </button>

        {/* Voice Mute / Unmute Button */}
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
            voiceSettings.isMuted
              ? 'text-slate-500 bg-white/5 border border-transparent hover:text-slate-300'
              : 'text-purple-200 bg-purple-950/70 border border-purple-700/60 shadow-sm shadow-purple-950'
          }`}
          title={voiceSettings.isMuted ? 'Voice Muted (Click to enable spoken replies)' : 'Voice Active (Click to mute)'}
          aria-label="Toggle Voice Mute"
        >
          {voiceSettings.isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xs:inline text-[10px]">Mute</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span className="hidden xs:inline text-[10px]">Voice ON</span>
            </>
          )}
        </button>

        {/* History Button */}
        <button
          onClick={onOpenHistory}
          className="p-2 text-slate-300 hover:text-purple-200 hover:bg-purple-950/40 rounded-xl transition-all cursor-pointer"
          title="Chat History & Memories"
          aria-label="Open History"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-300 hover:text-purple-200 hover:bg-purple-950/40 rounded-xl transition-all cursor-pointer"
          title="Settings (API, Voice, Memory)"
          aria-label="Open Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

