import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { login, signup } from "../services/authService";
import { User } from "../models/User";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const parsed = authSchema.safeParse(request.body);
  if (!parsed.success) {
    reply.code(400).send({ message: "Invalid payload", errors: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const result = await signup(email, password);
    reply.code(201).send(result);
  } catch (err) {
    reply.code(400).send({ message: (err as Error).message });
  }
};

export const loginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const parsed = authSchema.safeParse(request.body);
  if (!parsed.success) {
    reply.code(400).send({ message: "Invalid payload", errors: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const result = await login(email, password);
    reply.send(result);
  } catch (err) {
    reply.code(401).send({ message: (err as Error).message });
  }
};

export const getProfileHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const user = await User.findById(userId).select("-password");
  if (!user) {
    reply.code(404).send({ message: "User not found" });
    return;
  }

  reply.send(user);
};

const updateProfileSchema = z.object({
  email: z.string().email().optional(),
});

export const updateProfileHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id;
  if (!userId) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }

  const parsed = updateProfileSchema.safeParse(request.body);
  if (!parsed.success) {
    reply.code(400).send({ message: "Invalid payload", errors: parsed.error.flatten() });
    return;
  }

  const user = await User.findByIdAndUpdate(userId, parsed.data, { new: true }).select("-password");
  if (!user) {
    reply.code(404).send({ message: "User not found" });
    return;
  }

  reply.send(user);
};

