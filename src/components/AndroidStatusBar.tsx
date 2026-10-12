import React, { useEffect, useState } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#07050d] text-slate-300 text-xs px-5 pt-2 pb-1.5 flex items-center justify-between select-none z-30 shrink-0">
      <div className="font-semibold tracking-tight text-[13px] text-purple-200/90 font-mono">
        {time || '10:00'}
      </div>

      {/* Simulated Android camera punch-hole spacer in center */}
      <div className="w-3.5 h-3.5 rounded-full bg-black/80 border border-purple-950/40 shadow-inner" />

      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-[10px] font-bold text-purple-400/80 font-mono tracking-wider">5G</span>
        <Signal className="w-3.5 h-3.5 text-purple-300/80" />
        <Wifi className="w-3.5 h-3.5 text-purple-300/80" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-slate-300">89%</span>
          <Battery className="w-4 h-4 text-purple-400 fill-purple-400/40" />
        </div>
      </div>
    </div>
  );
};
