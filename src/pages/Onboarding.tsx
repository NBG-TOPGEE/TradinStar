import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronLeft, Check, Zap, BookOpen,
  BarChart3, Brain, Target, Clock, TrendingUp
} from "lucide-react";
import navbarLogo from "@/assets/images/navbar-logo.png";

// ── Types ─────────────────────────────────────────────────────────────────
interface TraderProfile {
  experience: string;
  trading_style: string;
  markets: string[];
  strategies: string[];
  favorite_assets: string[];
  trading_sessions: string[];
  platform: string;
  broker: string;
  risk_per_trade: number;
  preferred_rr: number;
  max_trades_per_day: number;
  max_daily_loss: number;
  goals: string[];
}

const DEFAULTS: TraderProfile = {
  experience: "",
  trading_style: "",
  markets: [],
  strategies: [],
  favorite_assets: [],
  trading_sessions: [],
  platform: "",
  broker: "",
  risk_per_trade: 1,
  preferred_rr: 2,
  max_trades_per_day: 3,
  max_daily_loss: 5,
  goals: [],
};

const DRAFT_KEY = "tradinstar_onboarding_draft";

interface Draft {
  step: number;
  profile: TraderProfile;
}

function saveDraft(step: number, profile: TraderProfile) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, profile }));
  } catch {}
}

function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Draft;
  } catch { return null; }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

// ── Chip selector ─────────────────────────────────────────────────────────
function Chip({
  label, selected, onClick, accent = "hsl(217,92%,60%)"
}: { label: string; selected: boolean; onClick: () => void; accent?: string }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 select-none"
      style={selected ? {
        background: `${accent}20`,
        border: `1.5px solid ${accent}`,
        color: accent,
        boxShadow: `0 0 16px ${accent}20`
      } : {
        background: "hsl(222,22%,12%)",
        border: "1px solid hsl(222,18%,18%)",
        color: "hsl(215,15%,52%)"
      }}
    >
      {selected && <Check className="inline w-3 h-3 mr-1.5 -mt-0.5" />}
      {label}
    </button>
  );
}

// ── Single-select card ────────────────────────────────────────────────────
function OptionCard({
  label, desc, icon: Icon, selected, onClick, accent = "hsl(217,92%,60%)"
}: {
  label: string; desc?: string; icon?: any;
  selected: boolean; onClick: () => void; accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-2xl transition-all active:scale-[0.98] flex items-start gap-4"
      style={selected ? {
        background: `${accent}12`,
        border: `1.5px solid ${accent}`,
        boxShadow: `0 0 20px ${accent}15`
      } : {
        background: "hsl(222,22%,11%)",
        border: "1px solid hsl(222,18%,17%)"
      }}
    >
      {Icon && (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{
          background: selected ? `${accent}20` : "hsl(222,20%,15%)",
          border: `1px solid ${selected ? accent + "40" : "hsl(222,18%,20%)"}`
        }}>
          <Icon className="w-4 h-4" style={{ color: selected ? accent : "hsl(215,15%,42%)" }} />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: selected ? "hsl(210,30%,92%)" : "hsl(210,20%,70%)" }}>{label}</p>
        {desc && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "hsl(215,15%,42%)" }}>{desc}</p>}
      </div>
      {selected && (
        <div className="ml-auto shrink-0">
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: accent }}>
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
    </button>
  );
}

