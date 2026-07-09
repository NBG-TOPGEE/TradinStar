import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Cog, User, DollarSign, TrendingUp, Bell, Brain, Shield,
  Save, AlertTriangle, Trash2, KeyRound, Mail, LogOut, CircleDot, Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ── Constants ─────────────────────────────────────────────────────────────
const TIMEZONES = [
  "UTC","America/New_York","America/Chicago","America/Denver","America/Los_Angeles",
  "Europe/London","Europe/Paris","Europe/Berlin","Asia/Dubai","Asia/Tokyo",
  "Asia/Singapore","Asia/Hong_Kong","Australia/Sydney","Africa/Lagos","Africa/Johannesburg",
];
const CURRENCIES = ["USD","EUR","GBP","JPY","CAD","AUD","CHF","NGN","ZAR"];
const LEVERAGES  = [1,10,20,50,100,200,500];
const MARKETS    = ["Forex","Crypto","Stocks","Indices","Commodities","Futures"];
const SESSIONS   = ["Asian","London","New York","London/NY Overlap"];
const STRATEGIES = [
  "Smart Money Concepts","ICT","Supply & Demand","Support & Resistance",
  "Price Action","Breakout","Trend Following","Fibonacci","Elliott Wave",
  "VWAP","Order Flow","Scalp","Reversal","News","Custom",
];
const ASSETS = [
  "EUR/USD","GBP/USD","USD/JPY","AUD/USD","USD/CAD","GBP/JPY","EUR/GBP",
  "XAU/USD","XAG/USD","BTC/USD","ETH/USD","NAS100","US30","SPX500","GER40",
];
const GOALS = [
  "Become consistent","Pass a funded challenge","Improve discipline",
  "Reduce emotional trading","Improve psychology","Increase profitability",
  "Build a trading system","Trade full-time",
];
const STYLES_MAP = [
  { val: "scalping", label: "Scalper" },
  { val: "day_trading", label: "Day Trader" },
  { val: "swing_trading", label: "Swing Trader" },
  { val: "position_trading", label: "Position Trader" },
];
const EXPERIENCE_OPTS = [
  { val: "beginner", label: "Beginner" },
  { val: "intermediate", label: "Intermediate" },
  { val: "advanced", label: "Advanced" },
];
const AI_STYLES = ["Strict","Balanced","Encouraging"];
const AI_FOCUS  = ["Risk Management","Psychology","Strategy","Consistency","All"];

type Section = "profile" | "trader" | "account" | "ai" | "notifications" | "security";
const NAV: { id: Section; label: string; icon: any }[] = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "trader",        label: "Trader DNA",    icon: CircleDot },
  { id: "account",       label: "Account",       icon: DollarSign },
  { id: "ai",            label: "AI Coach",      icon: Brain },
  { id: "notifications", label: "Alerts",        icon: Bell },
  { id: "security",      label: "Security",      icon: Shield },
];

// Branding footer for profile page
const VybeCredit = () => (
  <div className="text-center py-4 mt-2">
    <p className="text-[10px] tracking-widest" style={{ color: "hsl(215,15%,22%)" }}>
      BUILT BY <span className="font-bold" style={{ color: "hsl(215,15%,28%)" }}>VERTODEA</span>
    </p>
  </div>
);

// ── Shared input styles ───────────────────────────────────────────────────
const INPUT: React.CSSProperties = {
  width: "100%",
  background: "hsl(222,22%,11%)",
  border: "1px solid hsl(222,18%,18%)",
  borderRadius: "0.875rem",
  color: "hsl(210,30%,88%)",
  fontSize: "0.875rem",
  padding: "0.75rem 1rem",
  outline: "none",
};
const SELECT: React.CSSProperties = { ...INPUT };
const LABEL: React.CSSProperties = {
  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "hsl(215,15%,35%)",
  marginBottom: "0.5rem", display: "block",
};

