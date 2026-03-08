import { useRef } from "react";
import { Trade } from "@/lib/trades";
import { X, Download, Share2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { toast } from "sonner";

interface ShareCardProps {
  trade: Trade;
  onClose: () => void;
}

export default function ShareCard({ trade, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const isWin = trade.pnl >= 0;
  const dateStr = new Date(trade.timestamp).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const handleDownload = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      if (!cardRef.current) return;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `piptracker-${trade.pair.replace("/", "")}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Trade card saved!");
    } catch {
      toast.error("Download failed. Try screenshot instead.");
    }
  };

  const handleShare = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      if (!cardRef.current) return;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.share) {
          const file = new File([blob], "trade.png", { type: "image/png" });
          await navigator.share({ files: [file], title: `${trade.pair} Trade`, text: `${trade.pair} ${trade.direction.toUpperCase()} ${isWin ? "+" : ""}$${trade.pnl.toFixed(2)} — via PipTracker` });
        } else {
          handleDownload();
        }
      });
    } catch {
      toast.error("Share failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
        {/* Actions */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/70 text-xs font-medium tracking-wide uppercase">Share Setup</p>
          <div className="flex gap-2">
            <button onClick={handleShare}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-all">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 bg-white text-slate-900 text-xs font-medium px-3 py-1.5 rounded-xl transition-all hover:bg-slate-100">
              <Download className="w-3.5 h-3.5" /> Save
            </button>
            <button onClick={onClose}
              className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* THE CARD (this gets captured) */}
        <div ref={cardRef} style={{
          background: "linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #0d1520 100%)",
          borderRadius: "16px",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
          position: "relative",
        }}>
          {/* Top accent line */}
          <div style={{
            height: "3px",
            background: isWin
              ? "linear-gradient(90deg, #10b981, #34d399)"
              : "linear-gradient(90deg, #ef4444, #f87171)",
          }} />

          {/* Chart screenshot */}
          {trade.screenshot && (
            <div style={{ position: "relative" }}>
              <img
                src={trade.screenshot}
                alt="Chart"
                style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }}
                crossOrigin="anonymous"
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, transparent 50%, rgba(10,14,26,0.9) 100%)"
              }} />
            </div>
          )}

          {/* Main content */}
          <div style={{ padding: "20px 20px 16px" }}>
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "22px", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px" }}>
                    {trade.pair}
                  </span>
                  <span style={{
                    fontSize: "10px", fontWeight: "700", letterSpacing: "1px",
                    padding: "3px 8px", borderRadius: "6px",
                    background: trade.direction === "long" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                    color: trade.direction === "long" ? "#10b981" : "#ef4444",
                    border: `1px solid ${trade.direction === "long" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  }}>
                    {trade.direction === "long" ? "▲ LONG" : "▼ SHORT"}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
                  {dateStr} · {trade.session} Session
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontSize: "24px", fontWeight: "700", fontFamily: "monospace",
                  color: isWin ? "#10b981" : "#ef4444",
                  lineHeight: 1,
                }}>
                  {isWin ? "+" : ""}${Math.abs(trade.pnl).toFixed(2)}
                </div>
                <div style={{
                  fontSize: "12px", fontFamily: "monospace",
                  color: isWin ? "rgba(16,185,129,0.7)" : "rgba(239,68,68,0.7)",
                  marginTop: "3px",
                }}>
                  {trade.pips > 0 ? "+" : ""}{trade.pips} pips
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px", marginBottom: "14px",
            }}>
              {[
                { label: "Entry", value: trade.entryPrice.toString() },
                { label: "Exit", value: trade.exitPrice.toString() },
                { label: "Size", value: `${trade.positionSize}L` },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: "rgba(255,255,255,0.05)", borderRadius: "8px",
                  padding: "8px 10px", textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "3px" }}>{label}</div>
                  <div style={{ fontSize: "12px", fontWeight: "600", fontFamily: "monospace", color: "#fff" }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)", fontWeight: "500" }}>
                {trade.strategy}
              </span>
              <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", fontWeight: "500" }}>
                {trade.emotion}
              </span>
              <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", fontWeight: "500" }}>
                {"⭐".repeat(trade.confidence)}
              </span>
            </div>

            {/* Notes */}
            {trade.notes && (
              <div style={{
                fontSize: "11px", color: "rgba(255,255,255,0.5)",
                fontStyle: "italic", lineHeight: "1.5",
                borderLeft: "2px solid rgba(255,255,255,0.1)",
                paddingLeft: "10px", marginBottom: "14px",
              }}>
                "{trade.notes}"
              </div>
            )}

            {/* Footer / branding */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              paddingTop: "12px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "20px", height: "20px",
                  border: "1.5px solid rgba(245,166,35,0.8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute", width: "10px", height: "1.5px",
                    background: "rgba(245,166,35,0.8)",
                    transform: "rotate(-45deg)",
                  }} />
                </div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#fff", letterSpacing: "1px" }}>
                  PIP<span style={{ color: "#f5a623" }}>TRACKER</span>
                </span>
              </div>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.5px" }}>
                piptracker.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
