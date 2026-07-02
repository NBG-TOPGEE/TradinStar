import { useState, useRef, useEffect } from "react";
import { useTrades } from "@/contexts/TradeContext";
import { useAuth } from "@/contexts/AuthContext";
import { getStats } from "@/lib/trades";
import {
  Send, Bot, User, Sparkles, ImagePlus, X, Brain,
  TrendingUp, Clock, Zap, Target, ChevronRight,
  Award, AlertTriangle, CheckCircle2, ListChecks
} from "lucide-react";
import { useGemini } from "@/hooks/useGemini";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

// ── Build personalised system prompt from trader profile ──────────────────
function buildSystemPrompt(traderProfile: any | null, stats: any, trades: any[]) {
  const profileSection = traderProfile?.experience ? `
TRADER PROFILE:
- Experience: ${traderProfile.experience}
- Style: ${traderProfile.trading_style ?? "unknown"}
- Strategies: ${(traderProfile.strategies ?? []).join(", ") || "not set"}
- Markets: ${(traderProfile.markets ?? []).join(", ") || "not set"}
- Preferred Sessions: ${(traderProfile.trading_sessions ?? []).join(", ") || "not set"}
- Risk per trade: ${traderProfile.risk_per_trade ?? 1}%
- Preferred RR: 1:${traderProfile.preferred_rr ?? 2}
- Max trades/day: ${traderProfile.max_trades_per_day ?? 3}
- Goals: ${(traderProfile.goals ?? []).join(", ") || "not set"}
` : "";

  const statsSection = trades.length > 0 ? `
CURRENT PERFORMANCE:
- Total trades: ${stats.totalTrades}
- Win rate: ${stats.winRate}%
- Total P&L: $${stats.totalPnL.toFixed(2)}
- Avg win: $${stats.avgWin.toFixed(2)}
- Avg loss: $${stats.avgLoss.toFixed(2)}
- Best trade: $${stats.bestTrade.toFixed(2)}
- Worst trade: $${stats.worstTrade.toFixed(2)}
` : "\nNo trades logged yet.";

  return `You are an elite AI trading coach for TradinStar — a premium trading journal platform.
${profileSection}${statsSection}

Your role:
- Coach this specific trader based on their profile and real trade history above
- Be direct, specific, and actionable — never generic
- Reference their actual stats and strategy when relevant
- Push back on poor risk management without sugarcoating
- Celebrate genuine progress, not just participation
- For chart analysis: identify key levels, patterns, trend, and give a clear action plan with risk notes

Response format: conversational but structured. Use short paragraphs. Bold key numbers and recommendations. Be a coach, not a chatbot.`;
}

