import express from "express";
import type { RequestHandler } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmetImport from "helmet";
import { getEnv } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./lib/errors.js";
import { adminAuthRouter } from "./routes/admin-auth.js";
import { adminCommentsRouter } from "./routes/admin-comments.js";
import { commentsRouter } from "./routes/comments.js";
import { userAuthRouter } from "./routes/user-auth.js";

// Helmet 8 publishes a callable ESM default, but TypeScript 6 can resolve its
// declaration as a module namespace on Linux build hosts such as Vercel.
const createHelmetMiddleware = helmetImport as unknown as () => RequestHandler;

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(createHelmetMiddleware());
  app.use(cors({ origin: getEnv().FRONTEND_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "16kb" }));
  app.use(cookieParser());

  app.get("/api/health", (_request, response) => response.json({ status: "ok" }));
  app.use("/api/auth", userAuthRouter);
  app.use("/api/comments", commentsRouter);
  app.use("/api/admin/auth", adminAuthRouter);
  app.use("/api/admin/comments", adminCommentsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

// Vercel's zero-config Express runtime detects src/app.ts as the function
// entrypoint and requires the Express application as the default export.
const app = createApp();

export default app;
