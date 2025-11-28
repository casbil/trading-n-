import React, { useRef, useEffect } from 'react';
import { TradeLog, TradeType } from '../types';
import { TrendingUp, TrendingDown, History } from 'lucide-react';

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
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col h-[450px]">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-xl">
        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4" /> Order History
        </h2>
        <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full font-mono">{trades.length} Orders</span>
      </div>

      <div className="grid grid-cols-4 px-4 py-2 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-700/50">
        <div className="col-span-1">Side/Time</div>
        <div className="col-span-1 text-right">Price</div>
        <div className="col-span-1 text-right">Amount</div>
        <div className="col-span-1 text-right">PnL</div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 scroll-smooth"
      >
        {trades.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 text-sm">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-2">
                <History className="w-6 h-6 opacity-20" />
            </div>
            <span>No trades executed yet</span>
          </div>
        )}
        
        {trades.map((trade) => (
          <div 
            key={trade.id}
            className={`p-2.5 rounded-lg grid grid-cols-4 items-center border hover:brightness-110 transition-all ${
              trade.type === TradeType.BUY 
                ? 'bg-emerald-950/20 border-emerald-900/30' 
                : 'bg-rose-950/20 border-rose-900/30'
            }`}
          >
            {/* Column 1: Type & Time */}
            <div className="col-span-1 flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${
                trade.type === TradeType.BUY ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {trade.type === TradeType.BUY ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-bold ${
                   trade.type === TradeType.BUY ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {trade.type}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{trade.timestamp}</span>
              </div>
            </div>

            {/* Column 2: Price */}
            <div className="col-span-1 text-right font-mono text-xs text-slate-300">
                ${trade.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>

            {/* Column 3: Amount */}
            <div className="col-span-1 text-right">
                 <div className="text-xs font-mono text-slate-300">{trade.amount.toFixed(4)} BTC</div>
                 <div className="text-[10px] text-slate-500">${trade.totalValue.toLocaleString()}</div>
            </div>

            {/* Column 4: PnL */}
            <div className="col-span-1 text-right">
              {trade.type === TradeType.SELL && trade.profitLoss !== undefined ? (
                <span className={`text-xs font-bold font-mono ${trade.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}
                </span>
              ) : (
                <span className="text-slate-600 text-[10px]">-</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeList;