import { Conversation, IConversation, IConversationMessage } from "../models/Conversation";
import { MemoryMode } from "../models/AgentConfig";

export const appendMessage = async (
  instanceId: string,
  contactId: string,
  message: IConversationMessage,
): Promise<IConversation> => {
  const conversation =
    (await Conversation.findOne({ instanceId, contactId })) ??
    new Conversation({ instanceId, contactId, messages: [] });

  conversation.messages.push(message);
  conversation.lastUpdated = new Date();
  await conversation.save();

  return conversation;
};

export const getContextMessages = async (
  instanceId: string,
  contactId: string,
  memoryMode: MemoryMode,
): Promise<IConversationMessage[]> => {
  const conversation = await Conversation.findOne({ instanceId, contactId });
  if (!conversation) {
    return [];
  }

  const now = Date.now();
  let threshold: number | null = null;

  if (memoryMode === "5m") {
    threshold = now - 5 * 60 * 1000;
  } else if (memoryMode === "10m") {
    threshold = now - 10 * 60 * 1000;
  }

  const messages = conversation.messages;

  if (threshold) {
    return messages.filter(
      (m) => m.timestamp.getTime() >= threshold,
    );
  }

  return messages;
};

