import React, { useState } from 'react';
import { X, Search, Trash2, Download, MessageSquare, Sparkles, Brain, Check, Copy } from 'lucide-react';
import { ChatMessage, RobiMemoryItem } from '../types/chat';
import { memoryService } from '../services/memoryService';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  memoryItems: RobiMemoryItem[];
  onClearChat: () => void;
  onStartNewChat: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  memoryItems,
  onClearChat,
  onStartNewChat,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedExport, setCopiedExport] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'memory'>('history');

  if (!isOpen) return null;

  const filteredMessages = messages.filter((m) =>
    m.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportText = () => {
    const text = memoryService.exportChatAsText(messages);
    navigator.clipboard.writeText(text);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleDownloadFile = () => {
    const text = memoryService.exportChatAsText(messages);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ritika_AI_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const robiCount = messages.filter((m) => m.sender === 'robi').length;
  const ritikaCount = messages.filter((m) => m.sender === 'ritika').length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-[#0a0717] border-l border-purple-900/60 h-full flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-purple-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-purple-100">Chat History & Memory</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch (History vs Ritika's Memory about Robi) */}
        <div className="flex p-2 bg-[#120c24] border-b border-purple-950/60 gap-1">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-purple-900 text-purple-100 shadow-sm'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Messages ({messages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'memory'
                ? 'bg-purple-900 text-purple-100 shadow-sm'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Ritika's Memory</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'history' ? (
          <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-purple-400/60" />
              <input
                type="text"
                placeholder="Search conversation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#150f29] border border-purple-800/40 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-purple-400/40 outline-none focus:border-purple-500"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-[#140e28] border border-purple-900/40 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400">Robi Sent</span>
                <p className="text-base font-bold text-purple-300 font-mono">{robiCount}</p>
              </div>
              <div className="bg-[#140e28] border border-purple-900/40 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400">Ritika Replied</span>
                <p className="text-base font-bold text-fuchsia-300 font-mono">{ritikaCount}</p>
              </div>
            </div>

            {/* Message Feed / Search Results */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Koi message nahi mila
                </div>
              ) : (
                filteredMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border text-xs ${
                      m.sender === 'robi'
                        ? 'bg-purple-950/40 border-purple-800/30 text-purple-200'
                        : 'bg-[#150e2a] border-purple-900/30 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold text-purple-300">
                        {m.sender === 'robi' ? 'Robi' : 'Ritika'}
                      </span>
                      <span>
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="line-clamp-3 select-text">{m.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Actions: Export & Clear */}
            <div className="pt-2 border-t border-purple-950/60 flex flex-col gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportText}
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-xs font-medium text-purple-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedExport ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Chat</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadFile}
                  className="py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 text-xs font-medium text-purple-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Download .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onStartNewChat}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Start Fresh Chat
                </button>
                <button
                  onClick={onClearChat}
                  className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/40 text-rose-300 transition-colors cursor-pointer"
                  title="Clear Chat History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Memory Tab */
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 text-xs text-purple-200/90 leading-relaxed">
              <span className="font-semibold text-purple-300 flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Persistent AI Memory Bank
              </span>
              Ye wo context aur facts hain jo Ritika tumhare baare mein yaad rakhti hai taaki replies consistent aur personal rahein.
            </div>

            <div className="space-y-2">
              {memoryItems.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-xl bg-[#140e29] border border-purple-900/40 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-300">{mem.key}</span>
                    <span className="text-[10px] font-mono text-purple-400/60 uppercase">
                      {mem.category}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[12px]">{mem.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
