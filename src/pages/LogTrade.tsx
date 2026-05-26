import { useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTrades } from "@/contexts/TradeContext";
import { Trade, TradeDirection, TradingSession, TradingStrategy, TradeEmotion, TRADING_PAIRS, MARKET_PAIRS, MarketType, calculatePnL } from "@/lib/trades";
import { Star, ArrowUp, ArrowDown, ChevronLeft, Upload, Clipboard, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SESSIONS: TradingSession[] = ["Sydney", "Tokyo", "London", "New York"];
const STRATEGIES: TradingStrategy[] = ["Breakout", "Trend", "Scalp", "Reversal", "News", "Support/Resistance"];
const EMOTIONS: TradeEmotion[] = ["Fearful", "Neutral", "Confident", "Greedy"];
const EMOTION_EMOJI: Record<TradeEmotion, string> = { Fearful: "😰", Neutral: "😐", Confident: "💪", Greedy: "🤑" };

const LABEL_STYLE = {
  fontSize: "0.65rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "hsl(215,15%,35%)",
  marginBottom: "0.5rem",
  display: "block",
};

const INACTIVE_BTN = {
  background: "hsl(222,22%,12%)",
  border: "1px solid hsl(222,18%,17%)",
  color: "hsl(215,15%,45%)",
};

export default function LogTrade() {
  const { addTrade } = useTrades();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pair, setPair] = useState(TRADING_PAIRS[0]);
  const [marketType, setMarketType] = useState<MarketType>("Forex");
  const [direction, setDirection] = useState<TradeDirection>("long");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [session, setSession] = useState<TradingSession>("London");
  const [strategy, setStrategy] = useState<TradingStrategy>("Breakout");
  const [emotion, setEmotion] = useState<TradeEmotion>("Neutral");
  const [confidence, setConfidence] = useState(3);
  const [notes, setNotes] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const calc = useMemo(() => calculatePnL(pair, direction, parseFloat(entryPrice) || 0, parseFloat(exitPrice) || 0, parseFloat(positionSize) || 0), [pair, direction, entryPrice, exitPrice, positionSize]);

  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], "pasted-chart.png", { type: imageType });
          processImageFile(file);
          toast.success("Chart pasted!");
          return;
        }
      }
      toast.error("No image found in clipboard");
    } catch {
      toast.error("Clipboard access denied. Try uploading instead.");
    }
  }, [processImageFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  }, [processImageFile]);

  const uploadScreenshot = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("screenshots").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) { console.error(error); return null; }
    const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!entryPrice || !exitPrice || !positionSize) { toast.error("Please fill in all price fields"); return; }
    setUploading(true);
    let screenshotUrl: string | undefined;
    if (screenshotFile) {
      const url = await uploadScreenshot(screenshotFile);
      if (url) {
        screenshotUrl = url;
      } else {
        screenshotUrl = screenshotPreview ?? undefined;
        toast.warning("Using local image storage");
      }
    }
    await addTrade({
      id: crypto.randomUUID(), pair, direction,
      entryPrice: parseFloat(entryPrice), exitPrice: parseFloat(exitPrice),
      positionSize: parseFloat(positionSize), session, strategy, emotion,
      confidence, notes, screenshot: screenshotUrl,
      pnl: calc.pnl, pips: calc.pips,
      timestamp: new Date().toISOString(),
    });
    setUploading(false);
    toast.success("Trade logged!");
    navigate("/dashboard");
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
          style={{ background: "hsl(222,22%,13%)", border: "1px solid hsl(222,18%,18%)", color: "hsl(215,15%,50%)" }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold" style={{ color: "hsl(210,30%,92%)" }}>Log Trade</h1>
      </div>

      {/* Live P&L preview */}
      {(entryPrice && exitPrice && positionSize) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 mb-6"
          style={{
            background: calc.pnl >= 0 ? "hsl(158,68%,46%,0.08)" : "hsl(0,72%,58%,0.08)",
            border: `1px solid ${calc.pnl >= 0 ? "hsl(158,68%,46%,0.2)" : "hsl(0,72%,58%,0.2)"}`,
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: "hsl(215,15%,40%)" }}>Estimated P&L</p>
              <p
                className="text-2xl font-bold font-mono"
                style={{ color: calc.pnl >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)" }}
              >
                {calc.pnl >= 0 ? "+" : ""}${calc.pnl.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium mb-0.5" style={{ color: "hsl(215,15%,40%)" }}>Pips</p>
              <p
                className="text-lg font-bold font-mono"
                style={{ color: calc.pips >= 0 ? "hsl(158,68%,55%)" : "hsl(0,72%,65%)" }}
              >
                {calc.pips > 0 ? "+" : ""}{calc.pips}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-5">
        {/* Market type */}
        <div>
          <label style={LABEL_STYLE}>Market Type</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {(["Forex", "Crypto", "Indices", "Commodities"] as MarketType[]).map(m => (
              <button
                key={m}
                onClick={() => { setMarketType(m); setPair(MARKET_PAIRS[m][0]); }}
                className="py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={marketType === m ? {
                  background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
                  color: "white",
                  boxShadow: "0 4px 12px hsl(217,92%,60%,0.35)",
                  border: "1px solid transparent",
                } : INACTIVE_BTN}
              >
                {m === "Forex" ? "🌍" : m === "Crypto" ? "₿" : m === "Indices" ? "📈" : "🏅"} {m}
              </button>
            ))}
          </div>

          <label style={LABEL_STYLE}>Trading Pair</label>
          <select
            value={pair}
            onChange={e => setPair(e.target.value)}
            className="w-full rounded-xl px-3.5 py-3 text-sm premium-input"
          >
            {MARKET_PAIRS[marketType].map(p => <option key={p} style={{ background: "hsl(222,22%,10%)" }}>{p}</option>)}
          </select>
        </div>

        {/* Direction */}
        <div>
          <label style={LABEL_STYLE}>Direction</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDirection("long")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
              style={direction === "long" ? {
                background: "linear-gradient(135deg, hsl(158,68%,46%), hsl(158,68%,36%))",
                color: "white",
                boxShadow: "0 4px 16px hsl(158,68%,46%,0.4)",
                border: "1px solid hsl(158,68%,46%,0.3)",
              } : { ...INACTIVE_BTN }}
            >
              <ArrowUp className="w-4 h-4" /> Long
            </button>
            <button
              onClick={() => setDirection("short")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
              style={direction === "short" ? {
                background: "linear-gradient(135deg, hsl(0,72%,58%), hsl(0,72%,44%))",
                color: "white",
                boxShadow: "0 4px 16px hsl(0,72%,58%,0.4)",
                border: "1px solid hsl(0,72%,58%,0.3)",
              } : { ...INACTIVE_BTN }}
            >
              <ArrowDown className="w-4 h-4" /> Short
            </button>
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={LABEL_STYLE}>Entry Price</label>
            <input type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="0.00" className="w-full rounded-xl px-3.5 py-3 text-sm font-mono premium-input" />
          </div>
          <div>
            <label style={LABEL_STYLE}>Exit Price</label>
            <input type="number" step="any" value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="0.00" className="w-full rounded-xl px-3.5 py-3 text-sm font-mono premium-input" />
          </div>
        </div>

        <div>
          <label style={LABEL_STYLE}>Position Size (Lots)</label>
          <input type="number" step="any" value={positionSize} onChange={e => setPositionSize(e.target.value)} placeholder="1.0" className="w-full rounded-xl px-3.5 py-3 text-sm font-mono premium-input" />
        </div>

        {/* Session */}
        <div>
          <label style={LABEL_STYLE}>Session</label>
          <div className="grid grid-cols-4 gap-2">
            {SESSIONS.map(s => (
              <button
                key={s}
                onClick={() => setSession(s)}
                className="py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={session === s ? {
                  background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
                  color: "white",
                  boxShadow: "0 4px 12px hsl(217,92%,60%,0.35)",
                  border: "1px solid transparent",
                } : INACTIVE_BTN}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy */}
        <div>
          <label style={LABEL_STYLE}>Strategy</label>
          <div className="grid grid-cols-3 gap-2">
            {STRATEGIES.map(s => (
              <button
                key={s}
                onClick={() => setStrategy(s)}
                className="py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={strategy === s ? {
                  background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,42%))",
                  color: "white",
                  boxShadow: "0 4px 12px hsl(217,92%,60%,0.35)",
                  border: "1px solid transparent",
                } : INACTIVE_BTN}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Emotion */}
        <div>
          <label style={LABEL_STYLE}>Emotional State</label>
          <div className="grid grid-cols-4 gap-2">
            {EMOTIONS.map(e => (
              <button
                key={e}
                onClick={() => setEmotion(e)}
                className="py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 active:scale-95"
                style={emotion === e ? {
                  background: "hsl(222,22%,18%)",
                  color: "hsl(210,30%,92%)",
                  border: "1px solid hsl(217,92%,60%,0.4)",
                  boxShadow: "0 0 12px hsl(217,92%,60%,0.15)",
                } : INACTIVE_BTN}
              >
                <span>{EMOTION_EMOJI[e]}</span>
                <span>{e}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Confidence */}
        <div>
          <label style={LABEL_STYLE}>Confidence</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setConfidence(n)} className="transition-transform hover:scale-110 active:scale-95">
                <Star
                  className="w-7 h-7 transition-all"
                  style={{
                    fill: n <= confidence ? "hsl(38,92%,56%)" : "transparent",
                    color: n <= confidence ? "hsl(38,92%,56%)" : "hsl(222,18%,22%)",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Chart Screenshot */}
        <div>
          <label style={LABEL_STYLE}>
            Chart Screenshot <span style={{ color: "hsl(215,15%,30%)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>

          {screenshotPreview ? (
            <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid hsl(222,18%,18%)" }}>
              <img src={screenshotPreview} alt="Chart preview" className="w-full h-40 object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(222,22%,10%,0.5), transparent)" }} />
              <button
                onClick={() => { setScreenshotPreview(null); setScreenshotFile(null); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{ background: "hsl(222,28%,8%,0.8)", color: "hsl(210,20%,65%)", border: "1px solid hsl(222,18%,20%)" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-3 text-xs font-medium" style={{ color: "hsl(158,68%,55%)" }}>
                ✓ Chart ready
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className="border-2 border-dashed rounded-xl p-5 transition-all"
              style={{
                borderColor: isDragging ? "hsl(217,92%,60%,0.6)" : "hsl(222,18%,18%)",
                background: isDragging ? "hsl(217,92%,60%,0.06)" : "hsl(222,22%,10%)",
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "hsl(222,20%,14%)", border: "1px solid hsl(222,18%,19%)" }}
                >
                  <ImageIcon className="w-5 h-5" style={{ color: "hsl(215,15%,38%)" }} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium" style={{ color: "hsl(210,20%,60%)" }}>Drop your chart here</p>
                  <p className="text-xs mt-0.5" style={{ color: "hsl(215,15%,35%)" }}>PNG, JPG up to 10MB</p>
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                    style={{ background: "hsl(222,20%,14%)", border: "1px solid hsl(222,18%,19%)", color: "hsl(215,15%,45%)" }}
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                  <button
                    onClick={handlePaste}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                    style={{ background: "hsl(222,20%,14%)", border: "1px solid hsl(222,18%,19%)", color: "hsl(215,15%,45%)" }}
                  >
                    <Clipboard className="w-3.5 h-3.5" /> Paste
                  </button>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label style={LABEL_STYLE}>Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Observations, lessons, mistakes..."
            className="w-full rounded-xl px-3.5 py-3 text-sm resize-none premium-input"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="w-full text-white rounded-2xl py-4 font-bold text-sm mt-2 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, hsl(217,92%,60%), hsl(222,70%,40%))",
            boxShadow: "0 6px 24px hsl(217,92%,60%,0.4)",
            border: "1px solid hsl(217,92%,70%,0.2)",
          }}
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : "Save Trade"}
        </button>
      </div>
      <div className="h-8" />
    </div>
  );
}
