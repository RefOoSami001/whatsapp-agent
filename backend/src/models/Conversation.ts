import mongoose, { Document, Schema, Types } from "mongoose";

export type ConversationRole = "user" | "assistant";

export interface IConversationMessage {
  role: ConversationRole;
  text: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  instanceId: Types.ObjectId;
  contactId: string;
  messages: IConversationMessage[];
  lastUpdated: Date;
}

const messageSchema = new Schema<IConversationMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const conversationSchema = new Schema<IConversation>(
  {
    instanceId: {
      type: Schema.Types.ObjectId,
      ref: "Instance",
      required: true,
      index: true,
    },
    contactId: {
      type: String,
      required: true,
      index: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

conversationSchema.index({ instanceId: 1, contactId: 1 }, { unique: true });

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);

