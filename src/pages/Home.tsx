import { Link } from "react-router-dom";
import { TrendingUp, Brain, Calculator, BarChart3, BookOpen, Shield, ArrowRight, CheckCircle2, ChevronRight, Star } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Smart Trade Logging", desc: "Log every trade with entry/exit prices, session, strategy, emotions, and chart screenshots — all in under 30 seconds.", color: "bg-blue-50 text-blue-600" },
  { icon: Brain, title: "AI Coach", desc: "Get personalized coaching based on your actual trading patterns. The AI identifies your blind spots and tells you exactly what to improve.", color: "bg-violet-50 text-violet-600" },
  { icon: Calculator, title: "Risk Calculator", desc: "Calculate position sizes, risk-reward ratios, and stop-loss levels before every trade. Never risk more than you plan to.", color: "bg-amber-50 text-amber-600" },
  { icon: BarChart3, title: "Performance Analytics", desc: "Deep-dive charts on win rate, P&L curves, and session performance. Know what's working and what's costing you money.", color: "bg-emerald-50 text-emerald-600" },
  { icon: TrendingUp, title: "Journal Insights", desc: "Advanced filtering to find patterns across hundreds of trades. Discover your best setups and worst habits.", color: "bg-rose-50 text-rose-600" },
  { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade Supabase infrastructure with end-to-end encryption. GDPR compliant. Your data is always yours.", color: "bg-slate-100 text-slate-600" },
];

