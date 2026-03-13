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
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return { text: (response.text ?? "").trim() };
};

