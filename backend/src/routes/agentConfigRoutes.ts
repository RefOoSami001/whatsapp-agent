import { FastifyInstance } from "fastify";
import {
  getAgentConfigHandler,
  upsertAgentConfigHandler,
  resetAgentConfigHandler,
} from "../controllers/agentConfigController";
import { requireAuth } from "../middleware/authMiddleware";

export const registerAgentConfigRoutes = (app: FastifyInstance) => {
  app.get(
    "/api/instances/:id/agent-config",
    { preHandler: requireAuth },
    getAgentConfigHandler,
  );
  app.put(
    "/api/instances/:id/agent-config",
    { preHandler: requireAuth },
    upsertAgentConfigHandler,
  );
  app.delete(
    "/api/instances/:id/agent-config",
    { preHandler: requireAuth },
    resetAgentConfigHandler,
  );
};

