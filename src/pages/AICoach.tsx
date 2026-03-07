import { useState, useRef, useEffect } from "react";
import { useTrades } from "@/contexts/TradeContext";
import { getStats } from "@/lib/trades";
import { Send, Bot, User, Sparkles, ImagePlus, X } from "lucide-react";
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
    return `I can help with:\n• "Analyze my performance"\n• "Session analysis"\n• "Emotion impact"\n• Upload a chart for visual analysis\n\nFor AI-powered coaching, make sure your Gemini API key is set!`;
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
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(217,90%,56%), hsl(222,60%,40%))" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">AI Coach</h1>
            <p className="text-[11px] text-slate-400">Powered by Gemini</p>
          </div>
        </div>
      </div>

      {/* Messages */}
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
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: "hsl(222,60%,20%)" }}>
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "text-white"
                  : "bg-white text-slate-700 border border-slate-100"
              }`}
              style={msg.role === "user" ? { background: "hsl(222,60%,20%)", boxShadow: "0 2px 8px hsl(222,60%,20%,0.25)" } : { boxShadow: "0 1px 3px hsl(220,14%,10%,0.07)" }}
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
                <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {geminiLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(222,60%,20%)" }}>
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3" style={{ boxShadow: "0 1px 3px hsl(220,14%,10%,0.07)" }}>
              <div className="flex gap-1 items-center h-5">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
          {SUGGESTED.map(s => (
            <button key={s} onClick={() => handleSend(s)}
              className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 whitespace-nowrap hover:border-blue-300 hover:text-blue-600 transition-all"
              style={{ boxShadow: "0 1px 3px hsl(220,14%,10%,0.06)" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pb-4 space-y-2">
        {geminiError && (
          <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{geminiError}</p>
        )}

        {/* Image preview */}
        {previewImage && (
          <div className="relative inline-block">
            <img src={previewImage} alt="preview" className="h-16 rounded-xl object-cover border border-slate-200" />
            <button onClick={() => { setPreviewImage(null); setImageFile(null); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={geminiLoading}
            className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-all shrink-0"
            style={{ boxShadow: "0 1px 3px hsl(220,14%,10%,0.06)" }}
          >
            <ImagePlus className="w-4.5 h-4.5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask your coach anything..."
            disabled={geminiLoading}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 disabled:opacity-50 outline-none focus:border-blue-300 transition-all"
            style={{ boxShadow: "0 1px 3px hsl(220,14%,10%,0.06)" }}
          />
          <button
            onClick={() => handleSend()}
            disabled={geminiLoading || (!input.trim() && !imageFile)}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style={{ background: "hsl(222,60%,20%)", boxShadow: "0 2px 8px hsl(222,60%,20%,0.3)" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
