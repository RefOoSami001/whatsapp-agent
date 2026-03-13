import { IAIAgent } from "../models/AgentConfig";
import { IConversationMessage } from "../models/Conversation";

export interface PromptInput {
  agentConfig: IAIAgent;
  contextMessages: IConversationMessage[];
  userMessage: string;
}

export const buildPrompt = ({
  agentConfig,
  contextMessages,
  userMessage,
}: PromptInput): string => {
  const {
    businessName,
    description,
    products,
    faq,
    instructions,
    tone,
    language,
  } = agentConfig;

  const systemLines = [
    `You are an AI assistant for the business "${businessName ?? "Unnamed Business"}".`,
    description && `Business description: ${description}`,
    products && `Products or services: ${products}`,
    faq && `FAQ information: ${faq}`,
    instructions && `Additional instructions: ${instructions}`,
    `Tone of responses: ${tone}.`,
    `Respond in: ${language ?? "the same language as the user"}.`,
    "Provide concise, human-like, helpful responses suitable for WhatsApp.",
    "Do not mention that you are an AI model unless explicitly asked.",
  ]
    .filter(Boolean)
    .join("\n");

  const context = contextMessages
    .map(
      (m) =>
        `${m.role === "user" ? "Customer" : "Business"}: ${m.text}`,
    )
    .join("\n");

  return [
    "SYSTEM:",
    systemLines,
    "",
    "CONVERSATION CONTEXT:",
    context || "(no previous messages)",
    "",
    "LATEST CUSTOMER MESSAGE:",
    userMessage,
    "",
    "ASSISTANT:",
  ].join("\n");
};

