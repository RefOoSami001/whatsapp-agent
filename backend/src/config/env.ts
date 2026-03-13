import dotenv from "dotenv";

dotenv.config();

const required = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  mongoUri: required(process.env.MONGODB_URI, "MONGODB_URI"),
  jwtSecret: required(process.env.JWT_SECRET, "JWT_SECRET"),
  geminiApiKey: required(process.env.GEMINI_API_KEY, "GEMINI_API_KEY"),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  aiFakeReply: process.env.AI_FAKE_REPLY === "true",
};

