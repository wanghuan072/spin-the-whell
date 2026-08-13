import { Router } from "express";
import { getEnv } from "../config/env.js";
import { USER_COOKIE_NAME } from "../middleware/user-auth.js";
import { requireTrustedOrigin } from "../middleware/origin.js";
import { getIpHash } from "../lib/request.js";
import { getUserBySessionToken, loginWithGoogle, logoutUser } from "../services/user-auth.js";
import { consumeRateLimits, userLoginRules } from "../services/rate-limit.js";
import { googleLoginSchema } from "../validation/auth.js";

export const userAuthRouter = Router();

const cookieOptions = () => ({
  httpOnly: true,
  secure: getEnv().NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
});

userAuthRouter.post("/google", requireTrustedOrigin, async (request, response) => {
  const input = googleLoginSchema.parse(request.body);
  await consumeRateLimits(getIpHash(request), userLoginRules);
  const result = await loginWithGoogle(input.credential);
  response.cookie(USER_COOKIE_NAME, result.token, { ...cookieOptions(), expires: result.expiresAt });
  response.json({ user: result.user });
});

userAuthRouter.get("/me", async (request, response) => {
  const cookies = request.cookies as Record<string, string | undefined>;
  const token = cookies[USER_COOKIE_NAME];
  const user = token ? await getUserBySessionToken(token) : null;
  if (token && !user) response.clearCookie(USER_COOKIE_NAME, cookieOptions());
  response.json({ user });
});

userAuthRouter.post("/logout", requireTrustedOrigin, async (request, response) => {
  const cookies = request.cookies as Record<string, string | undefined>;
  const token = cookies[USER_COOKIE_NAME];
  if (token) await logoutUser(token);
  response.clearCookie(USER_COOKIE_NAME, cookieOptions());
  response.status(204).end();
});
