import { useTrades } from "@/contexts/TradeContext";
import { getStats, TradeEmotion, TradingSession, TradingStrategy } from "@/lib/trades";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, LineChart, Line } from "recharts";
import { motion } from "framer-motion";

export default function Performance() {
  const { trades } = useTrades();
  const stats = getStats(trades);

  // Weekly P&L
  const weeklyData = trades.reduce<Record<string, number>>((acc, t) => {
    const d = new Date(t.timestamp);
    const week = `${d.getMonth() + 1}/${d.getDate()}`;
    acc[week] = (acc[week] || 0) + t.pnl;
    return acc;
  }, {});
  const weeklyChart = Object.entries(weeklyData).slice(-7).map(([name, pnl]) => ({ name, pnl: Math.round(pnl * 100) / 100 }));

  // By session
  const sessionStats = (["Sydney", "Tokyo", "London", "New York"] as TradingSession[]).map(s => {
    const st = trades.filter(t => t.session === s);
    const wins = st.filter(t => t.pnl > 0).length;
    return { name: s, winRate: st.length ? Math.round((wins / st.length) * 100) : 0, trades: st.length };
  });

  // By strategy
  const strategyStats = (["Breakout", "Trend", "Scalp", "Reversal", "News", "Support/Resistance"] as TradingStrategy[]).map(s => {
    const st = trades.filter(t => t.strategy === s);
    const wins = st.filter(t => t.pnl > 0).length;
    return { name: s.substring(0, 6), winRate: st.length ? Math.round((wins / st.length) * 100) : 0, trades: st.length };
  }).filter(s => s.trades > 0);

  // Emotion impact
  const emotionStats = (["Fearful", "Neutral", "Confident", "Greedy"] as TradeEmotion[]).map(e => {
    const et = trades.filter(t => t.emotion === e);
    const wins = et.filter(t => t.pnl > 0).length;
    return { name: e, winRate: et.length ? Math.round((wins / et.length) * 100) : 0, trades: et.length, pnl: Math.round(et.reduce((s, t) => s + t.pnl, 0) * 100) / 100 };
  }).filter(e => e.trades > 0);

  const kpiCards = [
    { label: "Win Rate", value: `${stats.winRate}%` },
    { label: "Total P&L", value: `$${stats.totalPnL.toFixed(2)}` },
    { label: "Best Trade", value: `$${stats.bestTrade.toFixed(2)}` },
    { label: "Worst Trade", value: `$${stats.worstTrade.toFixed(2)}` },
    { label: "Avg Win", value: `$${stats.avgWin.toFixed(2)}` },
    { label: "Avg Loss", value: `$${stats.avgLoss.toFixed(2)}` },
  ];

  if (trades.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6">
        <h1 className="text-xl font-bold mb-4">Performance</h1>
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <p className="text-muted-foreground text-sm">Log some trades to see analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-xl font-bold mb-4">Performance</h1>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {kpiCards.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
            className="bg-card rounded-lg p-3 border border-border text-center">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="font-bold font-mono text-sm mt-1">{k.value}</p>
          </motion.div>
        ))}
      </div>

      {/* P&L Trend */}
      {weeklyChart.length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">P&L Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyChart}>
              <CartesianGrid stroke="hsl(220 14% 18%)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215 12% 50%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 12% 50%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220 18% 12%)", border: "1px solid hsl(220 14% 18%)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="pnl" stroke="hsl(142 70% 45%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Session Performance */}
      {sessionStats.some(s => s.trades > 0) && (
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Win Rate by Session</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={sessionStats.filter(s => s.trades > 0)}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215 12% 50%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 12% 50%)" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "hsl(220 18% 12%)", border: "1px solid hsl(220 14% 18%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="winRate" fill="hsl(200 80% 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Emotion Impact */}
      {emotionStats.length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Emotion Impact</h3>
          <div className="space-y-2">
            {emotionStats.map(e => (
              <div key={e.name} className="flex items-center justify-between">
                <span className="text-sm">{e.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${e.winRate}%` }} />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">{e.winRate}%</span>
                  <span className={`text-xs font-mono w-16 text-right ${e.pnl >= 0 ? "text-profit" : "text-loss"}`}>${e.pnl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategy Performance */}
      {strategyStats.length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Strategy Win Rate</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={strategyStats}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215 12% 50%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 12% 50%)" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "hsl(220 18% 12%)", border: "1px solid hsl(220 14% 18%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="winRate" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="h-8" />
    </div>
  );
}
