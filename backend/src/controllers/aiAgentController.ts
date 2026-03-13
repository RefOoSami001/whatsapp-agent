import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  createAiAgent,
  deleteAiAgent,
  getAiAgent,
  getAiAgents,
  getAiAgentByInstance,
  assignAiAgentToInstance,
  unassignAiAgentFromInstance,
  updateAiAgent,
} from "../services/aiAgentService";

const createAiAgentSchema = z.object({
  businessName: z.string().min(1),
  description: z.string().optional(),
  products: z.string().optional(),
  faq: z.string().optional(),
  instructions: z.string().optional(),
  tone: z.enum(["Professional", "Friendly", "Casual", "Formal"]).optional(),
  language: z
    .enum(["English", "Spanish", "Portuguese", "French", "Arabic"])
    .optional(),
  minDelay: z.number().min(0).optional(),
  maxDelay: z.number().min(0).optional(),
  typingSimulation: z.boolean().optional(),
  memory: z
    .enum(["5 Minutes", "10 Minutes", "Full Conversation"])
    .optional(),
  enabled: z.boolean().optional(),
  geminiApiKey: z.string().optional(),
  emojiReactionEnabled: z.boolean().optional(),
  emojiReactionRules: z.array(z.object({
    trigger: z.string(),
    emoji: z.string(),
  })).optional(),
  delaySeconds: z.number().min(0).optional(),
});

export const listAiAgentsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = (request as any).user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const agents = await getAiAgents(userId);
  reply.send(agents);
};

export const getAiAgentHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = (request as any).user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const agentId = (request.params as { id: string }).id;
  const agent = await getAiAgent(userId, agentId);
  if (!agent) {
    reply.code(404).send({ message: "Agent not found" });
    return;
  }

  reply.send(agent);
};

export const createAiAgentHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = (request as any).user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const parsed = createAiAgentSchema.safeParse(request.body);
  if (!parsed.success) {
    reply.code(400).send({ message: "Invalid payload" });
    return;
  }

  const agent = await createAiAgent(userId, parsed.data);
  reply.code(201).send(agent);
};

export const updateAiAgentHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = (request as any).user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const agentId = (request.params as { id: string }).id;
  const parsed = createAiAgentSchema.partial().safeParse(request.body);
  if (!parsed.success) {
    reply.code(400).send({ message: "Invalid payload" });
    return;
  }

  const agent = await updateAiAgent(userId, agentId, parsed.data);
  if (!agent) {
    reply.code(404).send({ message: "Agent not found" });
    return;
  }

  reply.send(agent);
};

export const deleteAiAgentHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = (request as any).user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const agentId = (request.params as { id: string }).id;
  const deleted = await deleteAiAgent(userId, agentId);
  if (!deleted) {
    reply.code(404).send({ message: "Agent not found" });
    return;
  }

  reply.code(204).send();
};

export const assignAiAgentHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = (request as any).user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const agentId = (request.params as { id: string }).id;
  const instanceId = (request.params as { instanceId: string }).instanceId;

  const agent = await assignAiAgentToInstance(userId, agentId, instanceId);
  if (!agent) {
    reply.code(404).send({ message: "Agent or instance not found" });
    return;
  }

  reply.send(agent);
};

export const unassignAiAgentHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = (request as any).user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const agentId = (request.params as { id: string }).id;
  const agent = await unassignAiAgentFromInstance(userId, agentId);
  if (!agent) {
    reply.code(404).send({ message: "Agent not found" });
    return;
  }

  reply.send(agent);
};

export const getAiAgentByInstanceHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const instanceId = (request.params as { id: string }).id;
  const agent = await getAiAgentByInstance(instanceId);
  reply.send(agent);
};
