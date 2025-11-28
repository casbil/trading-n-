import React, { useRef, useEffect } from 'react';
import { SignalLog, SignalType, Outcome } from '../types';
import { ArrowUp, ArrowDown, History, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface TradeListProps {
  signals: SignalLog[];
}

const TradeList: React.FC<TradeListProps> = ({ signals }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [signals]);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col h-[450px]">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-xl">
        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4" /> Signal History
        </h2>
        <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full font-mono">{signals.length}</span>
      </div>

      <div className="grid grid-cols-4 px-4 py-2 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-700/50">
        <div className="col-span-1">Type/Time</div>
        <div className="col-span-1 text-right">Entry</div>
        <div className="col-span-1 text-right">Close</div>
        <div className="col-span-1 text-right">Result</div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 scroll-smooth"
      >
        {signals.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-2">
                <History className="w-6 h-6 opacity-20" />
            </div>
            <span>Waiting for signals...</span>
          </div>
        )}
        
        {signals.map((signal) => (
          <div 
            key={signal.id}
            className={`p-2.5 rounded-lg grid grid-cols-4 items-center border hover:brightness-110 transition-all ${
              signal.outcome === Outcome.ITM ? 'bg-emerald-950/20 border-emerald-900/30' :
              signal.outcome === Outcome.OTM ? 'bg-rose-950/20 border-rose-900/30' :
              'bg-slate-800 border-slate-700'
            }`}
          >
            {/* Column 1: Type & Time */}
            <div className="col-span-1 flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${
                signal.type === SignalType.CALL ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {signal.type === SignalType.CALL ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-bold ${
                   signal.type === SignalType.CALL ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {signal.type}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{signal.entryTime}</span>
              </div>
            </div>

            {/* Column 2: Entry */}
            <div className="col-span-1 text-right font-mono text-xs text-slate-300">
                ${signal.entryPrice.toFixed(0)}
            </div>

            {/* Column 3: Close */}
            <div className="col-span-1 text-right">
                 {signal.outcome === Outcome.PENDING ? (
                     <span className="text-[10px] text-amber-500 animate-pulse">Running...</span>
                 ) : (
                     <div className="text-xs font-mono text-slate-300">${signal.closePrice?.toFixed(0)}</div>
                 )}
            </div>

            {/* Column 4: Result */}
            <div className="col-span-1 flex justify-end">
              {signal.outcome === Outcome.ITM && (
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      WIN <CheckCircle2 size={10} />
                  </span>
              )}
              {signal.outcome === Outcome.OTM && (
                  <span className="flex items-center gap-1 text-rose-400 text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded">
                      LOSS <XCircle size={10} />
                  </span>
              )}
               {signal.outcome === Outcome.ATM && (
                  <span className="text-slate-400 text-xs">DRAW</span>
              )}
               {signal.outcome === Outcome.PENDING && (
                  <Clock size={14} className="text-amber-500 animate-spin" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeList;