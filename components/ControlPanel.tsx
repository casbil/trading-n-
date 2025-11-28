import React from 'react';
import { Play, Pause, Settings, ArrowUpCircle, ArrowDownCircle, Timer } from 'lucide-react';
import { SignalType } from '../types';

interface ControlPanelProps {
  isRunning: boolean;
  onToggle: () => void;
  expiryTime: number; // in seconds
  onExpiryChange: (seconds: number) => void;
  nextSignal: SignalType;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  isRunning, 
  onToggle, 
  expiryTime, 
  onExpiryChange,
  nextSignal
}) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-6 h-full">
      
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-4">
        <Settings className="text-slate-400 w-5 h-5" />
        <h2 className="text-lg font-bold text-white">Signal Config</h2>
      </div>

      {/* Main Toggle */}
      <button
        onClick={onToggle}
        className={`w-full py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg ${
          isRunning 
            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20'
        }`}
      >
        {isRunning ? (
          <>
            <Pause className="w-5 h-5" /> PAUSE SIGNALS
          </>
        ) : (
          <>
            <Play className="w-5 h-5" /> START GENERATOR
          </>
        )}
      </button>

      {/* Expiry Selector */}
      <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
        <div className="flex justify-between text-sm text-slate-400 font-medium">
          <span className="flex items-center gap-2"><Timer className="w-4 h-4 text-sky-400"/> Expiration (Time)</span>
          <span className="text-sky-400 font-mono">M{expiryTime / 60 < 1 ? '0.5' : expiryTime / 60}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
            {[30, 60, 300].map((sec) => (
                <button
                    key={sec}
                    onClick={() => onExpiryChange(sec)}
                    disabled={isRunning}
                    className={`text-xs font-bold py-2 rounded border transition-colors ${
                        expiryTime === sec 
                        ? 'bg-sky-500 text-white border-sky-400' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                >
                    {sec < 60 ? `${sec} S` : `M${sec/60}`}
                </button>
            ))}
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
            Matches Pocket Option expiration setting (S30, M1, M5).
        </p>
      </div>

      {/* Next Signal Indicator */}
      <div className="mt-auto bg-slate-900 p-4 rounded-lg border border-slate-700 text-center relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full ${nextSignal === SignalType.CALL ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Predicted Next Signal</span>
        
        <div className={`flex items-center justify-center gap-3 mt-3 ${nextSignal === SignalType.CALL ? 'text-emerald-400' : 'text-rose-400'}`}>
            {nextSignal === SignalType.CALL ? <ArrowUpCircle className="w-8 h-8" /> : <ArrowDownCircle className="w-8 h-8" />}
            <div className="text-4xl font-black tracking-tight">
                {nextSignal === SignalType.CALL ? 'CALL' : 'PUT'}
            </div>
        </div>
        
        <div className="text-[10px] text-slate-600 mt-2 uppercase">
            Wait for active signal...
        </div>
      </div>

    </div>
  );
};

export default ControlPanel;