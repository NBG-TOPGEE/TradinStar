import { useState } from "react";
import { useTrades } from "@/contexts/TradeContext";
import { getStats } from "@/lib/trades";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { useGemini } from "@/hooks/useGemini";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AICoach() {
  const { trades } = useTrades();
  const stats = getStats(trades);
  const { chat, analyzeImage, loading: geminiLoading, error: geminiError, SYSTEM_PROMPT } = useGemini();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey trader! 👋 I'm your AI trading coach. Ask me about your trading patterns, strategy performance, or emotional impact on your results. To enable full AI coaching, connect Lovable Cloud!"
    }
  ]);
  const [input, setInput] = useState("");

  const generateLocalResponse = (userMsg: string): string => {
    const msg = userMsg.toLowerCase();
    
    if (trades.length === 0) {
      return "You haven't logged any trades yet. Start by logging some trades, then I can analyze your performance patterns!";
    }

    if (msg.includes("performance") || msg.includes("stats") || msg.includes("overview")) {
      return `📊 **Performance Overview**\n\n- Total Trades: ${stats.totalTrades}\n- Win Rate: ${stats.winRate}%\n- Total P&L: $${stats.totalPnL.toFixed(2)}\n- Avg Win: $${stats.avgWin.toFixed(2)}\n- Avg Loss: $${stats.avgLoss.toFixed(2)}\n- Best Trade: $${stats.bestTrade.toFixed(2)}\n- Worst Trade: $${stats.worstTrade.toFixed(2)}\n\n${stats.winRate >= 50 ? "Your win rate is above 50% — solid!" : "Your win rate is below 50%. Focus on trade selection and patience."}`;
    }

    if (msg.includes("emotion") || msg.includes("psychology") || msg.includes("fear") || msg.includes("greed")) {
      const emotions = ["Fearful", "Neutral", "Confident", "Greedy"] as const;
      const emotionBreakdown = emotions.map(e => {
        const et = trades.filter(t => t.emotion === e);
        const wins = et.filter(t => t.pnl > 0).length;
        const wr = et.length ? Math.round((wins / et.length) * 100) : 0;
        return `- **${e}**: ${et.length} trades, ${wr}% win rate`;
      }).filter((_, i) => trades.some(t => t.emotion === (["Fearful", "Neutral", "Confident", "Greedy"] as const)[i]));
      return `🧠 **Emotional Analysis**\n\n${emotionBreakdown.join("\n")}\n\nTip: Track which emotional states lead to your best decisions and aim to trade primarily in those states.`;
    }

    if (msg.includes("session") || msg.includes("london") || msg.includes("tokyo") || msg.includes("new york")) {
      const sessions = ["Sydney", "Tokyo", "London", "New York"] as const;
      const sessionBreakdown = sessions.map(s => {
        const st = trades.filter(t => t.session === s);
        const wins = st.filter(t => t.pnl > 0).length;
        const wr = st.length ? Math.round((wins / st.length) * 100) : 0;
        return st.length > 0 ? `- **${s}**: ${st.length} trades, ${wr}% win rate` : null;
      }).filter(Boolean);
      return `🕐 **Session Analysis**\n\n${sessionBreakdown.join("\n")}\n\nFocus on sessions where your win rate is highest.`;
    }

    if (msg.includes("last") || msg.includes("recent") || msg.includes("analyze")) {
      const recent = trades.slice(0, 5);
      const summary = recent.map(t => `- ${t.pair} ${t.direction.toUpperCase()}: ${t.pnl >= 0 ? "+" : ""}$${t.pnl.toFixed(2)} (${t.strategy}, ${t.emotion})`).join("\n");
      return `📋 **Recent Trades**\n\n${summary}\n\nLook for patterns in your winning vs losing trades.`;
    }

    return `I can help you analyze:\n- **"My performance"** — overall stats\n- **"Emotion analysis"** — how emotions affect results\n- **"Session analysis"** — best trading sessions\n- **"Analyze recent trades"** — review last trades\n\nFor full AI coaching with Gemini, enable Lovable Cloud!`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // if Gemini API key is configured, use remote model
    const key = import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (key) {
      try {
        const history = [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
          userMsg,
        ];
        const responseText = await chat(history as any);
        setMessages(prev => [...prev, { role: "assistant", content: responseText }]);
      } catch (err: any) {
        setMessages(prev => [...prev, { role: "assistant", content: `[error] ${err.message}` }]);
      }
    } else {
      const assistantMsg: Message = { role: "assistant", content: generateLocalResponse(input) };
      setMessages(prev => [...prev, assistantMsg]);
    }
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-5rem)]">
      <div className="px-4 pt-6 pb-3 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-bold">AI Coach</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && <Bot className="w-6 h-6 text-primary shrink-0 mt-1" />}
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
              msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
            }`}>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{msg.content}</pre>
            </div>
            {msg.role === "user" && <User className="w-6 h-6 text-muted-foreground shrink-0 mt-1" />}
          </div>
        ))}
      </div>

      <div className="p-4 space-y-2">
        {geminiError && (
          <div className="text-sm text-destructive">Error: {geminiError}</div>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask about your trading..."
            disabled={geminiLoading}
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50"
          />
          <button onClick={handleSend} disabled={geminiLoading} className="bg-primary text-primary-foreground rounded-xl px-4 py-3">
            {geminiLoading ? "..." : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div>
          <label className="block text-sm mb-1">Upload chart/image</label>
          <input
            type="file"
            accept="image/*"
            disabled={geminiLoading}
            onChange={async e => {
              const file = e.target.files?.[0];
              if (!file) return;
              setMessages(prev => [...prev, { role: "user", content: "[image sent]" }]);
              try {
                const analysis = await analyzeImage(file);
                setMessages(prev => [...prev, { role: "assistant", content: analysis }]);
              } catch (err: any) {
                setMessages(prev => [...prev, { role: "assistant", content: `[error] ${err.message}` }]);
              }
            }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
