import { eq, lt, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { rateLimitWindows } from "../db/schema.js";
import { AppError } from "../lib/errors.js";

type RateLimitRule = {
  namespace: string;
  limit: number;
  windowMs: number;
};

export const publicCommentRules: RateLimitRule[] = [
  { namespace: "comment:10m", limit: 3, windowMs: 10 * 60 * 1000 },
  { namespace: "comment:24h", limit: 10, windowMs: 24 * 60 * 60 * 1000 },
];

export const adminLoginRules: RateLimitRule[] = [
  { namespace: "admin-login:15m", limit: 8, windowMs: 15 * 60 * 1000 },
];

export const userLoginRules: RateLimitRule[] = [
  { namespace: "user-login:15m", limit: 12, windowMs: 15 * 60 * 1000 },
];

export async function consumeRateLimits(subject: string, rules: RateLimitRule[]) {
  const now = Date.now();

  for (const rule of rules) {
    const bucket = Math.floor(now / rule.windowMs);
    const key = `${rule.namespace}:${subject}:${bucket}`;
    const expiresAt = new Date((bucket + 1) * rule.windowMs);
    const [row] = await db
      .insert(rateLimitWindows)
      .values({ key, hits: 1, expiresAt })
      .onConflictDoUpdate({
        target: rateLimitWindows.key,
        set: {
          hits: sql`${rateLimitWindows.hits} + 1`,
          updatedAt: new Date(),
        },
      })
      .returning({ hits: rateLimitWindows.hits });

    if (row.hits > rule.limit) {
      const retryAfter = Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000));
      throw new AppError(429, "RATE_LIMITED", "Too many attempts. Please try again later.", { retryAfter });
    }
  }

  if (Math.random() < 0.01) {
    void db.delete(rateLimitWindows).where(lt(rateLimitWindows.expiresAt, new Date())).catch(() => undefined);
  }
}

export async function resetRateLimit(key: string) {
  await db.delete(rateLimitWindows).where(eq(rateLimitWindows.key, key));
}
