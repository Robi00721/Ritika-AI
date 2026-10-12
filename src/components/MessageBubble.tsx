import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Copy, Check, Volume2, User } from 'lucide-react';
import { AudioPlaybackState, ChatMessage, VoiceSettings } from '../types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isPlaying: boolean;
  voiceSettings: VoiceSettings;
  onPlaySpeech: (messageId: string, text: string) => void;
  onPauseSpeech: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isPlaying,
  voiceSettings,
  onPlaySpeech,
  onPauseSpeech,
}) => {
  const isRobi = message.sender === 'robi';
  const [copied, setCopied] = useState(false);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      onPauseSpeech(message.id);
    } else {
      onPlaySpeech(message.id, message.text);
    }
  };

  return (
    <div
      className={`w-full flex gap-2.5 my-2.5 transition-opacity ${
        isRobi ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Ritika's Avatar (Left) */}
      {!isRobi && (
        <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-700/40 flex items-center justify-center shrink-0 mt-1 shadow-md">
          <span className="text-[12px] font-bold text-purple-300 font-mono">R⚡</span>
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`relative max-w-[85%] sm:max-w-[78%] flex flex-col ${
          isRobi ? 'items-end' : 'items-start'
        }`}
      >
        {/* Sender Name tag */}
        <span className="text-[10px] font-medium text-slate-400 mb-1 px-1">
          {isRobi ? 'Robi' : 'Ritika'}
        </span>

        {/* Message Card */}
        <div
          className={`px-3.5 py-2.5 rounded-2xl shadow-md transition-all ${
            isRobi
              ? 'bg-gradient-to-br from-purple-800 via-purple-900 to-indigo-950 text-purple-100 rounded-tr-xs border border-purple-700/40 shadow-purple-950/50'
              : 'bg-[#120e24] text-slate-100 rounded-tl-xs border border-purple-900/40 shadow-black/60'
          }`}
        >
          {/* Main message text */}
          <div className="text-[14px] leading-relaxed break-words whitespace-pre-wrap select-text">
            {message.text}
          </div>

          {/* Action Row inside bubble */}
          <div
            className={`mt-2 pt-1.5 flex items-center gap-3 text-[11px] border-t ${
              isRobi
                ? 'border-purple-700/30 text-purple-300/80 justify-end'
                : 'border-purple-900/30 text-slate-400 justify-between'
            }`}
          >
            {/* Ritika Voice & Copy Controls */}
            {!isRobi ? (
              <div className="flex items-center gap-2">
                {/* Voice button */}
                <button
                  onClick={toggleSpeech}
                  disabled={voiceSettings.isMuted}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                    voiceSettings.isMuted
                      ? 'opacity-40 cursor-not-allowed text-slate-500'
                      : isPlaying
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 animate-pulse'
                      : 'bg-purple-950/40 text-purple-400 hover:bg-purple-900/50 hover:text-purple-200 border border-purple-800/30'
                  }`}
                  title={
                    voiceSettings.isMuted
                      ? 'Voice is muted'
                      : isPlaying
                      ? 'Pause voice'
                      : 'Play voice reply'
                  }
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3 fill-purple-300 text-purple-300" />
                      <span>Speaking...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-purple-400 text-purple-400" />
                      <span>Speak</span>
                    </>
                  )}
                </button>

                {/* Copy text button */}
                <button
                  onClick={handleCopy}
                  className="p-1 hover:text-purple-300 text-slate-500 transition-colors cursor-pointer"
                  title="Copy message"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            ) : null}

            {/* Timestamp & Status */}
            <div className="flex items-center gap-1.5 ml-auto text-[10px] text-slate-400/90 font-mono">
              <span>{formatTime(message.timestamp)}</span>
              {isRobi && (
                <span className="text-purple-300 text-[10px]" title="Delivered">
                  ✓✓
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Robi's Avatar (Right) */}
      {isRobi && (
        <div className="w-8 h-8 rounded-xl bg-purple-900/70 border border-purple-600/50 flex items-center justify-center shrink-0 mt-1 shadow-md">
          <User className="w-4 h-4 text-purple-200" />
        </div>
      )}
    </div>
  );
};
