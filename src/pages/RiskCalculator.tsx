import { useState, useMemo } from "react";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
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
    const pipValue = 10; // standard lot ~$10/pip
    const lotSize = dollarRisk / (sl * pipValue);
    const rrRatio = 2; // default 1:2

    return {
      dollarRisk: Math.round(dollarRisk * 100) / 100,
      lotSize: Math.round(lotSize * 100) / 100,
      rrRatio,
      riskLevel: risk <= 1 ? "low" : risk <= 2 ? "medium" : "high",
    };
  }, [balance, riskPercent, stopLossPips]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Risk Calculator</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Account Balance ($)</label>
          <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="10000" className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Risk Percentage (%)</label>
          <input type="number" step="0.1" value={riskPercent} onChange={e => setRiskPercent(e.target.value)} placeholder="1" className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground" />
          <div className="flex gap-2 mt-2">
            {["0.5", "1", "2", "3"].map(v => (
              <button key={v} onClick={() => setRiskPercent(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${riskPercent === v ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>
                {v}%
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Stop Loss (Pips)</label>
          <input type="number" value={stopLossPips} onChange={e => setStopLossPips(e.target.value)} placeholder="30" className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground" />
        </div>
      </div>

      {calc && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
          <div className={`rounded-xl p-4 border ${calc.riskLevel === "low" ? "border-profit/20 bg-profit\/10" : calc.riskLevel === "medium" ? "border-accent/20 bg-accent/10" : "border-loss/20 bg-loss\/10"}`}>
            <div className="flex items-center gap-2 mb-2">
              {calc.riskLevel === "low" ? <CheckCircle className="w-4 h-4 text-profit" /> : calc.riskLevel === "medium" ? <Shield className="w-4 h-4 text-accent" /> : <AlertTriangle className="w-4 h-4 text-loss" />}
              <span className="text-xs font-medium">
                {calc.riskLevel === "low" ? "Conservative Risk" : calc.riskLevel === "medium" ? "Moderate Risk" : "High Risk"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-xs text-muted-foreground">Lot Size</p>
              <p className="text-2xl font-bold font-mono text-foreground">{calc.lotSize}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-xs text-muted-foreground">Dollar Risk</p>
              <p className="text-2xl font-bold font-mono text-loss">${calc.dollarRisk}</p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-xs text-muted-foreground">At 1:2 RR, potential reward</p>
            <p className="text-xl font-bold font-mono text-profit">${(calc.dollarRisk * 2).toFixed(2)}</p>
          </div>
        </motion.div>
      )}
      <div className="h-8" />
    </div>
  );
}
