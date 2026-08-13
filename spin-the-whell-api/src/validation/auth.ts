import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256),
}).strict();

export const googleLoginSchema = z.object({
  credential: z.string().trim().min(100).max(10_000),
}).strict();
