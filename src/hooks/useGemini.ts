import { useState } from "react";

// Change this line at the top of useGemini.ts
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const SYSTEM_PROMPT = `You are an elite AI trading coach and market analyst. You specialize in:
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
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getKey = () => {
    // Vite uses VITE_ prefix, not NEXT_PUBLIC_
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error("Missing VITE_GEMINI_API_KEY in .env");
    return key;
  };

  const parseResponse = (json: any): string => {
    return json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  };

  const chat = async (
    history: { role: "system" | "user" | "assistant"; content: string }[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const key = getKey();

      // Separate system prompt from conversation history
      const systemMsg = history.find((m) => m.role === "system");
      const convo = history.filter((m) => m.role !== "system");

      // Map assistant -> model for Gemini's expected format
      const contents = convo.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const body: any = { contents };
      if (systemMsg) {
        body.system_instruction = { parts: [{ text: systemMsg.content }] };
      }

      const res = await fetch(`${GEMINI_API_URL}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini error: ${res.status} ${text}`);
      }

      const json = await res.json();
      return parseResponse(json);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const key = getKey();
      const base64 = await fileToBase64(file);

      const body = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Analyze this trading chart. Identify key levels, patterns, trend direction, and give a clear strategy recommendation with risk notes.",
              },
              {
                inline_data: {
                  mime_type: file.type || "image/jpeg",
                  data: base64,
                },
              },
            ],
          },
        ],
      };

      const res = await fetch(`${GEMINI_API_URL}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini error: ${res.status} ${text}`);
      }

      const json = await res.json();
      return parseResponse(json);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { chat, analyzeImage, loading, error, SYSTEM_PROMPT };
}
