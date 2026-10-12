import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { termuxClient } from '../services/termuxClient';

export const TermuxCodeSnippet: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const code = termuxClient.getTermuxFastApiCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-purple-300 font-mono">
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span>ritika_termux_server.py</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-medium border border-purple-700/50 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy Python Script</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Code Box */}
      <div className="relative rounded-xl bg-[#090613] border border-purple-950 p-3 overflow-x-auto max-h-[220px]">
        <pre className="text-[11px] font-mono text-purple-200/90 leading-relaxed">
          {code}
        </pre>
      </div>

      {/* Steps to run in Termux */}
      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 text-xs text-slate-300 flex flex-col gap-1.5">
        <span className="font-semibold text-purple-300">Run in Android Termux:</span>
        <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono text-[11px]">
          <li>pkg install python</li>
          <li>pip install fastapi uvicorn</li>
          <li>nano ritika_server.py (paste code)</li>
          <li>python ritika_server.py</li>
        </ol>
      </div>
    </div>
  );
};
