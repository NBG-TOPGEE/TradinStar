import { useState } from "react";
import { useTrades } from "@/contexts/TradeContext";
import { TRADING_PAIRS, TradingSession, Trade } from "@/lib/trades";
import { Trash2, Star, BookOpen, ArrowUpRight, ArrowDownRight, ImageIcon, Share2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ShareCard from "@/components/ShareCard";

const SESSIONS: TradingSession[] = ["Sydney", "Tokyo", "London", "New York"];

const SELECT_STYLE = {
  background: "hsl(222,22%,11%)",
  border: "1px solid hsl(222,18%,17%)",
  color: "hsl(210,20%,65%)",
  borderRadius: "0.875rem",
  padding: "0.375rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  outline: "none",
};

export default function Journal() {
  const { trades, deleteTrade } = useTrades();
  const [filterPair, setFilterPair] = useState("All");
  const [filterSession, setFilterSession] = useState("All");
  const [expandedScreenshot, setExpandedScreenshot] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<Trade | null>(null);

  const filtered = trades.filter(t => {
    if (filterPair !== "All" && t.pair !== filterPair) return false;
    if (filterSession !== "All" && t.session !== filterSession) return false;
    return true;
  });

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
            boxShadow: "0 4px 12px hsl(217,92%,60%,0.4)",
          }}
        >
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "hsl(210,30%,92%)" }}>Trade Journal</h1>
          <p className="text-xs" style={{ color: "hsl(215,15%,38%)" }}>
            {filtered.length} trade{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <select value={filterPair} onChange={e => setFilterPair(e.target.value)} style={SELECT_STYLE}>
          <option value="All">All Pairs</option>
          {TRADING_PAIRS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={filterSession} onChange={e => setFilterSession(e.target.value)} style={SELECT_STYLE}>
          <option value="All">All Sessions</option>
          {SESSIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <AnimatePresence>
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-10 text-center glass-card"
          >
            <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: "hsl(215,15%,25%)" }} />
            <p className="text-sm font-medium" style={{ color: "hsl(215,15%,40%)" }}>No trades found</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map(trade => (
              <motion.div
                key={trade.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="rounded-2xl overflow-hidden glass-card-hover"
                style={{
                  background: "hsl(222,22%,10%)",
                  border: "1px solid hsl(222,18%,15%)",
                  boxShadow: "0 4px 20px hsl(222,40%,4%,0.5)",
                }}
              >
                {/* Screenshot */}
                {trade.screenshot && (
                  <div
                    className="relative cursor-pointer group"
                    onClick={() => setExpandedScreenshot(trade.screenshot!)}
                  >
                    <img src={trade.screenshot} alt="Chart" className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-all bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                        View chart
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShareTarget(trade); }}
                      className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 hover:bg-black/70 text-white text-xs font-medium px-2.5 py-1.5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Share2 className="w-3 h-3" /> Share
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: "linear-gradient(to top, hsl(222,22%,10%), transparent)" }} />
                  </div>
                )}

                <div className="p-4">
                  {/* Top row */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                          background: trade.pnl >= 0 ? "hsl(158,68%,46%,0.12)" : "hsl(0,72%,58%,0.12)",
                          border: `1px solid ${trade.pnl >= 0 ? "hsl(158,68%,46%,0.2)" : "hsl(0,72%,58%,0.2)"}`,
                        }}
                      >
                        {trade.pnl >= 0
                          ? <ArrowUpRight className="w-4 h-4" style={{ color: "hsl(158,68%,55%)" }} />
                          : <ArrowDownRight className="w-4 h-4" style={{ color: "hsl(0,72%,65%)" }} />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm" style={{ color: "hsl(210,30%,90%)" }}>
                            {trade.pair}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-md font-bold font-mono"
                            style={{
                              background: trade.direction === "long" ? "hsl(158,68%,46%,0.12)" : "hsl(0,72%,58%,0.12)",
                              color: trade.direction === "long" ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)",
                              border: `1px solid ${trade.direction === "long" ? "hsl(158,68%,46%,0.2)" : "hsl(0,72%,58%,0.2)"}`,
                            }}
                          >
                            {trade.direction.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: "hsl(215,15%,38%)" }}>
                          {new Date(trade.timestamp).toLocaleDateString()} · {trade.session}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p
                          className="font-bold font-mono text-sm"
                          style={{ color: trade.pnl >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)" }}
                        >
                          {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                        </p>
                        <p className="text-[11px] font-mono" style={{ color: "hsl(215,15%,38%)" }}>
                          {trade.pips > 0 ? "+" : ""}{trade.pips} pips
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!trade.screenshot && (
                          <button
                            onClick={() => setShareTarget(trade)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: "hsl(222,20%,14%)", color: "hsl(215,15%,35%)" }}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => { deleteTrade(trade.id); toast.success("Deleted"); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                          style={{ background: "hsl(0,72%,58%,0.1)", color: "hsl(0,72%,58%,0.6)", border: "1px solid hsl(0,72%,58%,0.12)" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price row */}
                  <div
                    className="grid grid-cols-3 gap-2 text-xs mb-2 rounded-xl p-2.5"
                    style={{ background: "hsl(222,20%,13%)", border: "1px solid hsl(222,18%,16%)" }}
                  >
                    <span style={{ color: "hsl(215,15%,40%)" }}>
                      Entry <span className="font-mono font-semibold" style={{ color: "hsl(210,20%,72%)" }}>{trade.entryPrice}</span>
                    </span>
                    <span style={{ color: "hsl(215,15%,40%)" }}>
                      Exit <span className="font-mono font-semibold" style={{ color: "hsl(210,20%,72%)" }}>{trade.exitPrice}</span>
                    </span>
                    <span style={{ color: "hsl(215,15%,40%)" }}>
                      Size <span className="font-mono font-semibold" style={{ color: "hsl(210,20%,72%)" }}>{trade.positionSize}</span>
                    </span>
                  </div>

                  {/* Tags row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="px-2 py-0.5 rounded-lg font-medium"
                        style={{ background: "hsl(222,20%,14%)", color: "hsl(215,15%,45%)", border: "1px solid hsl(222,18%,17%)" }}
                      >
                        {trade.strategy}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-lg font-medium"
                        style={{ background: "hsl(222,20%,14%)", color: "hsl(215,15%,45%)", border: "1px solid hsl(222,18%,17%)" }}
                      >
                        {trade.emotion}
                      </span>
                      {trade.screenshot && (
                        <span
                          className="px-2 py-0.5 rounded-lg font-medium flex items-center gap-1"
                          style={{ background: "hsl(217,92%,60%,0.1)", color: "hsl(217,92%,65%)", border: "1px solid hsl(217,92%,60%,0.15)" }}
                        >
                          <ImageIcon className="w-3 h-3" /> Chart
                        </span>
                      )}
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star
                          key={n}
                          className="w-3 h-3"
                          style={{
                            fill: n <= trade.confidence ? "hsl(38,92%,56%)" : "transparent",
                            color: n <= trade.confidence ? "hsl(38,92%,56%)" : "hsl(222,18%,20%)",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {trade.notes && (
                    <p
                      className="text-xs mt-2.5 italic pt-2.5"
                      style={{
                        color: "hsl(215,15%,40%)",
                        borderTop: "1px solid hsl(222,18%,14%)",
                      }}
                    >
                      "{trade.notes}"
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="h-8" />

      {/* Full-screen screenshot viewer */}
      <AnimatePresence>
        {expandedScreenshot && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "hsl(222,28%,5%,0.96)", backdropFilter: "blur(20px)" }}
            onClick={() => setExpandedScreenshot(null)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "hsl(222,20%,16%)", border: "1px solid hsl(222,18%,22%)", color: "hsl(210,20%,65%)" }}
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              src={expandedScreenshot}
              alt="Chart"
              className="max-w-full max-h-full rounded-xl object-contain"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Card Modal */}
      <AnimatePresence>
        {shareTarget && <ShareCard trade={shareTarget} onClose={() => setShareTarget(null)} />}
      </AnimatePresence>
    </div>
  );
}
