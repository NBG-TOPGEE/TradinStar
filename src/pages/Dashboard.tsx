import { useTrades } from "@/contexts/TradeContext";
import { getStats } from "@/lib/trades";
import { TrendingUp, TrendingDown, Target, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { trades } = useTrades();
  const stats = getStats(trades);
  const recentTrades = trades.slice(0, 5);

  const statCards = [
    { label: "Total Trades", value: stats.totalTrades, icon: Target, color: "text-foreground" },
    { label: "Win Rate", value: `${stats.winRate}%`, icon: Award, color: stats.winRate >= 50 ? "text-profit" : "text-loss" },
    { label: "Total P&L", value: `$${stats.totalPnL.toFixed(2)}`, icon: stats.totalPnL >= 0 ? TrendingUp : TrendingDown, color: stats.totalPnL >= 0 ? "text-profit" : "text-loss" },
    { label: "Avg Win", value: `$${stats.avgWin.toFixed(2)}`, icon: ArrowUpRight, color: "text-profit" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PipTracker</h1>
          <p className="text-sm text-muted-foreground">Your trading dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <Link to="/log" className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-center font-semibold text-sm">
          + Log Trade
        </Link>
        <Link to="/risk" className="flex-1 bg-secondary text-secondary-foreground rounded-xl py-3 text-center font-semibold text-sm">
          Risk Calc
        </Link>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Recent Trades</h2>
        {recentTrades.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <p className="text-muted-foreground text-sm">No trades logged yet.</p>
            <Link to="/log" className="text-primary text-sm font-medium mt-2 inline-block">Log your first trade →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTrades.map((trade) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-xl p-4 border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${trade.pnl >= 0 ? "bg-profit" : "bg-loss"}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{trade.pair}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${trade.direction === "long" ? "bg-profit\/10 text-profit" : "bg-loss\/10 text-loss"}`}>
                        {trade.direction.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{trade.strategy}</span>
                      <span className="text-xs text-muted-foreground">• {trade.emotion}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold font-mono text-sm ${trade.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{trade.pips > 0 ? "+" : ""}{trade.pips} pips</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