// ── Structured coaching card ──────────────────────────────────────────────
function CoachingPanel({ trades, stats, traderProfile, onPrompt }: {
  trades: any[]; stats: any; traderProfile: any;
  onPrompt: (p: string) => void;
}) {
  const winStreak = (() => {
    let s = 0;
    for (const t of [...trades].reverse()) { if (t.pnl > 0) s++; else break; }
    return s;
  })();

  const todayTrades = trades.filter(t =>
    new Date(t.timestamp).toDateString() === new Date().toDateString()
  );
  const todayPnL = todayTrades.reduce((s, t) => s + t.pnl, 0);

  // Best session
  const sessions = ["Sydney", "Tokyo", "London", "New York"];
  const bestSession = sessions.reduce((best, s) => {
    const st = trades.filter(t => t.session === s);
    const wins = st.filter(t => t.pnl > 0).length;
    const wr = st.length ? wins / st.length : 0;
    const bestSt = trades.filter(t => t.session === best);
    const bestWins = bestSt.filter(t => t.pnl > 0).length;
    const bestWr = bestSt.length ? bestWins / bestSt.length : 0;
    return wr > bestWr ? s : best;
  }, "London");

  // Best pair
  const pairGroups = trades.reduce<Record<string, any[]>>((a, t) => {
    a[t.pair] = a[t.pair] || [];
    a[t.pair].push(t);
    return a;
  }, {});
  const bestPair = Object.entries(pairGroups).reduce((best, [pair, ts]) => {
    const wr = ts.filter(t => t.pnl > 0).length / ts.length;
    const bestTs = pairGroups[best] ?? [];
    const bestWr = bestTs.length ? bestTs.filter((t: any) => t.pnl > 0).length / bestTs.length : 0;
    return wr > bestWr ? pair : best;
  }, Object.keys(pairGroups)[0] ?? "—");

  if (trades.length === 0) {
    return (
      <div className="px-4 pb-3">
        <div className="rounded-2xl p-5" style={{
          background: "hsl(217,92%,60%,0.06)",
          border: "1px solid hsl(217,92%,60%,0.14)"
        }}>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4" style={{ color: "hsl(217,92%,65%)" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(217,92%,65%)" }}>
              AI Coach
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: "hsl(215,15%,52%)" }}>
            Start logging trades to unlock personalised coaching, pattern detection, and performance reviews.
          </p>
          <div className="flex flex-wrap gap-2">
            {["How does the AI Coach work?", "What should I log first?", "Tips for new traders"].map(p => (
              <button key={p} onClick={() => onPrompt(p)}
                className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all hover:opacity-80"
                style={{ background: "hsl(217,92%,60%,0.12)", color: "hsl(217,92%,65%)", border: "1px solid hsl(217,92%,60%,0.2)" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-2 space-y-2">
      {/* Today strip */}
      {todayTrades.length > 0 && (
        <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{
          background: todayPnL >= 0 ? "hsl(158,68%,46%,0.07)" : "hsl(0,72%,58%,0.07)",
          border: `1px solid ${todayPnL >= 0 ? "hsl(158,68%,46%,0.16)" : "hsl(0,72%,58%,0.16)"}`
        }}>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" style={{ color: todayPnL >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)" }} />
            <span className="text-xs font-semibold" style={{ color: "hsl(215,15%,52%)" }}>
              Today · {todayTrades.length} trade{todayTrades.length > 1 ? "s" : ""}
            </span>
          </div>
          <span className="text-sm font-bold font-mono" style={{
            color: todayPnL >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)"
          }}>
            {todayPnL >= 0 ? "+" : ""}${todayPnL.toFixed(2)}
          </span>
        </div>
      )}

      {/* Stat pills */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Win Rate", value: `${stats.winRate}%`, good: stats.winRate >= 50, icon: Award },
          { label: "Best Session", value: bestSession.split(" ")[0], good: true, icon: Clock },
          { label: "Best Pair", value: bestPair, good: true, icon: Target },
          { label: "Streak", value: winStreak >= 1 ? `🔥${winStreak}` : "—", good: winStreak >= 2, icon: Zap },
        ].map(({ label, value, good, icon: Icon }) => (
          <div key={label} className="rounded-xl p-2.5 text-center" style={{
            background: "hsl(222,22%,11%)", border: "1px solid hsl(222,18%,16%)"
          }}>
            <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: "hsl(215,15%,36%)" }}>{label}</p>
            <p className="text-xs font-bold font-mono" style={{
              color: good ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)"
            }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Quick coaching actions */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Daily review", icon: ListChecks, prompt: "Give me a detailed review of my trading today", accent: "hsl(217,92%,60%)" },
          { label: "Weak spots", icon: AlertTriangle, prompt: "What are my biggest weaknesses and blind spots based on my trades?", accent: "hsl(38,92%,56%)" },
          { label: "Strengths", icon: CheckCircle2, prompt: "What are my strongest patterns and setups? What should I keep doing?", accent: "hsl(158,68%,46%)" },
          { label: "Action plan", icon: TrendingUp, prompt: "Give me a specific action plan to improve my win rate and consistency", accent: "hsl(280,65%,62%)" },
        ].map(({ label, icon: Icon, prompt, accent }) => (
          <button key={label} onClick={() => onPrompt(prompt)}
            className="flex items-center gap-2.5 rounded-xl p-3 text-left transition-all hover:opacity-80 active:scale-[0.98]"
            style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}>
            <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
            <span className="text-xs font-semibold" style={{ color: accent }}>{label}</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-50" style={{ color: accent }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AICoach page
// ─────────────────────────────────────────────────────────────────────────────
export default function AICoach() {
  const { trades } = useTrades();
  const { traderProfile, user } = useAuth();
  const stats = getStats(trades);
  const { chat, analyzeImage, loading: aiLoading, error: aiError } = useGemini();

  const systemPrompt = buildSystemPrompt(traderProfile, stats, trades);

  const buildGreeting = () => {
    const name = (user as any)?.user_metadata?.display_name?.split(" ")[0] || "trader";
    if (!traderProfile?.experience) {
      return "Hey! I'm your AI Coach. Complete your Trader DNA profile and start logging trades — I'll then give you personalised coaching, pattern detection, and weekly reviews.";
    }
    if (trades.length === 0) {
      const style = traderProfile.trading_style?.replace("_", " ") ?? "trader";
      const strategies = (traderProfile.strategies ?? []).slice(0, 2).join(" & ") || "your strategy";
      const sessions = (traderProfile.trading_sessions ?? []).slice(0, 2).join(" & ") || "your sessions";
      const assets = (traderProfile.favorite_assets ?? []).slice(0, 2).join(", ") || "your pairs";
      return `Welcome back, ${name}. I can see you're ${traderProfile.experience === "intermediate" ? "an" : "a"} **${traderProfile.experience} ${style}** focused on **${strategies}** — primarily trading **${assets}** during the **${sessions}** session.\n\nOnce you start logging trades, I'll identify your patterns and help you improve your consistency. For now, ask me anything about your setup or strategy.`;
    }
    return `Hey ${name}! You have **${stats.totalTrades} trades** logged with a **${stats.winRate}% win rate** and **$${stats.totalPnL.toFixed(2)} total P&L**.\n\nI've analysed your history. Ask me anything or use a quick action below.`;
  };

  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: buildGreeting(),
  }]);
  const [input, setInput] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showPanel, setShowPanel] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  const handleSend = async (overrideText?: string) => {
    const text = overrideText ?? input.trim();
    if (!text && !imageFile) return;

    setShowPanel(false);
    const userMsg: Message = { role: "user", content: text, image: previewImage ?? undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setPreviewImage(null);

    if (imageFile) {
      const file = imageFile;
      setImageFile(null);
      try {
        const analysis = await analyzeImage(file);
        setMessages(prev => [...prev, { role: "assistant", content: analysis }]);
      } catch (err: any) {
        setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
      }
      return;
    }

    try {
      const history = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: text },
      ];
      const response = await chat(history);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
    e.target.value = "";
  };

  const formatContent = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:hsl(210,30%,88%)">$1</strong>')
      .replace(/\n/g, "<br/>");

  return (
    <div className="max-w-lg mx-auto flex flex-col" style={{ height: "calc(100dvh - 3.5rem)", overflow: "hidden" }}>

      {/* ── HEADER ── */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center ai-active" style={{
              background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
              boxShadow: "0 4px 16px hsl(217,92%,60%,0.45)",
            }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: "hsl(210,30%,92%)" }}>AI Coach</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "hsl(158,68%,50%)" }} />
                <p className="text-[11px] font-medium" style={{ color: "hsl(215,15%,40%)" }}>
                  Online · Personalised to your profile
                </p>
              </div>
            </div>
          </div>
          {messages.length > 1 && (
            <button
              onClick={() => setShowPanel(p => !p)}
              className="text-[10px] font-semibold px-3 py-1.5 rounded-xl transition-all"
              style={{
                background: showPanel ? "hsl(217,92%,60%,0.12)" : "hsl(222,20%,13%)",
                color: showPanel ? "hsl(217,92%,65%)" : "hsl(215,15%,42%)",
                border: `1px solid ${showPanel ? "hsl(217,92%,60%,0.2)" : "hsl(222,18%,18%)"}`,
              }}
            >
              {showPanel ? "Hide panel" : "Show panel"}
            </button>
          )}
        </div>
      </div>

      {/* ── COACHING PANEL ── */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 overflow-hidden"
          >
            <CoachingPanel
              trades={trades}
              stats={stats}
              traderProfile={traderProfile}
              onPrompt={handleSend}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{
                  background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
                  boxShadow: "0 2px 8px hsl(217,92%,60%,0.3)",
                }}>
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className="max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={msg.role === "user" ? {
                  background: "linear-gradient(135deg, hsl(217,92%,55%), hsl(222,70%,40%))",
                  boxShadow: "0 4px 16px hsl(217,92%,60%,0.3)",
                  color: "white",
                } : {
                  background: "hsl(222,22%,12%)",
                  border: "1px solid hsl(222,18%,18%)",
                  color: "hsl(215,15%,62%)",
                  boxShadow: "0 2px 12px hsl(222,40%,4%,0.4)",
                }}
              >
                {msg.image && (
                  <img src={msg.image} alt="chart" className="rounded-xl mb-2 max-h-40 object-cover w-full" />
                )}
                <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{
                  background: "hsl(222,20%,16%)", border: "1px solid hsl(222,18%,20%)",
                }}>
                  <User className="w-3.5 h-3.5" style={{ color: "hsl(215,15%,50%)" }} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {aiLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ai-active" style={{
              background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
            }}>
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="rounded-2xl px-4 py-3" style={{
              background: "hsl(222,22%,12%)", border: "1px solid hsl(222,18%,18%)",
            }}>
              <div className="flex gap-1 items-center h-5">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "hsl(217,92%,60%)" }}
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div className="px-4 pb-4 pt-2 shrink-0 space-y-2">
        {aiError && (
          <p className="text-xs rounded-xl px-3 py-2" style={{
            background: "hsl(0,72%,58%,0.1)", color: "hsl(0,72%,65%)",
            border: "1px solid hsl(0,72%,58%,0.2)"
          }}>{aiError}</p>
        )}

        {previewImage && (
          <div className="relative inline-block">
            <img src={previewImage} alt="preview" className="h-16 rounded-xl object-cover"
              style={{ border: "1px solid hsl(222,18%,22%)" }} />
            <button onClick={() => { setPreviewImage(null); setImageFile(null); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "hsl(222,22%,18%)", border: "1px solid hsl(222,18%,24%)" }}>
              <X className="w-3 h-3" style={{ color: "hsl(210,20%,60%)" }} />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <button onClick={() => fileRef.current?.click()} disabled={aiLoading}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 hover:opacity-80"
            style={{ background: "hsl(222,22%,13%)", border: "1px solid hsl(222,18%,18%)", color: "hsl(215,15%,40%)" }}>
            <ImagePlus className="w-4 h-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask your coach anything..."
            disabled={aiLoading}
            className="flex-1 rounded-xl px-4 py-3 text-sm disabled:opacity-50 premium-input"
          />

          <button
            onClick={() => handleSend()}
            disabled={aiLoading || (!input.trim() && !imageFile)}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
              boxShadow: "0 4px 16px hsl(217,92%,60%,0.4)",
            }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