// ── Reusable chips ────────────────────────────────────────────────────────
function Chip({ label, active, onClick, accent = "hsl(217,92%,60%)" }: {
  label: string; active: boolean; onClick: () => void; accent?: string;
}) {
  return (
    <button onClick={onClick}
      className="px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
      style={active ? {
        background: `${accent}18`, border: `1.5px solid ${accent}`, color: accent,
      } : {
        background: "hsl(222,22%,12%)", border: "1px solid hsl(222,18%,17%)", color: "hsl(215,15%,45%)"
      }}>
      {active && <Check className="inline w-2.5 h-2.5 mr-1 -mt-0.5" />}{label}
    </button>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────
function Toggle({ val, onChange, label, desc }: {
  val: boolean; onChange: (v: boolean) => void; label: string; desc: string;
}) {
  return (
    <div className="flex items-center justify-between py-3.5" style={{ borderBottom: "1px solid hsl(222,18%,14%)" }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: "hsl(210,25%,78%)" }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "hsl(215,15%,38%)" }}>{desc}</p>
      </div>
      <button onClick={() => onChange(!val)}
        className="relative w-11 h-6 rounded-full transition-all shrink-0 ml-4"
        style={{ background: val ? "hsl(217,92%,60%)" : "hsl(222,20%,20%)" }}>
        <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
          style={{ left: val ? "1.375rem" : "0.125rem" }} />
      </button>
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────
function SCard({ title, icon: Icon, accent = "hsl(217,92%,60%)", children }: {
  title: string; icon: any; accent?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl overflow-hidden mb-4" style={{
      background: "hsl(222,22%,10%)", border: "1px solid hsl(222,18%,15%)",
      boxShadow: "0 4px 20px hsl(222,40%,4%,0.5)"
    }}>
      <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid hsl(222,18%,14%)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}15`, border: `1px solid ${accent}20` }}>
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
        <p className="font-bold text-sm" style={{ color: "hsl(210,25%,80%)" }}>{title}</p>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Settings
// ─────────────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, signOut, refreshProfile, traderProfile } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState<Section>("profile");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone]       = useState("UTC");
  const [country, setCountry]         = useState("");

  // Account fields
  const [accountBalance,    setAccountBalance]    = useState("10000");
  const [accountCurrency,   setAccountCurrency]   = useState("USD");
  const [defaultRisk,       setDefaultRisk]       = useState("1");
  const [defaultLotSize,    setDefaultLotSize]    = useState("0.01");
  const [maxDailyLoss,      setMaxDailyLoss]      = useState("0");
  const [maxDrawdown,       setMaxDrawdown]       = useState("0");
  const [leverage,          setLeverage]          = useState("100");

  // Trader DNA fields (trader_profiles table)
  const [experience,       setExperience]       = useState("");
  const [tradingStyle,     setTradingStyle]     = useState("");
  const [markets,          setMarkets]          = useState<string[]>([]);
  const [strategies,       setStrategies]       = useState<string[]>([]);
  const [favAssets,        setFavAssets]        = useState<string[]>([]);
  const [tradingSessions,  setTradingSessions]  = useState<string[]>([]);
  const [riskPerTrade,     setRiskPerTrade]     = useState(1);
  const [preferredRR,      setPreferredRR]      = useState(2);
  const [maxTradesPerDay,  setMaxTradesPerDay]  = useState(3);
  const [profileGoals,     setProfileGoals]     = useState<string[]>([]);

  // AI fields
  const [aiCoachingStyle, setAiCoachingStyle] = useState("Balanced");
  const [aiFocusAreas,    setAiFocusAreas]    = useState<string[]>(["All"]);

  // Notification fields
  const [notifDailyLoss,     setNotifDailyLoss]     = useState(true);
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(true);
  const [notifDrawdownWarn,  setNotifDrawdownWarn]  = useState(true);

  // Security fields
  const [newEmail,       setNewEmail]       = useState("");
  const [newPassword,    setNewPassword]    = useState("");
  const [confirmPw,      setConfirmPw]      = useState("");
  const [deleteConfirm,  setDeleteConfirm]  = useState("");

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: p }, { data: tp }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("trader_profiles" as any).select("*").eq("id", user.id).maybeSingle(),
      ]);
      if (p) {
        setDisplayName(p.display_name || user.user_metadata?.display_name || "");
        setTimezone(p.timezone || "UTC");
        setCountry(p.country || "");
        setAccountBalance(String(p.account_balance || "10000"));
        setAccountCurrency(p.account_currency || "USD");
        setDefaultRisk(String(p.default_risk_percent || "1"));
        setDefaultLotSize(String(p.default_position_size || "0.01"));
        setMaxDailyLoss(String(p.max_daily_loss || "0"));
        setMaxDrawdown(String(p.max_drawdown || "0"));
        setLeverage(String(p.leverage || "100"));
        setAiCoachingStyle(p.ai_coaching_style || "Balanced");
        setAiFocusAreas(p.ai_focus_areas || ["All"]);
        setNotifDailyLoss(p.notif_daily_loss ?? true);
        setNotifWeeklySummary(p.notif_weekly_summary ?? true);
        setNotifDrawdownWarn(p.notif_drawdown_warn ?? true);
      } else {
        setDisplayName(user.user_metadata?.display_name || "");
      }
      if (tp) {
        setExperience(tp.experience || "");
        setTradingStyle(tp.trading_style || "");
        setMarkets(tp.markets || []);
        setStrategies(tp.strategies || []);
        setFavAssets(tp.favorite_assets || []);
        setTradingSessions(tp.trading_sessions || []);
        setRiskPerTrade(Number(tp.risk_per_trade) || 1);
        setPreferredRR(Number(tp.preferred_rr) || 2);
        setMaxTradesPerDay(Number(tp.max_trades_per_day) || 3);
        setProfileGoals(tp.goals || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const [pr, tp] = await Promise.all([
      supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName, timezone, country,
        account_balance: parseFloat(accountBalance) || 0,
        account_currency: accountCurrency,
        default_risk_percent: parseFloat(defaultRisk) || 1,
        default_position_size: parseFloat(defaultLotSize) || 0.01,
        max_daily_loss: parseFloat(maxDailyLoss) || 0,
        max_drawdown: parseFloat(maxDrawdown) || 0,
        leverage: parseInt(leverage) || 100,
        ai_coaching_style: aiCoachingStyle,
        ai_focus_areas: aiFocusAreas,
        notif_daily_loss: notifDailyLoss,
        notif_weekly_summary: notifWeeklySummary,
        notif_drawdown_warn: notifDrawdownWarn,
      }),
      supabase.from("trader_profiles" as any).upsert({
        id: user.id,
        experience, trading_style: tradingStyle,
        markets, strategies,
        favorite_assets: favAssets,
        trading_sessions: tradingSessions,
        risk_per_trade: riskPerTrade,
        preferred_rr: preferredRR,
        max_trades_per_day: maxTradesPerDay,
        goals: profileGoals,
        onboarding_completed: true,
      }),
    ]);
    await supabase.auth.updateUser({ data: { display_name: displayName } });
    await refreshProfile();
    setSaving(false);
    if (pr.error || tp.error) toast.error("Save failed — check console");
    else toast.success("Settings saved!");
  };

  const SBtn = ({ label, active: a, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
      style={a ? {
        background: "hsl(217,92%,60%,0.12)", border: "1px solid hsl(217,92%,60%,0.25)",
        color: "hsl(217,92%,65%)"
      } : {
        background: "hsl(222,22%,12%)", border: "1px solid hsl(222,18%,17%)",
        color: "hsl(215,15%,45%)"
      }}>
      {label}
      {a && <Check className="w-3 h-3" />}
    </button>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "hsl(222,20%,20%)", borderTopColor: "hsl(217,92%,60%)" }} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-16">
      {/* ── PROFILE HEADER ── */}
      <div className="rounded-2xl p-5 mb-5" style={{
        background: "linear-gradient(135deg, hsl(217,92%,60%,0.07), hsl(222,70%,45%,0.04))",
        border: "1px solid hsl(217,92%,60%,0.14)",
      }}>
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
              boxShadow: "0 4px 16px hsl(217,92%,60%,0.4)",
              color: "white",
            }}>
            {(displayName?.[0] ?? user?.email?.[0] ?? "T").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate" style={{ color: "hsl(210,30%,92%)" }}>
              {displayName || "Trader"}
            </p>
            <p className="text-xs truncate" style={{ color: "hsl(215,15%,40%)" }}>{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
                style={{ background: "hsl(217,92%,60%,0.12)", color: "hsl(217,92%,65%)", border: "1px solid hsl(217,92%,60%,0.2)" }}>
                Free Plan
              </span>
              {traderProfile?.experience && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                  style={{ background: "hsl(222,20%,15%)", color: "hsl(215,15%,50%)", border: "1px solid hsl(222,18%,20%)" }}>
                  {traderProfile.experience}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick DNA summary */}
        {traderProfile?.experience && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Style", value: ({"scalping":"Scalper","day_trading":"Day Trader","swing_trading":"Swing","position_trading":"Position"} as any)[traderProfile.trading_style] ?? "—" },
              { label: "Strategy", value: traderProfile.strategies?.[0]?.split(" ")[0] ?? "—" },
              { label: "Risk", value: traderProfile.risk_per_trade ? `${traderProfile.risk_per_trade}%` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-2.5 text-center" style={{
                background: "hsl(222,22%,11%)", border: "1px solid hsl(222,18%,16%)"
              }}>
                <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: "hsl(215,15%,35%)" }}>{label}</p>
                <p className="text-xs font-bold" style={{ color: "hsl(210,25%,78%)" }}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nav tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6 scrollbar-none">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActive(id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
            style={active === id ? {
              background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
              color: "white", boxShadow: "0 3px 10px hsl(217,92%,60%,0.3)",
              border: "1px solid transparent"
            } : {
              background: "hsl(222,22%,12%)", border: "1px solid hsl(222,18%,17%)",
              color: "hsl(215,15%,48%)"
            }}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── PROFILE ── */}
      {active === "profile" && (
        <SCard title="Profile" icon={User}>
          <div>
            <label style={LABEL}>Display Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="Your trading name" style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>Timezone</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)} style={SELECT}>
              {TIMEZONES.map(tz => <option key={tz} style={{ background: "hsl(222,22%,10%)" }}>{tz.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL}>Country</label>
            <input value={country} onChange={e => setCountry(e.target.value)}
              placeholder="e.g. Nigeria, UK, USA" style={INPUT} />
          </div>
        </SCard>
      )}

      {/* ── TRADER DNA ── */}
      {active === "trader" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* ── DNA Summary (from onboarding) ── */}
          {traderProfile?.experience && (
            <div className="rounded-2xl p-5 mb-4" style={{
              background: "linear-gradient(135deg, hsl(217,92%,60%,0.07), hsl(222,70%,45%,0.04))",
              border: "1px solid hsl(217,92%,60%,0.14)",
              boxShadow: "0 4px 24px hsl(222,40%,4%,0.4)",
            }}>
              <div className="flex items-center gap-2 mb-4">
                <CircleDot className="w-4 h-4" style={{ color: "hsl(217,92%,60%)" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(217,92%,60%)" }}>
                  Trader DNA
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Experience", value: traderProfile.experience?.charAt(0).toUpperCase() + traderProfile.experience?.slice(1) },
                  { label: "Style",      value: ({"scalping":"Scalper","day_trading":"Day Trader","swing_trading":"Swing Trader","position_trading":"Position Trader"} as any)[traderProfile.trading_style] ?? traderProfile.trading_style },
                  { label: "Strategy",   value: traderProfile.strategies?.[0] ?? "—" },
                  { label: "Risk / RR",  value: traderProfile.risk_per_trade ? `${traderProfile.risk_per_trade}% / 1:${traderProfile.preferred_rr}` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1.5"
                    style={{ borderBottom: "1px solid hsl(222,18%,14%)" }}>
                    <span className="text-xs" style={{ color: "hsl(215,15%,38%)" }}>{label}</span>
                    <span className="text-xs font-semibold" style={{ color: "hsl(210,25%,75%)" }}>{value}</span>
                  </div>
                ))}
              </div>
              {traderProfile.goals?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {traderProfile.goals.slice(0, 4).map((g: string) => (
                    <span key={g} className="text-[10px] px-2 py-0.5 rounded-lg font-medium" style={{
                      background: "hsl(217,92%,60%,0.1)",
                      color: "hsl(217,92%,65%)",
                      border: "1px solid hsl(217,92%,60%,0.18)"
                    }}>{g}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <SCard title="Trader DNA" icon={CircleDot} accent="hsl(217,92%,60%)">
            <div>
              <label style={LABEL}>Experience Level</label>
              <div className="flex gap-2">
                {EXPERIENCE_OPTS.map(e => (
                  <SBtn key={e.val} label={e.label} active={experience === e.val} onClick={() => setExperience(e.val)} />
                ))}
              </div>
            </div>
            <div>
              <label style={LABEL}>Trading Style</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES_MAP.map(s => (
                  <SBtn key={s.val} label={s.label} active={tradingStyle === s.val} onClick={() => setTradingStyle(s.val)} />
                ))}
              </div>
            </div>
            <div>
              <label style={LABEL}>Markets</label>
              <div className="flex flex-wrap gap-2">
                {MARKETS.map(m => (
                  <Chip key={m} label={m} active={markets.includes(m)} onClick={() => toggleArr(markets, m, setMarkets)} />
                ))}
              </div>
            </div>
            <div>
              <label style={LABEL}>Strategies</label>
              <div className="flex flex-wrap gap-2">
                {STRATEGIES.map(s => (
                  <Chip key={s} label={s} active={strategies.includes(s)} onClick={() => toggleArr(strategies, s, setStrategies)} />
                ))}
              </div>
            </div>
            <div>
              <label style={LABEL}>Favourite Assets</label>
              <div className="flex flex-wrap gap-2">
                {ASSETS.map(a => (
                  <Chip key={a} label={a} active={favAssets.includes(a)} onClick={() => toggleArr(favAssets, a, setFavAssets)} accent="hsl(158,68%,46%)" />
                ))}
              </div>
            </div>
            <div>
              <label style={LABEL}>Trading Sessions</label>
              <div className="flex flex-wrap gap-2">
                {SESSIONS.map(s => (
                  <Chip key={s} label={s} active={tradingSessions.includes(s)} onClick={() => toggleArr(tradingSessions, s, setTradingSessions)} accent="hsl(280,65%,62%)" />
                ))}
              </div>
            </div>
            <div>
              <label style={LABEL}>Goals</label>
              <div className="flex flex-wrap gap-2">
                {GOALS.map(g => (
                  <Chip key={g} label={g} active={profileGoals.includes(g)} onClick={() => toggleArr(profileGoals, g, setProfileGoals)} accent="hsl(38,92%,56%)" />
                ))}
              </div>
            </div>
          </SCard>

          <SCard title="Risk Profile" icon={TrendingUp} accent="hsl(38,92%,56%)">
            {[
              { label: "Risk per trade (%)", val: riskPerTrade, set: setRiskPerTrade, min: 0.25, max: 10, step: 0.25, suffix: "%" },
              { label: "Preferred RR", val: preferredRR, set: setPreferredRR, min: 1, max: 10, step: 0.5, suffix: ":1" },
              { label: "Max trades per day", val: maxTradesPerDay, set: setMaxTradesPerDay, min: 1, max: 20, step: 1, suffix: "" },
            ].map(({ label, val, set, min, max, step, suffix }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <label style={{ ...LABEL, marginBottom: 0 }}>{label}</label>
                  <span className="text-sm font-bold font-mono" style={{ color: "hsl(38,92%,62%)" }}>{val}{suffix}</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={val}
                  onChange={e => set(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, hsl(38,92%,56%) 0%, hsl(38,92%,56%) ${((val - min) / (max - min)) * 100}%, hsl(222,20%,18%) ${((val - min) / (max - min)) * 100}%, hsl(222,20%,18%) 100%)` }}
                />
              </div>
            ))}
          </SCard>
        </motion.div>
      )}

      {/* ── ACCOUNT ── */}
      {active === "account" && (
        <SCard title="Account & Risk" icon={DollarSign} accent="hsl(158,68%,46%)">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={LABEL}>Balance</label>
              <input type="number" value={accountBalance} onChange={e => setAccountBalance(e.target.value)} style={INPUT} placeholder="10000" />
            </div>
            <div>
              <label style={LABEL}>Currency</label>
              <select value={accountCurrency} onChange={e => setAccountCurrency(e.target.value)} style={SELECT}>
                {CURRENCIES.map(c => <option key={c} style={{ background: "hsl(222,22%,10%)" }}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={LABEL}>Default Risk %</label>
              <input type="number" step="0.1" value={defaultRisk} onChange={e => setDefaultRisk(e.target.value)} style={INPUT} placeholder="1" />
            </div>
            <div>
              <label style={LABEL}>Default Lot Size</label>
              <input type="number" step="0.01" value={defaultLotSize} onChange={e => setDefaultLotSize(e.target.value)} style={INPUT} placeholder="0.01" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={LABEL}>Max Daily Loss ($)</label>
              <input type="number" value={maxDailyLoss} onChange={e => setMaxDailyLoss(e.target.value)} style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Max Drawdown ($)</label>
              <input type="number" value={maxDrawdown} onChange={e => setMaxDrawdown(e.target.value)} style={INPUT} />
            </div>
          </div>
          <div>
            <label style={LABEL}>Leverage</label>
            <div className="flex flex-wrap gap-2">
              {LEVERAGES.map(l => (
                <Chip key={l} label={`1:${l}`} active={leverage === String(l)} onClick={() => setLeverage(String(l))} />
              ))}
            </div>
          </div>
        </SCard>
      )}

      {/* ── AI COACH ── */}
      {active === "ai" && (
        <SCard title="AI Coach Preferences" icon={Brain} accent="hsl(280,65%,62%)">
          <div>
            <label style={LABEL}>Coaching Style</label>
            <div className="grid grid-cols-3 gap-2">
              {AI_STYLES.map(s => (
                <button key={s} onClick={() => setAiCoachingStyle(s)}
                  className="py-3 rounded-xl text-xs font-bold transition-all"
                  style={aiCoachingStyle === s ? {
                    background: "hsl(280,65%,62%,0.15)", border: "1.5px solid hsl(280,65%,62%)",
                    color: "hsl(280,65%,72%)"
                  } : {
                    background: "hsl(222,22%,12%)", border: "1px solid hsl(222,18%,17%)",
                    color: "hsl(215,15%,45%)"
                  }}>
                  {s}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { s: "Strict", d: "Direct & blunt. No sugar-coating." },
                { s: "Balanced", d: "Honest mix of praise and critique." },
                { s: "Encouraging", d: "Positive reinforcement focused." },
              ].map(({ s, d }) => (
                <div key={s} className="p-3 rounded-xl text-[10px] leading-relaxed" style={{
                  background: aiCoachingStyle === s ? "hsl(280,65%,62%,0.06)" : "hsl(222,20%,12%)",
                  border: `1px solid ${aiCoachingStyle === s ? "hsl(280,65%,62%,0.18)" : "hsl(222,18%,15%)"}`,
                  color: "hsl(215,15%,42%)"
                }}>
                  <p className="font-bold mb-0.5" style={{ color: "hsl(210,20%,65%)" }}>{s}</p>
                  {d}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label style={LABEL}>Focus Areas</label>
            <div className="flex flex-wrap gap-2">
              {AI_FOCUS.map(f => (
                <Chip key={f} label={f} active={aiFocusAreas.includes(f)}
                  onClick={() => toggleArr(aiFocusAreas, f, setAiFocusAreas)} accent="hsl(280,65%,62%)" />
              ))}
            </div>
          </div>
        </SCard>
      )}

      {/* ── NOTIFICATIONS ── */}
      {active === "notifications" && (
        <SCard title="Alerts & Notifications" icon={Bell} accent="hsl(38,92%,56%)">
          <Toggle val={notifDailyLoss} onChange={setNotifDailyLoss}
            label="Daily Loss Limit Alert"
            desc="Warn me when I approach my max daily loss" />
          <Toggle val={notifWeeklySummary} onChange={setNotifWeeklySummary}
            label="Weekly Performance Summary"
            desc="Summary of your trading week every Monday" />
          <Toggle val={notifDrawdownWarn} onChange={setNotifDrawdownWarn}
            label="Drawdown Warning"
            desc="Alert when drawdown exceeds your set threshold" />
        </SCard>
      )}

      {/* ── SECURITY ── */}
      {active === "security" && (
        <>
          <SCard title="Change Email" icon={Mail} accent="hsl(217,92%,60%)">
            <p className="text-xs" style={{ color: "hsl(215,15%,40%)" }}>
              Current: <span style={{ color: "hsl(210,25%,70%)" }}>{user?.email}</span>
            </p>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
              placeholder="New email address" style={INPUT} />
            <button onClick={async () => {
              if (!newEmail) return toast.error("Enter a new email");
              const { error } = await supabase.auth.updateUser({ email: newEmail });
              if (error) toast.error(error.message);
              else { toast.success("Confirmation sent"); setNewEmail(""); }
            }} className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))" }}>
              <Mail className="w-4 h-4" /> Update Email
            </button>
          </SCard>

          <SCard title="Change Password" icon={KeyRound} accent="hsl(217,92%,60%)">
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="New password (min 6 chars)" style={INPUT} />
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              placeholder="Confirm new password" style={{ ...INPUT, marginTop: "0.5rem" }} />
            <button onClick={async () => {
              if (!newPassword) return toast.error("Enter a new password");
              if (newPassword !== confirmPw) return toast.error("Passwords don't match");
              if (newPassword.length < 6) return toast.error("Min 6 characters");
              const { error } = await supabase.auth.updateUser({ password: newPassword });
              if (error) toast.error(error.message);
              else { toast.success("Password updated!"); setNewPassword(""); setConfirmPw(""); }
            }} className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))" }}>
              <KeyRound className="w-4 h-4" /> Update Password
            </button>
          </SCard>

          <SCard title="Sign Out" icon={LogOut} accent="hsl(215,15%,45%)">
            <p className="text-xs" style={{ color: "hsl(215,15%,40%)" }}>Sign out of TradinStar on this device.</p>
            <button onClick={async () => { await signOut(); navigate("/auth"); }}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{ background: "hsl(222,20%,14%)", border: "1px solid hsl(222,18%,20%)", color: "hsl(215,15%,55%)" }}>
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </SCard>

          <div className="rounded-2xl overflow-hidden" style={{
            background: "hsl(0,72%,58%,0.05)", border: "1px solid hsl(0,72%,58%,0.2)",
            boxShadow: "0 4px 20px hsl(222,40%,4%,0.5)"
          }}>
            <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid hsl(0,72%,58%,0.15)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(0,72%,58%,0.12)" }}>
                <AlertTriangle className="w-4 h-4" style={{ color: "hsl(0,72%,65%)" }} />
              </div>
              <p className="font-bold text-sm" style={{ color: "hsl(0,72%,65%)" }}>Danger Zone</p>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: "hsl(215,15%,42%)" }}>
                Deleting your account is permanent. All trades, journal entries, and data will be erased and cannot be recovered.
              </p>
              <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                placeholder='Type "DELETE" to confirm' style={{ ...INPUT, borderColor: "hsl(0,72%,58%,0.3)" }} />
              <button onClick={() => {
                if (deleteConfirm !== "DELETE") return toast.error('Type "DELETE" to confirm');
                toast.error("Contact support@tradinstar.com to delete your account.");
                setDeleteConfirm("");
              }} className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ background: "hsl(0,72%,52%)" }}>
                <Trash2 className="w-4 h-4" /> Delete My Account
              </button>
            </div>
          </div>
        </>
      )}

      {/* Save button */}
      {active !== "security" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={handleSave} disabled={saving}
            className="w-full text-white rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
            style={{
              background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,40%))",
              boxShadow: "0 6px 24px hsl(217,92%,60%,0.35)",
            }}>
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </motion.div>
      )}

      <VybeCredit />
    </div>
  );
}
