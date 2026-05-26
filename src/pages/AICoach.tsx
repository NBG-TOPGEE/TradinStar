import { useState, useRef, useEffect } from "react";
import { useTrades } from "@/contexts/TradeContext";
import { getStats } from "@/lib/trades";
import { Send, Bot, User, Sparkles, ImagePlus, X, Brain, TrendingUp, Clock, Zap } from "lucide-react";
import { useGemini } from "@/hooks/useGemini";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

const SUGGESTED = [
  "Analyze my performance",
  "Review my risk management",
  "What's my best session?",
  "Emotion impact on my trades",
];

const INSIGHT_CARDS = [
  { icon: TrendingUp, label: "Performance", color: "hsl(217,92%,65%)", bg: "hsl(217,92%,60%,0.1)" },
  { icon: Brain, label: "Psychology", color: "hsl(280,65%,65%)", bg: "hsl(280,65%,62%,0.1)" },
  { icon: Clock, label: "Sessions", color: "hsl(38,92%,62%)", bg: "hsl(38,92%,56%,0.1)" },
  { icon: Zap, label: "Strategy", color: "hsl(158,68%,55%)", bg: "hsl(158,68%,46%,0.1)" },
];

export default function AICoach() {
  const { trades } = useTrades();
  const stats = getStats(trades);
  const { chat, analyzeImage, loading: geminiLoading, error: geminiError, SYSTEM_PROMPT } = useGemini();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey trader! 👋 I'm your AI trading coach powered by Gemini. I can analyze your charts, review your strategy, and coach you based on your actual trade history. What would you like to work on?",
    },
  ]);
  const [input, setInput] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, geminiLoading]);

  const generateLocalResponse = (userMsg: string): string => {
    const msg = userMsg.toLowerCase();
    if (trades.length === 0) return "You haven't logged any trades yet. Start logging trades and I'll give you personalized insights!";
    if (msg.includes("performance") || msg.includes("stats")) {
      return `📊 **Performance Overview**\n\n• Total Trades: ${stats.totalTrades}\n• Win Rate: ${stats.winRate}%\n• Total P&L: $${stats.totalPnL.toFixed(2)}\n• Avg Win: $${stats.avgWin.toFixed(2)}\n• Avg Loss: $${stats.avgLoss.toFixed(2)}\n\n${stats.winRate >= 50 ? "✅ Your win rate is solid! Focus on maximizing those winners." : "⚠️ Win rate below 50%. Let's work on trade selection and patience."}`;
    }
    if (msg.includes("session")) {
      const sessions = ["Sydney", "Tokyo", "London", "New York"] as const;
      const breakdown = sessions.map(s => {
        const st = trades.filter(t => t.session === s);
        const wins = st.filter(t => t.pnl > 0).length;
        const wr = st.length ? Math.round((wins / st.length) * 100) : 0;
        return st.length > 0 ? `• ${s}: ${st.length} trades, ${wr}% win rate` : null;
      }).filter(Boolean);
      return `🕐 **Session Performance**\n\n${breakdown.join("\n")}\n\nFocus your energy on your best-performing sessions.`;
    }
    if (msg.includes("emotion")) {
      const emotions = ["Fearful", "Neutral", "Confident", "Greedy"] as const;
      const breakdown = emotions.map(e => {
        const et = trades.filter(t => t.emotion === e);
        const wins = et.filter(t => t.pnl > 0).length;
        const wr = et.length ? Math.round((wins / et.length) * 100) : 0;
        return et.length > 0 ? `• ${e}: ${wr}% win rate (${et.length} trades)` : null;
      }).filter(Boolean);
      return `🧠 **Emotion Analysis**\n\n${breakdown.join("\n")}\n\nTrade in your highest-performing emotional state.`;
    }
    return `I can help with:\n• "Analyze my performance"\n• "Session analysis"\n• "Emotion impact"\n• Upload a chart for visual analysis\n\nFor AI-powered coaching, make sure your API key is set!`;
  };

  const handleSend = async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text && !imageFile) return;

    const userMsg: Message = { role: "user", content: text, image: previewImage || undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setPreviewImage(null);

    const key = import.meta.env.VITE_GEMINI_API_KEY;

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

    if (key) {
      try {
        const tradeContext = trades.length > 0
          ? `\n\nTrader's stats: ${stats.totalTrades} trades, ${stats.winRate}% win rate, $${stats.totalPnL.toFixed(2)} total P&L.`
          : "";
        const history = [
          { role: "system" as const, content: SYSTEM_PROMPT + tradeContext },
          ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user" as const, content: text },
        ];
        const responseText = await chat(history);
        setMessages(prev => [...prev, { role: "assistant", content: responseText }]);
      } catch (err: any) {
        setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
      }
    } else {
      setMessages(prev => [...prev, { role: "assistant", content: generateLocalResponse(text) }]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
    e.target.value = "";
  };

  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-5rem)]">

      {/* ── HEADER ── */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center ai-active"
            style={{
              background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
              boxShadow: "0 4px 16px hsl(217,92%,60%,0.45)",
            }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "hsl(210,30%,92%)" }}>
              AI Coach
            </h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "hsl(158,68%,50%)" }} />
              <p className="text-[11px] font-medium" style={{ color: "hsl(215,15%,40%)" }}>
                Online · Powered by Gemini
              </p>
            </div>
          </div>
        </div>

        {/* Quick insight cards */}
        {messages.length <= 1 && trades.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-1">
            {INSIGHT_CARDS.map(({ icon: Icon, label, color, bg }) => (
              <button
                key={label}
                onClick={() => handleSend(label.toLowerCase())}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl transition-all hover:opacity-80 active:scale-95"
                style={{ background: bg, border: `1px solid ${color}20` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-[9px] font-semibold" style={{ color }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
                    boxShadow: "0 2px 8px hsl(217,92%,60%,0.3)",
                  }}
                >
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className="max-w-[82%] rounded-2xl px-4 py-3 text-sm"
                style={msg.role === "user" ? {
                  background: "linear-gradient(135deg, hsl(217,92%,55%), hsl(222,70%,40%))",
                  boxShadow: "0 4px 16px hsl(217,92%,60%,0.3)",
                  color: "white",
                } : {
                  background: "hsl(222,22%,12%)",
                  border: "1px solid hsl(222,18%,18%)",
                  color: "hsl(210,20%,80%)",
                  boxShadow: "0 2px 12px hsl(222,40%,4%,0.4)",
                }}
              >
                {msg.image && (
                  <img src={msg.image} alt="chart" className="rounded-xl mb-2 max-h-40 object-cover w-full" />
                )}
                <div
                  className="leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                />
              </div>
              {msg.role === "user" && (
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: "hsl(222,20%,16%)",
                    border: "1px solid hsl(222,18%,20%)",
                  }}
                >
                  <User className="w-3.5 h-3.5" style={{ color: "hsl(215,15%,50%)" }} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {geminiLoading && (
          <div className="flex gap-2.5 justify-start">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ai-active"
              style={{
                background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
                boxShadow: "0 2px 8px hsl(217,92%,60%,0.3)",
              }}
            >
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: "hsl(222,22%,12%)",
                border: "1px solid hsl(222,18%,18%)",
                boxShadow: "0 2px 12px hsl(222,40%,4%,0.4)",
              }}
            >
              <div className="flex gap-1 items-center h-5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
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

      {/* ── SUGGESTED PROMPTS ── */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
          {SUGGESTED.map(s => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-xl whitespace-nowrap transition-all hover:opacity-80"
              style={{
                background: "hsl(222,22%,13%)",
                border: "1px solid hsl(222,18%,20%)",
                color: "hsl(215,20%,55%)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── INPUT AREA ── */}
      <div className="px-4 pb-4 space-y-2">
        {geminiError && (
          <p
            className="text-xs rounded-xl px-3 py-2"
            style={{ background: "hsl(0,72%,58%,0.1)", color: "hsl(0,72%,65%)", border: "1px solid hsl(0,72%,58%,0.2)" }}
          >
            {geminiError}
          </p>
        )}

        {previewImage && (
          <div className="relative inline-block">
            <img src={previewImage} alt="preview" className="h-16 rounded-xl object-cover" style={{ border: "1px solid hsl(222,18%,22%)" }} />
            <button
              onClick={() => { setPreviewImage(null); setImageFile(null); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "hsl(222,22%,18%)", border: "1px solid hsl(222,18%,24%)" }}
            >
              <X className="w-3 h-3" style={{ color: "hsl(210,20%,60%)" }} />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={geminiLoading}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 hover:opacity-80"
            style={{
              background: "hsl(222,22%,13%)",
              border: "1px solid hsl(222,18%,18%)",
              color: "hsl(215,15%,40%)",
            }}
          >
            <ImagePlus className="w-4.5 h-4.5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask your coach anything..."
            disabled={geminiLoading}
            className="flex-1 rounded-xl px-4 py-3 text-sm disabled:opacity-50 premium-input"
          />
          <button
            onClick={() => handleSend()}
            disabled={geminiLoading || (!input.trim() && !imageFile)}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
              boxShadow: "0 4px 16px hsl(217,92%,60%,0.4)",
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
