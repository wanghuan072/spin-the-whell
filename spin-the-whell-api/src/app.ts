import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as helmetModule from "helmet";
import { getEnv } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./lib/errors.js";
import { adminAuthRouter } from "./routes/admin-auth.js";
import { adminCommentsRouter } from "./routes/admin-comments.js";
import { commentsRouter } from "./routes/comments.js";
import { userAuthRouter } from "./routes/user-auth.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmetModule.default());
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
