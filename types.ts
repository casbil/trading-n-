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
  amount: number; // Amount of asset (e.g., BTC)
  totalValue: number; // Total USD value of trade
  timestamp: string;
  profitLoss?: number; // Only relevant for SELL
}

export interface MarketAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  advice: string;
  confidence: number;
}

export interface Portfolio {
  cash: number;
  crypto: number; // BTC holdings
  equity: number; // Total value
  startBalance: number;
}