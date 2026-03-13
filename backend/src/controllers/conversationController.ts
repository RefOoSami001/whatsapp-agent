import { FastifyReply, FastifyRequest } from "fastify";
import { Conversation } from "../models/Conversation";

export const listConversationsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const instanceId = (request.params as { id: string }).id;
  const conversations = await Conversation.find({ instanceId })
    .sort({ lastUpdated: -1 })
    .limit(50)
    .exec();

  reply.send(conversations);
};

export const getConversationHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const conversationId = (request.params as { conversationId: string }).conversationId;
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    reply.code(404).send({ message: "Conversation not found" });
    return;
  }

  reply.send(conversation);
};

export const deleteConversationHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const conversationId = (request.params as { conversationId: string }).conversationId;
  const result = await Conversation.findByIdAndDelete(conversationId);
  if (!result) {
    reply.code(404).send({ message: "Conversation not found" });
    return;
  }

  reply.code(204).send();
};

