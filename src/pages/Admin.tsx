/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, CSSProperties } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell,
} from "recharts";

// ─── Supabase ────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://pqtjwqwqqhtxijuwlsql.supabase.co";

async function sbFetch(path: string, params = "", serviceKey: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}${params}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "count=exact",
    },
  });
  const count = res.headers.get("content-range")?.split("/")[1];
  const data = await res.json();
  return { data, count: count ? parseInt(count) : null };
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#f1f5f9;--surface:#ffffff;--surface2:#f8fafc;--surface3:#f1f5f9;
  --border:#e2e8f0;--border2:#cbd5e1;
  --blue:#3b82f6;--cyan:#0891b2;
  --green:#059669;--red:#dc2626;--amber:#d97706;--violet:#7c3aed;
  --text:#0f172a;--text2:#475569;--text3:#94a3b8;--white:#0f172a;
  --mono:'DM Mono',monospace;--sans:'Syne',sans-serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--mono);font-size:13px;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:var(--surface2);}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}
.app{display:flex;min-height:100vh;}
.sidebar{width:220px;min-width:220px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow:hidden;}
.logo-area{padding:24px 20px 20px;border-bottom:1px solid var(--border);}
.logo-pip{font-family:var(--sans);font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--text3);margin-bottom:4px;}
.logo-title{font-family:var(--sans);font-size:20px;font-weight:800;color:var(--text);letter-spacing:-0.5px;}
.logo-tag{display:inline-block;margin-top:6px;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:2px 7px;background:rgba(59,130,246,0.08);color:var(--blue);border:1px solid rgba(59,130,246,0.25);}
.nav{padding:16px 0;flex:1;overflow-y:auto;}
.nav-label{padding:10px 20px 4px;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--text3);}
.nav-item{display:flex;align-items:center;gap:11px;padding:9px 20px;cursor:pointer;color:var(--text2);transition:all 0.15s;font-size:12px;border-left:2px solid transparent;}
.nav-item:hover{color:var(--text);background:rgba(59,130,246,0.04);}
.nav-item.active{color:var(--blue);border-left-color:var(--blue);background:rgba(59,130,246,0.06);}
.nav-icon{font-size:15px;width:18px;text-align:center;flex-shrink:0;}
.sidebar-bottom{padding:16px 20px;border-top:1px solid var(--border);}
.status-row{display:flex;align-items:center;gap:8px;font-size:10px;color:var(--text2);}
.dot-pulse{width:7px;height:7px;border-radius:50%;background:var(--green);animation:pls 2s infinite;}
@keyframes pls{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(5,150,105,0.4);}50%{opacity:0.7;box-shadow:0 0 0 5px rgba(5,150,105,0);}}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.topbar{height:52px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:10;box-shadow:0 1px 4px rgba(0,0,0,0.04);}
.topbar-left{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text2);}
.topbar-page{color:var(--text);font-weight:500;font-family:var(--sans);}
.topbar-right{display:flex;align-items:center;gap:16px;}
.tb-pill{display:flex;align-items:center;gap:5px;padding:4px 10px;border:1px solid var(--border2);font-size:10px;color:var(--text2);cursor:pointer;transition:all 0.15s;background:transparent;}
.tb-pill:hover{border-color:var(--blue);color:var(--blue);}
.tb-pill.warn{border-color:rgba(217,119,6,0.4);color:var(--amber);}
.content{flex:1;overflow-y:auto;padding:24px;}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
.stat-card{background:var(--surface);border:1px solid var(--border);padding:18px 20px;position:relative;overflow:hidden;transition:border-color 0.2s;}
.stat-card:hover{border-color:var(--border2);}
.stat-label{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:var(--text3);margin-bottom:10px;}
.stat-val{font-family:var(--sans);font-size:32px;font-weight:800;color:var(--text);line-height:1;letter-spacing:-1px;}
.stat-sub{margin-top:7px;font-size:10px;color:var(--text2);}
.section-title{font-family:var(--sans);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text2);margin-bottom:12px;}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
.grid-3{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px;}
.card{background:var(--surface);border:1px solid var(--border);}
.card-head{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;}
.card-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text2);}
.card-body{padding:18px;}
.tbl{width:100%;border-collapse:collapse;}
.tbl th{text-align:left;padding:9px 14px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);border-bottom:1px solid var(--border);white-space:nowrap;background:var(--surface2);}
.tbl td{padding:11px 14px;border-bottom:1px solid var(--border);font-size:11.5px;color:var(--text);transition:background 0.1s;}
.tbl tr:last-child td{border-bottom:none;}
.tbl tbody tr:hover td{background:var(--surface2);}
.badge{display:inline-flex;align-items:center;gap:4px;font-size:9px;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;}
.badge-green{background:rgba(5,150,105,0.08);color:var(--green);border:1px solid rgba(5,150,105,0.2);}
.badge-red{background:rgba(220,38,38,0.08);color:var(--red);border:1px solid rgba(220,38,38,0.2);}
.badge-blue{background:rgba(59,130,246,0.08);color:var(--blue);border:1px solid rgba(59,130,246,0.2);}
.badge-amber{background:rgba(217,119,6,0.08);color:var(--amber);border:1px solid rgba(217,119,6,0.2);}
.badge-dot{width:5px;height:5px;border-radius:50%;background:currentColor;}
.prog-track{height:3px;background:var(--border);margin-top:5px;}
.prog-fill{height:100%;transition:width 1s ease;}
.user-avi{width:30px;height:30px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;font-family:var(--sans);flex-shrink:0;}
.pair{font-size:10px;padding:2px 6px;background:var(--surface2);border:1px solid var(--border);color:var(--text2);font-family:var(--mono);}
.metric-row{display:flex;justify-content:space-between;align-items:center;padding:10px 18px;border-bottom:1px solid var(--border);}
.metric-row:last-child{border-bottom:none;}
.metric-label{font-size:11px;color:var(--text2);}
.metric-val{font-size:11px;font-family:var(--sans);font-weight:700;color:var(--text);}
.loading{display:flex;align-items:center;justify-content:center;min-height:200px;color:var(--text3);gap:10px;font-size:11px;}
.spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--blue);border-radius:50%;animation:spin 0.8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.empty{text-align:center;padding:48px 24px;color:var(--text3);}
.tabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:20px;}
.tab{padding:10px 18px;font-size:11px;cursor:pointer;color:var(--text2);border-bottom:2px solid transparent;margin-bottom:-1px;transition:all 0.15s;background:none;border-top:none;border-left:none;border-right:none;font-family:var(--mono);}
.tab:hover{color:var(--text);}
.tab.active{color:var(--blue);border-bottom-color:var(--blue);}
.search-input{background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:7px 12px;font-family:var(--mono);font-size:11px;outline:none;width:200px;transition:border-color 0.2s;}
.search-input:focus{border-color:var(--blue);}
.search-input::placeholder{color:var(--text3);}
.table-wrap{overflow-x:auto;}
.refresh-btn{background:none;border:1px solid var(--border2);color:var(--text2);padding:5px 10px;cursor:pointer;font-family:var(--mono);font-size:10px;transition:all 0.15s;}
.refresh-btn:hover{border-color:var(--blue);color:var(--blue);}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
.fade-up{animation:fadeUp 0.3s ease forwards;}
.gate-wrap{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:24px;}
.gate-card{background:var(--surface);border:1px solid var(--border);padding:40px;max-width:460px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.06);}
.gate-logo{font-family:var(--sans);font-weight:800;font-size:22px;color:var(--text);letter-spacing:-0.5px;margin-bottom:4px;}
.gate-sub{font-size:11px;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:32px;}
.gate-label{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);margin-bottom:8px;}
.gate-input{width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:11px 14px;font-family:var(--mono);font-size:12px;outline:none;transition:border-color 0.2s;}
.gate-input:focus{border-color:var(--blue);}
.gate-input::placeholder{color:var(--text3);}
.gate-hint{margin-top:10px;font-size:10px;color:var(--text3);line-height:1.6;}
.gate-btn{margin-top:20px;width:100%;background:var(--blue);border:none;color:#fff;padding:12px;font-family:var(--sans);font-size:13px;font-weight:700;cursor:pointer;}
.gate-btn:disabled{opacity:0.4;cursor:not-allowed;}
.gate-err{margin-top:12px;padding:10px 14px;background:rgba(220,38,38,0.06);border:1px solid rgba(220,38,38,0.2);font-size:11px;color:var(--red);}
.gate-steps{margin-top:28px;border-top:1px solid var(--border);padding-top:20px;}
.gate-steps-title{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);margin-bottom:12px;}
.gate-step{display:flex;gap:12px;margin-bottom:10px;font-size:11px;color:var(--text2);line-height:1.5;}
.gate-step-num{width:18px;height:18px;background:var(--surface2);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--text3);flex-shrink:0;margin-top:1px;}
.gate-warn{margin-top:16px;padding:10px 14px;background:rgba(217,119,6,0.05);border:1px solid rgba(217,119,6,0.2);font-size:10px;color:var(--amber);line-height:1.6;}
`;

function injectStyles() {
  if (typeof document !== "undefined" && !document.getElementById("ts-admin-css")) {
    const el = document.createElement("style");
    el.id = "ts-admin-css";
    el.textContent = BASE_CSS;
    document.head.appendChild(el);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: any) =>
  n == null ? "—" : Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n: any) =>
  n == null ? "—" : Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const ago = (ts: string) => {
  if (!ts) return "—";
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
const pnlColor = (v: any) => (Number(v) >= 0 ? "var(--green)" : "var(--red)");
const AVI_COLORS = ["#3b82f6","#a78bfa","#22d3ee","#34d399","#fbbf24","#f87171","#fb923c","#e879f9"];
const aviColor = (id: string) => AVI_COLORS[id ? id.charCodeAt(0) % AVI_COLORS.length : 0];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Trade {
  id: string; user_id: string; pair: string; direction: string;
  entry_price: number; exit_price: number; position_size: number;
  session: string; strategy: string; emotion: string; confidence: number;
  notes: string; screenshot: string | null; pnl: number; pips: number;
  created_at: string;
}
interface Profile {
  id: string; display_name: string; account_balance: number | null;
  default_risk_percent: number | null; preferred_pairs: string[] | null;
  created_at: string; updated_at: string;
}
interface Stats {
  totalPnL: number; wins: number; losses: number; winRate: number;
  bestTrade: number; worstTrade: number; totalPips: number;
  strategies: number; monthTrades: number;
}
interface AppData { trades: Trade[]; profiles: Profile[]; stats: Stats; }

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 12px", fontSize: 11 }}>
      <div style={{ color: "var(--text2)", marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || "var(--white)", fontFamily: "var(--sans)", fontWeight: 700 }}>
          {p.name}: {typeof p.value === "number"
            ? (String(p.name).includes("PnL") || String(p.name).includes("pnl") ? `$${fmt(p.value)}` : p.value)
            : p.value}
        </div>
      ))}
    </div>
  );
};

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview({ data }: { data: AppData | null }) {
  if (!data) return <div className="loading"><div className="spinner" /><span>Loading...</span></div>;
  const { trades, profiles, stats } = data;

  const byDay: Record<string, number> = {};
  trades.forEach(t => {
    const d = t.created_at?.slice(0, 10);
    if (d) byDay[d] = (byDay[d] || 0) + Number(t.pnl);
  });
  const dayChart = Object.entries(byDay).sort().slice(-14).map(([date, pnl]) => ({
    date: date.slice(5), pnl: Math.round(Number(pnl) * 100) / 100,
  }));

  const sessions = ["Sydney", "Tokyo", "London", "New York"];
  const sessionData = sessions.map(s => {
    const st = trades.filter(t => t.session === s);
    const wins = st.filter(t => Number(t.pnl) > 0).length;
    return { name: s === "New York" ? "NY" : s.slice(0, 3), trades: st.length, winRate: st.length ? Math.round(wins / st.length * 100) : 0 };
  });

  const pairMap: Record<string, number> = {};
  trades.forEach(t => { pairMap[t.pair] = (pairMap[t.pair] || 0) + 1; });
  const topPairs = Object.entries(pairMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([pair, count]) => ({ pair, count }));

  const now = new Date();
  const thisMonth = profiles.filter(p => {
    const d = new Date(p.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const kpis = [
    { label: "Total Users", val: fmtInt(profiles.length), sub: `+${thisMonth} this month`, accent: "var(--blue)" },
    { label: "Total Trades", val: fmtInt(trades.length), sub: `${fmtInt(stats.monthTrades)} this month`, accent: "var(--violet)" },
    { label: "Total PnL", val: `$${fmt(stats.totalPnL)}`, sub: stats.totalPnL >= 0 ? "Net profitable" : "Net negative", accent: stats.totalPnL >= 0 ? "var(--green)" : "var(--red)" },
    { label: "Platform Win Rate", val: `${stats.winRate}%`, sub: `${stats.wins}W / ${stats.losses}L`, accent: stats.winRate >= 50 ? "var(--green)" : "var(--amber)" },
  ];

  return (
    <div className="fade-up">
      <div className="stats-row">
        {kpis.map((s, i) => (
          <div className="stat-card" key={i} style={{ borderTop: `2px solid ${s.accent}` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-val" style={{ color: s.accent }}>{s.val}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-head">
            <span className="card-title">Daily PnL — Last 14 Days</span>
            <span style={{ fontSize: 10, color: "var(--text3)" }}>across all users</span>
          </div>
          <div style={{ padding: "16px 8px 8px" }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dayChart} barCategoryGap="30%">
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "var(--text3)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pnl" name="PnL" radius={[2, 2, 0, 0]}>
                  {dayChart.map((entry, index) => (
                    <Cell key={index} fill={entry.pnl >= 0 ? "var(--blue)" : "var(--red)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Session Breakdown</span></div>
          {sessionData.map((s, i) => (
            <div className="metric-row" key={i}>
              <div>
                <div className="metric-label">{s.name}</div>
                <div className="prog-track" style={{ width: 100 }}>
                  <div className="prog-fill" style={{ width: `${s.winRate}%`, background: "var(--blue)" }} />
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="metric-val">{s.winRate}%</div>
                <div style={{ fontSize: 9, color: "var(--text3)" }}>{s.trades} trades</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><span className="card-title">Most Traded Pairs</span></div>
          <div className="card-body" style={{ paddingTop: 12, paddingBottom: 12 }}>
            {topPairs.map((p, i) => {
              const pct = trades.length ? Math.round(p.count / trades.length * 100) : 0;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span className="pair" style={{ minWidth: 80 }}>{p.pair}</span>
                  <div style={{ flex: 1, height: 4, background: "var(--border)", position: "relative" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${pct}%`, background: "var(--violet)" }} />
                  </div>
                  <span style={{ fontSize: 10, color: "var(--text2)", minWidth: 60, textAlign: "right" }}>{p.count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Platform Metrics</span></div>
          {[
            { label: "Avg Trades / User", val: profiles.length ? (trades.length / profiles.length).toFixed(1) : "0" },
            { label: "Avg PnL / Trade", val: trades.length ? `$${fmt(stats.totalPnL / trades.length)}` : "$0" },
            { label: "Best Single Trade", val: `$${fmt(stats.bestTrade)}` },
            { label: "Worst Single Trade", val: `$${fmt(stats.worstTrade)}` },
            { label: "Total Pips Generated", val: fmtInt(stats.totalPips) },
            { label: "Strategies Used", val: stats.strategies },
          ].map((m, i) => (
            <div className="metric-row" key={i}>
              <span className="metric-label">{m.label}</span>
              <span className="metric-val">{m.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Users ────────────────────────────────────────────────────────────────────
function Users({ data, onRefresh }: { data: AppData | null; onRefresh: () => void }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("trades");

  if (!data) return <div className="loading"><div className="spinner" /><span>Loading users...</span></div>;
  const { profiles, trades } = data;

  const enriched = profiles.map(p => {
    const ut = trades.filter(t => t.user_id === p.id);
    const wins = ut.filter(t => Number(t.pnl) > 0).length;
    const pnl = ut.reduce((s, t) => s + Number(t.pnl), 0);
    const pairs = [...new Set(ut.map(t => t.pair))];
    const sorted = [...ut].sort((a, b) => b.created_at.localeCompare(a.created_at));
    return { ...p, tradeCount: ut.length, winRate: ut.length ? Math.round(wins / ut.length * 100) : 0, pnl, pairs, lastTrade: sorted[0]?.created_at };
  });

  const filtered = enriched
    .filter(u => !search || (u.display_name || u.id).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "trades") return b.tradeCount - a.tradeCount;
      if (sort === "pnl") return b.pnl - a.pnl;
      if (sort === "winrate") return b.winRate - a.winRate;
      if (sort === "balance") return (Number(b.account_balance) || 0) - (Number(a.account_balance) || 0);
      return 0;
    });

  return (
    <div className="fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="search-input" placeholder="search users..." value={search} onChange={e => setSearch(e.target.value)} />
          <select
            style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text2)", padding: "7px 10px", fontFamily: "var(--mono)", fontSize: 11, outline: "none" }}
            value={sort} onChange={e => setSort(e.target.value)}>
            <option value="trades">Sort: Trades</option>
            <option value="pnl">Sort: PnL</option>
            <option value="winrate">Sort: Win Rate</option>
            <option value="balance">Sort: Balance</option>
          </select>
        </div>
        <button className="refresh-btn" onClick={onRefresh}>↻ Refresh</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>User</th><th>Balance</th><th>Trades</th><th>Win Rate</th>
                <th>Total PnL</th><th>Risk %</th><th>Top Pairs</th><th>Last Trade</th><th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} className="empty">No users found</td></tr>}
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="user-avi" style={{ background: aviColor(u.id), color: "#fff" }}>
                        {(u.display_name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: "var(--white)", fontFamily: "var(--sans)", fontWeight: 600 }}>{u.display_name || "Unnamed"}</div>
                        <div style={{ fontSize: 9, color: "var(--text3)" }}>{u.id.slice(0, 20)}…</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: "var(--sans)", fontWeight: 700, color: "var(--white)" }}>${fmtInt(u.account_balance)}</td>
                  <td>{u.tradeCount}</td>
                  <td style={{ color: u.winRate >= 50 ? "var(--green)" : u.winRate > 0 ? "var(--amber)" : "var(--text3)" }}>
                    {u.tradeCount > 0 ? `${u.winRate}%` : "—"}
                  </td>
                  <td style={{ fontFamily: "var(--sans)", fontWeight: 700, color: pnlColor(u.pnl) }}>
                    {u.tradeCount > 0 ? `$${fmt(u.pnl)}` : "—"}
                  </td>
                  <td style={{ color: "var(--text2)" }}>{u.default_risk_percent ?? 1}%</td>
                  <td>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", maxWidth: 140 }}>
                      {u.pairs.slice(0, 3).map(p => <span className="pair" key={p}>{p}</span>)}
                      {u.pairs.length > 3 && <span style={{ fontSize: 9, color: "var(--text3)" }}>+{u.pairs.length - 3}</span>}
                    </div>
                  </td>
                  <td style={{ fontSize: 10, color: "var(--text3)" }}>{u.lastTrade ? ago(u.lastTrade) : "—"}</td>
                  <td style={{ fontSize: 10, color: "var(--text3)" }}>{u.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Trades ───────────────────────────────────────────────────────────────────
function Trades({ data, onRefresh }: { data: AppData | null; onRefresh: () => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const PER = 25;

  if (!data) return <div className="loading"><div className="spinner" /><span>Loading trades...</span></div>;
  const { trades, profiles } = data;
  const profMap = Object.fromEntries(profiles.map(p => [p.id, p.display_name || "Unnamed"]));

  const filtered = [...trades]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .filter(t => {
      if (filter === "wins" && Number(t.pnl) <= 0) return false;
      if (filter === "losses" && Number(t.pnl) > 0) return false;
      if (search && !t.pair?.toLowerCase().includes(search.toLowerCase()) &&
        !t.strategy?.toLowerCase().includes(search.toLowerCase()) &&
        !(profMap[t.user_id] || "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

  const pages = Math.ceil(filtered.length / PER);
  const paged = filtered.slice(page * PER, (page + 1) * PER);

  return (
    <div className="fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="search-input" placeholder="pair, strategy, user…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }} />
          <div style={{ display: "flex" }}>
            {["all", "wins", "losses"].map(f => (
              <button key={f} className={`tab ${filter === f ? "active" : ""}`}
                style={{ padding: "7px 14px" }} onClick={() => { setFilter(f); setPage(0); }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "var(--text3)" }}>{filtered.length} trades</span>
          <button className="refresh-btn" onClick={onRefresh}>↻ Refresh</button>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>User</th><th>Pair</th><th>Dir</th><th>Strategy</th><th>Session</th>
                <th>Emotion</th><th>Conf</th><th>Entry</th><th>Exit</th><th>Size</th>
                <th>Pips</th><th>PnL</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && <tr><td colSpan={13} className="empty">No trades found</td></tr>}
              {paged.map(t => (
                <tr key={t.id}>
                  <td style={{ fontSize: 11, color: "var(--text2)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {profMap[t.user_id] || t.user_id?.slice(0, 8)}
                  </td>
                  <td><span className="pair">{t.pair}</span></td>
                  <td>
                    <span className={`badge ${t.direction === "long" ? "badge-green" : "badge-red"}`}>
                      <span className="badge-dot" />{t.direction}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: "var(--text2)" }}>{t.strategy}</td>
                  <td style={{ fontSize: 11, color: "var(--text3)" }}>{t.session}</td>
                  <td>
                    <span className={`badge ${t.emotion === "Confident" ? "badge-green" : t.emotion === "Fearful" ? "badge-amber" : t.emotion === "Greedy" ? "badge-red" : "badge-blue"}`}>
                      {t.emotion}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", color: `hsl(${t.confidence * 20 + 20},80%,60%)` }}>{"★".repeat(t.confidence)}</td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)" }}>{t.entry_price}</td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)" }}>{t.exit_price}</td>
                  <td style={{ fontSize: 11, color: "var(--text3)" }}>{t.position_size}</td>
                  <td style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: 11, color: Number(t.pips) >= 0 ? "var(--green)" : "var(--red)" }}>
                    {Number(t.pips) >= 0 ? "+" : ""}{t.pips}
                  </td>
                  <td style={{ fontFamily: "var(--sans)", fontWeight: 700, color: pnlColor(t.pnl) }}>
                    {Number(t.pnl) >= 0 ? "+" : ""}{fmt(t.pnl)}
                  </td>
                  <td style={{ fontSize: 10, color: "var(--text3)" }}>{t.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 6, alignItems: "center" }}>
            <button className="refresh-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ opacity: page === 0 ? 0.3 : 1 }}>← Prev</button>
            <span style={{ fontSize: 10, color: "var(--text3)" }}>Page {page + 1} / {pages}</span>
            <button className="refresh-btn" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)} style={{ opacity: page >= pages - 1 ? 0.3 : 1 }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function Analytics({ data }: { data: AppData | null }) {
  if (!data) return <div className="loading"><div className="spinner" /><span>Loading...</span></div>;
  const { trades } = data;

  const strategies = ["Breakout", "Trend", "Scalp", "Reversal", "News", "Support/Resistance"];
  const strategyData = strategies.map(s => {
    const st = trades.filter(t => t.strategy === s);
    const wins = st.filter(t => Number(t.pnl) > 0).length;
    const pnl = st.reduce((a, t) => a + Number(t.pnl), 0);
    return { name: s === "Support/Resistance" ? "S/R" : s.slice(0, 7), trades: st.length, winRate: st.length ? Math.round(wins / st.length * 100) : 0, pnl: Math.round(pnl * 100) / 100 };
  }).filter(s => s.trades > 0);

  const emotions = ["Fearful", "Neutral", "Confident", "Greedy"];
  const emotionData = emotions.map(e => {
    const et = trades.filter(t => t.emotion === e);
    const wins = et.filter(t => Number(t.pnl) > 0).length;
    const pnl = et.reduce((a, t) => a + Number(t.pnl), 0);
    return { name: e, trades: et.length, winRate: et.length ? Math.round(wins / et.length * 100) : 0, pnl: Math.round(pnl * 100) / 100 };
  }).filter(e => e.trades > 0);

  const longs = trades.filter(t => t.direction === "long").length;
  const shorts = trades.filter(t => t.direction === "short").length;
  const dirData = [{ name: "Long", value: longs }, { name: "Short", value: shorts }];

  const confData = [1, 2, 3, 4, 5].map(c => {
    const ct = trades.filter(t => t.confidence === c);
    const wins = ct.filter(t => Number(t.pnl) > 0).length;
    return { conf: `C${c}`, trades: ct.length, winRate: ct.length ? Math.round(wins / ct.length * 100) : 0 };
  });

  return (
    <div className="fade-up">
      <div className="grid-2">
        <div className="card">
          <div className="card-head"><span className="card-title">Strategy Win Rate</span></div>
          <div style={{ padding: "12px 8px 8px" }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={strategyData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--text3)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="winRate" name="Win Rate %" fill="var(--violet)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="table-wrap">
            <table className="tbl" style={{ fontSize: 11 }}>
              <thead><tr><th>Strategy</th><th>Trades</th><th>Win%</th><th>PnL</th></tr></thead>
              <tbody>
                {strategyData.map(s => (
                  <tr key={s.name}>
                    <td>{s.name}</td>
                    <td style={{ color: "var(--text2)" }}>{s.trades}</td>
                    <td style={{ color: s.winRate >= 50 ? "var(--green)" : "var(--red)" }}>{s.winRate}%</td>
                    <td style={{ color: pnlColor(s.pnl), fontFamily: "var(--sans)", fontWeight: 700 }}>${fmt(s.pnl)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Emotion vs Performance</span></div>
          <div style={{ padding: "12px 8px 8px" }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={emotionData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--text3)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="winRate" name="Win Rate %" fill="var(--cyan)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {emotionData.map(e => (
            <div className="metric-row" key={e.name}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ minWidth: 70, fontSize: 11 }}>{e.name}</span>
                <div style={{ width: 80, height: 3, background: "var(--border)" }}>
                  <div style={{ height: "100%", width: `${e.winRate}%`, background: "var(--cyan)" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
                <span style={{ color: "var(--text3)" }}>{e.trades} trades</span>
                <span style={{ color: e.winRate >= 50 ? "var(--green)" : "var(--red)" }}>{e.winRate}%</span>
                <span style={{ color: pnlColor(e.pnl), fontFamily: "var(--sans)", fontWeight: 700 }}>${fmt(e.pnl)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><span className="card-title">Long vs Short</span></div>
          <div style={{ display: "flex", alignItems: "center", padding: 24, gap: 32 }}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={dirData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                  <Cell fill="var(--green)" />
                  <Cell fill="var(--red)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {[{ label: "Long", val: longs, color: "var(--green)" }, { label: "Short", val: shorts, color: "var(--red)" }].map(d => (
                <div key={d.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--text2)" }}>{d.label}</span>
                    <span style={{ fontSize: 11, fontFamily: "var(--sans)", fontWeight: 700, color: d.color }}>
                      {d.val} ({trades.length ? Math.round(d.val / trades.length * 100) : 0}%)
                    </span>
                  </div>
                  <div style={{ height: 3, background: "var(--border)" }}>
                    <div style={{ height: "100%", width: `${trades.length ? d.val / trades.length * 100 : 0}%`, background: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Confidence vs Win Rate</span></div>
          <div style={{ padding: "12px 8px 8px" }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={confData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="conf" tick={{ fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--text3)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="winRate" name="Win Rate %" fill="var(--amber)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Database ─────────────────────────────────────────────────────────────────
function Database({ data, onRefresh }: { data: AppData | null; onRefresh: () => void }) {
  if (!data) return <div className="loading"><div className="spinner" /><span>Loading...</span></div>;
  const { trades, profiles } = data;

  const recentSignups = [...profiles].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);
  const recentTrades = [...trades].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8);

  const tables = [
    { name: "profiles", count: profiles.length, desc: "User profile data — display name, balance, risk settings, preferred pairs.", cols: ["id","display_name","account_balance","default_risk_percent","preferred_pairs","created_at","updated_at"] },
    { name: "trades", count: trades.length, desc: "All trade records — pair, direction, P&L, strategy, emotion, session.", cols: ["id","user_id","pair","direction","entry_price","exit_price","position_size","session","strategy","emotion","confidence","notes","screenshot","pnl","pips","created_at"] },
  ];

  return (
    <div className="fade-up">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="refresh-btn" onClick={onRefresh}>↻ Refresh</button>
      </div>

      <div className="section-title">Tables</div>
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {tables.map(t => (
          <div className="card" key={t.name}>
            <div className="card-head">
              <span className="card-title" style={{ fontFamily: "var(--mono)", color: "var(--cyan)" }}>public.{t.name}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <span className="badge badge-blue">{t.count} rows</span>
                <span className="badge badge-green"><span className="badge-dot" />RLS</span>
              </div>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 11, color: "var(--text2)", marginBottom: 12 }}>{t.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {t.cols.map(c => (
                  <span key={c} style={{ fontSize: 9, padding: "2px 6px", background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text3)", fontFamily: "var(--mono)" }}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><span className="card-title">Recent Sign-ups</span></div>
          <table className="tbl">
            <thead><tr><th>User</th><th>Balance</th><th>Joined</th></tr></thead>
            <tbody>
              {recentSignups.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="user-avi" style={{ width: 24, height: 24, background: aviColor(u.id), color: "#fff", fontSize: 10 }}>
                        {(u.display_name || "?")[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--white)" }}>{u.display_name || "Unnamed"}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: "var(--text2)" }}>${fmtInt(u.account_balance)}</td>
                  <td style={{ fontSize: 10, color: "var(--text3)" }}>{ago(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Recent Trade Records</span></div>
          <table className="tbl">
            <thead><tr><th>Pair</th><th>Dir</th><th>PnL</th><th>When</th></tr></thead>
            <tbody>
              {recentTrades.map(t => (
                <tr key={t.id}>
                  <td><span className="pair">{t.pair}</span></td>
                  <td><span className={`badge ${t.direction === "long" ? "badge-green" : "badge-red"}`} style={{ fontSize: 8 }}>{t.direction}</span></td>
                  <td style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 11, color: pnlColor(t.pnl) }}>{Number(t.pnl) >= 0 ? "+" : ""}{fmt(t.pnl)}</td>
                  <td style={{ fontSize: 10, color: "var(--text3)" }}>{ago(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 4 }}>Connection Info</div>
      <div className="card">
        {[
          { k: "Project URL", v: SUPABASE_URL },
          { k: "Postgres Version", v: "14.1" },
          { k: "Auth Provider", v: "Supabase Auth (email/password)" },
          { k: "Edge Functions", v: "ai-coach (Gemini integration)" },
          { k: "RLS", v: "Enabled on all tables" },
          { k: "Access Level", v: "service_role (full access)" },
        ].map((r, i) => (
          <div className="metric-row" key={i}>
            <span className="metric-label" style={{ minWidth: 160, color: "var(--text3)" }}>{r.k}</span>
            <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--cyan)" }}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Key Gate ─────────────────────────────────────────────────────────────────
function KeyGate({ onUnlock }: { onUnlock: (key: string) => void }) {
  const [key, setKey] = useState("");
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    const trimmed = key.trim();
    if (!trimmed) return;
    setChecking(true);
    setErr("");
    try {
      const res = await sbFetch("profiles", "?select=id&limit=1", trimmed);
      if (Array.isArray(res.data)) {
        onUnlock(trimmed);
      } else {
        setErr("Access denied — make sure you're using the service_role secret, not the anon key.");
      }
    } catch (e: any) {
      setErr("Connection failed: " + e.message);
    }
    setChecking(false);
  };

  return (
    <div className="gate-wrap">
      <div className="gate-card">
        <div className="gate-logo" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <img src="/navbar-logo.png" alt="TradinStar logo" style={{ height: 42, width: "auto", objectFit: "contain", maxWidth: 210, filter: "saturate(1.18) contrast(1.12) drop-shadow(0 1px 2px rgba(15,23,42,0.18))" }} />
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", opacity: 0.55 }}>ADMIN</span>
        </div>
        <div className="gate-sub">Service Role Authentication Required</div>
        <div className="gate-label">Supabase Service Role Key</div>
        <input
          className="gate-input"
          type="password"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          value={key}
          onChange={e => { setKey(e.target.value); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />
        <div className="gate-hint">
          This key bypasses Row Level Security and grants full read access across all users. Never share it publicly.
        </div>
        {err && <div className="gate-err">⚠ {err}</div>}
        <button className="gate-btn" onClick={handleSubmit} disabled={checking || !key.trim()}>
          {checking ? "Verifying…" : "Unlock Admin Panel →"}
        </button>
        <div className="gate-steps">
          <div className="gate-steps-title">How to get your service role key</div>
          {[
            <span key={0}>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: "var(--blue)" }}>supabase.com/dashboard</a> and open your project</span>,
            <span key={1}>Navigate to <strong style={{ color: "var(--white)" }}>Settings → API</strong></span>,
            <span key={2}>Copy the <strong style={{ color: "var(--cyan)" }}>service_role</strong> secret</span>,
            <span key={3}>Paste it above and click Unlock</span>,
          ].map((s, i) => (
            <div className="gate-step" key={i}>
              <div className="gate-step-num">{i + 1}</div>
              <div>{s}</div>
            </div>
          ))}
        </div>
        <div className="gate-warn">⚠ Keep this panel private. The service role key has unrestricted database access.</div>
      </div>
    </div>
  );
}

// ─── Nav Config ───────────────────────────────────────────────────────────────
type PageKey = "overview" | "users" | "trades" | "analytics" | "database";
const NAV_PAGES: Record<PageKey, { label: string; icon: string; component: React.ComponentType<{ data: AppData | null; onRefresh: () => void }> }> = {
  overview:  { label: "Overview",  icon: "◈", component: Overview },
  users:     { label: "Users",     icon: "◎", component: Users },
  trades:    { label: "Trades",    icon: "⇅", component: Trades },
  analytics: { label: "Analytics", icon: "▦", component: Analytics },
  database:  { label: "Database",  icon: "⊡", component: Database },
};

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function Admin() {
  injectStyles();

  const [serviceKey, setServiceKey] = useState<string | null>(null);
  const [page, setPage] = useState<PageKey>("overview");
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const [tradesRes, profilesRes] = await Promise.all([
        sbFetch("trades", "?select=*&order=created_at.desc", key),
        sbFetch("profiles", "?select=*&order=created_at.desc", key),
      ]);
      const trades: Trade[] = Array.isArray(tradesRes.data) ? tradesRes.data : [];
      const profiles: Profile[] = Array.isArray(profilesRes.data) ? profilesRes.data : [];

      const wins = trades.filter(t => Number(t.pnl) > 0).length;
      const totalPnL = trades.reduce((s, t) => s + Number(t.pnl), 0);
      const now = new Date();
      const monthTrades = trades.filter(t => {
        const d = new Date(t.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      const stats: Stats = {
        totalPnL: Math.round(totalPnL * 100) / 100,
        wins, losses: trades.length - wins,
        winRate: trades.length ? Math.round(wins / trades.length * 100) : 0,
        bestTrade: trades.length ? Math.max(...trades.map(t => Number(t.pnl))) : 0,
        worstTrade: trades.length ? Math.min(...trades.map(t => Number(t.pnl))) : 0,
        totalPips: Math.round(trades.reduce((s, t) => s + Number(t.pips), 0) * 10) / 10,
        strategies: new Set(trades.map(t => t.strategy)).size,
        monthTrades,
      };

      setData({ trades, profiles, stats });
      setLastFetch(new Date());
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  const handleUnlock = (key: string) => {
    setServiceKey(key);
    fetchAll(key);
  };

  if (!serviceKey) return <KeyGate onUnlock={handleUnlock} />;

  const { component: Page } = NAV_PAGES[page];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo-area">
          <img src="/navbar-logo.png" alt="TradinStar logo" style={{ height: 38, width: "auto", objectFit: "contain", maxWidth: 190, display: "block", marginBottom: 12, filter: "saturate(1.18) contrast(1.12) drop-shadow(0 1px 2px rgba(15,23,42,0.18))" }} />
          <div className="logo-title">Admin Panel</div>
          <div className="logo-tag">Developer Console</div>
        </div>
        <nav className="nav">
          <div className="nav-label">Monitor</div>
          {(Object.keys(NAV_PAGES) as PageKey[]).map(key => (
            <div key={key} className={`nav-item ${page === key ? "active" : ""}`} onClick={() => setPage(key)}>
              <span className="nav-icon">{NAV_PAGES[key].icon}</span>
              {NAV_PAGES[key].label}
            </div>
          ))}
          <div className="nav-label" style={{ marginTop: 16 }}>App Pages</div>
          {[{ label: "Dashboard", icon: "⌂" }, { label: "Log Trade", icon: "＋" }, { label: "Journal", icon: "≡" }, { label: "AI Coach", icon: "✦" }, { label: "Performance", icon: "↗" }].map(n => (
            <div key={n.label} className="nav-item" style={{ opacity: 0.5, cursor: "default" }}>
              <span className="nav-icon" style={{ fontSize: 12 }}>{n.icon}</span>
              {n.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {loading
            ? <div className="status-row"><div className="spinner" style={{ width: 8, height: 8, borderWidth: 1 }} /><span>Fetching…</span></div>
            : <div className="status-row"><div className="dot-pulse" /><span>service_role active</span></div>
          }
          {lastFetch && <div style={{ marginTop: 6, fontSize: 9, color: "var(--text3)" }}>Updated {ago(lastFetch.toISOString())}</div>}
          <button
            onClick={() => { setServiceKey(null); setData(null); }}
            style={{ marginTop: 10, background: "none", border: "1px solid var(--border)", color: "var(--text3)", padding: "5px 10px", cursor: "pointer", fontSize: 9, letterSpacing: 1, width: "100%", fontFamily: "var(--mono)" }}>
            ⎋ Revoke & Lock
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            TradinStar / <span className="topbar-page" style={{ marginLeft: 6 }}>{NAV_PAGES[page].label}</span>
          </div>
          <div className="topbar-right">
            {data && (
              <>
                <div className="tb-pill"><span style={{ color: "var(--green)" }}>●</span>{data.profiles.length} users</div>
                <div className="tb-pill"><span style={{ color: "var(--violet)" }}>●</span>{data.trades.length} trades</div>
                <div className="tb-pill warn"><span>$</span>{data.stats.totalPnL >= 0 ? "+" : ""}${fmt(data.stats.totalPnL)} platform PnL</div>
              </>
            )}
            <button className="tb-pill" onClick={() => fetchAll(serviceKey)} style={{ cursor: "pointer" }}>↻ Refresh</button>
          </div>
        </div>
        <div className="content">
          {error && (
            <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", padding: "12px 18px", marginBottom: 20, fontSize: 12, color: "var(--red)" }}>
              ⚠ {error}
            </div>
          )}
          {loading && !data
            ? <div className="loading" style={{ minHeight: 400 }}><div className="spinner" /><span>Loading all data…</span></div>
            : <Page data={data} onRefresh={() => fetchAll(serviceKey)} />
          }
        </div>
      </div>
    </div>
  );
}
