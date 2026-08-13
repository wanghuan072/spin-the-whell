import { config } from "dotenv";
import { z } from "zod";

config({ path: ".env.local" });
config();

const envSchema = z.object({
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  IP_HASH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
}).superRefine((env, context) => {
  if (env.NODE_ENV === "production" && !env.GOOGLE_CLIENT_ID) {
    context.addIssue({
      code: "custom",
      path: ["GOOGLE_CLIENT_ID"],
      message: "GOOGLE_CLIENT_ID is required in production.",
    });
  }
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv() {
  if (!cachedEnv) cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}
