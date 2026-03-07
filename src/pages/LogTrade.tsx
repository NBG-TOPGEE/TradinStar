import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTrades } from "@/contexts/TradeContext";
import { Trade, TradeDirection, TradingSession, TradingStrategy, TradeEmotion, TRADING_PAIRS, calculatePnL } from "@/lib/trades";
import { Star, ArrowUp, ArrowDown, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const SESSIONS: TradingSession[] = ["Sydney", "Tokyo", "London", "New York"];
const STRATEGIES: TradingStrategy[] = ["Breakout", "Trend", "Scalp", "Reversal", "News", "Support/Resistance"];
const EMOTIONS: TradeEmotion[] = ["Fearful", "Neutral", "Confident", "Greedy"];
const EMOTION_EMOJI: Record<TradeEmotion, string> = { Fearful: "😰", Neutral: "😐", Confident: "💪", Greedy: "🤑" };

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

  const calc = useMemo(() => calculatePnL(pair, direction, parseFloat(entryPrice) || 0, parseFloat(exitPrice) || 0, parseFloat(positionSize) || 0), [pair, direction, entryPrice, exitPrice, positionSize]);

  const handleSubmit = async () => {
    if (!entryPrice || !exitPrice || !positionSize) { toast.error("Please fill in all price fields"); return; }
    await addTrade({ id: crypto.randomUUID(), pair, direction, entryPrice: parseFloat(entryPrice), exitPrice: parseFloat(exitPrice), positionSize: parseFloat(positionSize), session, strategy, emotion, confidence, notes, pnl: calc.pnl, pips: calc.pips, timestamp: new Date().toISOString() });
    toast.success("Trade logged!");
    navigate("/dashboard");
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-mono text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all";
  const selectClass = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 transition-all";

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Log Trade</h1>
      </div>

      {/* Live P&L banner */}
      {(entryPrice && exitPrice && positionSize) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 mb-6 border ${calc.pnl >= 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Estimated P&L</p>
              <p className={`text-2xl font-bold font-mono ${calc.pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {calc.pnl >= 0 ? "+" : ""}${calc.pnl.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Pips</p>
              <p className={`text-lg font-bold font-mono ${calc.pips >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {calc.pips > 0 ? "+" : ""}{calc.pips}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-5">
        {/* Pair */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Trading Pair</label>
          <select value={pair} onChange={e => setPair(e.target.value)} className={selectClass}>
            {TRADING_PAIRS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Direction */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Direction</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDirection("long")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${direction === "long" ? "text-white" : "bg-white border border-slate-200 text-slate-500"}`}
              style={direction === "long" ? { background: "hsl(152,65%,38%)", boxShadow: "0 2px 8px hsl(152,65%,38%,0.3)" } : {}}>
              <ArrowUp className="w-4 h-4" /> Long
            </button>
            <button onClick={() => setDirection("short")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${direction === "short" ? "text-white" : "bg-white border border-slate-200 text-slate-500"}`}
              style={direction === "short" ? { background: "hsl(0,72%,51%)", boxShadow: "0 2px 8px hsl(0,72%,51%,0.3)" } : {}}>
              <ArrowDown className="w-4 h-4" /> Short
            </button>
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Entry Price</label>
            <input type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="0.00" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Exit Price</label>
            <input type="number" step="any" value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="0.00" className={inputClass} />
          </div>
        </div>

        {/* Position Size */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Position Size (Lots)</label>
          <input type="number" step="any" value={positionSize} onChange={e => setPositionSize(e.target.value)} placeholder="1.0" className={inputClass} />
        </div>

        {/* Session */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Session</label>
          <div className="grid grid-cols-4 gap-2">
            {SESSIONS.map(s => (
              <button key={s} onClick={() => setSession(s)}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${session === s ? "text-white" : "bg-white border border-slate-200 text-slate-500"}`}
                style={session === s ? { background: "hsl(222,60%,20%)" } : {}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Strategy</label>
          <div className="grid grid-cols-3 gap-2">
            {STRATEGIES.map(s => (
              <button key={s} onClick={() => setStrategy(s)}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${strategy === s ? "text-white" : "bg-white border border-slate-200 text-slate-500"}`}
                style={strategy === s ? { background: "hsl(217,90%,56%)" } : {}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Emotion */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Emotional State</label>
          <div className="grid grid-cols-4 gap-2">
            {EMOTIONS.map(e => (
              <button key={e} onClick={() => setEmotion(e)}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 ${emotion === e ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-500"}`}>
                <span>{EMOTION_EMOJI[e]}</span>
                <span>{e}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Confidence */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Confidence</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setConfidence(n)}>
                <Star className={`w-7 h-7 transition-all ${n <= confidence ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Observations, lessons, mistakes..." className={`${inputClass} resize-none font-sans`} />
        </div>

        <button onClick={handleSubmit}
          className="w-full text-white rounded-2xl py-4 font-bold text-sm mt-2 transition-all active:scale-[0.98]"
          style={{ background: "hsl(222,60%,20%)", boxShadow: "0 4px 14px hsl(222,60%,20%,0.3)" }}>
          Save Trade
        </button>
      </div>
      <div className="h-8" />
    </div>
  );
}
