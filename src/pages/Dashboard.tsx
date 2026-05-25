import { useTrades } from "@/contexts/TradeContext";
import { getStats } from "@/lib/trades";
import { TrendingUp, TrendingDown, Target, Award, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { trades } = useTrades();
  const stats = getStats(trades);
  const recentTrades = trades.slice(0, 5);

  const statCards = [
    {
      label: "Total Trades",
      value: stats.totalTrades,
      icon: Target,
      color: "text-slate-700",
      bg: "bg-slate-50",
      iconColor: "#334155"
    },
    {
      label: "Win Rate",
      value: `${stats.winRate}%`,
      icon: Award,
      color: stats.winRate >= 50 ? "text-emerald-600" : "text-red-500",
      bg: stats.winRate >= 50 ? "bg-emerald-50" : "bg-red-50",
      iconColor: stats.winRate >= 50 ? "#059669" : "#ef4444"
    },
    {
      label: "Total P&L",
      value: `$${stats.totalPnL.toFixed(2)}`,
      icon: stats.totalPnL >= 0 ? TrendingUp : TrendingDown,
      color: stats.totalPnL >= 0 ? "text-emerald-600" : "text-red-500",
      bg: stats.totalPnL >= 0 ? "bg-emerald-50" : "bg-red-50",
      iconColor: stats.totalPnL >= 0 ? "#059669" : "#ef4444"
    },
    {
      label: "Avg Win",
      value: `$${stats.avgWin.toFixed(2)}`,
      icon: ArrowUpRight,
      color: "text-blue-600",
      bg: "bg-blue-50",
      iconColor: "#2563eb"
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(222,60%,20%)" }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "hsl(222,25%,10%)" }}>Welcome back</h1>
        </div>
        <p className="text-sm text-slate-500 ml-9">Your trading dashboard</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-4 border border-slate-100"
            style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.07)" }}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
              <s.icon className="w-4 h-4" style={{ color: s.iconColor }} />
            </div>
            <p className="text-xs text-slate-500 font-medium mb-0.5">{s.label}</p>
            <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent trades */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Trades</h2>
          {recentTrades.length > 0 && (
            <Link to="/journal" className="text-xs font-semibold" style={{ color: "hsl(217,90%,56%)" }}>View all →</Link>
          )}
        </div>

        {recentTrades.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-100 text-center" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.06)" }}>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm font-medium">No trades logged yet</p>
            <Link to="/log" className="text-sm font-semibold mt-2 inline-block" style={{ color: "hsl(217,90%,56%)" }}>Log your first trade →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTrades.map((trade, i) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between"
                style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.06)" }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${trade.pnl >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                    {trade.pnl >= 0
                      ? <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                      : <ArrowDownRight className="w-4 h-4 text-red-500" />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800">{trade.pair}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold font-mono ${
                        trade.direction === "long"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}>
                        {trade.direction.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{trade.strategy} · {trade.emotion}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold font-mono text-sm ${trade.pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">{trade.pips > 0 ? "+" : ""}{trade.pips} pips</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <div className="h-6" />
    </div>
  );
}
