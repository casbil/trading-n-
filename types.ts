export enum SignalType {
  CALL = 'CALL', // UP
  PUT = 'PUT'    // DOWN
}

export enum Outcome {
  PENDING = 'PENDING',
  ITM = 'ITM', // In The Money (Win)
  OTM = 'OTM', // Out Of The Money (Loss)
  ATM = 'ATM'  // At The Money (Draw)
}

export interface PricePoint {
  time: string;
  value: number;
}

export interface SignalLog {
  id: string;
  createdAt: number; // Timestamp in ms
  type: SignalType;
  entryPrice: number;
  closePrice?: number;
  entryTime: string;
  closeTime?: string;
  durationSeconds: number; // e.g. 60s
  outcome: Outcome;
}

export interface MarketAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  advice: string;
  confidence: number;
}

export interface SessionStats {
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalSignals: number;
}