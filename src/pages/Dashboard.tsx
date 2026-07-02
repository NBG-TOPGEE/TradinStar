import { useMemo } from "react";
import { useTrades } from "@/contexts/TradeContext";
import { useAuth } from "@/contexts/AuthContext";
import { getStats } from "@/lib/trades";
import {
  TrendingUp, TrendingDown, Target, Award, ArrowUpRight, ArrowDownRight,
  Zap, Flame, Brain, Plus, Activity, BarChart3, BookOpen, Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, Tooltip, Cell
} from "recharts";

// ── Helpers ───────────────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const TIP = {
  contentStyle: {
    background: "hsl(222,24%,12%)",
    border: "1px solid hsl(222,18%,18%)",
    borderRadius: 10,
    fontSize: 11,
    color: "hsl(210,20%,75%)",
    boxShadow: "0 8px 32px hsl(222,40%,4%,0.8)",
  },
  cursor: { stroke: "hsl(217,92%,60%,0.2)" },
};

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-2"
    >
      {[
        { icon: Plus,   title: "Log your first trade",    desc: "Record pair, direction, session, and strategy.", to: "/log",    accent: "hsl(217,92%,60%)", primary: true },
        { icon: Brain,  title: "Ask the AI Coach",        desc: "Get coaching tips before your first trade.",    to: "/coach",  accent: "hsl(280,65%,62%)" },
        { icon: Target, title: "Use the Risk Calculator", desc: "Calculate position size before the open.",      to: "/risk",   accent: "hsl(38,92%,56%)" },
      ].map(({ icon: Icon, title, desc, to, accent, primary }) => (
        <Link key={to} to={to}
          className="flex items-center gap-4 rounded-2xl p-4 transition-all group hover:-translate-y-0.5"
          style={{
            background: primary ? `${accent}12` : "hsl(222,22%,10%)",
            border: `1px solid ${primary ? accent + "28" : "hsl(222,18%,15%)"}`,
            boxShadow: "0 2px 12px hsl(222,40%,4%,0.4)",
          }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
            <Icon className="w-4 h-4" style={{ color: accent }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: "hsl(210,25%,85%)" }}>{title}</p>
            <p className="text-xs mt-0.5" style={{ color: "hsl(215,15%,42%)" }}>{desc}</p>
          </div>
        </Link>
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { trades } = useTrades();
  const { user, traderProfile } = useAuth();
  const stats = getStats(trades);

  const recentTrades = trades.slice(0, 5);
  const displayName = (user?.user_metadata?.display_name as string) || "Trader";
  const firstName = displayName.split(" ")[0];

  // Win streak
  let streak = 0;
  for (const t of [...trades].reverse()) { if (t.pnl > 0) streak++; else break; }

  // Today
  const today = new Date().toDateString();
  const todayTrades = trades.filter(t => new Date(t.timestamp).toDateString() === today);
  const todayPnL = todayTrades.reduce((s, t) => s + t.pnl, 0);
  const todayWins = todayTrades.filter(t => t.pnl > 0).length;

  // Profit factor
  const profitFactor = useMemo(() => {
    const gw = trades.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
    const gl = Math.abs(trades.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0));
    return gl > 0 ? (gw / gl).toFixed(2) : gw > 0 ? "∞" : "0";
  }, [trades]);

  // Equity curve
  const equityData = useMemo(() => {
    let running = 0;
    return [...trades].reverse().map((t, i) => ({
      i: i + 1,
      pnl: Math.round((running += t.pnl) * 100) / 100,
    }));
  }, [trades]);

  // Daily P&L (last 10 days)
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach(t => {
      const d = new Date(t.timestamp);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      map[key] = (map[key] || 0) + t.pnl;
    });
    return Object.entries(map).slice(-10).map(([name, pnl]) => ({
      name, pnl: Math.round(pnl * 100) / 100,
    }));
  }, [trades]);

  // Best session
  const sessionStats = useMemo(() => {
    const map: Record<string, { wins: number; total: number }> = {};
    trades.forEach(t => {
      if (!map[t.session]) map[t.session] = { wins: 0, total: 0 };
      map[t.session].total++;
      if (t.pnl > 0) map[t.session].wins++;
    });
    return Object.entries(map)
      .map(([s, d]) => ({ session: s, wr: Math.round((d.wins / d.total) * 100) }))
      .sort((a, b) => b.wr - a.wr);
  }, [trades]);

  // Best pair
  const pairStats = useMemo(() => {
    const map: Record<string, { wins: number; total: number }> = {};
    trades.forEach(t => {
      if (!map[t.pair]) map[t.pair] = { wins: 0, total: 0 };
      map[t.pair].total++;
      if (t.pnl > 0) map[t.pair].wins++;
    });
    return Object.entries(map)
      .map(([pair, d]) => ({ pair, wr: Math.round((d.wins / d.total) * 100) }))
      .sort((a, b) => b.wr - a.wr);
  }, [trades]);

  // Direction breakdown
  const longs  = trades.filter(t => t.direction === "long");
  const shorts = trades.filter(t => t.direction === "short");
  const longWR  = longs.length  ? Math.round((longs.filter(t => t.pnl > 0).length  / longs.length)  * 100) : 0;
  const shortWR = shorts.length ? Math.round((shorts.filter(t => t.pnl > 0).length / shorts.length) * 100) : 0;

  // AI insight
  const aiInsight = (() => {
    if (trades.length === 0) return null;
    if (stats.winRate >= 65) return `${stats.winRate}% win rate — strong discipline. Keep protecting your RR.`;
    if (stats.winRate >= 50) return `${stats.winRate}% win rate. Tighten entry criteria to push above 60%.`;
    if (todayTrades.length > (traderProfile?.max_trades_per_day ?? 3))
      return `${todayTrades.length} trades today — approaching your daily limit. Quality over quantity.`;
    return `Win rate at ${stats.winRate}%. Focus on trade selection and rule compliance.`;
  })();

  const CARD: React.CSSProperties = {
    background: "hsl(222,22%,10%)",
    border: "1px solid hsl(222,18%,15%)",
    borderRadius: "1.25rem",
    boxShadow: "0 4px 20px hsl(222,40%,4%,0.5)",
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">

      {/* ── GREETING ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
                background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
                boxShadow: "0 4px 12px hsl(217,92%,60%,0.4)",
              }}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: "hsl(210,30%,94%)" }}>
                {greeting()}, {firstName}
              </h1>
            </div>
            <p className="text-sm ml-9" style={{ color: "hsl(215,15%,42%)" }}>
              {trades.length > 0
                ? `${todayTrades.length > 0 ? `${todayTrades.length} trade${todayTrades.length > 1 ? "s" : ""} today` : "No trades today"} · ${stats.totalTrades} total`
                : "Your trading dashboard"}
            </p>
          </div>
          {streak >= 2 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: "hsl(38,92%,56%,0.12)", border: "1px solid hsl(38,92%,56%,0.22)" }}>
              <Flame className="w-3.5 h-3.5" style={{ color: "hsl(38,92%,62%)" }} />
              <span className="text-xs font-bold" style={{ color: "hsl(38,92%,62%)" }}>{streak} streak</span>
            </div>
          )}
        </div>

        {/* Today strip */}
        {todayTrades.length > 0 && (
          <div className="rounded-2xl px-4 py-3 flex items-center justify-between" style={{
            background: todayPnL >= 0 ? "hsl(158,68%,46%,0.07)" : "hsl(0,72%,58%,0.07)",
            border: `1px solid ${todayPnL >= 0 ? "hsl(158,68%,46%,0.18)" : "hsl(0,72%,58%,0.18)"}`,
          }}>
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" style={{ color: todayPnL >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)" }} />
              <span className="text-xs font-semibold" style={{ color: "hsl(215,15%,52%)" }}>
                Today · {todayWins}/{todayTrades.length} wins
              </span>
            </div>
            <span className="text-sm font-bold font-mono" style={{
              color: todayPnL >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)"
            }}>
              {todayPnL >= 0 ? "+" : ""}${todayPnL.toFixed(2)}
            </span>
          </div>
        )}

        {/* AI insight */}
        {aiInsight && (
          <div className="mt-2 px-4 py-3 rounded-2xl flex items-center gap-3" style={{
            background: "hsl(217,92%,60%,0.06)",
            border: "1px solid hsl(217,92%,60%,0.12)",
          }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{
              background: "hsl(217,92%,60%,0.18)", border: "1px solid hsl(217,92%,60%,0.25)",
            }}>
              <Brain className="w-3.5 h-3.5" style={{ color: "hsl(217,92%,70%)" }} />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "hsl(215,20%,58%)" }}>{aiInsight}</p>
          </div>
        )}
      </motion.div>

      {/* ── STAT CARDS ── */}
      {trades.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Win Rate",      value: `${stats.winRate}%`,                              icon: Award,      accent: stats.winRate >= 50 ? "hsl(158,68%,46%)" : "hsl(0,72%,58%)" },
              { label: "Net P&L",       value: `${stats.totalPnL >= 0 ? "+" : ""}$${stats.totalPnL.toFixed(2)}`, icon: stats.totalPnL >= 0 ? TrendingUp : TrendingDown, accent: stats.totalPnL >= 0 ? "hsl(158,68%,46%)" : "hsl(0,72%,58%)" },
              { label: "Total Trades",  value: String(stats.totalTrades),                        icon: Target,     accent: "hsl(217,92%,60%)" },
              { label: "Profit Factor", value: String(profitFactor),                             icon: BarChart3,  accent: Number(profitFactor) >= 1 ? "hsl(38,92%,56%)" : "hsl(0,72%,58%)" },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 + i * 0.04 }}
                className="rounded-2xl p-4"
                style={{ ...CARD, background: `linear-gradient(135deg, ${s.accent}14, ${s.accent}06)`, border: `1px solid ${s.accent}22` }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${s.accent}18` }}>
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.accent }} />
                </div>
                <p className="text-[10px] font-medium mb-0.5" style={{ color: "hsl(215,15%,40%)" }}>{s.label}</p>
                <p className="text-xl font-bold font-mono" style={{ color: s.accent }}>{s.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── EQUITY CURVE ── */}
      {equityData.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-4" style={CARD}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(215,15%,38%)" }}>
              Equity Curve
            </span>
            <span className="text-xs font-mono font-bold" style={{
              color: stats.totalPnL >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)"
            }}>
              {stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217,92%,60%)" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="hsl(217,92%,60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="i" hide />
              <YAxis hide />
              <Tooltip {...TIP} formatter={(v: any) => [`$${v}`, "P&L"]} />
              <Area type="monotone" dataKey="pnl" stroke="hsl(217,92%,60%)" strokeWidth={2}
                fill="url(#eqGrad)" dot={false} activeDot={{ r: 4, fill: "hsl(217,92%,60%)" }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* ── DAILY P&L ── */}
      {dailyData.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-4" style={CARD}>
          <span className="text-[10px] font-bold uppercase tracking-widest mb-3 block" style={{ color: "hsl(215,15%,38%)" }}>
            Daily P&L
          </span>
          <ResponsiveContainer width="100%" height={90}>
            <BarChart data={dailyData} barSize={14}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(215,15%,36%)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip {...TIP} formatter={(v: any) => [`$${v}`, "P&L"]} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {dailyData.map((d, i) => (
                  <Cell key={i} fill={d.pnl >= 0 ? "hsl(158,68%,46%)" : "hsl(0,72%,58%)"} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* ── PERFORMANCE BREAKDOWN ── */}
      {trades.length >= 3 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="p-4" style={CARD}>
          <span className="text-[10px] font-bold uppercase tracking-widest mb-4 block" style={{ color: "hsl(215,15%,38%)" }}>
            Performance Breakdown
          </span>
          <div className="space-y-3">
            {/* Direction */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Long", wr: longWR,  count: longs.length,  accent: "hsl(158,68%,46%)" },
                { label: "Short", wr: shortWR, count: shorts.length, accent: "hsl(0,72%,58%)" },
              ].filter(d => d.count > 0).map(d => (
                <div key={d.label} className="rounded-xl p-3" style={{
                  background: `${d.accent}08`, border: `1px solid ${d.accent}18`
                }}>
                  <p className="text-[9px] uppercase tracking-wider mb-1.5" style={{ color: "hsl(215,15%,36%)" }}>
                    {d.label} · {d.count}
                  </p>
                  <p className="text-sm font-bold font-mono" style={{ color: d.accent }}>{d.wr}%</p>
                  <div className="h-1 rounded-full mt-2" style={{ background: "hsl(222,20%,16%)" }}>
                    <div className="h-1 rounded-full" style={{ width: `${d.wr}%`, background: d.accent }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Best session */}
            {sessionStats.length > 0 && (
              <div className="flex items-center justify-between py-2.5"
                style={{ borderTop: "1px solid hsl(222,18%,14%)" }}>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" style={{ color: "hsl(215,15%,40%)" }} />
                  <span className="text-xs" style={{ color: "hsl(215,15%,40%)" }}>Best session</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: "hsl(210,20%,75%)" }}>
                    {sessionStats[0].session}
                  </span>
                  <span className="text-xs font-bold font-mono" style={{ color: "hsl(158,68%,55%)" }}>
                    {sessionStats[0].wr}%
                  </span>
                </div>
              </div>
            )}

            {/* Best pair */}
            {pairStats.length > 0 && (
              <div className="flex items-center justify-between py-2.5"
                style={{ borderTop: "1px solid hsl(222,18%,14%)" }}>
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3" style={{ color: "hsl(215,15%,40%)" }} />
                  <span className="text-xs" style={{ color: "hsl(215,15%,40%)" }}>Best pair</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold font-mono" style={{ color: "hsl(210,20%,75%)" }}>
                    {pairStats[0].pair}
                  </span>
                  <span className="text-xs font-bold font-mono" style={{ color: "hsl(158,68%,55%)" }}>
                    {pairStats[0].wr}%
                  </span>
                </div>
              </div>
            )}

            {/* Avg RR */}
            <div className="flex items-center justify-between py-2.5"
              style={{ borderTop: "1px solid hsl(222,18%,14%)" }}>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3 h-3" style={{ color: "hsl(215,15%,40%)" }} />
                <span className="text-xs" style={{ color: "hsl(215,15%,40%)" }}>Avg win / Avg loss</span>
              </div>
              <span className="text-xs font-bold font-mono" style={{ color: "hsl(38,92%,56%)" }}>
                ${stats.avgWin.toFixed(0)} / ${Math.abs(stats.avgLoss).toFixed(0)}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── QUICK ACTIONS ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "hsl(215,15%,32%)" }}>
          Quick Actions
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Plus,     label: "Add Trade",  to: "/log",        accent: "hsl(217,92%,60%)" },
            { icon: BookOpen, label: "Journal",    to: "/journal",    accent: "hsl(158,68%,46%)" },
            { icon: Brain,    label: "AI Coach",   to: "/coach",      accent: "hsl(280,65%,62%)" },
            { icon: BarChart3,label: "Analytics",  to: "/performance",accent: "hsl(38,92%,56%)" },
          ].map(({ icon: Icon, label, to, accent }) => (
            <Link key={to} to={to}
              className="flex flex-col items-center gap-2 py-3.5 rounded-2xl transition-all active:scale-95 hover:opacity-90"
              style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}>
              <Icon className="w-4 h-4" style={{ color: accent }} />
              <span className="text-[10px] font-semibold text-center" style={{ color: accent }}>{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── RECENT TRADES / EMPTY STATE ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(215,15%,32%)" }}>
            {trades.length > 0 ? "Recent Trades" : "Start here"}
          </p>
          {trades.length > 0 && (
            <Link to="/journal" className="text-xs font-semibold hover:opacity-80" style={{ color: "hsl(217,92%,65%)" }}>
              View all →
            </Link>
          )}
        </div>

        {trades.length === 0 ? <EmptyState /> : (
          <div className="space-y-2">
            {recentTrades.map((trade, i) => (
              <motion.div key={trade.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.32 + i * 0.05 }}
                className="rounded-2xl p-4 flex items-center justify-between"
                style={CARD}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
                    background: trade.pnl >= 0 ? "hsl(158,68%,46%,0.12)" : "hsl(0,72%,58%,0.12)",
                    border: `1px solid ${trade.pnl >= 0 ? "hsl(158,68%,46%,0.2)" : "hsl(0,72%,58%,0.2)"}`,
                  }}>
                    {trade.pnl >= 0
                      ? <ArrowUpRight className="w-4 h-4" style={{ color: "hsl(158,68%,55%)" }} />
                      : <ArrowDownRight className="w-4 h-4" style={{ color: "hsl(0,72%,65%)" }} />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: "hsl(210,30%,90%)" }}>{trade.pair}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold font-mono" style={{
                        background: trade.direction === "long" ? "hsl(158,68%,46%,0.12)" : "hsl(0,72%,58%,0.12)",
                        color: trade.direction === "long" ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)",
                        border: `1px solid ${trade.direction === "long" ? "hsl(158,68%,46%,0.2)" : "hsl(0,72%,58%,0.2)"}`,
                      }}>
                        {trade.direction.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: "hsl(215,15%,40%)" }}>
                      {trade.strategy} · {trade.session}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono text-sm" style={{
                    color: trade.pnl >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)"
                  }}>
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </p>
                  <p className="text-[11px] font-mono" style={{ color: "hsl(215,15%,38%)" }}>
                    {trade.pips > 0 ? "+" : ""}{trade.pips} pips
                  </p>
                </div>
              </motion.div>
            ))}

            <Link to="/log"
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-80"
              style={{
                background: "hsl(217,92%,60%,0.08)",
                border: "1px dashed hsl(217,92%,60%,0.3)",
                color: "hsl(217,92%,65%)",
              }}>
              <Plus className="w-4 h-4" /> Log a trade
            </Link>
          </div>
        )}
      </motion.div>

      <div className="h-6" />
    </div>
  );
}
