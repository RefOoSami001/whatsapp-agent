import { FastifyInstance } from "fastify";
import { loginHandler, signupHandler, getProfileHandler, updateProfileHandler } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

export const registerAuthRoutes = (app: FastifyInstance) => {
  app.post("/api/auth/signup", signupHandler);
  app.post("/api/auth/login", loginHandler);
  app.get("/api/auth/profile", { preHandler: requireAuth }, getProfileHandler);
  app.put("/api/auth/profile", { preHandler: requireAuth }, updateProfileHandler);
};

