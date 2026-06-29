import { useMemo } from "react";
import { useTrades } from "@/contexts/TradeContext";
import { getStats, TradeEmotion, TradingSession } from "@/lib/trades";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, Tooltip, CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Target, Award, Activity, Brain, Clock } from "lucide-react";

const CARD: React.CSSProperties = {
  background: "hsl(222,22%,10%)",
  border: "1px solid hsl(222,18%,15%)",
  borderRadius: "1.25rem",
  boxShadow: "0 4px 20px hsl(222,40%,4%,0.5)",
};

const TIP = {
  contentStyle: {
    background: "hsl(222,24%,12%)",
    border: "1px solid hsl(222,18%,18%)",
    borderRadius: 12,
    fontSize: 11,
    boxShadow: "0 8px 32px hsl(222,40%,4%,0.8)",
    color: "hsl(210,20%,75%)",
  },
  cursor: { stroke: "hsl(217,92%,60%,0.2)" },
};

export default function Performance() {
  const { trades } = useTrades();
  const stats = getStats(trades);

  // ── Equity curve ────────────────────────────────────────────────────────
  const equityData = useMemo(() => {
    let running = 0;
    return [...trades].reverse().map((t, i) => {
      running += t.pnl;
      return {
        i: i + 1,
        pnl: Math.round(running * 100) / 100,
        trade: t.pair,
      };
    });
  }, [trades]);

  // ── Daily P&L ───────────────────────────────────────────────────────────
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach(t => {
      const d = new Date(t.timestamp);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      map[key] = (map[key] || 0) + t.pnl;
    });
    return Object.entries(map)
      .slice(-14)
      .map(([name, pnl]) => ({ name, pnl: Math.round(pnl * 100) / 100 }));
  }, [trades]);

  // ── Session stats ───────────────────────────────────────────────────────
  const sessionStats = useMemo(() =>
    (["Sydney", "Tokyo", "London", "New York"] as TradingSession[]).map(s => {
      const st = trades.filter(t => t.session === s);
      const wins = st.filter(t => t.pnl > 0).length;
      const pnl = st.reduce((a, t) => a + t.pnl, 0);
      return {
        name: s.split(" ")[0],
        fullName: s,
        winRate: st.length ? Math.round((wins / st.length) * 100) : 0,
        trades: st.length,
        pnl: Math.round(pnl * 100) / 100,
      };
    }).filter(s => s.trades > 0),
  [trades]);

  // ── Pair stats ──────────────────────────────────────────────────────────
  const pairStats = useMemo(() => {
    const map: Record<string, { wins: number; total: number; pnl: number }> = {};
    trades.forEach(t => {
      if (!map[t.pair]) map[t.pair] = { wins: 0, total: 0, pnl: 0 };
      map[t.pair].total++;
      if (t.pnl > 0) map[t.pair].wins++;
      map[t.pair].pnl += t.pnl;
    });
    return Object.entries(map)
      .map(([pair, d]) => ({
        pair,
        winRate: Math.round((d.wins / d.total) * 100),
        trades: d.total,
        pnl: Math.round(d.pnl * 100) / 100,
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 6);
  }, [trades]);

  // ── Emotion stats ───────────────────────────────────────────────────────
  const emotionStats = useMemo(() =>
    (["Fearful", "Neutral", "Confident", "Greedy"] as TradeEmotion[]).map(e => {
      const et = trades.filter(t => t.emotion === e);
      const wins = et.filter(t => t.pnl > 0).length;
      return {
        name: e,
        winRate: et.length ? Math.round((wins / et.length) * 100) : 0,
        trades: et.length,
        pnl: Math.round(et.reduce((s, t) => s + t.pnl, 0) * 100) / 100,
      };
    }).filter(e => e.trades > 0),
  [trades]);

  // ── Profit factor ────────────────────────────────────────────────────────
  const profitFactor = useMemo(() => {
    const grossWin = trades.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0));
    return grossLoss > 0 ? Math.round((grossWin / grossLoss) * 100) / 100 : grossWin > 0 ? "∞" : 0;
  }, [trades]);

  // ── Best / worst ────────────────────────────────────────────────────────
  const bestSession = sessionStats.reduce((b, s) => (s.winRate > (b?.winRate ?? -1) ? s : b), sessionStats[0]);
  const bestPair = pairStats[0];

  if (trades.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
            background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
            boxShadow: "0 4px 12px hsl(217,92%,60%,0.4)"
          }}>
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "hsl(210,30%,92%)" }}>Performance</h1>
        </div>
        <div className="rounded-2xl p-10 text-center glass-card">
          <BarChart3 className="w-10 h-10 mx-auto mb-3" style={{ color: "hsl(215,15%,25%)" }} />
          <p className="text-sm font-medium mb-1" style={{ color: "hsl(215,15%,42%)" }}>No trades logged yet</p>
          <p className="text-xs" style={{ color: "hsl(215,15%,32%)" }}>Your analytics will appear once you log your first trade.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
          background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
          boxShadow: "0 4px 12px hsl(217,92%,60%,0.4)"
        }}>
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "hsl(210,30%,92%)" }}>Performance</h1>
          <p className="text-xs" style={{ color: "hsl(215,15%,38%)" }}>{stats.totalTrades} trades analysed</p>
        </div>
      </div>

      {/* KPI grid */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Win Rate", value: `${stats.winRate}%`, icon: Award, good: stats.winRate >= 50 },
            { label: "Total P&L", value: `$${stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}`, icon: stats.totalPnL >= 0 ? TrendingUp : TrendingDown, good: stats.totalPnL >= 0 },
            { label: "Profit Factor", value: String(profitFactor), icon: Target, good: Number(profitFactor) >= 1 },
            { label: "Avg Win", value: `$${stats.avgWin.toFixed(2)}`, icon: TrendingUp, good: true, amber: true },
            { label: "Avg Loss", value: `$${Math.abs(stats.avgLoss).toFixed(2)}`, icon: TrendingDown, good: false },
            { label: "Best Trade", value: `$${stats.bestTrade.toFixed(2)}`, icon: Activity, good: true, amber: true },
          ].map((k, i) => {
            const color = k.amber ? "hsl(38,92%,56%)" : k.good ? "hsl(158,68%,46%)" : "hsl(0,72%,58%)";
            return (
              <motion.div key={k.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 + i * 0.04 }}
                className="rounded-2xl p-3" style={CARD}>
                <p className="text-[9px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "hsl(215,15%,36%)" }}>{k.label}</p>
                <p className="font-bold font-mono text-sm" style={{ color }}>{k.value}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Best session + best pair callout */}
      {(bestSession || bestPair) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="grid grid-cols-2 gap-3">
            {bestSession && (
              <div className="rounded-2xl p-4" style={{
                background: "hsl(217,92%,60%,0.07)",
                border: "1px solid hsl(217,92%,60%,0.15)"
              }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5" style={{ color: "hsl(217,92%,65%)" }} />
                  <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "hsl(217,92%,65%)" }}>Best Session</span>
                </div>
                <p className="text-base font-bold" style={{ color: "hsl(210,30%,90%)" }}>{bestSession.fullName}</p>
                <p className="text-xs font-mono mt-1" style={{ color: "hsl(158,68%,55%)" }}>{bestSession.winRate}% win · {bestSession.trades} trades</p>
              </div>
            )}
            {bestPair && (
              <div className="rounded-2xl p-4" style={{
                background: "hsl(158,68%,46%,0.07)",
                border: "1px solid hsl(158,68%,46%,0.15)"
              }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Target className="w-3.5 h-3.5" style={{ color: "hsl(158,68%,55%)" }} />
                  <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "hsl(158,68%,55%)" }}>Best Pair</span>
                </div>
                <p className="text-base font-bold" style={{ color: "hsl(210,30%,90%)" }}>{bestPair.pair}</p>
                <p className="text-xs font-mono mt-1" style={{ color: "hsl(158,68%,55%)" }}>{bestPair.winRate}% win · {bestPair.trades} trades</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Equity curve */}
      {equityData.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-4" style={CARD}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(215,15%,38%)" }}>Equity Curve</h3>
            <span className="text-xs font-mono font-bold" style={{
              color: stats.totalPnL >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)"
            }}>
              {stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217,92%,60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217,92%,60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(222,18%,13%)" strokeDasharray="4 4" />
              <XAxis dataKey="i" tick={{ fontSize: 9, fill: "hsl(215,15%,36%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(215,15%,36%)" }} axisLine={false} tickLine={false} />
              <Tooltip {...TIP} formatter={(v: any) => [`$${v}`, "P&L"]} />
              <Area type="monotone" dataKey="pnl" stroke="hsl(217,92%,60%)" strokeWidth={2} fill="url(#equityGrad)"
                dot={false} activeDot={{ r: 4, fill: "hsl(217,92%,60%)" }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Daily P&L bars */}
      {dailyData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="p-4" style={CARD}>
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(215,15%,38%)" }}>Daily P&L</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={dailyData}>
              <CartesianGrid stroke="hsl(222,18%,13%)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(215,15%,36%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(215,15%,36%)" }} axisLine={false} tickLine={false} />
              <Tooltip {...TIP} formatter={(v: any) => [`$${v}`, "P&L"]} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}
                fill="hsl(217,92%,60%)"
                /* colour each bar individually via cell approach — Recharts supports fill function */
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Session breakdown */}
      {sessionStats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-4" style={CARD}>
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(215,15%,38%)" }}>Session Breakdown</h3>
          <div className="space-y-3">
            {sessionStats.map(s => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" style={{ color: "hsl(215,15%,40%)" }} />
                    <span className="text-xs font-semibold" style={{ color: "hsl(210,20%,70%)" }}>{s.fullName}</span>
                    <span className="text-[10px]" style={{ color: "hsl(215,15%,36%)" }}>{s.trades} trades</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono" style={{ color: s.pnl >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)" }}>
                      {s.pnl >= 0 ? "+" : ""}${s.pnl}
                    </span>
                    <span className="text-xs font-bold font-mono" style={{ color: s.winRate >= 50 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)" }}>
                      {s.winRate}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "hsl(222,20%,15%)" }}>
                  <div className="h-1.5 rounded-full transition-all" style={{
                    width: `${s.winRate}%`,
                    background: s.winRate >= 50
                      ? "linear-gradient(90deg, hsl(158,68%,46%), hsl(158,68%,58%))"
                      : "linear-gradient(90deg, hsl(0,72%,50%), hsl(0,72%,62%))"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pair performance */}
      {pairStats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="p-4" style={CARD}>
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(215,15%,38%)" }}>Pair Performance</h3>
          <div className="space-y-2.5">
            {pairStats.map(p => (
              <div key={p.pair} className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono w-20 shrink-0" style={{ color: "hsl(210,20%,72%)" }}>{p.pair}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "hsl(222,20%,15%)" }}>
                  <div className="h-1.5 rounded-full" style={{
                    width: `${p.winRate}%`,
                    background: p.winRate >= 50
                      ? "linear-gradient(90deg, hsl(158,68%,46%), hsl(158,68%,58%))"
                      : "linear-gradient(90deg, hsl(0,72%,50%), hsl(0,72%,62%))"
                  }} />
                </div>
                <span className="text-xs font-mono font-bold w-9 text-right shrink-0" style={{
                  color: p.winRate >= 50 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)"
                }}>{p.winRate}%</span>
                <span className="text-[10px] font-mono w-14 text-right shrink-0" style={{
                  color: p.pnl >= 0 ? "hsl(158,68%,50%)" : "hsl(0,72%,60%)"
                }}>{p.pnl >= 0 ? "+" : ""}${p.pnl}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Emotion impact */}
      {emotionStats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="p-4" style={CARD}>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-3.5 h-3.5" style={{ color: "hsl(280,65%,62%)" }} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(215,15%,38%)" }}>Emotion Impact</h3>
          </div>
          <div className="space-y-3">
            {emotionStats.map(e => (
              <div key={e.name} className="flex items-center gap-3">
                <span className="text-xs font-semibold w-20 shrink-0" style={{ color: "hsl(210,20%,65%)" }}>{e.name}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "hsl(222,20%,15%)" }}>
                  <div className="h-1.5 rounded-full" style={{
                    width: `${e.winRate}%`,
                    background: e.winRate >= 50
                      ? "linear-gradient(90deg, hsl(158,68%,46%), hsl(158,68%,58%))"
                      : "linear-gradient(90deg, hsl(0,72%,50%), hsl(0,72%,62%))"
                  }} />
                </div>
                <span className="text-xs font-mono font-bold w-8 text-right shrink-0" style={{
                  color: e.winRate >= 50 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)"
                }}>{e.winRate}%</span>
                <span className="text-[10px] font-mono w-14 text-right shrink-0" style={{
                  color: e.pnl >= 0 ? "hsl(158,68%,50%)" : "hsl(0,72%,60%)"
                }}>{e.pnl >= 0 ? "+" : ""}${e.pnl}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="h-6" />
    </div>
  );
}
