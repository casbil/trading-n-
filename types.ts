export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export interface PricePoint {
  time: string;
  value: number;
}

export interface TradeLog {
  id: string;
  type: TradeType;
  price: number;
  timestamp: string;
  profitLoss?: number; // Only relevant for SELL
}

export interface MarketAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  advice: string;
  confidence: number;
}