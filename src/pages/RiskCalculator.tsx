import { useState, useMemo } from "react";
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function RiskCalculator() {
  const [balance, setBalance] = useState("");
  const [riskPercent, setRiskPercent] = useState("1");
  const [stopLossPips, setStopLossPips] = useState("");

  const calc = useMemo(() => {
    const bal = parseFloat(balance) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const sl = parseFloat(stopLossPips) || 0;
    if (!bal || !risk || !sl) return null;
    const dollarRisk = bal * (risk / 100);
    const pipValue = 10;
    const lotSize = dollarRisk / (sl * pipValue);
    return {
      dollarRisk: Math.round(dollarRisk * 100) / 100,
      lotSize: Math.round(lotSize * 100) / 100,
      reward2: Math.round(dollarRisk * 2 * 100) / 100,
      reward3: Math.round(dollarRisk * 3 * 100) / 100,
      riskLevel: risk <= 1 ? "low" : risk <= 2 ? "medium" : "high",
    };
  }, [balance, riskPercent, stopLossPips]);

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-mono text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all";

  const riskColors = {
    low: { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, label: "Conservative — Well within safe limits" },
    medium: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", icon: <Shield className="w-4 h-4 text-amber-500" />, label: "Moderate — Acceptable, stay disciplined" },
    high: { border: "border-red-200", bg: "bg-red-50", text: "text-red-600", icon: <AlertTriangle className="w-4 h-4 text-red-500" />, label: "High Risk — Consider reducing exposure" },
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(222,60%,20%)" }}>
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Risk Calculator</h1>
          <p className="text-xs text-slate-400">Protect your capital</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Account Balance ($)</label>
          <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="10,000" className={inputClass} />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Risk Percentage</label>
          <input type="number" step="0.1" value={riskPercent} onChange={e => setRiskPercent(e.target.value)} placeholder="1" className={inputClass} />
          <div className="flex gap-2 mt-2">
            {["0.5", "1", "2", "3"].map(v => (
              <button key={v} onClick={() => setRiskPercent(v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${riskPercent === v ? "text-white" : "bg-white border border-slate-200 text-slate-500"}`}
                style={riskPercent === v ? { background: "hsl(222,60%,20%)" } : {}}>
                {v}%
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Stop Loss (Pips)</label>
          <input type="number" value={stopLossPips} onChange={e => setStopLossPips(e.target.value)} placeholder="30" className={inputClass} />
        </div>
      </div>

      {calc && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
          {/* Risk level badge */}
          <div className={`rounded-2xl p-3.5 border ${riskColors[calc.riskLevel].border} ${riskColors[calc.riskLevel].bg} flex items-center gap-2`}>
            {riskColors[calc.riskLevel].icon}
            <span className={`text-xs font-semibold ${riskColors[calc.riskLevel].text}`}>{riskColors[calc.riskLevel].label}</span>
          </div>

          {/* Main results */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-100" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.07)" }}>
              <p className="text-xs text-slate-500 font-medium mb-1">Lot Size</p>
              <p className="text-2xl font-bold font-mono text-slate-800">{calc.lotSize}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.07)" }}>
              <p className="text-xs text-slate-500 font-medium mb-1">Max Loss</p>
              <p className="text-2xl font-bold font-mono text-red-500">${calc.dollarRisk}</p>
            </div>
          </div>

          {/* Reward targets */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.07)" }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reward Targets</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-emerald-600 mb-1">1:2 RR</p>
                <p className="font-bold font-mono text-emerald-700">${calc.reward2}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-emerald-600 mb-1">1:3 RR</p>
                <p className="font-bold font-mono text-emerald-700">${calc.reward3}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      <div className="h-8" />
    </div>
  );
}