const testimonials = [
  { name: "Marcus T.", role: "Forex Trader · 3 yrs", text: "My win rate went from 48% to 67% in 2 months. The AI coach spotted that I was overtrading the New York open.", stars: 5 },
  { name: "Priya K.", role: "Prop Firm Trader", text: "TradinStar is the only journal that actually tells me WHY I'm losing, not just that I am. Game changer for my FTMO prep.", stars: 5 },
  { name: "James O.", role: "Swing Trader", text: "The screenshot feature is brilliant. I can review my exact setup context months later instead of relying on memory.", stars: 5 },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(222,60%,20%)" }}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">TradinStar</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#testimonials" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Reviews</a>
            <a href="mailto:support@tradinstar.com" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Support</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link to="/auth"
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all hover:opacity-90"
              style={{ background: "hsl(222,60%,20%)" }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            AI-Powered Trading Journal
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6">
            The journal that tells you{" "}
            <span className="relative inline-block">
              <span className="relative z-10" style={{ color: "hsl(222,60%,35%)" }}>why you lose</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-amber-100 -z-0 rounded" />
            </span>
          </h1>

          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            TradinStar logs your trades, analyzes your patterns, and gives you an AI coach that speaks plainly — so you can fix what's wrong and trade with real confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link to="/auth"
              className="flex items-center justify-center gap-2 text-white font-semibold px-6 py-3.5 rounded-xl transition-all hover:opacity-90 text-sm"
              style={{ background: "hsl(222,60%,20%)", boxShadow: "0 4px 20px hsl(222,60%,20%,0.25)" }}>
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/auth"
              className="flex items-center justify-center gap-2 text-slate-700 font-semibold px-6 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all text-sm">
              View demo
            </Link>
          </div>

          <p className="text-xs text-slate-400">No credit card required · Free to start · Takes 2 minutes</p>
        </div>

        {/* App preview card */}
        <div className="mt-16 relative max-w-4xl mx-auto">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/60 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4 bg-slate-700 rounded-md h-6 flex items-center px-3">
                <span className="text-xs text-slate-400">app.tradinstar.com/dashboard</span>
              </div>
            </div>
            {/* Dashboard preview */}
            <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Total P&L", value: "+$2,847", color: "text-emerald-400" },
                  { label: "Win Rate", value: "73%", color: "text-blue-400" },
                  { label: "Trades", value: "48", color: "text-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Recent Trades</p>
                  <span className="text-xs text-blue-400">View all →</span>
                </div>
                {[
                  { pair: "EUR/USD", dir: "LONG", pnl: "+$284", pips: "+35", win: true },
                  { pair: "GBP/JPY", dir: "LONG", pnl: "+$432", pips: "+28", win: true },
                  { pair: "BTC/USD", dir: "SHORT", pnl: "-$120", pips: "-18", win: false },
                ].map((t, i) => (
                  <div key={i} className={`flex items-center justify-between py-2.5 ${i < 2 ? "border-b border-slate-700" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${t.win ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400"}`}>
                        {t.dir === "LONG" ? "↑" : "↓"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{t.pair}</p>
                        <p className="text-xs text-slate-500">{t.dir}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold font-mono ${t.win ? "text-emerald-400" : "text-red-400"}`}>{t.pnl}</p>
                      <p className="text-xs text-slate-500 font-mono">{t.pips} pips</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-blue-500/5 rounded-3xl -z-10 blur-2xl" />
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: "12,000+", label: "Active traders" },
              { num: "2M+", label: "Trades logged" },
              { num: "68%", label: "Avg win rate boost" },
              { num: "4.9 ★", label: "Trader rating" },
            ].map(({ num, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-slate-900">{num}</p>
                <p className="text-sm text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wider">Features</p>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything serious traders need</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Built specifically for traders who want to understand their performance — not just track it.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-slate-200 hover:shadow-sm transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI COACH HIGHLIGHT */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-violet-600 mb-3 uppercase tracking-wider">AI Coach</p>
              <h2 className="text-4xl font-bold text-slate-900 mb-5 leading-tight">
                A coach that's studied every trade you've ever made
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Most journals show you the numbers. TradinStar tells you what they mean — and what to do about it. The AI analyzes your patterns and gives you specific, actionable advice in plain English.
              </p>
              <div className="space-y-3">
                {[
                  "Identifies your worst habits by session and time of day",
                  "Spots emotional patterns that hurt your win rate",
                  "Recommends specific changes based on your data",
                  "Tracks your improvement over time",
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">AI Coach</p>
                  <p className="text-xs text-emerald-500">● Online</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-slate-100 text-slate-700 text-sm px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[80%]">
                    Why do I keep losing on Mondays?
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex-shrink-0 flex items-center justify-center mt-1">
                    <Brain className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <div className="bg-violet-50 border border-violet-100 text-slate-700 text-sm px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%]">
                    I've analyzed your last 6 months. Monday opens show a <span className="text-red-500 font-semibold">34% win rate</span> vs your weekly average of 73%. You're entering within 30 minutes of open when spreads are widest. Your best window is <span className="font-semibold text-violet-700">10AM–12PM EST</span> — try waiting for the first candle to close before entering.
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-slate-100 text-slate-700 text-sm px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[80%]">
                    What's my strongest setup?
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex-shrink-0 flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-violet-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCREENSHOT FEATURE HIGHLIGHT */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <div className="relative order-2 lg:order-1">
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
              <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-slate-500 ml-2">Trade Card — EUR/USD LONG</span>
              </div>
              <div className="p-5">
                {/* Simulated trade card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-400" />
                  {/* Fake chart area */}
                  <div className="h-28 bg-slate-800 flex items-end px-3 pb-2 gap-0.5">
                    {[40,55,45,62,58,70,65,78,72,85,80,90].map((h, i) => (
                      <div key={i} style={{ height: `${h}%` }}
                        className={`flex-1 rounded-sm ${i > 7 ? "bg-emerald-500/60" : "bg-slate-600/60"}`} />
                    ))}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-white font-bold">EUR/USD <span className="text-emerald-400 text-xs ml-1">▲ LONG</span></p>
                        <p className="text-slate-500 text-xs">Mar 8 · London Session</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold font-mono text-lg">+$284</p>
                        <p className="text-slate-500 text-xs font-mono">+35 pips</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mb-3">
                      <span>Entry <span className="text-slate-300 font-mono">1.0812</span></span>
                      <span>Exit <span className="text-slate-300 font-mono">1.0847</span></span>
                      <span>RR <span className="text-slate-300 font-mono">1:2.4</span></span>
                    </div>
                    <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 tracking-widest">TRADINSTAR</span>
                      <span className="text-xs text-slate-600">tradinstar.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold text-amber-600 mb-3 uppercase tracking-wider">Setup Screenshots</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-5 leading-tight">
              Capture your setups. Share your wins.
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Attach a chart screenshot to every trade. Review your exact setup context months later, not just numbers. Then generate a branded trade card to share with your community in one click.
            </p>
            <div className="space-y-4">
              {[
                { title: "Upload or paste", desc: "Drag & drop, upload from device, or paste directly from your clipboard." },
                { title: "Permanent record", desc: "Your screenshots are stored securely and always visible in your journal." },
                { title: "One-click sharing", desc: "Generate a branded trade card with your chart and stats — ready to share on X, Discord, or anywhere." },
              ].map(({ title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChevronRight className="w-3 h-3 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                    <p className="text-sm text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wider">Reviews</p>
            <h2 className="text-4xl font-bold text-slate-900">Traders are winning more</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">"{text}"</p>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-400">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-5">
            Ready to trade with clarity?
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Join thousands of traders using TradinStar to understand their performance, fix their habits, and build real consistency.
          </p>
          <Link to="/auth"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:opacity-90 text-base"
            style={{ background: "hsl(222,60%,20%)", boxShadow: "0 4px 20px hsl(222,60%,20%,0.25)" }}>
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-sm text-slate-400 mt-4">No credit card required · Free to start</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "hsl(222,60%,20%)" }}>
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-slate-800">TradinStar</span>
              <span className="text-slate-300 text-sm">·</span>
              <span className="text-sm text-slate-400">AI-Powered Trading Journal</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/about" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">About</Link>
              <a href="mailto:support@tradinstar.com" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">Support</a>
              <span className="text-sm text-slate-400">© 2026 TradinStar</span>
              <span className="text-slate-200">·</span>
              <span className="text-xs text-slate-400">
                Built by{" "}
                <span className="font-semibold text-slate-600 uppercase tracking-widest text-[11px]">VYBE STACK</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
