import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PricePoint, TradeLog, TradeType, Portfolio } from './types';
import TradingChart from './components/TradingChart';
import ControlPanel from './components/ControlPanel';
import TradeList from './components/TradeList';
import AIAnalyst from './components/AIAnalyst';
import { Activity, Wallet, Wifi, WifiOff, Github, RefreshCw } from 'lucide-react';

const INITIAL_CASH = 10000;
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/btcusdt@miniTicker';

const App: React.FC = () => {
  // --- State ---
  const [isRunning, setIsRunning] = useState(false);
  const [intervalTime, setIntervalTime] = useState(3.0);
  const [isConnected, setIsConnected] = useState(false);
  
  // Market Data
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  
  // Account State
  const [portfolio, setPortfolio] = useState<Portfolio>({
      cash: INITIAL_CASH,
      crypto: 0,
      equity: INITIAL_CASH,
      startBalance: INITIAL_CASH
  });
  const [trades, setTrades] = useState<TradeLog[]>([]);
  
  // Trading Logic State
  const [isBuying, setIsBuying] = useState(true); // Toggles between BUY/SELL
  const lastBuyPriceRef = useRef<number | null>(null);
  
  // --- Refs ---
  const wsRef = useRef<WebSocket | null>(null);
  const tradingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
            
            // Update Price History (Throttle updates visually if needed, but here we just append)
            setPriceData(prev => {
                const now = new Date();
                const timeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
                const newPoint = { time: timeString, value: price };
                // Keep last 100 points
                const newData = [...prev, newPoint];
                if (newData.length > 150) return newData.slice(1);
                return newData;
            });
        };

        ws.onclose = () => {
            console.log('Disconnected from Binance');
            setIsConnected(false);
            // Reconnect after 3s
            setTimeout(connect, 3000);
        };

        wsRef.current = ws;
    };

    connect();

    return () => {
        if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // --- Portfolio Valuation Update ---
  useEffect(() => {
     if (currentPrice > 0) {
        setPortfolio(prev => ({
            ...prev,
            equity: prev.cash + (prev.crypto * currentPrice)
        }));
     }
  }, [currentPrice]);


  // --- Helper: Execute Trade ---
  const executeTrade = useCallback((action: TradeType) => {
      if (currentPrice === 0) return;

      setPortfolio(current => {
          let newCash = current.cash;
          let newCrypto = current.crypto;
          let tradeAmount = 0;
          let tradeValue = 0;
          let profitLoss = undefined;

          if (action === TradeType.BUY) {
              // Strategy: Buy with 50% of available cash or min $1000 to keep it interesting
              const investAmount = Math.max(1000, current.cash * 0.5); 
              if (current.cash < investAmount) return current; // Not enough funds
              
              tradeValue = investAmount;
              tradeAmount = investAmount / currentPrice;
              
              newCash -= tradeValue;
              newCrypto += tradeAmount;
              lastBuyPriceRef.current = currentPrice;

          } else if (action === TradeType.SELL) {
              // Strategy: Sell 100% of holdings
              if (current.crypto <= 0) return current;

              tradeAmount = current.crypto;
              tradeValue = tradeAmount * currentPrice;
              
              newCash += tradeValue;
              newCrypto = 0; // Sold all

              // Calculate PnL if we have a reference
              if (lastBuyPriceRef.current) {
                  const buyValue = tradeAmount * lastBuyPriceRef.current;
                  profitLoss = tradeValue - buyValue;
              }
              lastBuyPriceRef.current = null;
          }

          const newTrade: TradeLog = {
              id: Math.random().toString(36).substr(2, 9),
              type: action,
              price: currentPrice,
              amount: tradeAmount,
              totalValue: tradeValue,
              timestamp: new Date().toLocaleTimeString(),
              profitLoss
          };

          setTrades(prev => [...prev, newTrade]);

          return {
              ...current,
              cash: newCash,
              crypto: newCrypto,
              equity: newCash + (newCrypto * currentPrice)
          };
      });
  }, [currentPrice]);


  // --- Bot Logic Engine ---
  useEffect(() => {
    if (isRunning && isConnected) {
      tradingTimerRef.current = setInterval(() => {
        const action = isBuying ? TradeType.BUY : TradeType.SELL;
        
        executeTrade(action);

        // Toggle intent for next tick
        setIsBuying(prev => !prev);

      }, intervalTime * 1000);
    } else {
      if (tradingTimerRef.current) clearInterval(tradingTimerRef.current);
    }

    return () => {
      if (tradingTimerRef.current) clearInterval(tradingTimerRef.current);
    };
  }, [isRunning, intervalTime, isBuying, isConnected, executeTrade]);

  // --- Reset ---
  const handleReset = () => {
    setIsRunning(false);
    setTrades([]);
    setIsBuying(true);
    setPortfolio({
        cash: INITIAL_CASH,
        crypto: 0,
        equity: INITIAL_CASH,
        startBalance: INITIAL_CASH
    });
    lastBuyPriceRef.current = null;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-sky-500 selection:text-white pb-20">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-r from-sky-500 to-indigo-500 p-2 rounded-lg shadow-lg shadow-sky-500/20">
                <Activity className="text-white w-5 h-5" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-white tracking-tight">AutoTrade<span className="text-sky-400">Pro</span></h1>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        {isConnected ? (
                            <><Wifi className="w-3 h-3 text-emerald-500" /> Live Feed Connected</>
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
                <RefreshCw className="w-3 h-3" /> RESET ACCOUNT
             </button>
             <a 
               href="#" 
               className="text-slate-500 hover:text-white transition-colors"
             >
                <Github className="w-5 h-5" />
             </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Portfolio Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-slate-700 shadow-xl flex items-center justify-between">
                <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Equity</span>
                    <div className="text-3xl font-mono text-white mt-1 font-bold">
                        ${portfolio.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className={`text-right text-sm font-bold ${portfolio.equity >= portfolio.startBalance ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {portfolio.equity >= portfolio.startBalance ? '+' : ''}
                    {((portfolio.equity - portfolio.startBalance) / portfolio.startBalance * 100).toFixed(2)}%
                    <div className="text-[10px] text-slate-500 font-normal uppercase mt-1">Return</div>
                </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex items-center justify-between">
                <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Available Cash</span>
                    <div className="text-2xl font-mono text-emerald-400 mt-1">
                        ${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <Wallet className="w-6 h-6 text-emerald-500" />
                </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex items-center justify-between">
                <div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Bitcoin Holdings</span>
                    <div className="text-2xl font-mono text-amber-400 mt-1">
                        {portfolio.crypto.toFixed(5)} BTC
                    </div>
                </div>
                <div className="text-right text-xs text-slate-500 mt-auto">
                    ≈ ${(portfolio.crypto * currentPrice).toLocaleString(undefined, {maximumFractionDigits: 0})}
                </div>
            </div>
        </div>

        {/* Top Grid: Chart & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Left Column: Chart (Span 2) */}
          <div className="lg:col-span-2">
             <TradingChart data={priceData} trades={trades} />
          </div>

          {/* Right Column: AI Analysis */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <AIAnalyst priceData={priceData} isRunning={isRunning} />
            
            <div className="flex-1 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                 <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Strategy Performance</h3>
                 <div className="space-y-4">
                     <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                        <span className="text-sm text-slate-300">Total Trades</span>
                        <span className="text-sm font-mono text-white">{trades.length}</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                        <span className="text-sm text-slate-300">Winning Trades</span>
                        <span className="text-sm font-mono text-emerald-400">
                            {trades.filter(t => (t.profitLoss || 0) > 0).length}
                        </span>
                     </div>
                     <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                        <span className="text-sm text-slate-300">Avg Profit/Loss</span>
                        <span className={`text-sm font-mono ${
                            trades.reduce((acc, t) => acc + (t.profitLoss || 0), 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                           ${trades.length > 0 ? (trades.reduce((acc, t) => acc + (t.profitLoss || 0), 0) / trades.filter(t => t.type === TradeType.SELL).length || 0).toFixed(2) : '0.00'}
                        </span>
                     </div>
                 </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Controls & Logs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[500px]">
            <div className="md:col-span-4 h-full">
                <ControlPanel 
                    isRunning={isRunning} 
                    onToggle={() => setIsRunning(!isRunning)} 
                    interval={intervalTime}
                    onIntervalChange={setIntervalTime}
                    nextAction={isBuying ? 'BUY' : 'SELL'}
                />
            </div>
            <div className="md:col-span-8 h-full">
                <TradeList trades={trades} />
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;