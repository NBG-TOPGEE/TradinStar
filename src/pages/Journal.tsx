import { useState } from "react";
import { useTrades } from "@/contexts/TradeContext";
import { TRADING_PAIRS, TradingSession } from "@/lib/trades";
import { Trash2, Star } from "lucide-react";
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

  const handleDelete = (id: string) => {
    deleteTrade(id);
    toast.success("Trade deleted");
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-xl font-bold mb-4">Trade Journal</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <select value={filterPair} onChange={e => setFilterPair(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground shrink-0">
          <option value="All">All Pairs</option>
          {TRADING_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterSession} onChange={e => setFilterSession(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground shrink-0">
          <option value="All">All Sessions</option>
          {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{filtered.length} trade{filtered.length !== 1 ? "s" : ""}</p>

      <AnimatePresence>
        {filtered.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <p className="text-muted-foreground text-sm">No trades found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(trade => (
              <motion.div
                key={trade.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-card rounded-xl p-4 border border-border"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${trade.pnl >= 0 ? "bg-profit" : "bg-loss"}`} />
                    <span className="font-semibold text-sm">{trade.pair}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${trade.direction === "long" ? "bg-profit\/10 text-profit" : "bg-loss\/10 text-loss"}`}>
                      {trade.direction.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold font-mono text-sm ${trade.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                    </span>
                    <button onClick={() => handleDelete(trade.id)} className="text-muted-foreground hover:text-loss p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                  <span>Entry: <span className="font-mono text-foreground">{trade.entryPrice}</span></span>
                  <span>Exit: <span className="font-mono text-foreground">{trade.exitPrice}</span></span>
                  <span>Size: <span className="font-mono text-foreground">{trade.positionSize}</span></span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{trade.session}</span>
                  <span>•</span>
                  <span>{trade.strategy}</span>
                  <span>•</span>
                  <span>{trade.emotion}</span>
                  <span>•</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`w-3 h-3 ${n <= trade.confidence ? "fill-accent text-accent" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                </div>
                {trade.notes && (
                  <p className="text-xs text-muted-foreground mt-2 italic border-t border-border pt-2">"{trade.notes}"</p>
                )}
                <p className="text-xs text-muted-foreground/60 mt-1">{new Date(trade.timestamp).toLocaleDateString()} {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
      <div className="h-8" />
    </div>
  );
}
