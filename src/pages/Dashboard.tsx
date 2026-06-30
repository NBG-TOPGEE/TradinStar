import { useTrades } from "@/contexts/TradeContext";
import { useAuth } from "@/contexts/AuthContext";
import { getStats } from "@/lib/trades";
import {
  TrendingUp, TrendingDown, Target, Award, ArrowUpRight, ArrowDownRight,
  Zap, Flame, Brain, Plus, ChevronRight, CircleDot, Activity,
  BookOpen, BarChart3, Shield, Star, Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// ── Helpers ───────────────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function styleLabel(s: string) {
  const map: Record<string, string> = {
    scalping: "Scalper", day_trading: "Day Trader",
    swing_trading: "Swing Trader", position_trading: "Position Trader",
  };
  return map[s] ?? s;
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <svg width="52" height="52" className="-rotate-90">
      <circle cx="26" cy="26" r={r} fill="none" stroke="hsl(222,20%,16%)" strokeWidth="3.5" />
      <circle
        cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="3.5"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
    </svg>
  );
}

// ── Trader DNA Card ───────────────────────────────────────────────────────
function TraderDNACard() {
  const { traderProfile } = useAuth();

  if (!traderProfile || !traderProfile.experience) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 mb-5"
        style={{
          background: "linear-gradient(135deg, hsl(217,92%,60%,0.08), hsl(222,70%,45%,0.04))",
          border: "1px solid hsl(217,92%,60%,0.15)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CircleDot className="w-4 h-4" style={{ color: "hsl(217,92%,60%)" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(217,92%,60%)" }}>
              Trader DNA
            </span>
          </div>
        </div>
        <p className="text-sm mb-3" style={{ color: "hsl(215,15%,50%)" }}>
          Complete your profile to unlock your Trader DNA — personalized insights, AI coaching, and discipline scoring.
        </p>
        <Link
          to="/onboarding"
          className="inline-flex items-center gap-1.5 text-xs font-bold transition-all hover:opacity-80"
          style={{ color: "hsl(217,92%,65%)" }}
        >
          Build my profile <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>
    );
  }

  const disc = traderProfile.discipline_score;
  const cons = traderProfile.consistency_score;
  const primaryStrategy = traderProfile.strategies?.[0] ?? null;
  const primarySession = null; // will be derived from trades in a future phase
  const riskRR = traderProfile.preferred_rr;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl p-5 mb-5"
      style={{
        background: "linear-gradient(135deg, hsl(217,92%,60%,0.07), hsl(222,70%,45%,0.04))",
        border: "1px solid hsl(217,92%,60%,0.14)",
        boxShadow: "0 4px 24px hsl(222,40%,4%,0.4)",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CircleDot className="w-4 h-4" style={{ color: "hsl(217,92%,60%)" }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(217,92%,60%)" }}>
            Trader DNA
          </span>
        </div>
        <Link
          to="/settings"
          className="text-[10px] font-semibold transition-all hover:opacity-70"
          style={{ color: "hsl(215,15%,38%)" }}
        >
          Edit profile →
        </Link>
      </div>

      {/* Scores + identity */}
      <div className="flex items-start gap-4 mb-4">
        {/* Score rings */}
        {(disc !== null || cons !== null) && (
          <div className="flex gap-3 shrink-0">
            {disc !== null && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <ScoreRing score={disc} color="hsl(217,92%,60%)" />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono" style={{ color: "hsl(217,92%,65%)" }}>
                    {disc}
                  </span>
                </div>
                <span className="text-[9px] mt-1 font-semibold uppercase tracking-wide" style={{ color: "hsl(215,15%,38%)" }}>Disc.</span>
              </div>
            )}
            {cons !== null && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <ScoreRing score={cons} color="hsl(158,68%,46%)" />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono" style={{ color: "hsl(158,68%,55%)" }}>
                    {cons}
                  </span>
                </div>
                <span className="text-[9px] mt-1 font-semibold uppercase tracking-wide" style={{ color: "hsl(215,15%,38%)" }}>Cons.</span>
              </div>
            )}
          </div>
        )}

        {/* Identity fields */}
        <div className="flex-1 space-y-2">
          {[
            { label: "Style", value: styleLabel(traderProfile.trading_style ?? "") },
            primaryStrategy ? { label: "Strategy", value: primaryStrategy } : null,
            traderProfile.experience ? { label: "Level", value: traderProfile.experience.charAt(0).toUpperCase() + traderProfile.experience.slice(1) } : null,
            riskRR ? { label: "Pref. RR", value: `1:${riskRR}` } : null,
          ].filter(Boolean).slice(0, 4).map(row => row && (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: "hsl(215,15%,38%)" }}>{row.label}</span>
              <span className="text-[11px] font-semibold" style={{ color: "hsl(210,25%,75%)" }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Goals chips */}
      {traderProfile.goals?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {traderProfile.goals.slice(0, 3).map(g => (
            <span key={g} className="text-[10px] px-2 py-0.5 rounded-lg font-medium" style={{
              background: "hsl(217,92%,60%,0.1)",
              color: "hsl(217,92%,65%)",
              border: "1px solid hsl(217,92%,60%,0.18)"
            }}>
              {g}
            </span>
          ))}
          {traderProfile.goals.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-lg font-medium" style={{
              background: "hsl(222,20%,14%)",
              color: "hsl(215,15%,40%)",
            }}>
              +{traderProfile.goals.length - 3} more
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Empty state for new users ─────────────────────────────────────────────
function NewUserEmptyState() {
  const { traderProfile } = useAuth();
  const name = traderProfile?.trading_style ? styleLabel(traderProfile.trading_style) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      {/* Quick action cards */}
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(215,15%,35%)" }}>
          Get started
        </p>
        <div className="space-y-2">
          {[
            {
              icon: Plus, title: "Log your first trade",
              desc: "Record a trade with pair, direction, session, and strategy.",
              to: "/log", accent: "hsl(217,92%,60%)", primary: true
            },
            {
              icon: Brain, title: "Ask the AI Coach",
              desc: "Get coaching tips even before your first trade.",
              to: "/coach", accent: "hsl(280,65%,62%)"
            },
            {
              icon: Shield, title: "Use the Risk Calculator",
              desc: "Calculate your position size before the market opens.",
              to: "/risk", accent: "hsl(38,92%,56%)"
            },
          ].map(({ icon: Icon, title, desc, to, accent, primary }) => (
            <Link key={to} to={to}
              className="flex items-center gap-4 rounded-2xl p-4 transition-all group hover:-translate-y-0.5"
              style={{
                background: primary ? `${accent}12` : "hsl(222,22%,10%)",
                border: `1px solid ${primary ? accent + "25" : "hsl(222,18%,15%)"}`,
                boxShadow: "0 2px 12px hsl(222,40%,4%,0.4)"
              }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{
                background: `${accent}15`,
                border: `1px solid ${accent}25`
              }}>
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: "hsl(210,25%,85%)" }}>{title}</p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(215,15%,42%)" }}>{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }} />
            </Link>
          ))}
        </div>
      </div>
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

  // Win streak
  let streak = 0;
  for (const t of [...trades].reverse()) {
    if (t.pnl > 0) streak++;
    else break;
  }

  // Today's trades
  const today = new Date().toDateString();
  const todayTrades = trades.filter(t => new Date(t.timestamp).toDateString() === today);
  const todayPnL = todayTrades.reduce((s, t) => s + t.pnl, 0);
  const todayWins = todayTrades.filter(t => t.pnl > 0).length;

  // Display name: from user metadata or profile
  const displayName = (user?.user_metadata?.display_name as string) || "Trader";
  const firstName = displayName.split(" ")[0];

  // AI insight line
  const aiInsight = (() => {
    if (trades.length === 0) return null;
    if (stats.winRate >= 65) return `${stats.winRate}% win rate — strong discipline. Keep protecting your RR.`;
    if (stats.winRate >= 50) return `${stats.winRate}% win rate. Tighten your entry criteria to push above 60%.`;
    if (todayTrades.length > 3) return `${todayTrades.length} trades today — watch for overtrading. Quality over quantity.`;
    return `Win rate at ${stats.winRate}%. Focus on trade selection, not frequency.`;
  })();

  const statCards = [
    {
      label: "Win Rate",
      value: `${stats.winRate}%`,
      icon: Award,
      good: stats.winRate >= 50,
    },
    {
      label: "Total P&L",
      value: `$${stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}`,
      icon: stats.totalPnL >= 0 ? TrendingUp : TrendingDown,
      good: stats.totalPnL >= 0,
    },
    {
      label: "Total Trades",
      value: stats.totalTrades,
      icon: Target,
      good: true,
      neutral: true,
    },
    {
      label: "Avg Win",
      value: `$${stats.avgWin.toFixed(2)}`,
      icon: ArrowUpRight,
      good: true,
      amber: true,
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">

      {/* ── GREETING ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
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
                : "Your trading dashboard"
              }
            </p>
          </div>

          {streak >= 2 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{
                background: "hsl(38,92%,56%,0.12)",
                border: "1px solid hsl(38,92%,56%,0.22)",
              }}
            >
              <Flame className="w-3.5 h-3.5" style={{ color: "hsl(38,92%,62%)" }} />
              <span className="text-xs font-bold" style={{ color: "hsl(38,92%,62%)" }}>
                {streak} streak
              </span>
            </motion.div>
          )}
        </div>

        {/* Today's P&L strip — only if traded today */}
        {todayTrades.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 rounded-2xl px-4 py-3 flex items-center justify-between"
            style={{
              background: todayPnL >= 0 ? "hsl(158,68%,46%,0.07)" : "hsl(0,72%,58%,0.07)",
              border: `1px solid ${todayPnL >= 0 ? "hsl(158,68%,46%,0.18)" : "hsl(0,72%,58%,0.18)"}`,
            }}
          >
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
          </motion.div>
        )}

        {/* AI insight strip */}
        {aiInsight && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{
              background: "hsl(217,92%,60%,0.06)",
              border: "1px solid hsl(217,92%,60%,0.12)",
            }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ai-active" style={{
              background: "hsl(217,92%,60%,0.18)",
              border: "1px solid hsl(217,92%,60%,0.25)",
            }}>
              <Brain className="w-3.5 h-3.5" style={{ color: "hsl(217,92%,70%)" }} />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "hsl(215,20%,58%)" }}>
              {aiInsight}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* ── TRADER DNA ── */}
      <TraderDNACard />

      {/* ── STAT CARDS ── */}
      {trades.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {statCards.map((s, i) => {
            const accent = s.neutral
              ? "hsl(217,92%,60%)"
              : s.amber
              ? "hsl(38,92%,56%)"
              : s.good
              ? "hsl(158,68%,46%)"
              : "hsl(0,72%,58%)";

            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="rounded-2xl p-4 glass-card-hover"
                style={{
                  background: `linear-gradient(135deg, ${accent}14, ${accent}06)`,
                  border: `1px solid ${accent}22`,
                  boxShadow: "0 4px 20px hsl(222,40%,4%,0.5)",
                }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: `${accent}15` }}>
                  <s.icon className="w-4 h-4" style={{ color: accent }} />
                </div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "hsl(215,15%,42%)" }}>{s.label}</p>
                <p className="text-xl font-bold font-mono" style={{ color: accent }}>{s.value}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── RECENT TRADES or EMPTY STATE ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(215,15%,32%)" }}>
            {trades.length > 0 ? "Recent Trades" : "Start here"}
          </h2>
          {recentTrades.length > 0 && (
            <Link to="/journal" className="text-xs font-semibold transition-all hover:opacity-80" style={{ color: "hsl(217,92%,65%)" }}>
              View all →
            </Link>
          )}
        </div>

        {trades.length === 0 ? (
          <NewUserEmptyState />
        ) : (
          <div className="space-y-2">
            {recentTrades.map((trade, i) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="rounded-2xl p-4 flex items-center justify-between glass-card-hover"
                style={{
                  background: "hsl(222,22%,10%)",
                  border: "1px solid hsl(222,18%,15%)",
                  boxShadow: "0 2px 12px hsl(222,40%,4%,0.5)",
                }}
              >
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
                      {trade.strategy} · {trade.emotion}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono text-sm" style={{ color: trade.pnl >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)" }}>
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </p>
                  <p className="text-[11px] font-mono" style={{ color: "hsl(215,15%,38%)" }}>
                    {trade.pips > 0 ? "+" : ""}{trade.pips} pips
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Quick log CTA below trades */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/log"
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
                style={{
                  background: "hsl(217,92%,60%,0.08)",
                  border: "1px dashed hsl(217,92%,60%,0.3)",
                  color: "hsl(217,92%,65%)",
                }}
              >
                <Plus className="w-4 h-4" /> Log a trade
              </Link>
            </motion.div>
          </div>
        )}
      </div>

      <div className="h-6" />
    </div>
  );
}
