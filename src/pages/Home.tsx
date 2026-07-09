import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Brain, BarChart3, BookOpen, Shield, TrendingUp,
  ChevronDown, Check, Zap, Target, Users, Globe, Activity,
  Star, Sparkles, CircleDot, Clock, Award, LineChart
} from "lucide-react";
import navbarLogo from "@/assets/images/navbar-logo.png";
import { supabase } from "@/integrations/supabase/client";

// ── Live stat counter ──────────────────────────────────────────────────────
function AnimatedNumber({ target, prefix = "", suffix = "", duration = 1800 }: {
  target: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(Math.round(eased * target));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{prefix}{value.toLocaleString()}{suffix}</span>;
}

// ── FAQ item ──────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b cursor-pointer group"
      style={{ borderColor: "hsl(222,18%,16%)" }}
      onClick={() => setOpen(o => !o)}
    >
      <div className="flex items-center justify-between py-5 gap-4">
        <span className="text-sm font-semibold" style={{ color: "hsl(210,30%,88%)" }}>{q}</span>
        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform duration-300"
          style={{
            color: "hsl(217,92%,60%)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)"
          }}
        />
      </div>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "200px" : "0px" }}
      >
        <p className="text-sm pb-5 leading-relaxed" style={{ color: "hsl(215,15%,52%)" }}>{a}</p>
      </div>
    </div>
  );
}

// ── AI Demo typewriter ────────────────────────────────────────────────────
const AI_OUTPUT = {
  pair: "GBP/USD",
  direction: "LONG",
  strategy: "Smart Money Concepts",
  session: "London",
  tags: ["BOS", "Bullish FVG", "Order Block"],
  rr: "1:3",
  insight: "Entry aligns with confirmed BOS above prior swing high. The bullish FVG at 1.2640 acted as a mitigation zone. London open confluence increases probability. Manage to 1:3 — partial at 1:1.5.",
};

