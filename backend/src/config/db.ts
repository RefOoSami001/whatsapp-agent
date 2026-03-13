import mongoose from "mongoose";
import { env } from "./env";

export const connectDb = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("[DB] Connected to MongoDB");
  } catch (err) {
    console.error("[DB] MongoDB connection error", err);
    throw err;
  }
};

