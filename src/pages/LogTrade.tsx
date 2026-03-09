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

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-mono text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all";
  const selectClass = "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 transition-all";

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Log Trade</h1>
      </div>

      {(entryPrice && exitPrice && positionSize) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 mb-6 border ${calc.pnl >= 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Estimated P&L</p>
              <p className={`text-2xl font-bold font-mono ${calc.pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {calc.pnl >= 0 ? "+" : ""}${calc.pnl.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Pips</p>
              <p className={`text-lg font-bold font-mono ${calc.pips >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {calc.pips > 0 ? "+" : ""}{calc.pips}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Market Type</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {(["Forex", "Crypto", "Indices", "Commodities"] as MarketType[]).map(m => (
              <button key={m} onClick={() => { setMarketType(m); setPair(MARKET_PAIRS[m][0]); }}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${marketType === m ? "text-white" : "bg-white border border-slate-200 text-slate-500"}`}
                style={marketType === m ? { background: "hsl(217,90%,56%)" } : {}}>
                {m === "Forex" ? "🌍" : m === "Crypto" ? "₿" : m === "Indices" ? "📈" : "🏅"} {m}
              </button>
            ))}
          </div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Trading Pair</label>
          <select value={pair} onChange={e => setPair(e.target.value)} className={selectClass}>
            {MARKET_PAIRS[marketType].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Direction</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDirection("long")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${direction === "long" ? "text-white" : "bg-white border border-slate-200 text-slate-500"}`}
              style={direction === "long" ? { background: "hsl(152,65%,38%)", boxShadow: "0 2px 8px hsl(152,65%,38%,0.3)" } : {}}>
              <ArrowUp className="w-4 h-4" /> Long
            </button>
            <button onClick={() => setDirection("short")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${direction === "short" ? "text-white" : "bg-white border border-slate-200 text-slate-500"}`}
              style={direction === "short" ? { background: "hsl(0,72%,51%)", boxShadow: "0 2px 8px hsl(0,72%,51%,0.3)" } : {}}>
              <ArrowDown className="w-4 h-4" /> Short
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Entry Price</label>
            <input type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="0.00" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Exit Price</label>
            <input type="number" step="any" value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="0.00" className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Position Size (Lots)</label>
          <input type="number" step="any" value={positionSize} onChange={e => setPositionSize(e.target.value)} placeholder="1.0" className={inputClass} />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Session</label>
          <div className="grid grid-cols-4 gap-2">
            {SESSIONS.map(s => (
              <button key={s} onClick={() => setSession(s)}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${session === s ? "text-white" : "bg-white border border-slate-200 text-slate-500"}`}
                style={session === s ? { background: "hsl(222,60%,20%)" } : {}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Strategy</label>
          <div className="grid grid-cols-3 gap-2">
            {STRATEGIES.map(s => (
              <button key={s} onClick={() => setStrategy(s)}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${strategy === s ? "text-white" : "bg-white border border-slate-200 text-slate-500"}`}
                style={strategy === s ? { background: "hsl(217,90%,56%)" } : {}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Emotional State</label>
          <div className="grid grid-cols-4 gap-2">
            {EMOTIONS.map(e => (
              <button key={e} onClick={() => setEmotion(e)}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 ${emotion === e ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-500"}`}>
                <span>{EMOTION_EMOJI[e]}</span>
                <span>{e}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Confidence</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setConfidence(n)}>
                <Star className={`w-7 h-7 transition-all ${n <= confidence ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Chart Screenshot */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">
            Chart Screenshot <span className="text-slate-300 font-normal normal-case">(optional)</span>
          </label>

          {screenshotPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200">
              <img src={screenshotPreview} alt="Chart preview" className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <button
                onClick={() => { setScreenshotPreview(null); setScreenshotFile(null); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-3 text-white text-xs font-medium opacity-80">
                ✓ Chart ready
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 transition-all ${isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50/50"}`}>
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-600">Drop your chart here</p>
                  <p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 10MB</p>
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all">
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                  <button
                    onClick={handlePaste}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all">
                    <Clipboard className="w-3.5 h-3.5" /> Paste
                  </button>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wide">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Observations, lessons, mistakes..." className={`${inputClass} resize-none font-sans`} />
        </div>

        <button onClick={handleSubmit} disabled={uploading}
          className="w-full text-white rounded-2xl py-4 font-bold text-sm mt-2 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: "hsl(222,60%,20%)", boxShadow: "0 4px 14px hsl(222,60%,20%,0.3)" }}>
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
