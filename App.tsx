import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PricePoint, TradeLog, TradeType } from './types';
import TradingChart from './components/TradingChart';
import ControlPanel from './components/ControlPanel';
import TradeList from './components/TradeList';
import AIAnalyst from './components/AIAnalyst';
import { Activity, ShieldCheck, Github } from 'lucide-react';

const INITIAL_PRICE = 100;
const TICK_RATE_MS = 100; // How fast the simulation updates (chart smoothness)

const App: React.FC = () => {
  // --- State ---
  const [isRunning, setIsRunning] = useState(false);
  const [intervalTime, setIntervalTime] = useState(1.5); // Default 1.5s
  
  // Simulation Data
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(INITIAL_PRICE);
  const [trades, setTrades] = useState<TradeLog[]>([]);
  
  // Trading Logic State
  const [isBuying, setIsBuying] = useState(true); // Toggles between BUY/SELL
  const lastTradeRef = useRef<TradeLog | null>(null);
  
  // --- Refs for Timers ---
  const simulationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tradingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Helpers ---
  
  // Generates next random price (Random Walk)
  const getNextPrice = (prev: number) => {
    const change = (Math.random() - 0.5) * 2; // Random movement between -1 and 1
    const volatility = 0.5;
    return Math.max(0.01, prev + (change * volatility));
  };

  const handleReset = () => {
    setIsRunning(false);
    setPriceData([]);
    setTrades([]);
    setCurrentPrice(INITIAL_PRICE);
    setIsBuying(true);
    lastTradeRef.current = null;
  };

  // --- Effects ---

  // 1. Market Simulation (Always runs to show a "live" feed, or only when app starts?)
  // Let's have the market running always for visuals, but trading only when "running"
  useEffect(() => {
    const tick = () => {
      setCurrentPrice(prev => {
        const next = getNextPrice(prev);
        setPriceData(currentData => {
            const now = new Date();
            const timeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
            const newPoint = { time: timeString, value: next };
            // Keep last 100 points
            const newData = [...currentData, newPoint];
            if (newData.length > 100) return newData.slice(1);
            return newData;
        });
        return next;
      });
    };

    simulationTimerRef.current = setInterval(tick, TICK_RATE_MS);

    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, []);

  // 2. The AutoTrader Bot Logic (The Swift Code Equivalent)
  useEffect(() => {
    if (isRunning) {
      tradingTimerRef.current = setInterval(() => {
        const action = isBuying ? TradeType.BUY : TradeType.SELL;
        
        // Logic for Profit Calculation (Simple FIFO for last trade)
        let profitLoss = undefined;
        if (action === TradeType.SELL && lastTradeRef.current) {
             profitLoss = currentPrice - lastTradeRef.current.price;
        }

        const newTrade: TradeLog = {
          id: Math.random().toString(36).substr(2, 9),
          type: action,
          price: currentPrice,
          timestamp: new Date().toLocaleTimeString(),
          profitLoss
        };

        setTrades(prev => [...prev, newTrade]);
        
        if (action === TradeType.BUY) {
            lastTradeRef.current = newTrade;
        } else {
            lastTradeRef.current = null; // Reset after sell (assuming pairs)
        }

        // Toggle state
        setIsBuying(prev => !prev);

      }, intervalTime * 1000);
    } else {
      if (tradingTimerRef.current) clearInterval(tradingTimerRef.current);
    }

    return () => {
      if (tradingTimerRef.current) clearInterval(tradingTimerRef.current);
    };
  }, [isRunning, intervalTime, isBuying, currentPrice]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-tr from-emerald-500 to-cyan-500 p-2 rounded-lg">
                <Activity className="text-white w-6 h-6" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-white tracking-tight">AutoTrader<span className="text-emerald-500">.swift</span> Visualizer</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Web Simulation</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={handleReset}
                className="text-sm text-slate-400 hover:text-white transition-colors"
             >
                Reset Simulation
             </button>
             <a 
               href="#" 
               className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors border border-slate-700"
               title="View Source"
             >
                <Github className="w-5 h-5" />
             </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Grid: Chart & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Left Column: Chart (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
             <TradingChart data={priceData} trades={trades} />
             
             {/* Stats Cards */}
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-slate-500 text-xs font-bold uppercase">Total Trades</span>
                    <div className="text-2xl font-mono text-white mt-1">{trades.length}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-slate-500 text-xs font-bold uppercase">Bot Status</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`w-3 h-3 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                        <span className="text-lg font-medium text-white">{isRunning ? 'Running' : 'Stopped'}</span>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 col-span-2 sm:col-span-2">
                     <span className="text-slate-500 text-xs font-bold uppercase">Net Profit (Simulated)</span>
                     <div className="text-2xl font-mono mt-1 text-slate-300">
                        {trades.reduce((acc, t) => acc + (t.profitLoss || 0), 0).toFixed(2) === "0.00" ? "--" : 
                            <span className={trades.reduce((acc, t) => acc + (t.profitLoss || 0), 0) >= 0 ? "text-emerald-400" : "text-rose-400"}>
                                {trades.reduce((acc, t) => acc + (t.profitLoss || 0), 0) >= 0 ? "+" : ""}{trades.reduce((acc, t) => acc + (t.profitLoss || 0), 0).toFixed(2)}
                            </span>
                        }
                     </div>
                </div>
             </div>
          </div>

          {/* Right Column: AI Analysis */}
          <div className="lg:col-span-1">
            <AIAnalyst priceData={priceData} isRunning={isRunning} />
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-xs text-slate-400 leading-relaxed">
                <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold">
                    <ShieldCheck className="w-4 h-4" /> Disclaimer
                </div>
                This is a simulation based on the "Alternator" algorithm (Buy/Sell every X seconds). 
                Market data is generated via random walk. Do not use for real financial advice.
            </div>
          </div>
        </div>

        {/* Bottom Grid: Controls & Logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ControlPanel 
                isRunning={isRunning} 
                onToggle={() => setIsRunning(!isRunning)} 
                interval={intervalTime}
                onIntervalChange={setIntervalTime}
                nextAction={isBuying ? 'BUY' : 'SELL'}
            />
            <TradeList trades={trades} />
        </div>
      </main>
    </div>
  );
};

export default App;