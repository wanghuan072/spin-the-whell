import { Router } from "express";
import { getEnv } from "../config/env.js";
import { ADMIN_COOKIE_NAME, requireAdmin } from "../middleware/admin-auth.js";
import { requireTrustedOrigin } from "../middleware/origin.js";
import { getIpHash } from "../lib/request.js";
import { loginAdmin, logoutAdmin } from "../services/admin-auth.js";
import { adminLoginRules, consumeRateLimits } from "../services/rate-limit.js";
import { loginSchema } from "../validation/auth.js";

export const adminAuthRouter = Router();

adminAuthRouter.post("/login", requireTrustedOrigin, async (request, response) => {
  const input = loginSchema.parse(request.body);
  await consumeRateLimits(getIpHash(request), adminLoginRules);
  const result = await loginAdmin(input.username, input.password);
  response.cookie(ADMIN_COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: getEnv().NODE_ENV === "production",
    sameSite: "lax",
    expires: result.expiresAt,
    path: "/",
  });
  response.json({ admin: result.admin });
});

adminAuthRouter.post("/logout", requireTrustedOrigin, async (request, response) => {
  const cookies = request.cookies as Record<string, string | undefined>;
  const token = cookies[ADMIN_COOKIE_NAME];
  if (token) await logoutAdmin(token);
  response.clearCookie(ADMIN_COOKIE_NAME, { path: "/" });
  response.status(204).end();
});

adminAuthRouter.get("/me", requireAdmin, (request, response) => {
  response.json({ admin: request.admin });
});
