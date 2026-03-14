import { FastifyReply, FastifyRequest } from "fastify";
import { verifyToken } from "../services/authService";

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
  };
}

export const requireAuth = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    reply.code(401).send({ message: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.substring("Bearer ".length);

  try {
    const payload = verifyToken(token);
    (request as AuthenticatedRequest).user = { id: payload.userId };
  } catch {
    reply.code(401).send({ message: "Invalid or expired token" });
    return;
  }
};

