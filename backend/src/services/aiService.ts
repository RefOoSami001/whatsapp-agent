import { buildPrompt } from "../ai/promptBuilder";
import { generateReply } from "../ai/geminiClient";
import { getAiAgentByInstance } from "./aiAgentService";
import { getContextMessages, appendMessage } from "./conversationService";
import { env } from "../config/env";
import { MemoryMode } from "../models/AgentConfig";

export const handleIncomingMessage = async (params: {
  instanceId: string;
  contactId: string;
  text: string;
}) => {
  const { instanceId, contactId, text } = params;

  await appendMessage(instanceId, contactId, {
    role: "user",
    text,
    timestamp: new Date(),
  });

  const agentConfig = await getAiAgentByInstance(instanceId);
  if (!agentConfig || !agentConfig.enabled) {
    return null;
  }

  const contextMessages = await getContextMessages(
    instanceId,
    contactId,
    agentConfig.memory as MemoryMode,
  );

  let replyMessage: string;

  if (env.aiFakeReply) {
    replyMessage = `رسالتك وصلت 🎯\n\n${text}`;
  } else {
    const prompt = buildPrompt({
      agentConfig,
      contextMessages,
      userMessage: text,
    });

    try {
      const { text: reply } = await generateReply({ prompt, apiKey: agentConfig.geminiApiKey });
      replyMessage = reply || "Thank you for your message.";
    } catch (err) {
      replyMessage =
        "شكراً لرسالتك! حالياً النظام الذكي يواجه مشكلة مؤقتة، لكن فريق RIVAL سيقوم بالرد عليك قريباً.";
    }
  }

  await appendMessage(instanceId, contactId, {
    role: "assistant",
    text: replyMessage,
    timestamp: new Date(),
  });

  return {
    replyText: replyMessage,
    agentConfig,
  };
};

