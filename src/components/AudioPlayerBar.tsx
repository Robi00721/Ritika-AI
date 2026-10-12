import React from 'react';
import { Play, Pause, Square, Volume2, VolumeX, FastForward } from 'lucide-react';
import { VoiceSettings } from '../types/chat';

interface AudioPlayerBarProps {
  isPlaying: boolean;
  activeText: string;
  voiceSettings: VoiceSettings;
  onTogglePlayPause: () => void;
  onStop: () => void;
  onChangeSpeed: (newSpeed: number) => void;
  onToggleMute: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isPlaying,
  activeText,
  voiceSettings,
  onTogglePlayPause,
  onStop,
  onChangeSpeed,
  onToggleMute,
}) => {
  const speeds = [0.8, 1.0, 1.25, 1.5];
  const nextSpeedIndex = (speeds.indexOf(voiceSettings.speed) + 1) % speeds.length;
  const nextSpeed = speeds[nextSpeedIndex] || 1.0;

  return (
    <div className="w-full bg-[#160f2d] border-t border-purple-800/40 px-3.5 py-2 flex items-center justify-between text-xs text-purple-200 shadow-xl transition-all select-none">
      {/* Left: Animated Soundwave & Snippet */}
      <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
        {/* Equalizer animation */}
        <div className="flex items-end gap-0.5 h-4 w-4 shrink-0">
          <span
            className={`w-0.5 bg-purple-400 rounded-full transition-all ${
              isPlaying ? 'animate-pulse h-3.5' : 'h-1.5'
            }`}
          />
          <span
            className={`w-0.5 bg-fuchsia-400 rounded-full transition-all ${
              isPlaying ? 'animate-bounce h-4' : 'h-2'
            }`}
          />
          <span
            className={`w-0.5 bg-purple-300 rounded-full transition-all ${
              isPlaying ? 'animate-pulse h-2.5' : 'h-1'
            }`}
          />
          <span
            className={`w-0.5 bg-purple-500 rounded-full transition-all ${
              isPlaying ? 'animate-bounce h-3' : 'h-2'
            }`}
          />
        </div>

        <div className="flex flex-col truncate">
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 font-mono">
            {isPlaying ? 'Ritika Speaking' : 'Voice Paused'}
          </span>
          <span className="text-[11px] text-slate-300 truncate">
            {activeText || 'Voice output stream'}
          </span>
        </div>
      </div>

      {/* Right: Controls (Play/Pause, Stop, Speed, Mute) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Speed toggle */}
        <button
          onClick={() => onChangeSpeed(nextSpeed)}
          className="px-2 py-1 rounded-md text-[10px] font-mono font-semibold bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-300 cursor-pointer"
          title={`Speech speed: ${voiceSettings.speed}x (Click to cycle)`}
        >
          {voiceSettings.speed}x
        </button>

        {/* Play / Pause */}
        <button
          onClick={onTogglePlayPause}
          className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/50 transition-transform active:scale-95 cursor-pointer"
          title={isPlaying ? 'Pause speech' : 'Resume speech'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
        </button>

        {/* Stop */}
        <button
          onClick={onStop}
          className="p-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/40 cursor-pointer"
          title="Stop speech"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Mute */}
        <button
          onClick={onToggleMute}
          className="p-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/40 cursor-pointer"
          title={voiceSettings.isMuted ? 'Unmute voice' : 'Mute voice'}
        >
          {voiceSettings.isMuted ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};
