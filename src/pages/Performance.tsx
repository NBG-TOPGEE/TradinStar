import { useTrades } from "@/contexts/TradeContext";
import { getStats, TradeEmotion, TradingSession, TradingStrategy } from "@/lib/trades";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

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
    { label: "Win Rate", value: `${stats.winRate}%`, color: stats.winRate >= 50 ? "text-emerald-600" : "text-red-500" },
    { label: "Total P&L", value: `$${stats.totalPnL.toFixed(2)}`, color: stats.totalPnL >= 0 ? "text-emerald-600" : "text-red-500" },
    { label: "Best Trade", value: `$${stats.bestTrade.toFixed(2)}`, color: "text-emerald-600" },
    { label: "Worst Trade", value: `$${stats.worstTrade.toFixed(2)}`, color: "text-red-500" },
    { label: "Avg Win", value: `$${stats.avgWin.toFixed(2)}`, color: "text-emerald-600" },
    { label: "Avg Loss", value: `$${stats.avgLoss.toFixed(2)}`, color: "text-red-500" },
  ];

  const tooltipStyle = { background: "white", border: "1px solid hsl(220,14%,90%)", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 12px hsl(220,14%,10%,0.1)" };

  if (trades.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(222,60%,20%)" }}>
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Performance</h1>
        </div>
        <div className="bg-white rounded-2xl p-10 border border-slate-100 text-center" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.06)" }}>
          <BarChart3 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Log some trades to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(222,60%,20%)" }}>
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Performance</h1>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {kpiCards.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl p-3 border border-slate-100 text-center"
            style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.06)" }}>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">{k.label}</p>
            <p className={`font-bold font-mono text-sm ${k.color}`}>{k.value}</p>
          </motion.div>
        ))}
      </div>

      {/* P&L Trend */}
      {weeklyChart.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-4" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.06)" }}>
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">P&L Trend</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weeklyChart}>
              <CartesianGrid stroke="hsl(220,14%,94%)" strokeDasharray="4 4" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="pnl" stroke="hsl(217,90%,56%)" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(217,90%,56%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Session Performance */}
      {sessionStats.some(s => s.trades > 0) && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-4" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.06)" }}>
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Win Rate by Session</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={sessionStats.filter(s => s.trades > 0)}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="winRate" fill="hsl(222,60%,20%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Emotion Impact */}
      {emotionStats.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-4" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.06)" }}>
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Emotion Impact</h3>
          <div className="space-y-3">
            {emotionStats.map(e => (
              <div key={e.name} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600 w-20">{e.name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${e.winRate}%`, background: "hsl(217,90%,56%)" }} />
                </div>
                <span className="text-xs font-mono text-slate-500 w-8 text-right">{e.winRate}%</span>
                <span className={`text-xs font-mono w-16 text-right font-semibold ${e.pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>${e.pnl}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategy Performance */}
      {strategyStats.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-4" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.06)" }}>
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Strategy Win Rate</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={strategyStats}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="winRate" fill="hsl(217,90%,56%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="h-8" />
    </div>
  );
}
