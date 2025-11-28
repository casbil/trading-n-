import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PricePoint, SignalLog, SignalType } from '../types';

interface TradingChartProps {
  data: PricePoint[];
  signals: SignalLog[];
}

const TradingChart: React.FC<TradingChartProps> = ({ data, signals }) => {
  const lastPrice = data.length > 0 ? data[data.length - 1].value : 0;
  const isPositive = data.length > 1 ? data[data.length - 1].value >= data[data.length - 2].value : true;

  // Calculate domain padding for better visuals
  const minPrice = Math.min(...data.map(d => d.value));
  const maxPrice = Math.max(...data.map(d => d.value));
  // Dynamic padding based on volatility
  const padding = (maxPrice - minPrice) * 0.2; // Increase padding to keep price in middle

  // Filter signals to only show recent ones that match the visible time window (roughly)
  // For simplicity, we just show the last 10 signals
  const visibleSignals = signals.slice(-10);

  return (
    <div className="w-full h-[450px] bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
             <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">BTC/USD Live Feed</h2>
        </div>
        <div className={`text-3xl font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          ${lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
            <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
                dataKey="time" 
                hide={true} 
            />
            <YAxis 
                domain={[minPrice - padding, maxPrice + padding]} 
                orientation="right" 
                tick={{fill: '#94a3b8', fontSize: 11}}
                tickFormatter={(val) => val.toFixed(2)}
                width={60}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'BTC Price']}
                labelStyle={{ display: 'none' }}
                animationDuration={0}
            />
            <Area 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? "#10b981" : "#f43f5e"} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                isAnimationActive={false}
            />
            {/* Render lines for recent signals */}
            {visibleSignals.map((signal) => (
                <ReferenceLine 
                    key={signal.id} 
                    y={signal.entryPrice} 
                    stroke={signal.type === SignalType.CALL ? "#10b981" : "#f43f5e"} 
                    strokeDasharray="3 3"
                    label={{ 
                        position: 'left', 
                        value: signal.type === SignalType.CALL ? 'CALL' : 'PUT',
                        fill: signal.type === SignalType.CALL ? "#10b981" : "#f43f5e",
                        fontSize: 10,
                        fontWeight: 'bold',
                        dy: -10
                    }} 
                />
            ))}
            </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TradingChart;