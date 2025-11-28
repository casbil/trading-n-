import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PricePoint, SignalLog, SignalType, SessionStats, Outcome } from './types';
import TradingChart from './components/TradingChart';
import ControlPanel from './components/ControlPanel';
import TradeList from './components/TradeList';
import AIAnalyst from './components/AIAnalyst';
import { Radio, Wifi, WifiOff, RefreshCw, Trophy } from 'lucide-react';

// For Pocket Option, we mostly care about recent volatility
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/btcusdt@miniTicker';

const App: React.FC = () => {
  // --- State ---
  const [isRunning, setIsRunning] = useState(false);
  const [expiryTime, setExpiryTime] = useState(60); // 60s default
  const [isConnected, setIsConnected] = useState(false);
  
  // Market Data
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  
  // App State
  const [signals, setSignals] = useState<SignalLog[]>([]);
  const [stats, setStats] = useState<SessionStats>({
      wins: 0, losses: 0, draws: 0, winRate: 0, totalSignals: 0
  });
  
  // Signal Logic
  const [nextSignal, setNextSignal] = useState<SignalType>(SignalType.CALL);
  
  // --- Refs ---
  const wsRef = useRef<WebSocket | null>(null);
  const generatorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- WebSocket Connection ---
  useEffect(() => {
    const connect = () => {
        const ws = new WebSocket(BINANCE_WS_URL);
        
        ws.onopen = () => {
            console.log('Connected to Binance');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const price = parseFloat(data.c); // 'c' is close price
            
            setCurrentPrice(price);
            
            setPriceData(prev => {
                const now = new Date();
                const timeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
                const newPoint = { time: timeString, value: price };
                const newData = [...prev, newPoint];
                if (newData.length > 150) return newData.slice(1); // Keep chart clean
                return newData;
            });
        };

        ws.onclose = () => {
            console.log('Disconnected from Binance');
            setIsConnected(false);
            setTimeout(connect, 3000);
        };

        wsRef.current = ws;
    };

    connect();

    return () => {
        if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // --- Check for Signal Outcomes ---
  useEffect(() => {
    // Check more frequently for higher precision
    checkerTimerRef.current = setInterval(() => {
        if (signals.length === 0) return;

        const now = Date.now();
        let statsUpdated = false;

        setSignals(prevSignals => {
            return prevSignals.map(signal => {
                // Skip if already processed
                if (signal.outcome !== Outcome.PENDING) return signal;

                const expiresAt = signal.createdAt + (signal.durationSeconds * 1000);
                
                if (now >= expiresAt) {
                    statsUpdated = true;
                    // Check outcome
                    let outcome = Outcome.ATM;
                    
                    if (signal.type === SignalType.CALL) {
                        if (currentPrice > signal.entryPrice) outcome = Outcome.ITM;
                        else if (currentPrice < signal.entryPrice) outcome = Outcome.OTM;
                    } else {
                        // PUT
                        if (currentPrice < signal.entryPrice) outcome = Outcome.ITM;
                        else if (currentPrice > signal.entryPrice) outcome = Outcome.OTM;
                    }

                    return {
                        ...signal,
                        closePrice: currentPrice,
                        closeTime: new Date().toLocaleTimeString(),
                        outcome
                    };
                }
                return signal;
            });
        });

        // Update stats if we closed a trade
        if (statsUpdated) {
           updateStats();
        }

    }, 250); // Check every 250ms

    return () => {
        if (checkerTimerRef.current) clearInterval(checkerTimerRef.current);
    }
  }, [currentPrice, signals.length]); // Re-bind when price changes to capture latest close price accurately

  const updateStats = useCallback(() => {
      setSignals(currentSignals => {
          const finished = currentSignals.filter(s => s.outcome !== Outcome.PENDING);
          const wins = finished.filter(s => s.outcome === Outcome.ITM).length;
          const losses = finished.filter(s => s.outcome === Outcome.OTM).length;
          const draws = finished.filter(s => s.outcome === Outcome.ATM).length;
          
          setStats({
              wins,
              losses,
              draws,
              totalSignals: finished.length,
              winRate: finished.length > 0 ? (wins / finished.length) * 100 : 0
          });
          return currentSignals;
      });
  }, []);

  // --- Signal Generator Engine ---
  const generateSignal = useCallback(() => {
      if (currentPrice === 0) return;

      const type = nextSignal;
      const now = Date.now();
      
      const newSignal: SignalLog = {
          id: `${now}-${Math.random().toString(36).substr(2, 5)}`,
          createdAt: now,
          type: type,
          entryPrice: currentPrice,
          entryTime: new Date().toLocaleTimeString(),
          durationSeconds: expiryTime,
          outcome: Outcome.PENDING
      };

      setSignals(prev => [...prev, newSignal]);

      // Simple alternation for demo, assuming the AI Analyst (human) follows the trend
      // In a full automated mode, we would query the AI here for the decision.
      setNextSignal(prev => prev === SignalType.CALL ? SignalType.PUT : SignalType.CALL);

  }, [currentPrice, nextSignal, expiryTime]);


  // --- Run Loop ---
  useEffect(() => {
    if (isRunning && isConnected) {
      // Generate a signal periodically
      // Randomize interval slightly to look organic
      const intervalMs = Math.max(5000, expiryTime * 500); // Dynamic interval based on expiry
      
      generatorTimerRef.current = setInterval(generateSignal, intervalMs);
    } else {
      if (generatorTimerRef.current) clearInterval(generatorTimerRef.current);
    }

    return () => {
      if (generatorTimerRef.current) clearInterval(generatorTimerRef.current);
    };
  }, [isRunning, isConnected, generateSignal, expiryTime]);

  // --- Reset ---
  const handleReset = () => {
    setIsRunning(false);
    setSignals([]);
    setStats({ wins: 0, losses: 0, draws: 0, winRate: 0, totalSignals: 0 });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-amber-500 selection:text-white pb-20">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg shadow-lg shadow-amber-500/20">
                <Radio className="text-white w-5 h-5" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Pocket<span className="text-amber-500">Signal</span> AI</h1>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        {isConnected ? (
                            <><Wifi className="w-3 h-3 text-emerald-500" /> Binance Feed Active</>
                        ) : (
                            <><WifiOff className="w-3 h-3 text-rose-500" /> Reconnecting...</>
                        )}
                    </span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={handleReset}
                className="flex items-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md transition-colors border border-slate-700"
             >
                <RefreshCw className="w-3 h-3" /> RESET SESSION
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="sm:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-xl border border-indigo-500/30 shadow-xl flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Session Win Rate</span>
                    <div className={`text-4xl font-mono font-bold mt-1 ${
                        stats.winRate >= 60 ? 'text-emerald-400' : stats.winRate >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                        {stats.winRate.toFixed(1)}%
                    </div>
                </div>
                <Trophy className="text-indigo-500/20 w-16 h-16 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>

            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex flex-col justify-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">ITM (Wins)</span>
                <div className="text-2xl font-mono text-emerald-400 mt-1 flex items-baseline gap-2">
                    {stats.wins} <span className="text-xs text-slate-600 font-normal">Signals</span>
                </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex flex-col justify-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">OTM (Losses)</span>
                <div className="text-2xl font-mono text-rose-400 mt-1 flex items-baseline gap-2">
                    {stats.losses} <span className="text-xs text-slate-600 font-normal">Signals</span>
                </div>
            </div>
        </div>

        {/* Top Grid: Chart & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Left Column: Chart (Span 2) */}
          <div className="lg:col-span-2">
             {/* Pass signals to the chart to visualize entry points */}
             <TradingChart data={priceData} signals={signals} /> 
          </div>

          {/* Right Column: AI Analysis */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <AIAnalyst priceData={priceData} isRunning={isRunning} />
            
            <div className="bg-amber-900/10 p-4 rounded-xl border border-amber-900/30">
                <h4 className="text-amber-500 font-bold text-sm mb-2">Platform Note</h4>
                <p className="text-xs text-amber-200/60 leading-relaxed">
                    This assistant generates signals for Pocket Option. 
                    <br/><br/>
                    1. Set expiration on Pocket Option to <strong>{expiryTime < 60 ? `${expiryTime}s` : `M${expiryTime/60}`}</strong>.
                    <br/>
                    2. Wait for the <strong>CALL</strong> or <strong>PUT</strong> signal below.
                    <br/>
                    3. Execute manually on the platform.
                </p>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Controls & Logs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[500px]">
            <div className="md:col-span-4 h-full">
                <ControlPanel 
                    isRunning={isRunning} 
                    onToggle={() => setIsRunning(!isRunning)} 
                    expiryTime={expiryTime}
                    onExpiryChange={setExpiryTime}
                    nextSignal={nextSignal}
                />
            </div>
            <div className="md:col-span-8 h-full">
                <TradeList signals={signals} />
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;