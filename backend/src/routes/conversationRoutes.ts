import { FastifyInstance } from "fastify";
import { listConversationsHandler, getConversationHandler, deleteConversationHandler } from "../controllers/conversationController";
import { requireAuth } from "../middleware/authMiddleware";

export const registerConversationRoutes = (app: FastifyInstance) => {
  app.get(
    "/api/instances/:id/conversations",
    { preHandler: requireAuth },
    listConversationsHandler,
  );
  app.get(
    "/api/conversations/:conversationId",
    { preHandler: requireAuth },
    getConversationHandler,
  );
  app.delete(
    "/api/conversations/:conversationId",
    { preHandler: requireAuth },
    deleteConversationHandler,
  );
};

