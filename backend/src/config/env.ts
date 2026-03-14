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
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  aiFakeReply: process.env.AI_FAKE_REPLY === "true",
  /** Set in Docker/production so Puppeteer uses system Chrome instead of bundled Chromium (required for QR in containers). */
  puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? undefined,
};