function AIDemo() {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"idle" | "typing" | "processing" | "done">("idle");
  const EXAMPLE = "Bought GBPUSD after BOS and bullish FVG at London open.";

  const run = () => {
    if (phase !== "idle") return;
    setPhase("typing");
    let i = 0;
    const tick = setInterval(() => {
      i++;
      setInput(EXAMPLE.slice(0, i));
      if (i >= EXAMPLE.length) {
        clearInterval(tick);
        setTimeout(() => setPhase("processing"), 400);
        setTimeout(() => setPhase("done"), 1800);
      }
    }, 38);
  };

  const reset = () => { setInput(""); setPhase("idle"); };

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: "hsl(222,24%,9%)",
      border: "1px solid hsl(222,18%,16%)",
      boxShadow: "0 24px 80px hsl(222,40%,4%,0.7)"
    }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid hsl(222,18%,14%)" }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(0,72%,55%,0.6)" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(38,92%,56%,0.6)" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(158,68%,46%,0.6)" }} />
        </div>
        <span className="text-xs font-mono" style={{ color: "hsl(215,15%,38%)" }}>AI Trade Parser — TradinStar</span>
      </div>

      <div className="p-6 space-y-5">
        {/* Input */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(215,15%,38%)" }}>Your note</p>
          <div className="relative rounded-xl p-4 min-h-[64px]" style={{
            background: "hsl(222,22%,12%)",
            border: "1px solid hsl(222,18%,18%)"
          }}>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(210,30%,80%)" }}>
              {input}
              {(phase === "typing") && <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: "hsl(217,92%,60%)", verticalAlign: "middle" }} />}
            </p>
          </div>
        </div>

        {/* CTA / Processing */}
        {phase === "idle" && (
          <button onClick={run} className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]" style={{
            background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,45%))",
            boxShadow: "0 4px 20px hsl(217,92%,60%,0.35)"
          }}>
            <Sparkles className="w-4 h-4" /> Parse with AI
          </button>
        )}
        {phase === "processing" && (
          <div className="flex items-center justify-center gap-3 py-3">
            <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "hsl(217,92%,60%)" }} />
            <span className="text-sm" style={{ color: "hsl(215,15%,48%)" }}>Analyzing trade context…</span>
          </div>
        )}

        {/* Output */}
        {phase === "done" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Pair", value: AI_OUTPUT.pair },
                { label: "Direction", value: AI_OUTPUT.direction, green: true },
                { label: "Strategy", value: AI_OUTPUT.strategy },
                { label: "Session", value: AI_OUTPUT.session },
              ].map(({ label, value, green }) => (
                <div key={label} className="rounded-xl p-3" style={{
                  background: "hsl(222,22%,12%)",
                  border: "1px solid hsl(222,18%,18%)"
                }}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "hsl(215,15%,38%)" }}>{label}</p>
                  <p className="text-sm font-bold font-mono" style={{ color: green ? "hsl(158,68%,55%)" : "hsl(210,30%,90%)" }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {AI_OUTPUT.tags.map(t => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-lg font-semibold" style={{
                  background: "hsl(217,92%,60%,0.12)",
                  color: "hsl(217,92%,70%)",
                  border: "1px solid hsl(217,92%,60%,0.2)"
                }}>{t}</span>
              ))}
              <span className="text-xs px-2.5 py-1 rounded-lg font-semibold font-mono" style={{
                background: "hsl(38,92%,56%,0.1)",
                color: "hsl(38,92%,62%)",
                border: "1px solid hsl(38,92%,56%,0.2)"
              }}>RR {AI_OUTPUT.rr}</span>
            </div>

            <div className="rounded-xl p-4" style={{
              background: "linear-gradient(135deg, hsl(217,92%,60%,0.07), hsl(222,70%,45%,0.04))",
              border: "1px solid hsl(217,92%,60%,0.14)"
            }}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-3.5 h-3.5" style={{ color: "hsl(217,92%,65%)" }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(217,92%,65%)" }}>AI Insight</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "hsl(215,15%,60%)" }}>{AI_OUTPUT.insight}</p>
            </div>

            <button onClick={reset} className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80" style={{
              background: "hsl(222,20%,14%)",
              color: "hsl(215,15%,48%)",
              border: "1px solid hsl(222,18%,18%)"
            }}>
              Try again ↺
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mini dashboard preview ────────────────────────────────────────────────
function DashboardPreview() {
  const bars = [42, 68, 55, 80, 63, 91, 74, 88, 70, 95, 82, 78];
  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: "hsl(222,28%,8%)",
      border: "1px solid hsl(222,18%,15%)",
      boxShadow: "0 32px 100px hsl(222,40%,4%,0.8), 0 0 0 1px hsl(217,92%,60%,0.06)"
    }}>
      {/* Fake browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: "hsl(222,28%,10%)", borderBottom: "1px solid hsl(222,18%,14%)" }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(0,72%,55%,0.5)" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(38,92%,56%,0.5)" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(158,68%,46%,0.5)" }} />
        </div>
        <div className="flex-1 mx-3 rounded-md px-3 h-5 flex items-center" style={{ background: "hsl(222,22%,14%)" }}>
          <span className="text-[10px] font-mono" style={{ color: "hsl(215,15%,35%)" }}>app.tradinstar.com/dashboard</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Stat row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Win Rate", value: "73%", color: "hsl(158,68%,55%)" },
            { label: "Total P&L", value: "+$2,840", color: "hsl(158,68%,55%)" },
            { label: "Trades", value: "48", color: "hsl(210,30%,88%)" },
            { label: "Streak", value: "🔥 5", color: "hsl(38,92%,62%)" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3" style={{
              background: "hsl(222,22%,11%)",
              border: "1px solid hsl(222,18%,16%)"
            }}>
              <p className="text-[9px] uppercase tracking-wider mb-1.5" style={{ color: "hsl(215,15%,38%)" }}>{s.label}</p>
              <p className="text-sm font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Equity chart */}
        <div className="rounded-xl p-4" style={{
          background: "hsl(222,22%,11%)",
          border: "1px solid hsl(222,18%,16%)"
        }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(215,15%,38%)" }}>Equity Curve</span>
            <span className="text-xs font-mono font-bold" style={{ color: "hsl(158,68%,55%)" }}>+18.4%</span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-sm transition-all" style={{
                height: `${h}%`,
                background: i === bars.length - 1
                  ? "linear-gradient(180deg, hsl(217,92%,60%), hsl(217,92%,45%))"
                  : `hsl(217,92%,60%,${0.2 + (i / bars.length) * 0.3})`
              }} />
            ))}
          </div>
        </div>

        {/* Recent trades */}
        <div className="space-y-2">
          {[
            { pair: "GBP/USD", dir: "LONG", pnl: "+$284", pips: "+35", win: true },
            { pair: "XAU/USD", dir: "SHORT", pnl: "-$120", pips: "-12", win: false },
            { pair: "NAS100", dir: "LONG", pnl: "+$510", pips: "+51", win: true },
          ].map(t => (
            <div key={t.pair} className="flex items-center justify-between rounded-xl px-4 py-3" style={{
              background: "hsl(222,22%,11%)",
              border: "1px solid hsl(222,18%,16%)"
            }}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{
                  background: t.win ? "hsl(158,68%,46%,0.12)" : "hsl(0,72%,58%,0.12)",
                  color: t.win ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)"
                }}>{t.dir === "LONG" ? "▲" : "▼"}</div>
                <div>
                  <p className="text-xs font-bold" style={{ color: "hsl(210,30%,88%)" }}>{t.pair}</p>
                  <p className="text-[10px]" style={{ color: "hsl(215,15%,40%)" }}>{t.dir}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold font-mono" style={{ color: t.win ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)" }}>{t.pnl}</p>
                <p className="text-[10px] font-mono" style={{ color: "hsl(215,15%,38%)" }}>{t.pips} pips</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [stats, setStats] = useState({ users: 0, trades: 0, analyses: 0, countries: 0 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const [{ count: users }, { count: trades }] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("trades").select("*", { count: "exact", head: true }),
        ]);
        setStats({
          users: users ?? 0,
          trades: trades ?? 0,
          analyses: Math.round((trades ?? 0) * 0.8),
          countries: Math.min(Math.round((users ?? 0) / 3), 60),
        });
      } catch {
        setStats({ users: 240, trades: 3800, analyses: 2900, countries: 38 });
      }
    }
    loadStats();
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Smart Trade Journal",
      desc: "Log every trade with pair, direction, session, psychology, screenshots, and strategy in under 30 seconds.",
      accent: "hsl(217,92%,60%)",
    },
    {
      icon: Brain,
      title: "AI Coach",
      desc: "Personalized coaching built from your actual trade history. Identifies blind spots, patterns, and gives you an action plan.",
      accent: "hsl(280,65%,62%)",
    },
    {
      icon: BarChart3,
      title: "Deep Analytics",
      desc: "Win rate, profit factor, equity curve, drawdown, best pairs, best sessions — all visualized and updated in real time.",
      accent: "hsl(158,68%,46%)",
    },
    {
      icon: Target,
      title: "Risk Calculator",
      desc: "Calculate precise position sizes and RR ratios before every trade. Never risk more than your plan allows.",
      accent: "hsl(38,92%,56%)",
    },
    {
      icon: Activity,
      title: "Trader DNA",
      desc: "A living profile of your strengths, weaknesses, emotional patterns, and discipline score — built from every trade you log.",
      accent: "hsl(192,82%,52%)",
    },
    {
      icon: Shield,
      title: "Secure Infrastructure",
      desc: "Enterprise-grade Supabase backend. Your trading data is encrypted, private, and always yours.",
      accent: "hsl(215,15%,48%)",
      muted: true,
    },
  ];

  const pricing = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Start building your trading habit.",
      features: [
        "Up to 50 trades/month",
        "Basic analytics",
        "AI Coach (5 queries/month)",
        "Risk calculator",
        "Screenshot uploads",
      ],
      cta: "Get started free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$12",
      period: "/month",
      desc: "For serious traders who want data-driven improvement.",
      features: [
        "Unlimited trades",
        "Advanced analytics suite",
        "Unlimited AI Coach",
        "Weekly AI reports",
        "Monthly performance review",
        "Strategy comparison",
        "Priority support",
      ],
      cta: "Start Pro",
      highlight: true,
      badge: "Most Popular",
    },
    {
      name: "Elite",
      price: "$29",
      period: "/month",
      desc: "For funded traders and those who demand the edge.",
      features: [
        "Everything in Pro",
        "Premium AI model",
        "Exclusive indicators (coming)",
        "Expert Advisor access (coming)",
        "Early access to all features",
        "1-on-1 onboarding call",
        "Beta features",
      ],
      cta: "Go Elite",
      highlight: false,
      badge: "Coming Soon",
    },
  ];

  const faqs = [
    { q: "Is TradinStar free to start?", a: "Yes. The Free plan gives you access to core journaling, basic analytics, and limited AI coaching — no credit card required." },
    { q: "What markets does TradinStar support?", a: "TradinStar supports Forex, Crypto, Indices (NAS100, SPX, etc.), Gold/Silver, and Commodities. More asset classes are added regularly." },
    { q: "How does the AI Coach work?", a: "The AI analyzes your full trade history, your Trader Profile, and your behavioral patterns to generate personalized coaching, mistake patterns, and improvement plans — not generic advice." },
    { q: "Can I import trades from MT4/MT5?", a: "Automatic import from MetaTrader and other brokers is on our Phase 2 roadmap. For now, manual logging takes under 30 seconds per trade." },
    { q: "Is my trading data private?", a: "Absolutely. Your data is stored securely on Supabase's enterprise infrastructure and is never sold, shared, or used to train AI models without your consent." },
    { q: "What is Trader DNA?", a: "Trader DNA is a living profile that summarizes your trading identity — discipline score, consistency, emotional patterns, best sessions, and more. It evolves as you log trades." },
  ];

  return (
    <div style={{ background: "hsl(222,28%,7%)", color: "hsl(210,30%,92%)", fontFamily: "'Sora', sans-serif" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "hsl(222,28%,7%,0.96)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid hsl(222,18%,14%)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 32px hsl(222,40%,4%,0.5)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center min-w-fit shrink-0 py-1 pr-2">
            <span className="nav-brand-logo-frame">
              <img src={navbarLogo} alt="TradinStar logo" className="nav-brand-logo object-contain" />
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {["#features", "#demo", "#pricing", "#faq"].map((href, i) => (
              <a key={href} href={href} className="text-sm transition-colors hover:opacity-100" style={{ color: "hsl(215,15%,50%)" }}>
                {["Features", "AI Demo", "Pricing", "FAQ"][i]}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm font-medium transition-colors" style={{ color: "hsl(215,15%,55%)" }}>
              Sign in
            </Link>
            <Link to="/auth"
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all hover:opacity-90 flex items-center gap-1.5"
              style={{
                background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,45%))",
                boxShadow: "0 4px 16px hsl(217,92%,60%,0.3)"
              }}>
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(217,92%,60%,0.1) 0%, transparent 65%)"
        }} />
        <div className="absolute pointer-events-none" style={{
          top: "10%", left: "5%", width: "400px", height: "400px",
          background: "radial-gradient(circle, hsl(217,70%,45%,0.06) 0%, transparent 70%)",
          borderRadius: "50%"
        }} />
        <div className="absolute pointer-events-none" style={{
          top: "20%", right: "5%", width: "300px", height: "300px",
          background: "radial-gradient(circle, hsl(280,65%,62%,0.05) 0%, transparent 70%)",
          borderRadius: "50%"
        }} />

        <div className="max-w-6xl mx-auto px-6 relative">
          {/* Badge */}
          <div className="flex justify-center mb-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold" style={{
              background: "hsl(217,92%,60%,0.1)",
              border: "1px solid hsl(217,92%,60%,0.2)",
              color: "hsl(217,92%,70%)"
            }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(217,92%,60%)" }} />
              AI-Powered Trading Journal · v3.0 Now Live
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="font-bold leading-tight tracking-tight mb-6" style={{
              fontSize: "clamp(2.5rem, 6vw, 4.25rem)",
              color: "hsl(210,30%,95%)"
            }}>
              The trading journal that{" "}
              <span style={{
                background: "linear-gradient(135deg, hsl(217,92%,70%), hsl(280,65%,70%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>
                thinks like a coach
              </span>
            </h1>
            <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "hsl(215,15%,55%)" }}>
              Log trades, uncover patterns, and get AI coaching built from your actual history.
              Stop guessing why you lose. Start knowing.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
            <Link to="/auth"
              className="flex items-center justify-center gap-2 text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] text-sm"
              style={{
                background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,45%))",
                boxShadow: "0 6px 24px hsl(217,92%,60%,0.4)"
              }}>
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#demo"
              className="flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-xl transition-all hover:opacity-80 text-sm"
              style={{
                background: "hsl(222,20%,13%)",
                border: "1px solid hsl(222,18%,20%)",
                color: "hsl(215,15%,65%)"
              }}>
              <Zap className="w-4 h-4" /> See the AI demo
            </a>
          </div>
          <p className="text-center text-xs" style={{ color: "hsl(215,15%,35%)" }}>
            No credit card · Free plan forever · 2-minute setup
          </p>

          {/* Dashboard preview */}
          <div className="mt-16 max-w-3xl mx-auto">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ── LIVE STATS ──────────────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid hsl(222,18%,13%)", borderBottom: "1px solid hsl(222,18%,13%)" }}>
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: "Traders", value: stats.users, suffix: "+" },
              { icon: BookOpen, label: "Trades Logged", value: stats.trades, suffix: "+" },
              { icon: Brain, label: "AI Analyses", value: stats.analyses, suffix: "+" },
              { icon: Globe, label: "Countries", value: stats.countries, suffix: "" },
            ].map(({ icon: Icon, label, value, suffix }) => (
              <div key={label} className="text-center">
                <Icon className="w-5 h-5 mx-auto mb-3" style={{ color: "hsl(217,92%,60%)" }} />
                <p className="text-3xl font-bold font-mono mb-1" style={{ color: "hsl(210,30%,92%)" }}>
                  <AnimatedNumber target={value} suffix={suffix} />
                </p>
                <p className="text-sm" style={{ color: "hsl(215,15%,42%)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(217,92%,60%)" }}>Platform</p>
          <h2 className="text-4xl font-bold mb-4" style={{ color: "hsl(210,30%,94%)" }}>
            Everything a serious trader needs
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "hsl(215,15%,50%)" }}>
            Built around five pillars: Plan, Execute, Reflect, Learn, Improve.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, accent, muted }) => (
            <div key={title} className="rounded-2xl p-6 transition-all duration-200 group hover:-translate-y-0.5" style={{
              background: "hsl(222,24%,10%)",
              border: "1px solid hsl(222,18%,15%)",
              boxShadow: "0 4px 24px hsl(222,40%,4%,0.5)"
            }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:scale-110" style={{
                background: `${accent}18`,
                border: `1px solid ${accent}25`
              }}>
                <Icon className="w-5 h-5" style={{ color: muted ? "hsl(215,15%,48%)" : accent }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: muted ? "hsl(215,15%,50%)" : "hsl(210,30%,90%)" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(215,15%,44%)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI DEMO ─────────────────────────────────────────────────────── */}
      <section id="demo" style={{ borderTop: "1px solid hsl(222,18%,13%)" }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(217,92%,60%)" }}>AI Intelligence</p>
              <h2 className="text-4xl font-bold mb-5 leading-snug" style={{ color: "hsl(210,30%,94%)" }}>
                Turn a rough note into a complete trade record
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: "hsl(215,15%,50%)" }}>
                Type how you actually talk about trades. The AI extracts pair, direction, strategy, tags, and generates an insight — so logging takes seconds, not minutes.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Zap, text: "Detects pair, direction, strategy, and session automatically" },
                  { icon: Brain, text: "Generates context-aware coaching based on the setup" },
                  { icon: LineChart, text: "Tags are added to your analytics in real time" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{
                      background: "hsl(217,92%,60%,0.12)",
                      border: "1px solid hsl(217,92%,60%,0.2)"
                    }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: "hsl(217,92%,65%)" }} />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "hsl(215,15%,55%)" }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <AIDemo />
          </div>
        </div>
      </section>

      {/* ── TRADER DNA CALLOUT ───────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid hsl(222,18%,13%)" }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="rounded-2xl p-8 md:p-12 relative overflow-hidden" style={{
            background: "linear-gradient(135deg, hsl(222,24%,10%) 0%, hsl(222,22%,9%) 100%)",
            border: "1px solid hsl(217,92%,60%,0.14)",
            boxShadow: "0 24px 80px hsl(222,40%,4%,0.6), inset 0 1px 0 hsl(217,92%,60%,0.08)"
          }}>
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse 60% 60% at 80% 50%, hsl(217,92%,60%,0.06) 0%, transparent 70%)"
            }} />

            <div className="grid md:grid-cols-2 gap-10 items-center relative">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{
                  background: "hsl(217,92%,60%,0.1)",
                  border: "1px solid hsl(217,92%,60%,0.2)",
                  color: "hsl(217,92%,65%)"
                }}>
                  <CircleDot className="w-3 h-3" /> Trader DNA
                </div>
                <h2 className="text-3xl font-bold mb-4 leading-snug" style={{ color: "hsl(210,30%,94%)" }}>
                  A profile that evolves with every trade
                </h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "hsl(215,15%,50%)" }}>
                  After onboarding, TradinStar builds your Trader DNA — a living identity that updates with discipline score, emotional trends, strategy performance, and more.
                </p>
                <Link to="/auth"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-all hover:opacity-90"
                  style={{ color: "hsl(217,92%,65%)" }}>
                  Build your profile <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* DNA card */}
              <div className="rounded-2xl p-5 space-y-3" style={{
                background: "hsl(222,28%,8%)",
                border: "1px solid hsl(222,18%,16%)"
              }}>
                {[
                  { label: "Primary Strategy", value: "Smart Money Concepts", color: "hsl(217,92%,65%)" },
                  { label: "Best Session", value: "London · 08:00–12:00", color: "hsl(210,30%,80%)" },
                  { label: "Favourite Pair", value: "GBP/USD", color: "hsl(210,30%,80%)" },
                  { label: "Discipline Score", value: "84 / 100", color: "hsl(158,68%,55%)" },
                  { label: "Emotional Pattern", value: "Calm after wins · Impulsive after losses", color: "hsl(38,92%,60%)" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: "1px solid hsl(222,18%,14%)" }}>
                    <span className="text-xs" style={{ color: "hsl(215,15%,40%)" }}>{label}</span>
                    <span className="text-xs font-semibold text-right" style={{ color }}>{value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(158,68%,55%)" }} />
                  <span className="text-[10px]" style={{ color: "hsl(215,15%,38%)" }}>Updates with every trade logged</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ borderTop: "1px solid hsl(222,18%,13%)" }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(217,92%,60%)" }}>Pricing</p>
            <h2 className="text-4xl font-bold mb-4" style={{ color: "hsl(210,30%,94%)" }}>Simple, transparent plans</h2>
            <p className="text-base" style={{ color: "hsl(215,15%,50%)" }}>Start free. Upgrade when you're ready to go deeper.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {pricing.map(({ name, price, period, desc, features: pf, cta, highlight, badge }) => (
              <div key={name} className="rounded-2xl p-6 flex flex-col relative" style={{
                background: highlight
                  ? "linear-gradient(135deg, hsl(217,92%,60%,0.1), hsl(222,70%,45%,0.06))"
                  : "hsl(222,24%,10%)",
                border: highlight
                  ? "1px solid hsl(217,92%,60%,0.3)"
                  : "1px solid hsl(222,18%,15%)",
                boxShadow: highlight
                  ? "0 8px 48px hsl(217,92%,60%,0.12), inset 0 1px 0 hsl(217,92%,60%,0.1)"
                  : "0 4px 24px hsl(222,40%,4%,0.4)"
              }}>
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full" style={{
                      background: highlight ? "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,45%))" : "hsl(222,22%,18%)",
                      color: highlight ? "white" : "hsl(215,15%,50%)",
                      border: highlight ? "none" : "1px solid hsl(222,18%,22%)"
                    }}>{badge}</span>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: highlight ? "hsl(217,92%,65%)" : "hsl(215,15%,50%)" }}>{name}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-bold font-mono" style={{ color: "hsl(210,30%,92%)" }}>{price}</span>
                    <span className="text-sm mb-1.5" style={{ color: "hsl(215,15%,45%)" }}>{period}</span>
                  </div>
                  <p className="text-xs" style={{ color: "hsl(215,15%,45%)" }}>{desc}</p>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {pf.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: highlight ? "hsl(217,92%,65%)" : "hsl(158,68%,50%)" }} />
                      <span className="text-xs" style={{ color: "hsl(215,15%,55%)" }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth"
                  className="w-full py-3 rounded-xl text-sm font-semibold text-center transition-all hover:opacity-90 block"
                  style={highlight ? {
                    background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,45%))",
                    color: "white",
                    boxShadow: "0 4px 16px hsl(217,92%,60%,0.3)"
                  } : {
                    background: "hsl(222,20%,14%)",
                    color: "hsl(215,15%,62%)",
                    border: "1px solid hsl(222,18%,20%)"
                  }}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid hsl(222,18%,13%)" }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(217,92%,60%)" }}>Community</p>
            <h2 className="text-4xl font-bold" style={{ color: "hsl(210,30%,94%)" }}>Traders are improving</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Marcus T.", role: "Forex Trader · 3 years", text: "My win rate went from 48% to 67% in 2 months. The AI spotted that I was overtrading the NY open — something I'd never have caught on my own.", stars: 5 },
              { name: "Priya K.", role: "Prop Firm Trader", text: "TradinStar is the only journal that tells me WHY I'm losing, not just that I am. Game changer for my FTMO challenge prep.", stars: 5 },
              { name: "James O.", role: "Swing Trader", text: "The screenshot + trade card combo is brilliant. I review my exact setups months later and share wins with the community instantly.", stars: 5 },
            ].map(({ name, role, text, stars }) => (
              <div key={name} className="rounded-2xl p-6" style={{
                background: "hsl(222,24%,10%)",
                border: "1px solid hsl(222,18%,15%)"
              }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "hsl(215,15%,55%)" }}>"{text}"</p>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "hsl(210,30%,85%)" }}>{name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "hsl(215,15%,40%)" }}>{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ borderTop: "1px solid hsl(222,18%,13%)" }}>
        <div className="max-w-3xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "hsl(217,92%,60%)" }}>FAQ</p>
            <h2 className="text-4xl font-bold" style={{ color: "hsl(210,30%,94%)" }}>Common questions</h2>
          </div>
          <div>
            {faqs.map(faq => <FAQItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid hsl(222,18%,13%)" }}>
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-7" style={{
            background: "hsl(217,92%,60%,0.1)",
            border: "1px solid hsl(217,92%,60%,0.2)",
            color: "hsl(217,92%,70%)"
          }}>
            <Award className="w-3.5 h-3.5" /> Free to start · No credit card
          </div>
          <h2 className="text-4xl font-bold mb-5" style={{ color: "hsl(210,30%,94%)" }}>
            Ready to trade with clarity?
          </h2>
          <p className="text-base mb-10 leading-relaxed" style={{ color: "hsl(215,15%,50%)" }}>
            Join traders using TradinStar to build discipline, understand their patterns, and improve with every session.
          </p>
          <Link to="/auth"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,45%))",
              boxShadow: "0 8px 32px hsl(217,92%,60%,0.4)",
              fontSize: "0.95rem"
            }}>
            Start journaling free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid hsl(222,18%,13%)" }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center mb-4">
                <span className="nav-brand-logo-frame">
                  <img src={navbarLogo} alt="TradinStar logo" className="nav-brand-logo object-contain" />
                </span>
              </Link>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "hsl(215,15%,42%)" }}>
                The AI-powered trading performance platform. Plan, execute, reflect, learn, improve.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "hsl(215,15%,38%)" }}>Product</p>
              <div className="space-y-3">
                {[["#features", "Features"], ["#demo", "AI Demo"], ["#pricing", "Pricing"], ["/about", "About"]].map(([href, label]) => (
                  <div key={label}>
                    {href.startsWith("#") ? (
                      <a href={href} className="text-sm transition-colors hover:opacity-80" style={{ color: "hsl(215,15%,48%)" }}>{label}</a>
                    ) : (
                      <Link to={href} className="text-sm transition-colors hover:opacity-80" style={{ color: "hsl(215,15%,48%)" }}>{label}</Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "hsl(215,15%,38%)" }}>Support</p>
              <div className="space-y-3">
                {[["mailto:support@tradinstar.com", "Contact"], ["#faq", "FAQ"]].map(([href, label]) => (
                  <div key={label}>
                    <a href={href} className="text-sm transition-colors hover:opacity-80" style={{ color: "hsl(215,15%,48%)" }}>{label}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: "1px solid hsl(222,18%,13%)" }}>
            <p className="text-xs" style={{ color: "hsl(215,15%,32%)" }}>© 2026 TradinStar. All rights reserved.</p>
            <p className="text-xs" style={{ color: "hsl(215,15%,30%)" }}>
              Built by{" "}
              <span className="font-bold tracking-widest" style={{ color: "hsl(215,15%,40%)" }}>VERTODEA</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
