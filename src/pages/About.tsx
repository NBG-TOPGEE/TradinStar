import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight, Zap, Shield, Users, Mail } from "lucide-react";
import navbarLogo from "@/assets/images/navbar-logo.png";

const timeline = [
  {
    year: "The Problem",
    title: "Losing without knowing why",
    desc: "Most traders keep losing not because of bad strategies — but because they never truly study themselves. Spreadsheets are tedious. Generic apps don't talk back. The patterns that are costing you money stay hidden.",
  },
  {
    year: "The Insight",
    title: "Data + AI = a real coach",
    desc: "When you combine every trade you've ever made with an AI that can actually read patterns, something clicks. Not just 'your win rate is 48%' — but 'you lose 80% of trades you enter in the first 15 minutes of the NY open.'",
  },
  {
    year: "The Build",
    title: "TradinStar is born",
    desc: "Built under VYBE STACK by a forex trader who was tired of guessing. Every feature exists because it was needed — fast logging, screenshot capture, AI coaching, risk calculation. Nothing bloated. Nothing generic.",
  },
];

const values = [
  {
    icon: Zap,
    title: "Built for speed",
    desc: "Logging a trade should take under 30 seconds. We obsess over friction so you don't lose momentum mid-session.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Shield,
    title: "Privacy first",
    desc: "Your trade data is yours. We never sell, share, or analyze it for anything other than coaching you.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Users,
    title: "Trader-built",
    desc: "Every decision is made by someone who trades. No feature gets added unless it solves a real problem.",
    color: "bg-violet-50 text-violet-600",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center min-w-fit shrink-0 py-1 pr-2">
            <span className="nav-brand-logo-frame">
              <img
                src={navbarLogo}
                alt="TradinStar logo"
                className="nav-brand-logo object-contain"
              />
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Link
              to="/auth"
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all hover:opacity-90"
              style={{ background: "hsl(222,60%,20%)" }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          Our story
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6">
          Built by a trader,{" "}
          <span className="relative inline-block">
            <span className="relative z-10" style={{ color: "hsl(222,60%,35%)" }}>for traders</span>
            <span className="absolute bottom-1 left-0 right-0 h-3 bg-amber-100 -z-0 rounded" />
          </span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          TradinStar wasn't designed in a boardroom. It was built out of frustration — by someone sitting in losing trades, staring at a spreadsheet, wondering what they were missing.
        </p>
      </section>

      {/* TIMELINE */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="relative">
          <div className="absolute left-5 top-2 bottom-2 w-px bg-slate-100 hidden md:block" />
          <div className="space-y-10">
            {timeline.map(({ year, title, desc }, i) => (
              <div key={i} className="flex gap-8 items-start">
                <div className="hidden md:flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold z-10"
                    style={{ background: "hsl(222,60%,20%)" }}
                  >
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 hover:border-slate-200 hover:shadow-sm transition-all">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{year}</p>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wider">What we stand for</p>
            <h2 className="text-4xl font-bold text-slate-900">How we build</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {values.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-slate-200 hover:shadow-sm transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VYBE STACK CALLOUT */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-slate-900 rounded-2xl p-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Part of</p>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">VYBE STACK</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed mb-6">
            TradinStar is a product of VYBE STACK — a software and creative company building focused tools for real people. Every product is minimal, purposeful, and built to last.
          </p>
          <a
            href="https://github.com/NBG-TOPGEE"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            github.com/NBG-TOPGEE <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to understand your trading?</h2>
          <p className="text-slate-500 mb-8">
            Join traders using TradinStar to fix their habits and build real consistency.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-6 py-3.5 rounded-xl transition-all hover:opacity-90 text-sm"
              style={{ background: "hsl(222,60%,20%)", boxShadow: "0 4px 20px hsl(222,60%,20%,0.25)" }}
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:support@tradinstar.com"
              className="inline-flex items-center justify-center gap-2 text-slate-700 font-semibold px-6 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all text-sm"
            >
              <Mail className="w-4 h-4" /> Contact us
            </a>
          </div>
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
              <Link to="/" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">Home</Link>
              <a href="mailto:support@tradinstar.com" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">Support</a>
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
