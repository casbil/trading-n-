import React, { useEffect, useState } from 'react';
import { MarketAnalysis, PricePoint } from '../types';
import { analyzeMarketTrends } from '../services/geminiService';
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';

interface AIAnalystProps {
  priceData: PricePoint[];
  isRunning: boolean;
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ priceData, isRunning }) => {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const handleAnalysis = async () => {
    if (priceData.length < 10) return; // Need some data
    
    setLoading(true);
    const result = await analyzeMarketTrends(priceData);
    setAnalysis(result);
    setLoading(false);
    setLastUpdated(new Date());
  };

  // Auto-analyze every 15 seconds if running
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && priceData.length > 10) {
      interval = setInterval(() => {
        handleAnalysis();
      }, 15000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, priceData.length]);

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-xl border border-indigo-500/30 shadow-lg relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles className="w-32 h-32 text-indigo-400" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
               <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="text-indigo-100 font-bold text-lg">Gemini Market Analyst</h3>
              <p className="text-indigo-300/60 text-xs">AI-Powered Sentiment</p>
            </div>
          </div>

          <button 
            onClick={handleAnalysis}
            disabled={loading || priceData.length < 5}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
            title="Refresh Analysis"
          >
            <RefreshCw className={`w-5 h-5 text-indigo-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {!analysis ? (
          <div className="h-32 flex flex-col items-center justify-center text-indigo-300/50 text-sm border-2 border-dashed border-indigo-500/20 rounded-lg">
             <p>Collect more market data to start analysis...</p>
             <p className="text-xs mt-2 opacity-60">Requires at least 10 data points</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                analysis.sentiment === 'bullish' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                analysis.sentiment === 'bearish' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                'bg-slate-500/20 text-slate-300 border-slate-500/30'
              }`}>
                {analysis.sentiment}
              </div>
              <div className="text-xs text-indigo-300/70">
                Confidence: {analysis.confidence}%
              </div>
            </div>
            
            <p className="text-indigo-100 text-sm leading-relaxed font-medium italic">
              "{analysis.advice}"
            </p>

            <div className="text-[10px] text-indigo-400/40 text-right mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
      
      {!process.env.API_KEY && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
            <AlertTriangle className="text-yellow-500 w-8 h-8 mb-2" />
            <h4 className="text-white font-bold">API Key Missing</h4>
            <p className="text-slate-400 text-sm mt-1">Add <code className="bg-slate-800 px-1 rounded">API_KEY</code> to environment to enable Gemini AI features.</p>
          </div>
      )}
    </div>
  );
};

export default AIAnalyst;