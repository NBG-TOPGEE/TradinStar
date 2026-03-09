export type TradeDirection = "long" | "short";
export type TradingSession = "Sydney" | "Tokyo" | "London" | "New York";
export type TradingStrategy = "Breakout" | "Trend" | "Scalp" | "Reversal" | "News" | "Support/Resistance";
export type TradeEmotion = "Fearful" | "Neutral" | "Confident" | "Greedy";

export type MarketType = "Forex" | "Crypto" | "Indices" | "Commodities";

export const MARKET_PAIRS: Record<MarketType, string[]> = {
  Forex: [
    "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD",
    "USD/CHF", "EUR/GBP", "EUR/JPY", "GBP/JPY", "AUD/JPY", "CAD/JPY",
    "EUR/AUD", "GBP/AUD", "EUR/CAD", "GBP/CAD", "AUD/CAD", "NZD/JPY",
    "EUR/NZD", "GBP/NZD",
  ],
  Crypto: [
    "BTC/USD", "ETH/USD", "SOL/USD", "BNB/USD", "XRP/USD", "ADA/USD",
    "DOGE/USD", "AVAX/USD", "DOT/USD", "MATIC/USD", "LTC/USD", "LINK/USD",
  ],
  Indices: [
    "US30", "SPX500", "NAS100", "UK100", "GER40", "FRA40",
    "AUS200", "JPN225", "HK50", "ESP35",
  ],
  Commodities: [
    "XAU/USD", "XAG/USD", "WTI/OIL", "BRENT/OIL", "NAT/GAS",
    "COPPER", "PLATINUM", "PALLADIUM",
  ],
};

export const TRADING_PAIRS = Object.values(MARKET_PAIRS).flat();

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

/** Map a Supabase row (snake_case) to the app Trade interface (camelCase) */
export function rowToTrade(row: any): Trade {
  return {
    id: row.id,
    pair: row.pair,
    direction: row.direction as TradeDirection,
    entryPrice: Number(row.entry_price),
    exitPrice: Number(row.exit_price),
    positionSize: Number(row.position_size),
    session: row.session as TradingSession,
    strategy: row.strategy as TradingStrategy,
    emotion: row.emotion as TradeEmotion,
    confidence: row.confidence,
    notes: row.notes ?? "",
    screenshot: row.screenshot ?? undefined,
    pnl: Number(row.pnl),
    pips: Number(row.pips),
    timestamp: row.created_at,
  };
}

/** Map the app Trade interface to a Supabase insert payload */
export function tradeToRow(trade: Trade, userId: string) {
  return {
    id: trade.id,
    user_id: userId,
    pair: trade.pair,
    direction: trade.direction,
    entry_price: trade.entryPrice,
    exit_price: trade.exitPrice,
    position_size: trade.positionSize,
    session: trade.session,
    strategy: trade.strategy,
    emotion: trade.emotion,
    confidence: trade.confidence,
    notes: trade.notes,
    screenshot: trade.screenshot ?? null,
    pnl: trade.pnl,
    pips: trade.pips,
    created_at: trade.timestamp,
  };
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

  let pips: number;
  if (direction === "long") {
    pips = (exit - entry) * pipMultiplier;
  } else {
    pips = (entry - exit) * pipMultiplier;
  }

  const isCrypto = pair.includes("BTC") || pair.includes("ETH") || pair.includes("SOL");
  const isIndex = ["US30", "SPX500", "NAS100"].includes(pair);

  let pnl: number;
  if (isCrypto || isIndex) {
    pnl = direction === "long" ? (exit - entry) * size : (entry - exit) * size;
  } else {
    pnl = pips * size * 10;
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