// ── Number input ──────────────────────────────────────────────────────────
function NumberInput({
  label, value, onChange, min, max, step = 0.5, suffix = ""
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; suffix?: string;
}) {
  return (
    <div className="rounded-2xl p-5" style={{
      background: "hsl(222,22%,11%)",
      border: "1px solid hsl(222,18%,17%)"
    }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ color: "hsl(210,20%,75%)" }}>{label}</p>
        <span className="text-lg font-bold font-mono" style={{ color: "hsl(217,92%,65%)" }}>
          {value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, hsl(217,92%,60%) 0%, hsl(217,92%,60%) ${((value - min) / (max - min)) * 100}%, hsl(222,20%,18%) ${((value - min) / (max - min)) * 100}%, hsl(222,20%,18%) 100%)`
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: "hsl(215,15%,35%)" }}>{min}{suffix}</span>
        <span className="text-xs" style={{ color: "hsl(215,15%,35%)" }}>{max}{suffix}</span>
      </div>
    </div>
  );
}

// ── Step config ───────────────────────────────────────────────────────────
const STEPS = [
  "Experience", "Style", "Markets", "Strategy",
  "Assets & Sessions", "Risk Profile", "Goals",
];

const STEP_TITLES = [
  { title: "What's your experience level?", sub: "Be honest — this shapes how your AI coach talks to you." },
  { title: "How do you trade?", sub: "Your style determines which analytics matter most." },
  { title: "What markets do you trade?", sub: "You can always add more later." },
  { title: "What strategies do you use?", sub: "Select every approach you apply regularly." },
  { title: "Your assets, sessions & platform", sub: "This builds the core of your Trader DNA." },
  { title: "Define your risk profile", sub: "These limits will be used by the AI Coach and Risk Calculator." },
  { title: "What are your trading goals?", sub: "Your AI Coach will track progress toward these targets." },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Onboarding component
// ─────────────────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [dir, setDir] = useState(1);

  // ── Restore draft on mount ───────────────────────────────────────────
  const draft = loadDraft();
  const [step, setStep] = useState(draft?.step ?? 0);
  const [profile, setProfile] = useState<TraderProfile>(draft?.profile ?? DEFAULTS);

  // Persist draft whenever step or profile changes
  useEffect(() => {
    saveDraft(step, profile);
  }, [step, profile]);

  const update = <K extends keyof TraderProfile>(key: K, val: TraderProfile[K]) =>
    setProfile(p => ({ ...p, [key]: val }));

  const toggleArr = (key: keyof TraderProfile, val: string) => {
    const arr = profile[key] as string[];
    update(key, (arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]) as any);
  };

  const goNext = () => { setDir(1); setStep(s => s + 1); };
  const goBack = () => { setDir(-1); setStep(s => s - 1); };

  const canAdvance = () => {
    switch (step) {
      case 0: return !!profile.experience;
      case 1: return !!profile.trading_style;
      case 2: return profile.markets.length > 0;
      case 3: return profile.strategies.length > 0;
      case 4: return profile.trading_sessions.length > 0;
      case 5: return true;
      case 6: return profile.goals.length > 0;
      default: return true;
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("trader_profiles" as any)
        .upsert({
          id: user.id,
          ...profile,
          onboarding_completed: true,
          onboarding_step: STEPS.length,
        });
      if (error) throw error;
      clearDraft();
      await refreshProfile();
      toast.success("Your Trader Profile is ready!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save profile");
      setSaving(false);
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-3">
          {[
            { val: "beginner", label: "Beginner", desc: "Less than 1 year of active trading", icon: BookOpen },
            { val: "intermediate", label: "Intermediate", desc: "1–3 years, consistently applying a strategy", icon: TrendingUp },
            { val: "advanced", label: "Advanced", desc: "3+ years, consistently profitable or funded", icon: Zap },
          ].map(o => (
            <OptionCard key={o.val} label={o.label} desc={o.desc} icon={o.icon}
              selected={profile.experience === o.val}
              onClick={() => update("experience", o.val)} />
          ))}
        </div>
      );
      case 1: return (
        <div className="space-y-3">
          {[
            { val: "scalping", label: "Scalper", desc: "In and out in minutes. High frequency, tight targets.", icon: Zap },
            { val: "day_trading", label: "Day Trader", desc: "All trades closed within the session. London or NY open plays.", icon: Clock },
            { val: "swing_trading", label: "Swing Trader", desc: "Hold for hours or days. Bigger moves, smaller frequency.", icon: TrendingUp },
            { val: "position_trading", label: "Position Trader", desc: "Long-term holds. Weekly/monthly charts. Big picture bias.", icon: BarChart3 },
          ].map(o => (
            <OptionCard key={o.val} label={o.label} desc={o.desc} icon={o.icon}
              selected={profile.trading_style === o.val}
              onClick={() => update("trading_style", o.val)} />
          ))}
        </div>
      );
      case 2: return (
        <div>
          <p className="text-xs mb-4" style={{ color: "hsl(215,15%,45%)" }}>Select all that apply</p>
          <div className="flex flex-wrap gap-2.5">
            {["Forex", "Crypto", "Stocks", "Indices", "Commodities", "Futures", "Options"].map(m => (
              <Chip key={m} label={m} selected={profile.markets.includes(m)}
                onClick={() => toggleArr("markets", m)} />
            ))}
          </div>
        </div>
      );
      case 3: return (
        <div>
          <p className="text-xs mb-4" style={{ color: "hsl(215,15%,45%)" }}>Select all strategies you use</p>
          <div className="flex flex-wrap gap-2.5">
            {[
              "Smart Money Concepts", "ICT", "Supply & Demand",
              "Support & Resistance", "Price Action", "Breakout",
              "Trend Following", "Fibonacci", "Elliott Wave",
              "VWAP", "Order Flow", "Custom"
            ].map(s => (
              <Chip key={s} label={s} selected={profile.strategies.includes(s)}
                onClick={() => toggleArr("strategies", s)} />
            ))}
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(215,15%,38%)" }}>
              Favourite assets
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD",
                "GBP/JPY", "EUR/GBP", "XAU/USD", "XAG/USD",
                "BTC/USD", "ETH/USD", "NAS100", "US30", "SPX500", "GER40"
              ].map(a => (
                <Chip key={a} label={a} selected={profile.favorite_assets.includes(a)}
                  onClick={() => toggleArr("favorite_assets", a)}
                  accent="hsl(158,68%,46%)" />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(215,15%,38%)" }}>
              Trading sessions
            </p>
            <div className="flex flex-wrap gap-2.5">
              {[
                { val: "Asian", time: "00:00–08:00 UTC" },
                { val: "London", time: "08:00–17:00 UTC" },
                { val: "New York", time: "13:00–22:00 UTC" },
                { val: "London/NY Overlap", time: "13:00–17:00 UTC" },
              ].map(s => (
                <Chip key={s.val} label={`${s.val} · ${s.time}`}
                  selected={profile.trading_sessions.includes(s.val)}
                  onClick={() => toggleArr("trading_sessions", s.val)}
                  accent="hsl(280,65%,62%)" />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(215,15%,38%)" }}>
              Platform
            </p>
            <div className="flex flex-wrap gap-2.5">
              {["MT4", "MT5", "cTrader", "TradingView", "Other"].map(p => (
                <Chip key={p} label={p} selected={profile.platform === p}
                  onClick={() => update("platform", p)}
                  accent="hsl(38,92%,56%)" />
              ))}
            </div>
          </div>
        </div>
      );
      case 5: return (
        <div className="space-y-4">
          <NumberInput label="Risk per trade" value={profile.risk_per_trade}
            onChange={v => update("risk_per_trade", v)} min={0.25} max={10} step={0.25} suffix="%" />
          <NumberInput label="Preferred Risk:Reward" value={profile.preferred_rr}
            onChange={v => update("preferred_rr", v)} min={1} max={10} step={0.5} suffix=":1" />
          <NumberInput label="Max trades per day" value={profile.max_trades_per_day}
            onChange={v => update("max_trades_per_day", v)} min={1} max={20} step={1} />
          <NumberInput label="Max daily loss" value={profile.max_daily_loss}
            onChange={v => update("max_daily_loss", v)} min={1} max={20} step={0.5} suffix="%" />
        </div>
      );
      case 6: return (
        <div>
          <p className="text-xs mb-4" style={{ color: "hsl(215,15%,45%)" }}>Select all that apply</p>
          <div className="flex flex-wrap gap-2.5">
            {[
              "Become consistent", "Pass a funded challenge", "Improve discipline",
              "Reduce emotional trading", "Improve psychology", "Increase profitability",
              "Build a trading system", "Trade full-time",
            ].map(g => (
              <Chip key={g} label={g} selected={profile.goals.includes(g)}
                onClick={() => toggleArr("goals", g)}
                accent="hsl(158,68%,46%)" />
            ))}
          </div>
        </div>
      );
      default: return null;
    }
  };

  const progress = (step / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col ambient-bg" style={{ fontFamily: "'Sora', sans-serif" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between max-w-lg mx-auto w-full px-5 py-4">
        <span className="nav-brand-logo-frame">
          <img src={navbarLogo} alt="TradinStar" className="nav-brand-logo object-contain" />
        </span>
        <span className="text-xs font-mono" style={{ color: "hsl(215,15%,38%)" }}>
          {step + 1} / {STEPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="max-w-lg mx-auto w-full px-5">
        <div className="h-1 rounded-full" style={{ background: "hsl(222,20%,14%)" }}>
          <div
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, hsl(217,92%,60%), hsl(280,65%,62%))"
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-5 py-8">
        {/* Step header */}
        <div className="mb-8">
          <motion.div
            key={`header-${step}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1" style={{ background: "hsl(222,18%,16%)" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest px-3" style={{ color: "hsl(217,92%,60%)" }}>
                {STEPS[step]}
              </span>
              <div className="h-px flex-1" style={{ background: "hsl(222,18%,16%)" }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "hsl(210,30%,93%)" }}>
              {STEP_TITLES[step].title}
            </h2>
            <p className="text-sm" style={{ color: "hsl(215,15%,48%)" }}>
              {STEP_TITLES[step].sub}
            </p>
          </motion.div>
        </div>

        {/* Step body */}
        <div className="flex-1 overflow-y-auto pb-4">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="pt-5 flex gap-3" style={{ borderTop: "1px solid hsl(222,18%,14%)" }}>
          {step > 0 && (
            <button onClick={goBack}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: "hsl(222,20%,13%)", border: "1px solid hsl(222,18%,18%)", color: "hsl(215,15%,55%)" }}>
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button onClick={goNext} disabled={!canAdvance()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,45%))",
                boxShadow: canAdvance() ? "0 4px 20px hsl(217,92%,60%,0.35)" : "none"
              }}>
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleFinish} disabled={!canAdvance() || saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, hsl(158,68%,46%), hsl(158,60%,38%))",
                boxShadow: "0 4px 20px hsl(158,68%,46%,0.35)"
              }}>
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Check className="w-4 h-4" /> Build my Trader Profile</>
              )}
            </button>
          )}
        </div>

        <p className="text-center text-[9px] tracking-widest mt-4" style={{ color: "hsl(215,15%,25%)" }}>
          BUILT BY <span className="font-bold" style={{ color: "hsl(215,15%,30%)" }}>VERTODEA</span>
        </p>
      </div>
    </div>
  );
}
