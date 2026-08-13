import type { RequestHandler } from "express";
import { getAdminBySessionToken } from "../services/admin-auth.js";
import { AppError } from "../lib/errors.js";

export const ADMIN_COOKIE_NAME = "spin_admin_session";

export const requireAdmin: RequestHandler = async (request, _response, next) => {
  const cookies = request.cookies as Record<string, string | undefined>;
  const token = cookies[ADMIN_COOKIE_NAME];
  if (!token) throw new AppError(401, "UNAUTHORIZED", "Please sign in.");
  const admin = await getAdminBySessionToken(token);
  if (!admin) throw new AppError(401, "UNAUTHORIZED", "Your session has expired. Please sign in again.");
  request.admin = admin;
  next();
};
