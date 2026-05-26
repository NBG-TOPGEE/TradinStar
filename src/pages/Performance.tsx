import { useTrades } from "@/contexts/TradeContext";
import { getStats, TradeEmotion, TradingSession, TradingStrategy } from "@/lib/trades";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const CARD_STYLE = {
  background: "hsl(222,22%,10%)",
  border: "1px solid hsl(222,18%,15%)",
  borderRadius: "1.25rem",
  boxShadow: "0 4px 20px hsl(222,40%,4%,0.5)",
};

const tooltipStyle = {
  background: "hsl(222,24%,12%)",
  border: "1px solid hsl(222,18%,18%)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 8px 32px hsl(222,40%,4%,0.8)",
  color: "hsl(210,20%,75%)",
};

export default function Performance() {
  const { trades } = useTrades();
  const stats = getStats(trades);

  const weeklyData = trades.reduce<Record<string, number>>((acc, t) => {
    const d = new Date(t.timestamp);
    const week = `${d.getMonth() + 1}/${d.getDate()}`;
    acc[week] = (acc[week] || 0) + t.pnl;
    return acc;
  }, {});
  const weeklyChart = Object.entries(weeklyData).slice(-7).map(([name, pnl]) => ({ name, pnl: Math.round(pnl * 100) / 100 }));

  const sessionStats = (["Sydney", "Tokyo", "London", "New York"] as TradingSession[]).map(s => {
    const st = trades.filter(t => t.session === s);
    const wins = st.filter(t => t.pnl > 0).length;
    return { name: s.split(" ")[0], winRate: st.length ? Math.round((wins / st.length) * 100) : 0, trades: st.length };
  });

  const strategyStats = (["Breakout", "Trend", "Scalp", "Reversal", "News", "Support/Resistance"] as TradingStrategy[]).map(s => {
    const st = trades.filter(t => t.strategy === s);
    const wins = st.filter(t => t.pnl > 0).length;
    return { name: s.substring(0, 7), winRate: st.length ? Math.round((wins / st.length) * 100) : 0, trades: st.length };
  }).filter(s => s.trades > 0);

  const emotionStats = (["Fearful", "Neutral", "Confident", "Greedy"] as TradeEmotion[]).map(e => {
    const et = trades.filter(t => t.emotion === e);
    const wins = et.filter(t => t.pnl > 0).length;
    return { name: e, winRate: et.length ? Math.round((wins / et.length) * 100) : 0, trades: et.length, pnl: Math.round(et.reduce((s, t) => s + t.pnl, 0) * 100) / 100 };
  }).filter(e => e.trades > 0);

  const kpiCards = [
    { label: "Win Rate",    value: `${stats.winRate}%`,             isGood: stats.winRate >= 50 },
    { label: "Total P&L",   value: `$${stats.totalPnL.toFixed(2)}`, isGood: stats.totalPnL >= 0 },
    { label: "Best Trade",  value: `$${stats.bestTrade.toFixed(2)}`,isGood: true },
    { label: "Worst Trade", value: `$${stats.worstTrade.toFixed(2)}`,isGood: false },
    { label: "Avg Win",     value: `$${stats.avgWin.toFixed(2)}`,   isGood: true },
    { label: "Avg Loss",    value: `$${stats.avgLoss.toFixed(2)}`,  isGood: false },
  ];

  if (trades.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 mb-6">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))" }}
          >
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "hsl(210,30%,92%)" }}>Performance</h1>
        </div>
        <div className="rounded-2xl p-10 text-center glass-card">
          <BarChart3 className="w-10 h-10 mx-auto mb-3" style={{ color: "hsl(215,15%,25%)" }} />
          <p className="text-sm font-medium" style={{ color: "hsl(215,15%,40%)" }}>Log some trades to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
            boxShadow: "0 4px 12px hsl(217,92%,60%,0.4)",
          }}
        >
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-xl font-bold" style={{ color: "hsl(210,30%,92%)" }}>Performance</h1>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {kpiCards.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl p-3 text-center"
            style={CARD_STYLE}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-wide mb-1"
              style={{ color: "hsl(215,15%,38%)" }}
            >
              {k.label}
            </p>
            <p
              className="font-bold font-mono text-sm"
              style={{ color: k.isGood ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)" }}
            >
              {k.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* P&L Trend */}
      {weeklyChart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 mb-4"
          style={CARD_STYLE}
        >
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(215,15%,38%)" }}>
            P&L Trend
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyChart}>
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217,92%,60%)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(217,92%,60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(222,18%,14%)" strokeDasharray="4 4" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215,15%,38%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215,15%,38%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke="hsl(217,92%,60%)"
                strokeWidth={2.5}
                fill="url(#pnlGradient)"
                dot={{ r: 3, fill: "hsl(217,92%,60%)", stroke: "hsl(222,24%,12%)", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "hsl(217,92%,60%)", boxShadow: "0 0 12px hsl(217,92%,60%,0.6)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Session Win Rate */}
      {sessionStats.some(s => s.trades > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="p-4 mb-4"
          style={CARD_STYLE}
        >
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(215,15%,38%)" }}>
            Win Rate by Session
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={sessionStats.filter(s => s.trades > 0)}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215,15%,38%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215,15%,38%)" }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="winRate" fill="hsl(217,92%,60%)" radius={[6, 6, 0, 0]} opacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Emotion Impact */}
      {emotionStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="p-4 mb-4"
          style={CARD_STYLE}
        >
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(215,15%,38%)" }}>
            Emotion Impact
          </h3>
          <div className="space-y-3">
            {emotionStats.map(e => (
              <div key={e.name} className="flex items-center gap-3">
                <span className="text-xs font-semibold w-20" style={{ color: "hsl(210,20%,65%)" }}>
                  {e.name}
                </span>
                <div className="flex-1 rounded-full h-2" style={{ background: "hsl(222,20%,16%)" }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${e.winRate}%`,
                      background: e.winRate >= 50
                        ? "linear-gradient(90deg, hsl(158,68%,46%), hsl(158,68%,58%))"
                        : "linear-gradient(90deg, hsl(0,72%,50%), hsl(0,72%,62%))",
                    }}
                  />
                </div>
                <span className="text-xs font-mono w-8 text-right" style={{ color: "hsl(215,15%,45%)" }}>
                  {e.winRate}%
                </span>
                <span
                  className="text-xs font-mono w-16 text-right font-semibold"
                  style={{ color: e.pnl >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)" }}
                >
                  ${e.pnl}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Strategy Win Rate */}
      {strategyStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="p-4 mb-4"
          style={CARD_STYLE}
        >
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(215,15%,38%)" }}>
            Strategy Win Rate
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={strategyStats}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215,15%,38%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215,15%,38%)" }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="winRate" fill="hsl(217,92%,60%)" radius={[6, 6, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <div className="h-8" />
    </div>
  );
}
