import { env } from "../config/env";
import { GoogleGenAI } from "@google/genai";

export interface GeminiRequest {
  prompt: string;
  apiKey?: string;
}

export interface GeminiResponse {
  text: string;
}

const defaultAI = new GoogleGenAI({ apiKey: env.geminiApiKey });

export const generateReply = async ({
  prompt,
  apiKey,
}: GeminiRequest): Promise<GeminiResponse> => {
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : defaultAI;
  try {
    const response = await ai.models.generateContent({
      model: env.geminiModel,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const text = typeof response.text === "string" ? response.text : "";
    return { text: text.trim() || "Thank you for your message." };
  } catch (err) {
    if (env.nodeEnv === "development") {
      console.error("[Gemini] generateContent error:", err);
    }
    throw err;
  }
};

