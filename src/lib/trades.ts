export type TradeDirection = "long" | "short";
export type TradingSession = "Sydney" | "Tokyo" | "London" | "New York";
export type TradingStrategy = "Breakout" | "Trend" | "Scalp" | "Reversal" | "News" | "Support/Resistance";
export type TradeEmotion = "Fearful" | "Neutral" | "Confident" | "Greedy";

export const TRADING_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD",
  "BTC/USD", "ETH/USD", "SOL/USD",
  "US30", "SPX500", "NAS100",
];

export interface Trade {
  id: string;
  pair: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  session: TradingSession;
  strategy: TradingStrategy;
  emotion: TradeEmotion;
  confidence: number;
  notes: string;
  screenshot?: string;
  pnl: number;
  pips: number;
  timestamp: string;
}

const STORAGE_KEY = "piptracker_trades";

export function loadTrades(): Trade[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTrades(trades: Trade[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
}

export function addTrade(trade: Trade): Trade[] {
  const trades = loadTrades();
  trades.unshift(trade);
  saveTrades(trades);
  return trades;
}

export function updateTrade(id: string, updates: Partial<Trade>): Trade[] {
  const trades = loadTrades().map(t => t.id === id ? { ...t, ...updates } : t);
  saveTrades(trades);
  return trades;
}

export function deleteTrade(id: string): Trade[] {
  const trades = loadTrades().filter(t => t.id !== id);
  saveTrades(trades);
  return trades;
}

export function calculatePnL(
  pair: string,
  direction: TradeDirection,
  entry: number,
  exit: number,
  size: number
): { pnl: number; pips: number } {
  if (!entry || !exit || !size) return { pnl: 0, pips: 0 };

  const isJPY = pair.includes("JPY");
  const pipMultiplier = isJPY ? 100 : 10000;
  const pipValue = isJPY ? 0.01 : 0.0001;

  let pips: number;
  if (direction === "long") {
    pips = (exit - entry) * pipMultiplier;
  } else {
    pips = (entry - exit) * pipMultiplier;
  }

  // Simplified PnL: for forex standard lot = $10/pip, for crypto/indices use direct calc
  const isCrypto = pair.includes("BTC") || pair.includes("ETH") || pair.includes("SOL");
  const isIndex = ["US30", "SPX500", "NAS100"].includes(pair);

  let pnl: number;
  if (isCrypto || isIndex) {
    pnl = direction === "long" ? (exit - entry) * size : (entry - exit) * size;
  } else {
    pnl = pips * size * 10; // standard lot pip value ~$10
  }

  return { pnl: Math.round(pnl * 100) / 100, pips: Math.round(pips * 10) / 10 };
}

export function getStats(trades: Trade[]) {
  if (trades.length === 0) {
    return { totalTrades: 0, winRate: 0, totalPnL: 0, avgWin: 0, avgLoss: 0, bestTrade: 0, worstTrade: 0 };
  }
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  return {
    totalTrades: trades.length,
    winRate: Math.round((wins.length / trades.length) * 100),
    totalPnL: Math.round(trades.reduce((s, t) => s + t.pnl, 0) * 100) / 100,
    avgWin: wins.length ? Math.round((wins.reduce((s, t) => s + t.pnl, 0) / wins.length) * 100) / 100 : 0,
    avgLoss: losses.length ? Math.round((losses.reduce((s, t) => s + t.pnl, 0) / losses.length) * 100) / 100 : 0,
    bestTrade: trades.length ? Math.max(...trades.map(t => t.pnl)) : 0,
    worstTrade: trades.length ? Math.min(...trades.map(t => t.pnl)) : 0,
  };
}
