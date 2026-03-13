import fastify from "fastify";
import cors from "@fastify/cors";
import { connectDb } from "./config/db";
import { env } from "./config/env";
import { initSocket } from "./config/socket";
import { registerRoutes } from "./routes";

const buildServer = () => {
  const app = fastify({
    logger: true,
  });

  app.register(cors, {
    origin: true, // allow all origins in dev to support any localhost port
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  registerRoutes(app);

  return app;
};

const start = async () => {
  const app = buildServer();

  await connectDb();

  const io = initSocket(app.server);
  app.decorate("io", io);

  await app.listen({ port: env.port, host: "0.0.0.0" });
  console.log(`Server listening on port ${env.port}`);
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});

