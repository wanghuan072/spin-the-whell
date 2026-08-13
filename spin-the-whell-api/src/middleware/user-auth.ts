import type { RequestHandler } from "express";
import { AppError } from "../lib/errors.js";
import { getUserBySessionToken } from "../services/user-auth.js";

export const USER_COOKIE_NAME = "spin_user_session";

export const requireUser: RequestHandler = async (request, _response, next) => {
  const cookies = request.cookies as Record<string, string | undefined>;
  const token = cookies[USER_COOKIE_NAME];
  if (!token) throw new AppError(401, "UNAUTHORIZED", "Sign in with Google to post a comment.");
  const user = await getUserBySessionToken(token);
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Your session has expired. Please sign in again.");
  request.user = user;
  next();
};
