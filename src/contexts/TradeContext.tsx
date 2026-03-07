import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Trade, rowToTrade, tradeToRow } from "@/lib/trades";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TradeContextType {
  trades: Trade[];
  loading: boolean;
  refresh: () => void;
  addTrade: (trade: Trade) => Promise<void>;
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
}

const TradeContext = createContext<TradeContextType | null>(null);

export function TradeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = useCallback(async () => {
    if (!user) { setTrades([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setTrades(data.map(rowToTrade));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const refresh = useCallback(() => { fetchTrades(); }, [fetchTrades]);

  const addTrade = useCallback(async (trade: Trade) => {
    if (!user) return;
    const row = tradeToRow(trade, user.id);
    const { error } = await supabase.from("trades").insert(row as any);
    if (!error) setTrades(prev => [trade, ...prev]);
  }, [user]);

  const updateTrade = useCallback(async (id: string, updates: Partial<Trade>) => {
    if (!user) return;
    const dbUpdates: Record<string, any> = {};
    if (updates.pair !== undefined) dbUpdates.pair = updates.pair;
    if (updates.direction !== undefined) dbUpdates.direction = updates.direction;
    if (updates.entryPrice !== undefined) dbUpdates.entry_price = updates.entryPrice;
    if (updates.exitPrice !== undefined) dbUpdates.exit_price = updates.exitPrice;
    if (updates.positionSize !== undefined) dbUpdates.position_size = updates.positionSize;
    if (updates.session !== undefined) dbUpdates.session = updates.session;
    if (updates.strategy !== undefined) dbUpdates.strategy = updates.strategy;
    if (updates.emotion !== undefined) dbUpdates.emotion = updates.emotion;
    if (updates.confidence !== undefined) dbUpdates.confidence = updates.confidence;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.screenshot !== undefined) dbUpdates.screenshot = updates.screenshot;
    if (updates.pnl !== undefined) dbUpdates.pnl = updates.pnl;
    if (updates.pips !== undefined) dbUpdates.pips = updates.pips;

    const { error } = await supabase.from("trades").update(dbUpdates).eq("id", id).eq("user_id", user.id);
    if (!error) setTrades(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [user]);

  const deleteTrade = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("trades").delete().eq("id", id).eq("user_id", user.id);
    if (!error) setTrades(prev => prev.filter(t => t.id !== id));
  }, [user]);

  return (
    <TradeContext.Provider value={{ trades, loading, refresh, addTrade, updateTrade, deleteTrade }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error("useTrades must be used within TradeProvider");
  return ctx;
}
