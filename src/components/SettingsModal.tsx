import React, { useState, useEffect } from 'react';
import {
  X,
  Terminal,
  Volume2,
  Sliders,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Activity,
  Layers,
  Sparkles,
  Info,
  Key,
  Smartphone,
  Trash2,
  Plus,
  ShieldCheck,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  ConnectionStatus,
  PersonalitySettings,
  TermuxConfig,
  VoiceSettings,
} from '../types/chat';
import { termuxClient, PingResult } from '../services/termuxClient';
import { voiceService } from '../services/voiceService';
import { apiKeysService, APIKeyEntry, AIProvider } from '../services/apiKeysService';
import { TermuxCodeSnippet } from './TermuxCodeSnippet';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  termuxConfig: TermuxConfig;
  onSaveTermuxConfig: (cfg: TermuxConfig) => void;
  voiceSettings: VoiceSettings;
  onSaveVoiceSettings: (stg: VoiceSettings) => void;
  personalitySettings: PersonalitySettings;
  onSavePersonalitySettings: (stg: PersonalitySettings) => void;
  connectionStatus: ConnectionStatus;
  onStatusChange: (status: ConnectionStatus) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  termuxConfig,
  onSaveTermuxConfig,
  voiceSettings,
  onSaveVoiceSettings,
  personalitySettings,
  onSavePersonalitySettings,
  connectionStatus,
  onStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState<'termux' | 'api_keys' | 'personality' | 'voice' | 'apk'>('termux');
  const [localTermux, setLocalTermux] = useState<TermuxConfig>(termuxConfig);
  const [localVoice, setLocalVoice] = useState<VoiceSettings>(voiceSettings);
  const [localPersonality, setLocalPersonality] = useState<PersonalitySettings>(personalitySettings);
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<APIKeyEntry[]>([]);
  const [activeProvider, setActiveProvider] = useState<'termux' | 'gemini' | 'openrouter' | 'mock'>('termux');
  const [newKeyProvider, setNewKeyProvider] = useState<AIProvider>('gemini');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  const [pingResult, setPingResult] = useState<PingResult | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setLocalTermux(termuxConfig);
    setLocalVoice(voiceSettings);
    setLocalPersonality(personalitySettings);
    if (isOpen) {
      setAvailableVoices(voiceService.getVoices());
      setApiKeys(apiKeysService.getKeys());
      setActiveProvider(apiKeysService.getActiveProvider());
    }
  }, [isOpen, termuxConfig, voiceSettings, personalitySettings]);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    onStatusChange('connecting');

    const result = await termuxClient.pingServer(localTermux);
    setPingResult(result);
    setIsPinging(false);

    if (result.success) {
      onStatusChange('connected');
    } else {
      onStatusChange('error');
    }
  };

  const handleAddAPIKey = () => {
    if (!newKeyValue.trim()) return;
    const entry = apiKeysService.addKey(newKeyProvider, newKeyValue, newKeyLabel);
    setApiKeys(apiKeysService.getKeys());
    setNewKeyValue('');
    setNewKeyLabel('');
  };

  const handleRemoveKey = (id: string) => {
    apiKeysService.removeKey(id);
    setApiKeys(apiKeysService.getKeys());
  };

  const handleToggleKey = (id: string, active: boolean) => {
    apiKeysService.toggleKey(id, active);
    setApiKeys(apiKeysService.getKeys());
  };

  const handleTestKey = async (entry: APIKeyEntry) => {
    setTestingKeyId(entry.id);
    setTestResult(null);
    const res = await apiKeysService.testKey(entry.key, entry.provider, entry.model);
    setTestingKeyId(null);
    setTestResult({ id: entry.id, success: res.success, msg: `${res.message} (${res.latencyMs}ms)` });
  };

  const handleSaveAll = () => {
    onSaveTermuxConfig(localTermux);
    onSaveVoiceSettings(localVoice);
    onSavePersonalitySettings(localPersonality);
    apiKeysService.setActiveProvider(activeProvider);
    onClose();
  };

  const handleTestVoice = () => {
    voiceService.speak(
      'voice_test_msg',
      'Abe Robi! Sunayi de raha hai na mera voice? Kaan khol kar sun, Ritika bol rahi hai!',
      localVoice
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-[#0c081c] border border-purple-800/60 rounded-3xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-[#110b24] border-b border-purple-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-100">Ritika AI Settings</h2>
                <span className="text-[10px] font-mono font-semibold text-purple-300 bg-purple-900/70 border border-purple-700/60 px-1.5 py-0.2 rounded-md">
                  v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-purple-300/70">
                Termux API, Provider Keys, Personality & Android APK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1.5 bg-[#0e0920] border-b border-purple-950/70 gap-1 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('termux')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'termux'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-950'
                : 'text-slate-400 hover:text-purple-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Termux</span>
          </button>
          <button
            onClick={() => setActiveTab('api_keys')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'api_keys'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-950'
                : 'text-slate-400 hover:text-purple-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Keys</span>
          </button>
          <button
            onClick={() => setActiveTab('personality')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'personality'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-950'
                : 'text-slate-400 hover:text-purple-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personality</span>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-950'
                : 'text-slate-400 hover:text-purple-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-950'
                : 'text-slate-400 hover:text-purple-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android APK</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: TERMUX SETTINGS */}
          {activeTab === 'termux' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-purple-200">AI Response Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProvider('termux');
                      setLocalTermux({ ...localTermux, mode: 'termux' });
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      activeProvider === 'termux'
                        ? 'bg-purple-950/80 border-purple-500 shadow-md shadow-purple-950'
                        : 'bg-[#140e29] border-purple-900/40 text-slate-400'
                    }`}
                  >
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      Termux Backend
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Local Python server on phone (127.0.0.1:8000)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProvider('mock');
                      setLocalTermux({ ...localTermux, mode: 'mock' });
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      activeProvider === 'mock'
                        ? 'bg-purple-950/80 border-purple-500 shadow-md shadow-purple-950'
                        : 'bg-[#140e29] border-purple-900/40 text-slate-400'
                    }`}
                  >
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Mock Engine
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Built-in sarcastic Hinglish offline engine
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-purple-200">Termux Base URL</label>
                <input
                  type="text"
                  value={localTermux.baseUrl}
                  onChange={(e) => setLocalTermux({ ...localTermux, baseUrl: e.target.value })}
                  placeholder="http://127.0.0.1:8000"
                  className="w-full bg-[#140e29] border border-purple-900/60 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  Phone ke andar localhost <code className="text-purple-300">http://127.0.0.1:8000</code> hota hai.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestPing}
                  disabled={isPinging}
                  className="px-4 py-2 rounded-xl bg-purple-950/70 border border-purple-700/60 hover:bg-purple-900/70 text-purple-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? 'Pinging Termux...' : 'Ping Termux (Test Connection)'}</span>
                </button>
              </div>

              {pingResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  pingResult.success ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                }`}>
                  {pingResult.success ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                  <span>{pingResult.statusText || pingResult.error || 'Server responded'} ({pingResult.latencyMs}ms)</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: API KEYS (GEMINI & OPENROUTER WITH ROTATION) */}
          {activeTab === 'api_keys' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#140e29] border border-purple-900/40 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-purple-200 block">Client-Side Secure Key Vault</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    API Keys are stored securely in your browser's private local vault. They are <strong>never hardcoded</strong> into the APK or sent to any third party. Multiple keys will <strong>automatically rotate</strong> if one hits rate limits (HTTP 429).
                  </p>
                </div>
              </div>

              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-purple-200">Active Direct AI Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveProvider('gemini')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeProvider === 'gemini'
                        ? 'bg-purple-950/80 border-purple-500 text-white'
                        : 'bg-[#140e29] border-purple-900/40 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold block text-xs">Google Gemini</span>
                    <span className="text-[10px] text-purple-300/70">gemini-2.5-flash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveProvider('openrouter')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeProvider === 'openrouter'
                        ? 'bg-purple-950/80 border-purple-500 text-white'
                        : 'bg-[#140e29] border-purple-900/40 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold block text-xs">OpenRouter</span>
                    <span className="text-[10px] text-purple-300/70">llama-3.3-70b</span>
                  </button>
                </div>
              </div>

              {/* Add Key Form */}
              <div className="p-3.5 rounded-2xl bg-[#110a24] border border-purple-800/40 space-y-2.5">
                <span className="font-semibold text-purple-200 block">Add New API Key</span>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newKeyProvider}
                    onChange={(e) => setNewKeyProvider(e.target.value as any)}
                    className="col-span-1 bg-[#180e35] border border-purple-900/60 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs"
                  >
                    <option value="gemini">Gemini</option>
                    <option value="openrouter">OpenRouter</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Key Label (e.g. Primary)"
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                    className="col-span-2 bg-[#180e35] border border-purple-900/60 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs"
                  />
                </div>
                <input
                  type="password"
                  placeholder="Paste API Key (AIzaSy... or sk-or-...)"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  className="w-full bg-[#180e35] border border-purple-900/60 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddAPIKey}
                  disabled={!newKeyValue.trim()}
                  className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Key to Vault</span>
                </button>
              </div>

              {/* Stored Keys List */}
              <div className="space-y-2">
                <span className="font-semibold text-purple-200 block">Configured API Keys ({apiKeys.length})</span>
                {apiKeys.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic p-2 bg-[#140e29] rounded-xl text-center">
                    No keys added yet. Add a key above or use the Termux backend.
                  </p>
                ) : (
                  apiKeys.map((k) => (
                    <div
                      key={k.id}
                      className="p-3 rounded-xl bg-[#140e29] border border-purple-900/50 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-100 block">{k.label}</span>
                          <span className="text-[10px] text-purple-300 uppercase font-mono">
                            {k.provider} · {k.key.substring(0, 7)}...{k.key.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleKey(k.id, !k.isActive)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold cursor-pointer ${
                              k.isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {k.isActive ? 'Active' : 'Disabled'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTestKey(k)}
                            disabled={testingKeyId === k.id}
                            className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-200 border border-purple-800 text-[10px] font-semibold hover:bg-purple-900 cursor-pointer disabled:opacity-50"
                          >
                            {testingKeyId === k.id ? 'Testing...' : 'Test'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveKey(k.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {testResult && testResult.id === k.id && (
                        <div className={`p-2 rounded-lg text-[10px] font-mono ${
                          testResult.success ? 'bg-emerald-950/60 text-emerald-300' : 'bg-rose-950/60 text-rose-300'
                        }`}>
                          {testResult.msg}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PERSONALITY SETTINGS */}
          {activeTab === 'personality' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-purple-200">Ritika's Attitude & Temperament</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'arrogant_playful', label: 'Arrogant & Playful', desc: 'Proud, stubborn, teases Robi with witty banter' },
                    { id: 'super_sarcastic', label: 'Super Sarcastic', desc: 'Maximum sarcasm and biting humor' },
                    { id: 'caring_teasing', label: 'Caring Teaser', desc: 'Warm underneath, but pretends to be stubborn' },
                    { id: 'bossy', label: 'Bossy Leader', desc: 'Orders Robi around and acts superior' },
                  ].map((att) => (
                    <button
                      key={att.id}
                      type="button"
                      onClick={() => setLocalPersonality({ ...localPersonality, attitude: att.id as any })}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        localPersonality.attitude === att.id
                          ? 'bg-purple-950/80 border-purple-500 shadow-md shadow-purple-950'
                          : 'bg-[#140e29] border-purple-900/40 text-slate-400'
                      }`}
                    >
                      <span className="font-bold text-slate-100">{att.label}</span>
                      <span className="text-[10px] text-slate-400">{att.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-purple-200">Response Length</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'concise', label: 'Concise (1-2 lines)' },
                    { id: 'normal', label: 'Normal (SMS style)' },
                    { id: 'detailed', label: 'Detailed' },
                  ].map((len) => (
                    <button
                      key={len.id}
                      type="button"
                      onClick={() => setLocalPersonality({ ...localPersonality, responseLength: len.id as any })}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                        localPersonality.responseLength === len.id
                          ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                          : 'bg-[#140e29] border-purple-900/40 text-slate-400'
                      }`}
                    >
                      {len.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-purple-200">Conversation Language</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'hinglish', label: 'Hinglish (Default)' },
                    { id: 'hindi', label: 'Hindi Mix' },
                    { id: 'english', label: 'Sassy English' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLocalPersonality({ ...localPersonality, language: lang.id as any })}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                        localPersonality.language === lang.id
                          ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                          : 'bg-[#140e29] border-purple-900/40 text-slate-400'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VOICE SETTINGS */}
          {activeTab === 'voice' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#140e29] border border-purple-900/40">
                <div>
                  <span className="font-semibold text-purple-200 block">Auto-Speak Replies</span>
                  <span className="text-[11px] text-slate-400">
                    Ritika speaks out loud every time she sends a reply
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalVoice({ ...localVoice, autoSpeakReplies: !localVoice.autoSpeakReplies })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                    localVoice.autoSpeakReplies ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {localVoice.autoSpeakReplies ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="font-semibold text-purple-200">Speed (Rate)</label>
                  <span className="text-purple-300 font-mono">{localVoice.speed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={localVoice.speed}
                  onChange={(e) => setLocalVoice({ ...localVoice, speed: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="font-semibold text-purple-200">Pitch (Tone)</label>
                  <span className="text-purple-300 font-mono">{localVoice.pitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.6"
                  step="0.05"
                  value={localVoice.pitch}
                  onChange={(e) => setLocalVoice({ ...localVoice, pitch: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <button
                type="button"
                onClick={handleTestVoice}
                className="w-full py-2.5 rounded-xl bg-purple-950/70 border border-purple-700/60 hover:bg-purple-900/60 text-purple-200 font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Test Ritika Voice</span>
              </button>
            </div>
          )}

          {/* TAB 5: ANDROID APK & CAPACITOR */}
          {activeTab === 'apk' && (
            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/70 to-[#1b1035] border border-purple-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-100 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    Capacitor Android Package
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-900 border border-purple-700 text-purple-200">
                    com.robi.ritikaai
                  </span>
                </div>
                <p className="text-[11px] text-purple-200/90">
                  Android project successfully configured in <code className="font-mono text-purple-300">./android</code> with cleartext HTTP enabled for Termux localhost.
                </p>
              </div>

              {/* GitHub Actions 1-Click APK Build */}
              <div className="p-3.5 rounded-2xl bg-[#140e29] border border-purple-900/40 space-y-2">
                <span className="font-semibold text-purple-200 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Method A: Automated GitHub Actions (.APK Build)
                </span>
                <p className="text-[11px] text-slate-300">
                  Workflow file <code className="text-purple-300 font-mono">.github/workflows/build-apk.yml</code> is ready.
                  Push code to GitHub &rarr; GitHub Actions Ubuntu runner (with JDK 17 & Android SDK) will automatically compile and produce <code className="text-purple-300 font-mono">RitikaAI-v1.0.0-debug-apk</code> for direct download!
                </p>
              </div>

              {/* Local / Termux Build Commands */}
              <div className="p-3.5 rounded-2xl bg-[#140e29] border border-purple-900/40 space-y-2">
                <span className="font-semibold text-purple-200 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Method B: Build via Gradle (PC or Termux)
                </span>
                <div className="bg-[#090613] p-2.5 rounded-xl border border-purple-950 font-mono text-[11px] text-purple-200 space-y-1">
                  <p>cd android</p>
                  <p>chmod +x gradlew</p>
                  <p>./gradlew assembleDebug</p>
                </div>
                <p className="text-[10px] text-slate-400">
                  Output path: <code className="text-purple-300">android/app/build/outputs/apk/debug/app-debug.apk</code>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#110b24] border-t border-purple-900/60 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-purple-900 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-xs font-semibold text-white shadow-lg shadow-purple-900/50 transition-colors cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
