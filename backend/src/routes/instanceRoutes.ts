import { FastifyInstance } from "fastify";
import {
  createInstanceHandler,
  deleteInstanceHandler,
  getInstanceHandler,
  getInstanceQrHandler,
  listInstancesHandler,
  sendMessageHandler,
  startInstanceHandler,
  stopInstanceHandler,
  connectInstanceHandler,
} from "../controllers/instanceController";
import { requireAuth } from "../middleware/authMiddleware";

export const registerInstanceRoutes = (app: FastifyInstance) => {
  app.get("/api/instances", { preHandler: requireAuth }, listInstancesHandler);
  app.post("/api/instances", { preHandler: requireAuth }, createInstanceHandler);
  app.delete(
    "/api/instances/:id",
    { preHandler: requireAuth },
    deleteInstanceHandler,
  );
  app.post(
    "/api/instances/:id/start",
    { preHandler: requireAuth },
    startInstanceHandler,
  );
  app.get(
    "/api/instances/:id",
    { preHandler: requireAuth },
    getInstanceHandler,
  );
  app.get(
    "/api/instances/:id/qr",
    { preHandler: requireAuth },
    getInstanceQrHandler,
  );
  app.post(
    "/api/instances/:id/send",
    { preHandler: requireAuth },
    sendMessageHandler,
  );
  app.post(
    "/api/instances/:id/connect",
    { preHandler: requireAuth },
    connectInstanceHandler,
  );
  app.post(
    "/api/instances/:id/stop",
    { preHandler: requireAuth },
    stopInstanceHandler,
  );
};

