import { useState } from "react";

// ---------------------------------------------------------------------------
// AI Coach — powered by Claude (Anthropic) via Supabase Edge Function proxy
// Drop-in replacement for the old Gemini hook. Same interface, same exports.
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT = `You are an elite AI trading coach and market analyst for TradinStar. You specialize in:
- Technical analysis of charts and price action
- Risk management and position sizing
- Trading strategy development and review
- Performance tracking and psychology coaching
- Market structure, trends, and patterns

When analyzing charts or data, be specific, structured, and actionable. Always include:
1. What you observe (key levels, patterns, indicators)
2. Your strategic recommendation
3. Risk considerations
4. A clear action plan

Be balanced — direct and honest when needed, encouraging when deserved. Never sugarcoat bad risk management.`;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Supabase Edge Function URL — update VITE_SUPABASE_URL to match your project
const getProxyUrl = () => {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) throw new Error("Missing VITE_SUPABASE_URL in .env");
  return `${base}/functions/v1/ai-coach`;
};

const getAnonKey = () => {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!key) throw new Error("Missing VITE_SUPABASE_ANON_KEY in .env");
  return key;
};

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callProxy = async (body: object): Promise<string> => {
    const res = await fetch(getProxyUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAnonKey()}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI Coach error: ${res.status} ${text}`);
    }

    const data = await res.json();
    return data.content || "";
  };

  // Chat — takes full message history including system prompt
  const chat = async (
    history: { role: "system" | "user" | "assistant"; content: string }[]
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const systemMsg = history.find((m) => m.role === "system");
      const messages = history
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));

      const result = await callProxy({
        type: "chat",
        system: systemMsg?.content || SYSTEM_PROMPT,
        messages,
      });
      return result;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Image analysis — converts file to base64 and sends to proxy
  const analyzeImage = async (file: File): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      const result = await callProxy({
        type: "image",
        system: SYSTEM_PROMPT,
        imageBase64: base64,
        mediaType: file.type || "image/jpeg",
        prompt: "Analyze this trading chart. Identify key levels, patterns, trend direction, and give a clear strategy recommendation with risk notes.",
      });
      return result;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { chat, analyzeImage, loading, error, SYSTEM_PROMPT };
}
