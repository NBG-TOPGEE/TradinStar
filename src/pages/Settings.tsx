import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [preferredPairs, setPreferredPairs] = useState("");
  const [defaultRisk, setDefaultRisk] = useState<number | "">("");
  const [accountBalance, setAccountBalance] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, preferred_pairs, default_risk_percent, account_balance")
        .eq("id", user.id)
        .single();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else if (data) {
        setDisplayName(data.display_name || "");
        setPreferredPairs((data.preferred_pairs || []).join(", "));
        setDefaultRisk(data.default_risk_percent ?? "");
        setAccountBalance(data.account_balance ?? "");
      }
    };

    load();
  }, [user, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const updates: any = {
      display_name: displayName,
      preferred_pairs: preferredPairs
        ? preferredPairs.split(",").map((p) => p.trim()).filter(Boolean)
        : [],
      default_risk_percent: defaultRisk === "" ? null : Number(defaultRisk),
      account_balance: accountBalance === "" ? null : Number(accountBalance),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Profile settings updated." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Preferred Pairs (comma separated)</Label>
              <Input value={preferredPairs} onChange={(e) => setPreferredPairs(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Default Risk %</Label>
              <Input
                type="number"
                value={defaultRisk}
                onChange={(e) => setDefaultRisk(e.target.value === "" ? "" : Number(e.target.value))}
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Balance</Label>
              <Input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value === "" ? "" : Number(e.target.value))}
                min={0}
                step="0.01"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
