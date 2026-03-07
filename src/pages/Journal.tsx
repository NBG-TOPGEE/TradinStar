import { useState } from "react";
import { useTrades } from "@/contexts/TradeContext";
import { TRADING_PAIRS, TradingSession } from "@/lib/trades";
import { Trash2, Star, BookOpen, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const SESSIONS: TradingSession[] = ["Sydney", "Tokyo", "London", "New York"];

export default function Journal() {
  const { trades, deleteTrade } = useTrades();
  const [filterPair, setFilterPair] = useState("All");
  const [filterSession, setFilterSession] = useState("All");

  const filtered = trades.filter(t => {
    if (filterPair !== "All" && t.pair !== filterPair) return false;
    if (filterSession !== "All" && t.session !== filterSession) return false;
    return true;
  });

  const selectClass = "bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 outline-none focus:border-blue-300 transition-all";

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(222,60%,20%)" }}>
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Trade Journal</h1>
          <p className="text-xs text-slate-400">{filtered.length} trade{filtered.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <select value={filterPair} onChange={e => setFilterPair(e.target.value)} className={selectClass}>
          <option value="All">All Pairs</option>
          {TRADING_PAIRS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={filterSession} onChange={e => setFilterSession(e.target.value)} className={selectClass}>
          <option value="All">All Sessions</option>
          {SESSIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <AnimatePresence>
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-100 text-center" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.06)" }}>
            <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No trades found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(trade => (
              <motion.div key={trade.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }}
                className="bg-white rounded-2xl p-4 border border-slate-100"
                style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.06)" }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${trade.pnl >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                      {trade.pnl >= 0
                        ? <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                        : <ArrowDownRight className="w-4 h-4 text-red-500" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{trade.pair}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${trade.direction === "long" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                          {trade.direction.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{new Date(trade.timestamp).toLocaleDateString()} · {trade.session}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className={`font-bold font-mono text-sm ${trade.pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">{trade.pips > 0 ? "+" : ""}{trade.pips} pips</p>
                    </div>
                    <button onClick={() => { deleteTrade(trade.id); toast.success("Deleted"); }}
                      className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 mb-2 bg-slate-50 rounded-xl p-2.5">
                  <span>Entry <span className="font-mono font-semibold text-slate-700">{trade.entryPrice}</span></span>
                  <span>Exit <span className="font-mono font-semibold text-slate-700">{trade.exitPrice}</span></span>
                  <span>Size <span className="font-mono font-semibold text-slate-700">{trade.positionSize}</span></span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-lg font-medium">{trade.strategy}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded-lg font-medium">{trade.emotion}</span>
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`w-3 h-3 ${n <= trade.confidence ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                    ))}
                  </div>
                </div>

                {trade.notes && (
                  <p className="text-xs text-slate-500 mt-2.5 italic border-t border-slate-100 pt-2.5">"{trade.notes}"</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
      <div className="h-8" />
    </div>
  );
}
