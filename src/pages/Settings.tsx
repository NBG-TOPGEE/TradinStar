import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Cog, User, Save } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || "");
  const [preferredPairs, setPreferredPairs] = useState(user?.user_metadata?.preferred_pairs || "");
  const [defaultRisk, setDefaultRisk] = useState(user?.user_metadata?.default_risk || "1");
  const [accountBalance, setAccountBalance] = useState(user?.user_metadata?.account_balance || "10000");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName, preferred_pairs: preferredPairs, default_risk: defaultRisk, account_balance: accountBalance },
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Settings saved!");
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all";

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(222,60%,20%)" }}>
          <Cog className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 1px 4px hsl(220,14%,10%,0.07)" }}>
        {/* Profile section header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Profile Settings</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Display Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your trading name" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Preferred Pairs</label>
            <input value={preferredPairs} onChange={e => setPreferredPairs(e.target.value)} placeholder="EUR/USD, GBP/USD, XAU/USD" className={inputClass} />
            <p className="text-[11px] text-slate-400 mt-1">Comma separated</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Default Risk %</label>
              <input type="number" step="0.1" value={defaultRisk} onChange={e => setDefaultRisk(e.target.value)} placeholder="1" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Account Balance</label>
              <input type="number" value={accountBalance} onChange={e => setAccountBalance(e.target.value)} placeholder="10000" className={inputClass} />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full text-white rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: "hsl(222,60%,20%)", boxShadow: "0 4px 14px hsl(222,60%,20%,0.25)" }}>
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
