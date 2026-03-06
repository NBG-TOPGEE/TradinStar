import { useState } from "react";

const API_URL = "https://api.openai.com/v1/responses";
const SYSTEM_PROMPT = `You are a professional trading coach. Provide clear, balanced advice on strategy, risk management, and performance without being overly aggressive or timid. Adapt your tone to be encouraging but realistic, and always reference principles of sound trading. Avoid giving financial advice; focus on coaching and education.`;

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

  const _request = async (body: any) => {
    const key = import.meta.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) throw new Error("Missing Gemini API key");

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini request failed: ${res.status} ${text}`);
    }
    const json = await res.json();
    // the new API returns output array
    const output = json.output?.[0]?.content;
    if (!output) return "";
    // concatenate all text pieces
    if (Array.isArray(output)) {
      return output.map((p: any) => p.text || "").join("");
    }
    return output.text || String(output);
  };

  const chat = async (
    history: { role: "system" | "user" | "assistant"; content: string }[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const messages = history.map((m) => ({
        type: "message",
        role: m.role,
        content: [{ type: "text", text: m.content }],
      }));
      const resp = await _request({ model: "gemini-1.5-flash", messages });
      return resp;
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
      const base64 = await fileToBase64(file);
      const prompt = `Here is a trading chart image. Analyze it and provide any insights or recommendations.`;
      const resp = await _request({
        model: "gemini-1.5-flash",
        input: [
          {
            role: "system",
            content: [
              { type: "text", text: SYSTEM_PROMPT }
            ],
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image", image_url: `data:${file.type};base64,${base64}` }
            ],
          },
        ],
      });
      return resp;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { chat, analyzeImage, loading, error, SYSTEM_PROMPT };
}
