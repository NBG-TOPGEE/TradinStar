import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface TraderProfileBasic {
  onboarding_completed: boolean;
  experience: string | null;
  trading_style: string | null;
  strategies: string[];
  markets: string[];
  risk_per_trade: number | null;
  preferred_rr: number | null;
  goals: string[];
  discipline_score: number | null;
  consistency_score: number | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  traderProfile: TraderProfileBasic | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [traderProfile, setTraderProfile] = useState<TraderProfileBasic | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data } = await supabase
        .from("trader_profiles" as any)
        .select("onboarding_completed, experience, trading_style, strategies, markets, risk_per_trade, preferred_rr, goals, discipline_score, consistency_score")
        .eq("id", userId)
        .maybeSingle();
      setTraderProfile(data ?? null);
    } catch {
      setTraderProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (session?.user) await fetchProfile(session.user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setLoading(false);
      if (sess?.user) {
        fetchProfile(sess.user.id);
      } else {
        setTraderProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setLoading(false);
      if (sess?.user) fetchProfile(sess.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setTraderProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      session, user: session?.user ?? null,
      loading, traderProfile, profileLoading,
      refreshProfile, signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
