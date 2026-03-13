import { FastifyInstance } from "fastify";
import { registerAuthRoutes } from "./authRoutes";
import { registerInstanceRoutes } from "./instanceRoutes";
import { registerAgentConfigRoutes } from "./agentConfigRoutes";
import { registerConversationRoutes } from "./conversationRoutes";
import { registerAIAgentRoutes } from "./aiAgentRoutes";

export const registerRoutes = (app: FastifyInstance) => {
  app.get("/health", async () => {
    return { status: "ok" };
  });

  registerAuthRoutes(app);
  registerInstanceRoutes(app);
  registerAgentConfigRoutes(app);
  registerConversationRoutes(app);
  registerAIAgentRoutes(app);
};



