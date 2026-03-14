import { Client, ClientOptions, Message } from "whatsapp-web.js";
import { Instance, IInstance } from "../models/Instance";
import { getIo } from "../config/socket";
import { env } from "../config/env";
import { handleIncomingMessage } from "../services/aiService";
import { simulateDelayAndTyping } from "./messageUtils";
import { MongoDBAuth } from "./mongoAuth";

/** Chrome args required for headless in Docker/Koyeb; without these, QR often fails to generate. */
const PUPPETEER_CHROME_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--disable-software-rasterizer",
  "--disable-extensions",
  "--no-first-run",
  "--no-zygote",
  "--disable-background-networking",
  "--disable-default-apps",
  "--disable-sync",
  "--metrics-recording-only",
  "--mute-audio",
  "--disable-hang-monitor",
  "--disable-client-side-phishing-detection",
  "--disable-popup-blocking",
  "--disable-prompt-on-repost",
  "--ignore-certificate-errors",
  "--disable-web-security",
  "--disable-features=VizDisplayCompositor",
  "--user-data-dir=/tmp/chrome-data",
  "--remote-debugging-port=9222",
  "--single-process",
];

type InstanceId = string;

interface ManagedClient {
  client: Client;
  instance: IInstance;
}

class WhatsAppClientManager {
  private clients = new Map<InstanceId, ManagedClient>();
  private qrCache = new Map<InstanceId, string>();

  async createInstance(userId: string, name: string): Promise<IInstance> {
    const instance = await Instance.create({
      userId,
      name,
      status: "stopped",
    });
    return instance;
  }

  async deleteInstance(userId: string, instanceId: string): Promise<void> {
    const existing = await Instance.findOne({ _id: instanceId, userId });
    if (!existing) {
      throw new Error("Instance not found");
    }

    await this.stopInstance(instanceId);
    await Instance.deleteOne({ _id: instanceId });
  }

  async startInstance(instanceId: string): Promise<void> {
    if (this.clients.has(instanceId)) {
      return;
    }

    const instance = await Instance.findById(instanceId);
    if (!instance) {
      throw new Error("Instance not found");
    }

    const options: ClientOptions = {
      authStrategy: new MongoDBAuth(instanceId),
      puppeteer: {
        headless: true,
        executablePath: env.puppeteerExecutablePath || undefined,
        args: PUPPETEER_CHROME_ARGS,
      },
    };

    const client = new Client(options);
    this.bindClientEvents(client, instanceId);

    this.clients.set(instanceId, { client, instance });

    instance.status = "connecting";
    await instance.save();

    try {
      await client.initialize();
    } catch (err) {
      this.clients.delete(instanceId);
      this.qrCache.delete(instanceId);
      await Instance.findByIdAndUpdate(instanceId, { status: "error" });
      const io = getIo();
      io.to(`instance:${instanceId}`).emit("instance:error", {
        instanceId,
        message: err instanceof Error ? err.message : "Failed to start browser (check Puppeteer/Chrome in container)",
      });
      throw err;
    }
  }

  async stopInstance(instanceId: string): Promise<void> {
    const managed = this.clients.get(instanceId);
    if (!managed) {
      return;
    }

    await managed.client.destroy();
    this.clients.delete(instanceId);
    this.qrCache.delete(instanceId);

    await Instance.findByIdAndUpdate(instanceId, {
      status: "stopped",
    });
  }

  async forceQRConnection(instanceId: string): Promise<void> {
    // Stop any existing instance first
    await this.stopInstance(instanceId);

    // Clear the session data to force QR generation
    await Instance.findByIdAndUpdate(instanceId, {
      sessionData: null,
      status: "stopped"
    });

    // Start the instance fresh
    await this.startInstance(instanceId);
  }

  getLastQr = (instanceId: string): string | null => {
    return this.qrCache.get(instanceId) ?? null;
  };

