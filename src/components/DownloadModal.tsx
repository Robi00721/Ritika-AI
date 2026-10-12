import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Terminal,
  Code2,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { termuxClient } from '../services/termuxClient';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'python' | 'source'>('android');
  const [copiedPython, setCopiedPython] = useState(false);
  const [copiedTermuxCmd, setCopiedTermuxCmd] = useState(false);
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();

  if (!isOpen) return null;

  const pythonCode = termuxClient.getTermuxFastApiCode();

  const handleDownloadPythonFile = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ritika_termux_server.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZipFile = async () => {
    try {
      const res = await fetch('/ritika-ai-v1.0.0.zip');
      if (!res.ok) throw new Error('Fetch failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ritika-ai-v1.0.0.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.location.href = '/ritika-ai-v1.0.0.zip';
    }
  };

  const handleCopyPython = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopiedPython(true);
    setTimeout(() => setCopiedPython(false), 2000);
  };

  const handleCopyTermuxCmd = () => {
    const cmd = `pkg update && pkg install python -y && pip install fastapi uvicorn && python ritika_termux_server.py`;
    navigator.clipboard.writeText(cmd);
    setCopiedTermuxCmd(true);
    setTimeout(() => setCopiedTermuxCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0c081c] border border-purple-800/60 rounded-3xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#110b24] border-b border-purple-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center">
              <Download className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-100">Ritika AI Download</h2>
                <span className="text-[10px] font-mono font-semibold text-purple-300 bg-purple-900/70 border border-purple-700/60 px-1.5 py-0.2 rounded-md">
                  v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-purple-300/70">
                Official Release v1.0.0 · APK, PWA & Termux script
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

        {/* Tab selection */}
        <div className="flex p-2 bg-[#0e0920] border-b border-purple-950/70 gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-950'
                : 'text-slate-400 hover:text-purple-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install on Android</span>
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'python'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-950'
                : 'text-slate-400 hover:text-purple-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Termux Python (.py)</span>
          </button>
          <button
            onClick={() => setActiveTab('source')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'source'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-950'
                : 'text-slate-400 hover:text-purple-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Source Code</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: INSTALL ON ANDROID */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              {/* Status Box */}
              <div className="p-3.5 rounded-2xl bg-[#140e29] border border-purple-900/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-purple-200 block">
                    {isInstalled ? 'App Already Installed' : 'Ready to Install on Android'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isInstalled
                      ? 'Running in full-screen standalone mode.'
                      : 'Runs like a native Android APK with home screen icon.'}
                  </span>
                </div>
                {isInstallable && (
                  <button
                    onClick={install}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-xs font-semibold text-white shadow-md shadow-purple-950 cursor-pointer"
                  >
                    Install Now
                  </button>
                )}
              </div>

              {/* Step-by-Step Android Instructions */}
              <div className="p-4 rounded-2xl bg-[#140e29] border border-purple-900/40 space-y-3">
                <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  Method 1: Direct WebAPK Install (Recommended - 10 Seconds):
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  <li>
                    Open this app link in <strong>Google Chrome</strong> on Android.
                  </li>
                  <li>
                    Tap Chrome menu <strong>three dots (⋮)</strong> at top right.
                  </li>
                  <li>
                    Tap <strong>"Install app"</strong>. Android automatically builds a native <strong>WebAPK</strong> file and installs it into your app drawer with full-screen access!
                  </li>
                </ol>
              </div>

              {/* Method 2: Standalone .APK File via PWABuilder */}
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Method 2: Standalone Signed .APK File
                  </span>
                  <a
                    href="https://www.pwabuilder.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] font-medium text-purple-300 hover:text-purple-100 underline"
                  >
                    <span>PWABuilder</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Agar aapko WhatsApp par share karne ke liye direct <strong>.apk file</strong> chahiye:
                </p>
                <div className="bg-[#090613] p-2.5 rounded-xl border border-purple-950 text-[11px] text-slate-300 space-y-1">
                  <p>1. Go to <strong>pwabuilder.com</strong></p>
                  <p>2. Paste app URL: <code className="text-purple-300 font-mono text-[10px] break-all">{window.location.origin}</code></p>
                  <p>3. Click <strong>Package for Android</strong> &rarr; Download your compiled <strong>.apk</strong>!</p>
                </div>
              </div>

              {/* iOS Guide if on iPhone */}
              {isIOS && (
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200 space-y-1.5">
                  <span className="font-semibold text-purple-300">On iPhone / iPad (Safari):</span>
                  <p className="text-[11px] text-slate-300">
                    Tap the <strong>Share</strong> button at bottom of Safari, then tap <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TERMUX PYTHON SCRIPT */}
          {activeTab === 'python' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#140e29] border border-purple-900/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-purple-200 block">
                    ritika_termux_server.py
                  </span>
                  <span className="text-[11px] text-slate-400">
                    FastAPI Python server with CORS and /chat endpoint
                  </span>
                </div>
                <button
                  onClick={handleDownloadPythonFile}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-purple-950 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .py</span>
                </button>
              </div>

              {/* Quick Run in Termux */}
              <div className="p-3.5 rounded-2xl bg-[#140e29] border border-purple-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-300">
                    One-line Termux Setup Command:
                  </span>
                  <button
                    onClick={handleCopyTermuxCmd}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedTermuxCmd ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Command</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-[#090613] border border-purple-950 font-mono text-[11px] text-purple-200 break-all select-all">
                  pkg install python -y &amp;&amp; pip install fastapi uvicorn &amp;&amp; python ritika_termux_server.py
                </div>
              </div>

              {/* Copy Full Python Source */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Script Code:
                </span>
                <button
                  onClick={handleCopyPython}
                  className="px-2.5 py-1 rounded-lg bg-purple-900/50 hover:bg-purple-900 text-purple-200 text-xs border border-purple-800/40 flex items-center gap-1 cursor-pointer"
                >
                  {copiedPython ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Full Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl bg-[#090613] border border-purple-950 p-3 overflow-x-auto max-h-[180px]">
                <pre className="text-[11px] font-mono text-purple-200/90 leading-relaxed">
                  {pythonCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SOURCE CODE & EXPORT */}
          {activeTab === 'source' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 to-[#1b1035] border border-purple-700/60 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-purple-100 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      ritika-ai-v1.0.0.zip
                    </span>
                    <span className="text-[11px] text-purple-300/80">
                      Complete project archive ready to extract and run
                    </span>
                  </div>
                  <button
                    onClick={handleDownloadZipFile}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-purple-950 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .ZIP</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#140e29] border border-purple-900/40 space-y-2">
                <span className="font-semibold text-purple-200 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  Full Application Codebase
                </span>
                <p>
                  This project is a React 19 + TypeScript + Vite web app styled with Tailwind CSS v4.
                </p>
                <div className="space-y-1 text-[11px] text-slate-400 font-mono bg-[#090613] p-2.5 rounded-xl border border-purple-950">
                  <p># Run locally on your computer:</p>
                  <p>npm install</p>
                  <p>npm run dev</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#140e29] border border-purple-900/40 space-y-2">
                <span className="font-semibold text-purple-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  AI Studio Export
                </span>
                <p>
                  In the Google AI Studio Build interface, you can download the whole repository as a ZIP archive or push it directly to GitHub using the top navigation options.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#110b24] border-t border-purple-900/60 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-xs font-semibold text-white shadow-md shadow-purple-950 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
