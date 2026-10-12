import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Send, X, AlertCircle, Sparkles } from 'lucide-react';
import { voiceService } from '../services/voiceService';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceMessage: (text: string) => void;
  voiceLanguage: string;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onSendVoiceMessage,
  voiceLanguage,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [micSupported, setMicSupported] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setTranscript('');
      const supported = voiceService.isMicSupported();
      setMicSupported(supported);

      if (supported) {
        startRecording();
      }
    } else {
      voiceService.stopListening();
      setIsListening(false);
    }
    return () => {
      voiceService.stopListening();
    };
  }, [isOpen]);

  const startRecording = () => {
    setError(null);
    setIsListening(true);
    const ok = voiceService.startListening(
      (text, isFinal) => {
        setTranscript(text);
      },
      (err) => {
        setIsListening(false);
        setError(err);
      },
      () => {
        setIsListening(false);
      },
      voiceLanguage || 'hi-IN'
    );

    if (!ok) {
      setIsListening(false);
    }
  };

  const handleStopRecording = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const handleSend = () => {
    if (transcript.trim()) {
      onSendVoiceMessage(transcript.trim());
      onClose();
    }
  };

  const handleSimulateSpeech = (phrase: string) => {
    setTranscript(phrase);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-[#0f0a1f] border border-purple-800/50 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
            <span className="text-xs font-bold tracking-wider uppercase text-purple-300 font-mono">
              Voice Input (Android STT)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Wave / Mic Animation */}
        <div className="py-6 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            {/* Outer glowing pulsing circles */}
            <div
              className={`absolute -inset-4 rounded-full bg-purple-600/20 blur-md transition-all ${
                isListening ? 'scale-125 opacity-100 animate-pulse' : 'opacity-0'
              }`}
            />
            <button
              onClick={isListening ? handleStopRecording : startRecording}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-tr from-purple-600 to-fuchsia-600 text-white shadow-purple-600/50 scale-105'
                  : 'bg-purple-950 text-purple-300 border border-purple-800/60 hover:bg-purple-900'
              }`}
            >
              {isListening ? (
                <Mic className="w-9 h-9 animate-pulse" />
              ) : (
                <MicOff className="w-9 h-9" />
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-purple-200">
              {isListening
                ? 'Ritika sun rahi hai... Bol Robi!'
                : transcript
                ? 'Voice captured!'
                : 'Mic paused. Tap button to record.'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Target Lang: {voiceLanguage || 'Hinglish (hi-IN)'}
            </p>
          </div>
        </div>

        {/* Live Transcript Box */}
        <div className="bg-[#160f2d] border border-purple-900/50 rounded-2xl p-3 min-h-[72px] flex items-center justify-center text-center">
          {transcript ? (
            <p className="text-sm text-slate-100 font-medium break-words">{transcript}</p>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {error
                ? `Note: ${error}`
                : isListening
                ? 'Kuch bol Robi, transcript yaha aayegi...'
                : 'Yaha boli hui baat dikhegi...'}
            </p>
          )}
        </div>

        {/* Clear Notice about Termux STT & Browser speech recognition */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/30 text-[11px] text-purple-300/80">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-purple-200">Integration Notice:</strong> Speech-to-Text uses
            browser Android SpeechRecognition. Termux Python Whisper STT endpoint (
            <code className="text-purple-300 font-mono">/api/stt</code>) is pre-configured in
            Settings for future offline Android model inference.
          </p>
        </div>

        {/* Quick Voice Simulation Buttons if microphone is restricted */}
        {!transcript && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
              Sample Voice Inputs:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Abe Ritika, kaisi hai tu?',
                'Termux server setup samjhao',
                'Ek mast sarcastic joke sunao na',
              ].map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => handleSimulateSpeech(phrase)}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-purple-200 transition-colors"
                >
                  "{phrase}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-purple-950/60">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-purple-900/60 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!transcript.trim()}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-lg shadow-purple-900/40 transition-all active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Ritika</span>
          </button>
        </div>
      </div>
    </div>
  );
};
