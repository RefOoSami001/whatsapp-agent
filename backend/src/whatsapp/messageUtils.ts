import { Client } from "whatsapp-web.js";

export const simulateDelayAndTyping = async (params: {
  client: Client;
  chatId: string;
  delayMinSeconds: number;
  delayMaxSeconds: number;
  enableTyping: boolean;
  send: () => Promise<void>;
}) => {
  const { client, chatId, delayMinSeconds, delayMaxSeconds, enableTyping, send } = params;

  const min = Math.max(0, delayMinSeconds);
  const max = Math.max(min, delayMaxSeconds);
  const delayMs = (min + Math.random() * (max - min)) * 1000;

  if (enableTyping) {
    try {
      await client.sendPresenceAvailable();
    } catch {
      // ignore typing simulation errors
    }
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  await send();

  if (enableTyping) {
    try {
      await client.sendSeen(chatId);
    } catch {
      // ignore
    }
  }
};

