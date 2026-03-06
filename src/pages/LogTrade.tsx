import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTrades } from "@/contexts/TradeContext";
import {
  Trade, TradeDirection, TradingSession, TradingStrategy, TradeEmotion,
  TRADING_PAIRS, calculatePnL,
} from "@/lib/trades";
import { Star, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

const SESSIONS: TradingSession[] = ["Sydney", "Tokyo", "London", "New York"];
const STRATEGIES: TradingStrategy[] = ["Breakout", "Trend", "Scalp", "Reversal", "News", "Support/Resistance"];
const EMOTIONS: TradeEmotion[] = ["Fearful", "Neutral", "Confident", "Greedy"];

export default function LogTrade() {
  const { addTrade } = useTrades();
  const navigate = useNavigate();

  const [pair, setPair] = useState(TRADING_PAIRS[0]);
  const [direction, setDirection] = useState<TradeDirection>("long");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [session, setSession] = useState<TradingSession>("London");
  const [strategy, setStrategy] = useState<TradingStrategy>("Breakout");
  const [emotion, setEmotion] = useState<TradeEmotion>("Neutral");
  const [confidence, setConfidence] = useState(3);
  const [notes, setNotes] = useState("");

  const calc = useMemo(() => {
    return calculatePnL(pair, direction, parseFloat(entryPrice) || 0, parseFloat(exitPrice) || 0, parseFloat(positionSize) || 0);
  }, [pair, direction, entryPrice, exitPrice, positionSize]);

  const handleSubmit = () => {
    if (!entryPrice || !exitPrice || !positionSize) {
      toast.error("Please fill in all price fields");
      return;
    }
    const trade: Trade = {
      id: crypto.randomUUID(),
      pair,
      direction,
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice),
      positionSize: parseFloat(positionSize),
      session,
      strategy,
      emotion,
      confidence,
      notes,
      pnl: calc.pnl,
      pips: calc.pips,
      timestamp: new Date().toISOString(),
    };
    addTrade(trade);
    toast.success("Trade logged successfully!");
    navigate("/");
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-xl font-bold mb-6">Log Trade</h1>

      {/* Live P&L display */}
      {(entryPrice && exitPrice && positionSize) && (
        <div className={`rounded-xl p-4 mb-6 border ${calc.pnl >= 0 ? "bg-profit\/10 border-profit/20" : "bg-loss\/10 border-loss/20"}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Estimated P&L</p>
              <p className={`text-2xl font-bold font-mono ${calc.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                {calc.pnl >= 0 ? "+" : ""}${calc.pnl.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Pips</p>
              <p className={`text-lg font-bold font-mono ${calc.pips >= 0 ? "text-profit" : "text-loss"}`}>
                {calc.pips > 0 ? "+" : ""}{calc.pips}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Pair */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Trading Pair</label>
          <select value={pair} onChange={e => setPair(e.target.value)} className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground">
            {TRADING_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Direction */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Direction</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDirection("long")}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
                direction === "long" ? "bg-profit text-primary-foreground" : "bg-card border border-border text-muted-foreground"
              }`}
            >
              <ArrowUp className="w-4 h-4" /> Long
            </button>
            <button
              onClick={() => setDirection("short")}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
                direction === "short" ? "bg-loss text-destructive-foreground" : "bg-card border border-border text-muted-foreground"
              }`}
            >
              <ArrowDown className="w-4 h-4" /> Short
            </button>
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Entry Price</label>
            <input type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="0.00" className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Exit Price</label>
            <input type="number" step="any" value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="0.00" className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>

        {/* Position Size */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Position Size (Lots/Qty)</label>
          <input type="number" step="any" value={positionSize} onChange={e => setPositionSize(e.target.value)} placeholder="1.0" className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground" />
        </div>

        {/* Session */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Session</label>
          <div className="grid grid-cols-4 gap-2">
            {SESSIONS.map(s => (
              <button key={s} onClick={() => setSession(s)}
                className={`py-2 rounded-lg text-xs font-medium transition-all ${session === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Strategy</label>
          <div className="grid grid-cols-3 gap-2">
            {STRATEGIES.map(s => (
              <button key={s} onClick={() => setStrategy(s)}
                className={`py-2 rounded-lg text-xs font-medium transition-all ${strategy === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Emotion */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Emotional State</label>
          <div className="grid grid-cols-4 gap-2">
            {EMOTIONS.map(e => (
              <button key={e} onClick={() => setEmotion(e)}
                className={`py-2 rounded-lg text-xs font-medium transition-all ${emotion === e ? "bg-accent text-accent-foreground" : "bg-card border border-border text-muted-foreground"}`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Confidence */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Confidence Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setConfidence(n)}>
                <Star className={`w-7 h-7 ${n <= confidence ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Trade Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Observations, lessons, mistakes..." className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none" />
        </div>

        <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-semibold text-sm mt-2">
          Save Trade
        </button>
      </div>
      <div className="h-8" />
    </div>
  );
}
