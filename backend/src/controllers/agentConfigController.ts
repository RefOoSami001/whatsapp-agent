import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  upsertAgentConfig,
  getAgentConfig,
  resetAndDisableAgentConfig,
} from "../services/agentConfigService";

const agentConfigSchema = z.object({
  businessName: z.string().optional(),
  businessDescription: z.string().optional(),
  productsServices: z.string().optional(),
  faq: z.string().optional(),
  aiInstructions: z.string().optional(),
  tone: z.enum(["friendly", "professional", "sales"]).optional(),
  delayMin: z.number().min(0).optional(),
  delayMax: z.number().min(0).optional(),
  typingSimulation: z.boolean().optional(),
  memoryMode: z.enum(["5m", "10m", "full"]).optional(),
  responseLanguage: z.string().optional(),
  enabled: z.boolean().optional(),
});

export const getAgentConfigHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const instanceId = (request.params as { id: string }).id;
  const config = await getAgentConfig(instanceId);
  reply.send(config);
};

export const upsertAgentConfigHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const instanceId = (request.params as { id: string }).id;

  const parsed = agentConfigSchema.safeParse(request.body);
  if (!parsed.success) {
    reply.code(400).send({ message: "Invalid payload" });
    return;
  }

  const config = await upsertAgentConfig(instanceId, parsed.data);
  reply.send(config);
};

export const resetAgentConfigHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const instanceId = (request.params as { id: string }).id;
  const config = await resetAndDisableAgentConfig(instanceId);
  reply.send(config);
};

