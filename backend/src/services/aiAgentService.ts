import { IAIAgent, AIAgent } from "../models/AgentConfig";

export const getAiAgents = async (userId: string): Promise<IAIAgent[]> => {
  return await AIAgent.find({ userId }).sort({ createdAt: -1 });
};

export const getAiAgent = async (userId: string, agentId: string): Promise<IAIAgent | null> => {
  return await AIAgent.findOne({ _id: agentId, userId });
};

export const createAiAgent = async (userId: string, agentData: Partial<IAIAgent>): Promise<IAIAgent> => {
  const agent = new AIAgent({
    userId,
    ...agentData,
  });
  return await agent.save();
};

export const updateAiAgent = async (userId: string, agentId: string, updates: Partial<IAIAgent>): Promise<IAIAgent | null> => {
  return await AIAgent.findOneAndUpdate(
    { _id: agentId, userId },
    { ...updates, updatedAt: new Date() },
    { new: true }
  );
};

export const deleteAiAgent = async (userId: string, agentId: string): Promise<boolean> => {
  const result = await AIAgent.deleteOne({ _id: agentId, userId });
  return result.deletedCount > 0;
};

export const assignAiAgentToInstance = async (userId: string, agentId: string, instanceId: string): Promise<IAIAgent | null> => {
  return await AIAgent.findOneAndUpdate(
    { _id: agentId, userId },
    { instanceId, updatedAt: new Date() },
    { new: true }
  );
};

export const unassignAiAgentFromInstance = async (userId: string, agentId: string): Promise<IAIAgent | null> => {
  return await AIAgent.findOneAndUpdate(
    { _id: agentId, userId },
    { $unset: { instanceId: 1 }, updatedAt: new Date() },
    { new: true }
  );
};

export const getAiAgentByInstance = async (instanceId: string): Promise<IAIAgent | null> => {
  return await AIAgent.findOne({ instanceId, enabled: true });
};