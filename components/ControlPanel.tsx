import React from 'react';
import { Play, Pause, Zap, Clock } from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  onToggle: () => void;
  interval: number;
  onIntervalChange: (value: number) => void;
  nextAction: 'BUY' | 'SELL';
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  isRunning, 
  onToggle, 
  interval, 
  onIntervalChange,
  nextAction
}) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-4">
        <Zap className="text-yellow-400 w-5 h-5" />
        <h2 className="text-lg font-bold text-white">Bot Controls</h2>
      </div>

      {/* Main Toggle */}
      <button
        onClick={onToggle}
        className={`w-full py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 ${
          isRunning 
            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
        }`}
      >
        {isRunning ? (
          <>
            <Pause className="w-6 h-6" /> STOP BOT
          </>
        ) : (
          <>
            <Play className="w-6 h-6" /> START TRADING
          </>
        )}
      </button>

      {/* Interval Slider */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-slate-400 font-medium">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> Interval</span>
          <span className="text-white">{interval.toFixed(1)}s</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="5.0"
          step="0.1"
          value={interval}
          onChange={(e) => onIntervalChange(parseFloat(e.target.value))}
          disabled={isRunning}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
        />
        <p className="text-xs text-slate-500">
          Adjusts how frequently the bot triggers a trade.
        </p>
      </div>

      {/* Next Action Indicator */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-center">
        <span className="text-slate-400 text-xs uppercase tracking-widest">Next Signal</span>
        <div className={`text-3xl font-black mt-1 ${nextAction === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {nextAction === 'BUY' ? '↑ UP' : '↓ DOWN'}
        </div>
      </div>

    </div>
  );
};

export default ControlPanel;