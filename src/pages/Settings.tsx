import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Cog, User, DollarSign, TrendingUp, Bell, Brain, Shield,
  Save, ChevronRight, AlertTriangle, Trash2, KeyRound, Mail, LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Dubai", "Asia/Tokyo",
  "Asia/Singapore", "Asia/Hong_Kong", "Australia/Sydney", "Africa/Lagos", "Africa/Johannesburg",
];

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "NGN", "ZAR"];
const SESSIONS   = ["Sydney", "Tokyo", "London", "New York"];
const STRATEGIES = ["Breakout", "Trend", "Scalp", "Reversal", "News", "Support/Resistance"];
const STYLES     = ["Scalper", "Day Trader", "Swing Trader", "Position Trader"];
const MARKETS    = ["Forex", "Crypto", "Stocks", "Indices", "Commodities", "Futures"];
const AI_STYLES  = ["Strict", "Balanced", "Encouraging"];
const AI_FOCUS   = ["Risk Management", "Psychology", "Strategy", "Consistency", "All"];
const PAIRS      = ["EUR/USD","GBP/USD","USD/JPY","AUD/USD","USD/CAD","NZD/USD","XAU/USD","GBP/JPY","EUR/GBP","BTC/USD","ETH/USD","US30","NAS100","SPX500"];
const LEVERAGES  = [1, 10, 20, 50, 100, 200, 500];

type Section = "profile" | "account" | "trading" | "ai" | "notifications" | "security";

