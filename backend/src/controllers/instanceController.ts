import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { whatsappClientManager } from "../whatsapp/clientManager";
import { listInstances, getInstance } from "../services/instanceService";

const createInstanceSchema = z.object({
  name: z.string().min(1),
});

export const listInstancesHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const instances = await listInstances(userId);
  reply.send(instances);
};

export const createInstanceHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const parsed = createInstanceSchema.safeParse(request.body);
  if (!parsed.success) {
    reply.code(400).send({ message: "Invalid payload" });
    return;
  }

  const instance = await whatsappClientManager.createInstance(
    userId,
    parsed.data.name,
  );
  reply.code(201).send(instance);
};

export const deleteInstanceHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const instanceId = (request.params as { id: string }).id;

  try {
    await whatsappClientManager.deleteInstance(userId, instanceId);
    reply.code(204).send();
  } catch (err) {
    reply.code(404).send({ message: (err as Error).message });
  }
};

export const startInstanceHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const instanceId = (request.params as { id: string }).id;
  const instance = await getInstance(userId, instanceId);
  if (!instance) {
    reply.code(404).send({ message: "Instance not found" });
    return;
  }

  try {
    await whatsappClientManager.startInstance(instanceId);
    reply.code(202).send({ message: "Instance starting" });
  } catch (err) {
    reply.code(500).send({ message: (err as Error).message });
  }
};

export const connectInstanceHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const instanceId = (request.params as { id: string }).id;
  const instance = await getInstance(userId, instanceId);
  if (!instance) {
    reply.code(404).send({ message: "Instance not found" });
    return;
  }

  try {
    // Force QR generation by clearing any existing session
    await whatsappClientManager.forceQRConnection(instanceId);
    reply.code(202).send({ message: "Instance connecting with QR" });
  } catch (err) {
    reply.code(500).send({ message: (err as Error).message });
  }
};

export const stopInstanceHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const instanceId = (request.params as { id: string }).id;
  const instance = await getInstance(userId, instanceId);
  if (!instance) {
    reply.code(404).send({ message: "Instance not found" });
    return;
  }

  await whatsappClientManager.stopInstance(instanceId);
  reply.code(202).send({ message: "Instance stopping" });
};

export const getInstanceHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const instanceId = (request.params as { id: string }).id;
  const instance = await getInstance(userId, instanceId);
  if (!instance) {
    reply.code(404).send({ message: "Instance not found" });
    return;
  }

  reply.send(instance);
};

export const getInstanceQrHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const instanceId = (request.params as { id: string }).id;
  const instance = await getInstance(userId, instanceId);
  if (!instance) {
    reply.code(404).send({ message: "Instance not found" });
    return;
  }

  const qr = whatsappClientManager.getLastQr(instanceId);
  if (!qr) {
    // Attempt to start/connect the instance so a QR can be generated.
    // This will also safely no-op if the instance is already running.
    try {
      await whatsappClientManager.startInstance(instanceId);
    } catch {
      // If start fails, ignore; we still want to return a 202 for polling.
    }

    reply
      .code(202)
      .send({ message: "QR not yet available. Instance is starting; retry shortly." });
    return;
  }

  reply.send({ qr });
};

const sendMessageSchema = z.object({
  contactId: z.string().min(1),
  text: z.string().min(1),
});

export const sendMessageHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const instanceId = (request.params as { id: string }).id;
  const instance = await getInstance(userId, instanceId);
  if (!instance) {
    reply.code(404).send({ message: "Instance not found" });
    return;
  }

  const parsed = sendMessageSchema.safeParse(request.body);
  if (!parsed.success) {
    reply.code(400).send({ message: "Invalid payload" });
    return;
  }

  try {
    await whatsappClientManager.sendMessage(
      instanceId,
      parsed.data.contactId,
      parsed.data.text,
    );
    reply.send({ message: "Message sent" });
  } catch (err) {
    reply.code(500).send({ message: (err as Error).message });
  }
};

