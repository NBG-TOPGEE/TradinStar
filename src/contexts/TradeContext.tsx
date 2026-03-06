import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Trade, loadTrades, addTrade as addTradeStorage, updateTrade as updateTradeStorage, deleteTrade as deleteTradeStorage } from "@/lib/trades";

interface TradeContextType {
  trades: Trade[];
  refresh: () => void;
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
}

const TradeContext = createContext<TradeContextType | null>(null);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(() => loadTrades());

  const refresh = useCallback(() => setTrades(loadTrades()), []);
  const add = useCallback((trade: Trade) => setTrades(addTradeStorage(trade)), []);
  const update = useCallback((id: string, updates: Partial<Trade>) => setTrades(updateTradeStorage(id, updates)), []);
  const remove = useCallback((id: string) => setTrades(deleteTradeStorage(id)), []);

  return (
    <TradeContext.Provider value={{ trades, refresh, addTrade: add, updateTrade: update, deleteTrade: remove }}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTrades() {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error("useTrades must be used within TradeProvider");
  return ctx;
}