  async sendMessage(
    instanceId: string,
    contactId: string,
    text: string,
  ): Promise<void> {
    const managed = this.clients.get(instanceId);
    if (!managed) {
      throw new Error("Instance not running");
    }

    if (!managed.client.info) {
      throw new Error("Instance not connected to WhatsApp");
    }

    let targetId = contactId;
    if (!contactId.includes('@')) {
      // Assume it's a phone number, convert to JID
      const phoneNumber = contactId.startsWith('+') ? contactId.slice(1) : contactId;
      const numberId = await managed.client.getNumberId(phoneNumber);
      if (!numberId) {
        throw new Error("Invalid phone number or contact not found on WhatsApp");
      }
      targetId = numberId._serialized;
    }

    await managed.client.sendMessage(targetId, text);
  }

  getStatus = async (userId: string, instanceId: string): Promise<IInstance | null> => {
    const instance = await Instance.findOne({ _id: instanceId, userId });
    return instance;
  };

  private bindClientEvents(client: Client, instanceId: string): void {
    const io = getIo();
    const room = `instance:${instanceId}`;

    client.on("qr", async (qr) => {
      // Cache the latest QR so REST clients can fetch it if needed
      this.qrCache.set(instanceId, qr);

      await Instance.findByIdAndUpdate(instanceId, { status: "qr" });
      io.to(room).emit("instance:qr", { instanceId, qr });
      io.to(room).emit("instance:status", { instanceId, status: "qr" });
    });

    client.on("ready", async () => {
      // Once connected, we no longer need to keep the QR code around.
      this.qrCache.delete(instanceId);
      await Instance.findByIdAndUpdate(instanceId, { status: "connected" });
      io.to(room).emit("instance:status", { instanceId, status: "connected" });
    });

    client.on("disconnected", async () => {
      // Keep QR around in case a reconnect is triggered, but clear on hard stop
      await Instance.findByIdAndUpdate(instanceId, { status: "disconnected" });
      io.to(room).emit("instance:status", {
        instanceId,
        status: "disconnected",
      });
    });

    client.on("auth_failure", async (msg) => {
      this.qrCache.delete(instanceId);
      await Instance.findByIdAndUpdate(instanceId, { status: "error" });
      io.to(room).emit("instance:error", { instanceId, message: msg });
    });

    client.on("message", async (message: Message) => {
      // Ignore messages sent by this WhatsApp account itself
      if (message.fromMe) {
        return;
      }
      const contactId = message.from;
      const text = message.body;

      io.to(room).emit("message:incoming", {
        instanceId,
        contactId,
        text,
        timestamp: new Date().toISOString(),
      });

      try {
        const result = await handleIncomingMessage({
          instanceId,
          contactId,
          text,
        });

        if (!result) {
          return;
        }

        const { agentConfig, replyText } = result;
        const delaySeconds = agentConfig.delaySeconds ?? 3;

        // Handle emoji reactions
        if (agentConfig.emojiReactionEnabled && agentConfig.emojiReactionRules) {
          for (const rule of agentConfig.emojiReactionRules) {
            if (text.toLowerCase().includes(rule.trigger.toLowerCase())) {
              try {
                await message.react(rule.emoji);
              } catch (err) {
                // ignore emoji reaction errors
              }
              break; // React with first matching rule
            }
          }
        }

        await simulateDelayAndTyping({
          client,
          chatId: contactId,
          delayMinSeconds: delaySeconds,
          delayMaxSeconds: delaySeconds,
          enableTyping: agentConfig.typingSimulation ?? true,
          send: async () => {
            await client.sendMessage(contactId, replyText);
          },
        });

        io.to(room).emit("message:outgoing", {
          instanceId,
          contactId,
          text: replyText,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error(`[DEBUG] Error handling message:`, err);
        io.to(room).emit("instance:error", {
          instanceId,
          message: (err as Error).message,
        });
      }
    });
  }
}

export const whatsappClientManager = new WhatsAppClientManager();

