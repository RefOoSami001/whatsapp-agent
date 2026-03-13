import { FastifyInstance } from "fastify";
import {
  assignAiAgentHandler,
  createAiAgentHandler,
  deleteAiAgentHandler,
  getAiAgentByInstanceHandler,
  getAiAgentHandler,
  listAiAgentsHandler,
  unassignAiAgentHandler,
  updateAiAgentHandler,
} from "../controllers/aiAgentController";
import { requireAuth } from "../middleware/authMiddleware";

export const registerAIAgentRoutes = (app: FastifyInstance) => {
  app.get("/api/ai-agents", { preHandler: requireAuth }, listAiAgentsHandler);
  app.get("/api/ai-agents/:id", { preHandler: requireAuth }, getAiAgentHandler);
  app.post("/api/ai-agents", { preHandler: requireAuth }, createAiAgentHandler);
  app.put("/api/ai-agents/:id", { preHandler: requireAuth }, updateAiAgentHandler);
  app.delete(
    "/api/ai-agents/:id",
    { preHandler: requireAuth },
    deleteAiAgentHandler,
  );

  app.post(
    "/api/ai-agents/:id/assign/:instanceId",
    { preHandler: requireAuth },
    assignAiAgentHandler,
  );
  app.post(
    "/api/ai-agents/:id/unassign",
    { preHandler: requireAuth },
    unassignAiAgentHandler,
  );

  app.get(
    "/api/instances/:id/ai-agent",
    { preHandler: requireAuth },
    getAiAgentByInstanceHandler,
  );
};
