import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles } from 'lucide-react';
import { voiceService } from '../services/voiceService';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onOpenVoiceInput: () => void;
  disabled?: boolean;
}

const QUICK_PROMPTS = [
  'Abe Ritika, kaisi hai tu?',
  'Termux setup code dikhao',
  'Ek mast sarcastic advice de',
  'Chai piyogi mere sath?',
  'Pyaar karti hai mujhse? 😂',
  'Code mein bug aa gaya, help kar',
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onOpenVoiceInput,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="w-full bg-[#0d091a]/95 backdrop-blur-md border-t border-purple-950/70 p-2.5 sm:p-3 shrink-0 flex flex-col gap-2 z-20">
      {/* Quick Prompts Horizontal Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-[10px] text-purple-400/80 font-mono flex items-center gap-0.5 shrink-0 pl-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Tease:
        </span>
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => handleSelectPrompt(p)}
            disabled={disabled}
            className="px-2.5 py-1 rounded-full bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-200/90 text-[11px] whitespace-nowrap shrink-0 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Main Input Row */}
      <div className="flex items-end gap-2">
        {/* Voice Input Microphone Button */}
        <button
          type="button"
          onClick={() => {
            voiceService.playChime('mic');
            onOpenVoiceInput();
          }}
          disabled={disabled}
          className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-950 to-[#22133e] hover:from-purple-900 hover:to-[#2e1a53] border border-purple-700/50 text-purple-300 hover:text-purple-100 flex items-center justify-center shrink-0 shadow-md shadow-purple-950/40 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Voice Input (Mic)"
          aria-label="Microphone Voice Input"
        >
          <Mic className="w-5 h-5 text-purple-300" />
        </button>

        {/* Text Input Field */}
        <div className="flex-1 min-h-[44px] bg-[#140e27] border border-purple-800/40 focus-within:border-purple-500 rounded-2xl px-3 py-2 flex items-center transition-all shadow-inner">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ritika ko bol... (Hinglish)"
            disabled={disabled}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-purple-400/40 resize-none outline-none max-h-[120px] leading-relaxed"
          />
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="h-11 w-11 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/40 transition-all active:scale-95 cursor-pointer"
          title="Send message"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
