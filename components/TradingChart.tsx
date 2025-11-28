import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PricePoint, TradeLog, TradeType } from '../types';

interface TradingChartProps {
  data: PricePoint[];
  trades: TradeLog[];
}

const TradingChart: React.FC<TradingChartProps> = ({ data, trades }) => {
  const lastPrice = data.length > 0 ? data[data.length - 1].value : 0;
  const isPositive = data.length > 1 ? data[data.length - 1].value >= data[data.length - 2].value : true;

  return (
    <div className="w-full h-[400px] bg-slate-800 rounded-xl border border-slate-700 p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Live Market Feed</h2>
        <div className={`text-2xl font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          ${lastPrice.toFixed(2)}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
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
            interval={Math.floor(data.length / 5)}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            orientation="right" 
            tick={{fill: '#94a3b8', fontSize: 12}}
            tickFormatter={(val) => val.toFixed(2)}
            width={60}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            itemStyle={{ color: '#f1f5f9' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            labelStyle={{ display: 'none' }}
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
          {/* Render lines for recent trades */}
          {trades.slice(-5).map((trade) => (
             <ReferenceLine 
                key={trade.id} 
                y={trade.price} 
                stroke={trade.type === TradeType.BUY ? "#10b981" : "#f43f5e"} 
                strokeDasharray="3 3"
                label={{ 
                    position: 'left', 
                    value: trade.type === TradeType.BUY ? 'B' : 'S',
                    fill: trade.type === TradeType.BUY ? "#10b981" : "#f43f5e",
                    fontSize: 10
                }} 
             />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TradingChart;