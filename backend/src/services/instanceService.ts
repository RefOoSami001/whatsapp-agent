import { Instance, IInstance } from "../models/Instance";

export const listInstances = (userId: string): Promise<IInstance[]> => {
  return Instance.find({ userId }).sort({ createdAt: -1 }).exec();
};

export const getInstance = (
  userId: string,
  instanceId: string,
): Promise<IInstance | null> => {
  return Instance.findOne({ _id: instanceId, userId }).exec();
};

