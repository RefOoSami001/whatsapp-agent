import mongoose, { Document, Schema, Types } from "mongoose";

export type MemoryMode = "5m" | "10m" | "full";
export type Tone = "friendly" | "professional" | "sales";

export interface IEmojiReactionRule {
  trigger: string;
  emoji: string;
}

export interface IAgentConfig extends Document {
  instanceId: Types.ObjectId;
  businessName?: string;
  businessDescription?: string;
  productsServices?: string;
  faq?: string;
  aiInstructions?: string;
  tone: Tone;
  delayMin: number;
  delayMax: number;
  typingSimulation: boolean;
  memoryMode: MemoryMode;
  responseLanguage?: string;
  enabled: boolean;
}

export interface IAIAgent extends Document {
  userId: Types.ObjectId;
  instanceId?: Types.ObjectId; // Optional - can be assigned later
  businessName: string;
  description?: string;
  products?: string;
  faq?: string;
  instructions?: string;
  tone: string;
  language: string;
  minDelay: number;
  maxDelay: number;
  typingSimulation: boolean;
  memory: string;
  enabled: boolean;
  geminiApiKey?: string;
  emojiReactionEnabled: boolean;
  emojiReactionRules: IEmojiReactionRule[];
  delaySeconds: number;
  createdAt: Date;
}

const agentConfigSchema = new Schema<IAgentConfig>(
  {
    instanceId: {
      type: Schema.Types.ObjectId,
      ref: "Instance",
      required: true,
      unique: true,
      index: true,
    },
    businessName: String,
    businessDescription: String,
    productsServices: String,
    faq: String,
    aiInstructions: String,
    tone: {
      type: String,
      enum: ["friendly", "professional", "sales"],
      default: "friendly",
    },
    delayMin: {
      type: Number,
      default: 2,
    },
    delayMax: {
      type: Number,
      default: 6,
    },
    typingSimulation: {
      type: Boolean,
      default: true,
    },
    memoryMode: {
      type: String,
      enum: ["5m", "10m", "full"],
      default: "5m",
    },
    responseLanguage: {
      type: String,
      default: "English",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
  },
);

export const AgentConfig = mongoose.model<IAgentConfig>(
  "AgentConfig",
  agentConfigSchema,
);

const aiAgentSchema = new Schema<IAIAgent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    instanceId: {
      type: Schema.Types.ObjectId,
      ref: "Instance",
      index: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    description: String,
    products: String,
    faq: String,
    instructions: String,
    tone: {
      type: String,
      enum: ["Professional", "Friendly", "Casual", "Formal"],
      default: "Professional",
    },
    language: {
      type: String,
      enum: ["English", "Spanish", "Portuguese", "French", "Arabic"],
      default: "English",
    },
    minDelay: {
      type: Number,
      default: 2,
      min: 0,
    },
    maxDelay: {
      type: Number,
      default: 5,
      min: 0,
    },
    typingSimulation: {
      type: Boolean,
      default: true,
    },
    memory: {
      type: String,
      enum: ["5 Minutes", "10 Minutes", "Full Conversation"],
      default: "10 Minutes",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    geminiApiKey: String,
    emojiReactionEnabled: {
      type: Boolean,
      default: false,
    },
    emojiReactionRules: [{
      trigger: { type: String, required: true },
      emoji: { type: String, required: true },
    }],
    delaySeconds: {
      type: Number,
      default: 3,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const AIAgent = mongoose.model<IAIAgent>(
  "AIAgent",
  aiAgentSchema,
);

