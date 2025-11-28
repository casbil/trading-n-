import React, { useRef, useEffect } from 'react';
import { TradeLog, TradeType } from '../types';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface TradeListProps {
  trades: TradeLog[];
}

const TradeList: React.FC<TradeListProps> = ({ trades }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new trade
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [trades]);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col h-[400px]">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-xl">
        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Transaction Log
        </h2>
        <span className="text-xs text-slate-500">{trades.length} Actions</span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-2 scroll-smooth"
      >
        {trades.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-600 text-sm italic">
            Waiting for signals...
          </div>
        )}
        
        {trades.map((trade) => (
          <div 
            key={trade.id}
            className={`p-3 rounded-lg flex items-center justify-between border ${
              trade.type === TradeType.BUY 
                ? 'bg-emerald-900/10 border-emerald-900/30' 
                : 'bg-rose-900/10 border-rose-900/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                trade.type === TradeType.BUY ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {trade.type === TradeType.BUY ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${
                   trade.type === TradeType.BUY ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {trade.type}
                </span>
                <span className="text-xs text-slate-500">{trade.timestamp}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-slate-200 font-mono text-sm">
                ${trade.price.toFixed(2)}
              </div>
              {trade.type === TradeType.SELL && trade.profitLoss !== undefined && (
                <div className={`text-xs font-bold ${trade.profitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {trade.profitLoss >= 0 ? '+' : ''}{trade.profitLoss.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeList;