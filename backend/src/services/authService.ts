import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { env } from "../config/env";

const SALT_ROUNDS = 10;

export interface AuthPayload {
  userId: string;
}

export interface AuthToken {
  token: string;
}

export const signup = async (email: string, password: string): Promise<AuthToken> => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, passwordHash });

  const token = jwt.sign({ userId: user.id }, env.jwtSecret, {
    expiresIn: "7d",
  });

  return { token };
};

export const login = async (email: string, password: string): Promise<AuthToken> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign({ userId: user.id }, env.jwtSecret, {
    expiresIn: "7d",
  });

  return { token };
};

export const verifyToken = (token: string): AuthPayload => {
  const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload;
  return decoded;
};

