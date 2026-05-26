import { useTrades } from "@/contexts/TradeContext";
import { getStats } from "@/lib/trades";
import { TrendingUp, TrendingDown, Target, Award, ArrowUpRight, ArrowDownRight, Zap, Flame, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { trades } = useTrades();
  const stats = getStats(trades);
  const recentTrades = trades.slice(0, 5);

  // Calculate win streak
  let streak = 0;
  for (const t of [...trades].reverse()) {
    if (t.pnl > 0) streak++;
    else break;
  }

  const statCards = [
    {
      label: "Total Trades",
      value: stats.totalTrades,
      icon: Target,
      gradient: "linear-gradient(135deg, hsl(217,92%,60%,0.15), hsl(217,92%,60%,0.05))",
      border: "hsl(217,92%,60%,0.2)",
      iconBg: "hsl(217,92%,60%,0.15)",
      iconColor: "hsl(217,92%,70%)",
      valueColor: "hsl(210,30%,92%)",
    },
    {
      label: "Win Rate",
      value: `${stats.winRate}%`,
      icon: Award,
      gradient: stats.winRate >= 50
        ? "linear-gradient(135deg, hsl(158,68%,46%,0.15), hsl(158,68%,46%,0.05))"
        : "linear-gradient(135deg, hsl(0,72%,58%,0.15), hsl(0,72%,58%,0.05))",
      border: stats.winRate >= 50 ? "hsl(158,68%,46%,0.2)" : "hsl(0,72%,58%,0.2)",
      iconBg: stats.winRate >= 50 ? "hsl(158,68%,46%,0.15)" : "hsl(0,72%,58%,0.15)",
      iconColor: stats.winRate >= 50 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)",
      valueColor: stats.winRate >= 50 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)",
    },
    {
      label: "Total P&L",
      value: `$${stats.totalPnL.toFixed(2)}`,
      icon: stats.totalPnL >= 0 ? TrendingUp : TrendingDown,
      gradient: stats.totalPnL >= 0
        ? "linear-gradient(135deg, hsl(158,68%,46%,0.15), hsl(158,68%,46%,0.05))"
        : "linear-gradient(135deg, hsl(0,72%,58%,0.15), hsl(0,72%,58%,0.05))",
      border: stats.totalPnL >= 0 ? "hsl(158,68%,46%,0.2)" : "hsl(0,72%,58%,0.2)",
      iconBg: stats.totalPnL >= 0 ? "hsl(158,68%,46%,0.15)" : "hsl(0,72%,58%,0.15)",
      iconColor: stats.totalPnL >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)",
      valueColor: stats.totalPnL >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)",
    },
    {
      label: "Avg Win",
      value: `$${stats.avgWin.toFixed(2)}`,
      icon: ArrowUpRight,
      gradient: "linear-gradient(135deg, hsl(38,92%,56%,0.12), hsl(38,92%,56%,0.04))",
      border: "hsl(38,92%,56%,0.18)",
      iconBg: "hsl(38,92%,56%,0.12)",
      iconColor: "hsl(38,92%,62%)",
      valueColor: "hsl(38,92%,62%)",
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-7">

      {/* ── HERO HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-7"
      >
        {/* Greeting row */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
                  boxShadow: "0 4px 12px hsl(217,92%,60%,0.4)",
                }}
              >
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ color: "hsl(210,30%,94%)" }}
              >
                Welcome back
              </h1>
            </div>
            <p className="text-sm ml-9" style={{ color: "hsl(215,15%,45%)" }}>
              Your trading dashboard
            </p>
          </div>

          {/* Win streak badge */}
          {streak >= 2 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{
                background: "linear-gradient(135deg, hsl(38,92%,56%,0.15), hsl(38,92%,56%,0.05))",
                border: "1px solid hsl(38,92%,56%,0.25)",
              }}
            >
              <Flame className="w-3.5 h-3.5" style={{ color: "hsl(38,92%,62%)" }} />
              <span className="text-xs font-bold" style={{ color: "hsl(38,92%,62%)" }}>
                {streak} streak
              </span>
            </motion.div>
          )}
        </div>

        {/* AI insight strip */}
        {trades.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-4 px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{
              background: "linear-gradient(135deg, hsl(217,92%,60%,0.08), hsl(222,70%,45%,0.04))",
              border: "1px solid hsl(217,92%,60%,0.14)",
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ai-active"
              style={{
                background: "linear-gradient(135deg, hsl(217,92%,60%,0.25), hsl(217,92%,60%,0.1))",
                border: "1px solid hsl(217,92%,60%,0.3)",
              }}
            >
              <Brain className="w-3.5 h-3.5" style={{ color: "hsl(217,92%,70%)" }} />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "hsl(215,20%,60%)" }}>
              {stats.winRate >= 60
                ? `Strong discipline — ${stats.winRate}% win rate this session. Keep managing your risk tightly.`
                : stats.winRate >= 50
                ? `You're above 50% — refine your entry criteria to push higher.`
                : `Win rate at ${stats.winRate}%. Focus on trade selection quality over frequency.`
              }
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-4 glass-card-hover cursor-default"
            style={{
              background: s.gradient,
              border: `1px solid ${s.border}`,
              boxShadow: "0 4px 20px hsl(222,40%,4%,0.5)",
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
              style={{ background: s.iconBg }}
            >
              <s.icon className="w-4 h-4" style={{ color: s.iconColor }} />
            </div>
            <p className="text-xs font-medium mb-0.5" style={{ color: "hsl(215,15%,45%)" }}>
              {s.label}
            </p>
            <p className="text-xl font-bold font-mono" style={{ color: s.valueColor }}>
              {s.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── RECENT TRADES ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "hsl(215,15%,35%)" }}
          >
            Recent Trades
          </h2>
          {recentTrades.length > 0 && (
            <Link
              to="/journal"
              className="text-xs font-semibold transition-all hover:opacity-80"
              style={{ color: "hsl(217,92%,65%)" }}
            >
              View all →
            </Link>
          )}
        </div>

        {recentTrades.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-10 text-center glass-card"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "hsl(222,20%,14%)", border: "1px solid hsl(222,18%,18%)" }}
            >
              <Target className="w-6 h-6" style={{ color: "hsl(215,15%,30%)" }} />
            </div>
            <p className="text-sm font-medium mb-2" style={{ color: "hsl(215,15%,40%)" }}>
              No trades logged yet
            </p>
            <Link
              to="/log"
              className="text-sm font-semibold"
              style={{ color: "hsl(217,92%,65%)" }}
            >
              Log your first trade →
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {recentTrades.map((trade, i) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + i * 0.05 }}
                className="rounded-2xl p-4 flex items-center justify-between glass-card-hover"
                style={{
                  background: "hsl(222,22%,10%)",
                  border: "1px solid hsl(222,18%,15%)",
                  boxShadow: "0 2px 12px hsl(222,40%,4%,0.5)",
                }}
              >
                <div className="flex items-center gap-3">
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
                    <p className="text-[11px] mt-0.5" style={{ color: "hsl(215,15%,40%)" }}>
                      {trade.strategy} · {trade.emotion}
                    </p>
                  </div>
                </div>
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <div className="h-6" />
    </div>
  );
}
