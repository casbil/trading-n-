import React from 'react';
import { Play, Pause, Zap, Clock, Settings } from 'lucide-react';

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
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-6 h-full">
      
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-4">
        <Settings className="text-slate-400 w-5 h-5" />
        <h2 className="text-lg font-bold text-white">Strategy Config</h2>
      </div>

      {/* Main Toggle */}
      <button
        onClick={onToggle}
        className={`w-full py-6 px-6 rounded-lg font-bold text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg ${
          isRunning 
            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20' 
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'
        }`}
      >
        {isRunning ? (
          <>
            <Pause className="w-7 h-7" /> HALT STRATEGY
          </>
        ) : (
          <>
            <Play className="w-7 h-7" /> EXECUTE STRATEGY
          </>
        )}
      </button>

      {/* Interval Slider */}
      <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
        <div className="flex justify-between text-sm text-slate-400 font-medium">
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-sky-400"/> Order Interval</span>
          <span className="text-sky-400 font-mono">{interval.toFixed(1)}s</span>
        </div>
        <input
          type="range"
          min="1.0"
          max="10.0"
          step="0.5"
          value={interval}
          onChange={(e) => onIntervalChange(parseFloat(e.target.value))}
          disabled={isRunning}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-50"
        />
        <p className="text-xs text-slate-500 leading-relaxed">
            Time between automated order execution signals. Lower intervals increase frequency and potential slippage.
        </p>
      </div>

      {/* Next Action Indicator */}
      <div className="mt-auto bg-slate-900 p-4 rounded-lg border border-slate-700 text-center relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full ${nextAction === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Signal Queue</span>
        <div className={`text-4xl font-black mt-2 tracking-tight ${nextAction === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {nextAction === 'BUY' ? 'BUY' : 'SELL'}
        </div>
        <div className="text-[10px] text-slate-600 mt-1 uppercase">Next Order Type</div>
      </div>

    </div>
  );
};

export default ControlPanel;