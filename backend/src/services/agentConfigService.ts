import { AgentConfig, IAgentConfig, MemoryMode, Tone } from "../models/AgentConfig";

export interface AgentConfigInput {
  businessName?: string;
  businessDescription?: string;
  productsServices?: string;
  faq?: string;
  aiInstructions?: string;
  tone?: Tone;
  delayMin?: number;
  delayMax?: number;
  typingSimulation?: boolean;
  memoryMode?: MemoryMode;
  responseLanguage?: string;
  enabled?: boolean;
}

export const getAgentConfig = async (
  instanceId: string,
): Promise<IAgentConfig | null> => {
  return AgentConfig.findOne({ instanceId }).exec();
};

export const resetAndDisableAgentConfig = async (
  instanceId: string,
): Promise<IAgentConfig | null> => {
  const existing = await AgentConfig.findOne({ instanceId });
  if (!existing) {
    return null;
  }

  existing.businessName = undefined;
  existing.businessDescription = undefined;
  existing.productsServices = undefined;
  existing.faq = undefined;
  existing.aiInstructions = undefined;
  existing.tone = "friendly";
  existing.delayMin = 2;
  existing.delayMax = 6;
  existing.typingSimulation = true;
  existing.memoryMode = "5m";
  existing.responseLanguage = "English";
  existing.enabled = false;

  await existing.save();
  return existing;
};

export const upsertAgentConfig = async (
  instanceId: string,
  input: AgentConfigInput,
): Promise<IAgentConfig> => {
  const existing = await AgentConfig.findOne({ instanceId });
  if (!existing) {
    const created = await AgentConfig.create({
      instanceId,
      ...input,
    });
    return created;
  }

  Object.assign(existing, input);
  await existing.save();
  return existing;
};

