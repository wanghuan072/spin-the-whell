import { randomUUID } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "../db/client.js";
import { adminSessions, adminUsers } from "../db/schema.js";
import { createOpaqueToken, hashPassword, sha256, verifyPassword } from "../lib/crypto.js";
import { AppError } from "../lib/errors.js";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function loginAdmin(username: string, password: string) {
  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid username or password.");
  }

  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(adminSessions).values({
    id: randomUUID(), adminUserId: admin.id, tokenHash: sha256(token), expiresAt,
  });
  if (Math.random() < 0.01) {
    void db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date())).catch(() => undefined);
  }
  return { token, expiresAt, admin: { id: admin.id, username: admin.username } };
}

export async function getAdminBySessionToken(token: string) {
  const [row] = await db.select({
    sessionId: adminSessions.id,
    adminId: adminUsers.id,
    username: adminUsers.username,
  }).from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
    .where(and(eq(adminSessions.tokenHash, sha256(token)), gt(adminSessions.expiresAt, new Date())))
    .limit(1);

  if (!row) return null;
  await db.update(adminSessions).set({ lastUsedAt: new Date() })
    .where(eq(adminSessions.id, row.sessionId));
  return { id: row.adminId, username: row.username };
}

export async function logoutAdmin(token: string) {
  await db.delete(adminSessions).where(eq(adminSessions.tokenHash, sha256(token)));
}

export async function seedInitialAdmin(username: string, password: string) {
  const existing = await db.select({ id: adminUsers.id }).from(adminUsers)
    .where(eq(adminUsers.username, username)).limit(1);
  if (existing.length) return { created: false };

  await db.insert(adminUsers).values({
    id: randomUUID(), username, passwordHash: await hashPassword(password),
  });
  return { created: true };
}