const NAV: { id: Section; label: string; icon: any }[] = [
  { id: "profile",       label: "Profile",        icon: User },
  { id: "account",       label: "Account & Risk",  icon: DollarSign },
  { id: "trading",       label: "Trading Prefs",   icon: TrendingUp },
  { id: "ai",            label: "AI Coach",        icon: Brain },
  { id: "notifications", label: "Notifications",   icon: Bell },
  { id: "security",      label: "Security",        icon: Shield },
];

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState<Section>("profile");

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile
  const [displayName,    setDisplayName]    = useState("");
  const [timezone,       setTimezone]       = useState("UTC");
  const [country,        setCountry]        = useState("");

  // Account & Risk
  const [accountBalance,    setAccountBalance]    = useState("10000");
  const [accountCurrency,   setAccountCurrency]   = useState("USD");
  const [defaultRisk,       setDefaultRisk]       = useState("1");
  const [defaultPositionSize, setDefaultPositionSize] = useState("0.01");
  const [maxDailyLoss,      setMaxDailyLoss]      = useState("0");
  const [maxDrawdown,       setMaxDrawdown]       = useState("0");
  const [leverage,          setLeverage]          = useState("100");

  // Trading Preferences
  const [tradingStyle,    setTradingStyle]    = useState("Day Trader");
  const [marketsTraded,   setMarketsTraded]   = useState<string[]>(["Forex"]);
  const [preferredPairs,  setPreferredPairs]  = useState<string[]>([]);
  const [defaultSession,  setDefaultSession]  = useState("London");
  const [defaultStrategy, setDefaultStrategy] = useState("Breakout");

  // AI Coach
  const [aiCoachingStyle, setAiCoachingStyle] = useState("Balanced");
  const [aiFocusAreas,    setAiFocusAreas]    = useState<string[]>(["All"]);

  // Notifications
  const [notifDailyLoss,    setNotifDailyLoss]    = useState(true);
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(true);
  const [notifDrawdownWarn, setNotifDrawdownWarn]  = useState(true);

  // Security
  const [newEmail,       setNewEmail]       = useState("");
  const [newPassword,    setNewPassword]    = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirm,  setDeleteConfirm]  = useState("");

  // Load profile from Supabase
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setDisplayName(data.display_name || user.user_metadata?.display_name || "");
        setTimezone(data.timezone || "UTC");
        setCountry(data.country || "");
        setAccountBalance(String(data.account_balance || "10000"));
        setAccountCurrency(data.account_currency || "USD");
        setDefaultRisk(String(data.default_risk_percent || "1"));
        setDefaultPositionSize(String(data.default_position_size || "0.01"));
        setMaxDailyLoss(String(data.max_daily_loss || "0"));
        setMaxDrawdown(String(data.max_drawdown || "0"));
        setLeverage(String(data.leverage || "100"));
        setTradingStyle(data.trading_style || "Day Trader");
        setMarketsTraded(data.markets_traded || ["Forex"]);
        setPreferredPairs(data.preferred_pairs || []);
        setDefaultSession(data.default_session || "London");
        setDefaultStrategy(data.default_strategy || "Breakout");
        setAiCoachingStyle(data.ai_coaching_style || "Balanced");
        setAiFocusAreas(data.ai_focus_areas || ["All"]);
        setNotifDailyLoss(data.notif_daily_loss ?? true);
        setNotifWeeklySummary(data.notif_weekly_summary ?? true);
        setNotifDrawdownWarn(data.notif_drawdown_warn ?? true);
      } else {
        setDisplayName(user.user_metadata?.display_name || "");
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const profileData = {
      display_name: displayName,
      timezone, country,
      account_balance: parseFloat(accountBalance) || 0,
      account_currency: accountCurrency,
      default_risk_percent: parseFloat(defaultRisk) || 1,
      default_position_size: parseFloat(defaultPositionSize) || 0.01,
      max_daily_loss: parseFloat(maxDailyLoss) || 0,
      max_drawdown: parseFloat(maxDrawdown) || 0,
      leverage: parseInt(leverage) || 100,
      trading_style: tradingStyle,
      markets_traded: marketsTraded,
      preferred_pairs: preferredPairs,
      default_session: defaultSession,
      default_strategy: defaultStrategy,
      ai_coaching_style: aiCoachingStyle,
      ai_focus_areas: aiFocusAreas,
      notif_daily_loss: notifDailyLoss,
      notif_weekly_summary: notifWeeklySummary,
      notif_drawdown_warn: notifDrawdownWarn,
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...profileData });

    // Also sync display_name to auth metadata
    await supabase.auth.updateUser({ data: { display_name: displayName } });

    setSaving(false);
    if (profileError) toast.error(profileError.message);
    else toast.success("Settings saved!");
  };

  const handleChangeEmail = async () => {
    if (!newEmail) return toast.error("Enter a new email");
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) toast.error(error.message);
    else { toast.success("Confirmation sent to new email"); setNewEmail(""); }
  };

  const handleChangePassword = async () => {
    if (!newPassword) return toast.error("Enter a new password");
    if (newPassword !== confirmPassword) return toast.error("Passwords don't match");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success("Password updated!"); setNewPassword(""); setConfirmPassword(""); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return toast.error("Type DELETE to confirm");
    toast.error("Contact support@tradinstar.com to delete your account.");
    setDeleteConfirm("");
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all";
  const selectClass = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 transition-all";
  const labelClass = "text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide";

  const ChipBtn = ({ val, active, onClick }: { val: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${active
        ? "text-white border-transparent"
        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
      style={active ? { background: "hsl(222,60%,20%)" } : {}}>
      {val}
    </button>
  );

  const Toggle = ({ val, onChange, label, desc }: { val: boolean; onChange: (v: boolean) => void; label: string; desc: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <button onClick={() => onChange(!val)}
        className={`relative w-11 h-6 rounded-full transition-all ${val ? "bg-blue-500" : "bg-slate-200"}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${val ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );

  const SectionCard = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.07)" }}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <p className="font-semibold text-slate-800 text-sm">{title}</p>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(222,60%,20%)" }}>
          <Cog className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Settings</h1>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActive(id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${active === id
              ? "text-white"
              : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"}`}
            style={active === id ? { background: "hsl(222,60%,20%)" } : {}}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── PROFILE ── */}
      {active === "profile" && (
        <SectionCard title="Profile" icon={User}>
          <div>
            <label className={labelClass}>Display Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your trading name" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Timezone</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)} className={selectClass}>
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace("_", " ")}</option>)}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">Used to align trade timestamps with your local time</p>
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Nigeria, UK, USA" className={inputClass} />
          </div>
        </SectionCard>
      )}

      {/* ── ACCOUNT & RISK ── */}
      {active === "account" && (
        <SectionCard title="Account & Risk" icon={DollarSign}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Account Balance</label>
              <input type="number" value={accountBalance} onChange={e => setAccountBalance(e.target.value)} placeholder="10000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select value={accountCurrency} onChange={e => setAccountCurrency(e.target.value)} className={selectClass}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Default Risk %</label>
              <input type="number" step="0.1" min="0.1" max="100" value={defaultRisk} onChange={e => setDefaultRisk(e.target.value)} placeholder="1" className={inputClass} />
              <p className="text-[11px] text-slate-400 mt-1">% of balance per trade</p>
            </div>
            <div>
              <label className={labelClass}>Default Lot Size</label>
              <input type="number" step="0.01" min="0.01" value={defaultPositionSize} onChange={e => setDefaultPositionSize(e.target.value)} placeholder="0.01" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Max Daily Loss ($)</label>
              <input type="number" value={maxDailyLoss} onChange={e => setMaxDailyLoss(e.target.value)} placeholder="0" className={inputClass} />
              <p className="text-[11px] text-slate-400 mt-1">Stop trading if hit</p>
            </div>
            <div>
              <label className={labelClass}>Max Drawdown ($)</label>
              <input type="number" value={maxDrawdown} onChange={e => setMaxDrawdown(e.target.value)} placeholder="0" className={inputClass} />
              <p className="text-[11px] text-slate-400 mt-1">Account-level limit</p>
            </div>
          </div>
          <div>
            <label className={labelClass}>Leverage</label>
            <div className="flex gap-2 flex-wrap">
              {LEVERAGES.map(l => (
                <ChipBtn key={l} val={`1:${l}`} active={leverage === String(l)} onClick={() => setLeverage(String(l))} />
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── TRADING PREFERENCES ── */}
      {active === "trading" && (
        <SectionCard title="Trading Preferences" icon={TrendingUp}>
          <div>
            <label className={labelClass}>Trading Style</label>
            <div className="flex gap-2 flex-wrap">
              {STYLES.map(s => (
                <ChipBtn key={s} val={s} active={tradingStyle === s} onClick={() => setTradingStyle(s)} />
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Markets Traded</label>
            <div className="flex gap-2 flex-wrap">
              {MARKETS.map(m => (
                <ChipBtn key={m} val={m} active={marketsTraded.includes(m)} onClick={() => toggleArr(marketsTraded, m, setMarketsTraded)} />
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Preferred Pairs</label>
            <div className="flex gap-2 flex-wrap">
              {PAIRS.map(p => (
                <ChipBtn key={p} val={p} active={preferredPairs.includes(p)} onClick={() => toggleArr(preferredPairs, p, setPreferredPairs)} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Default Session</label>
              <select value={defaultSession} onChange={e => setDefaultSession(e.target.value)} className={selectClass}>
                {SESSIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Default Strategy</label>
              <select value={defaultStrategy} onChange={e => setDefaultStrategy(e.target.value)} className={selectClass}>
                {STRATEGIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── AI COACH ── */}
      {active === "ai" && (
        <SectionCard title="AI Coach" icon={Brain}>
          <div>
            <label className={labelClass}>Coaching Style</label>
            <p className="text-xs text-slate-400 mb-2">How the AI delivers feedback to you</p>
            <div className="flex gap-2 flex-wrap">
              {AI_STYLES.map(s => (
                <ChipBtn key={s} val={s} active={aiCoachingStyle === s} onClick={() => setAiCoachingStyle(s)} />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { style: "Strict", desc: "Direct, no sugar-coating. Focused on fixing mistakes." },
                { style: "Balanced", desc: "Mix of praise and critique. Honest but constructive." },
                { style: "Encouraging", desc: "Positive reinforcement. Motivational tone." },
              ].map(({ style, desc }) => (
                <div key={style} className={`p-3 rounded-xl border text-xs ${aiCoachingStyle === style ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-400"}`}>
                  <p className="font-semibold mb-1">{style}</p>
                  <p className="leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Focus Areas</label>
            <p className="text-xs text-slate-400 mb-2">What should the AI prioritize in its analysis?</p>
            <div className="flex gap-2 flex-wrap">
              {AI_FOCUS.map(f => (
                <ChipBtn key={f} val={f} active={aiFocusAreas.includes(f)} onClick={() => toggleArr(aiFocusAreas, f, setAiFocusAreas)} />
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── NOTIFICATIONS ── */}
      {active === "notifications" && (
        <SectionCard title="Notifications" icon={Bell}>
          <Toggle
            val={notifDailyLoss} onChange={setNotifDailyLoss}
            label="Daily Loss Limit Alert"
            desc="Warn me when I approach my max daily loss"
          />
          <Toggle
            val={notifWeeklySummary} onChange={setNotifWeeklySummary}
            label="Weekly Performance Summary"
            desc="Receive a summary of your trading week every Monday"
          />
          <Toggle
            val={notifDrawdownWarn} onChange={setNotifDrawdownWarn}
            label="Drawdown Warning"
            desc="Alert me when drawdown exceeds my set threshold"
          />
        </SectionCard>
      )}

      {/* ── SECURITY ── */}
      {active === "security" && (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.07)" }}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-slate-500" />
              </div>
              <p className="font-semibold text-slate-800 text-sm">Change Email</p>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-400">Current: <span className="text-slate-600 font-medium">{user?.email}</span></p>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New email address" className={inputClass} />
              <button onClick={handleChangeEmail}
                className="w-full text-white rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: "hsl(222,60%,20%)" }}>
                <Mail className="w-4 h-4" /> Update Email
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.07)" }}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-slate-500" />
              </div>
              <p className="font-semibold text-slate-800 text-sm">Change Password</p>
            </div>
            <div className="p-5 space-y-3">
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" className={inputClass} />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className={inputClass} />
              <button onClick={handleChangePassword}
                className="w-full text-white rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: "hsl(222,60%,20%)" }}>
                <KeyRound className="w-4 h-4" /> Update Password
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.07)" }}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <LogOut className="w-4 h-4 text-slate-500" />
              </div>
              <p className="font-semibold text-slate-800 text-sm">Sign Out</p>
            </div>
            <div className="p-5">
              <p className="text-xs text-slate-400 mb-3">Sign out of your TradinStar account on this device.</p>
              <button onClick={handleLogout}
                className="w-full border border-slate-200 text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-red-100 overflow-hidden" style={{ boxShadow: "0 1px 4px hsl(0,72%,51%,0.07)" }}>
            <div className="px-5 py-4 border-b border-red-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <p className="font-semibold text-red-600 text-sm">Danger Zone</p>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">Deleting your account is permanent. All your trades, journal entries, and data will be erased and cannot be recovered.</p>
              <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder='Type "DELETE" to confirm' className={`${inputClass} border-red-200 focus:border-red-400 focus:ring-red-50`} />
              <button onClick={handleDeleteAccount}
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all">
                <Trash2 className="w-4 h-4" /> Delete My Account
              </button>
            </div>
          </div>
        </>
      )}

      {/* Save button — shown on all tabs except security */}
      {active !== "security" && (
        <button onClick={handleSave} disabled={saving}
          className="w-full text-white rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
          style={{ background: "hsl(222,60%,20%)", boxShadow: "0 4px 14px hsl(222,60%,20%,0.25)" }}>
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </button>
      )}
    </div>
  );
}
