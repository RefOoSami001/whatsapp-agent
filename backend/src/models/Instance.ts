import mongoose, { Document, Schema, Types } from "mongoose";

export type InstanceStatus =
  | "stopped"
  | "connecting"
  | "qr"
  | "connected"
  | "disconnected"
  | "error";

export interface IInstance extends Document {
  userId: Types.ObjectId;
  name: string;
  sessionId?: string;
  sessionData?: unknown;
  status: InstanceStatus;
  createdAt: Date;
  lastHealthCheck?: Date;
}

const instanceSchema = new Schema<IInstance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sessionId: {
      type: String,
    },
    sessionData: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ["stopped", "connecting", "qr", "connected", "disconnected", "error"],
      default: "stopped",
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastHealthCheck: {
      type: Date,
    },
  },
  {
    versionKey: false,
  },
);

export const Instance = mongoose.model<IInstance>("Instance", instanceSchema);

