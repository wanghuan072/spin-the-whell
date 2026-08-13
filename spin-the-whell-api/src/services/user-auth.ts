import { randomUUID } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { getEnv } from "../config/env.js";
import { db } from "../db/client.js";
import { userIdentities, userSessions, users } from "../db/schema.js";
import { createOpaqueToken, sha256 } from "../lib/crypto.js";
import { AppError } from "../lib/errors.js";

const GOOGLE_PROVIDER = "google";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const googleClient = new OAuth2Client();

type PublicUser = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
};

function normalizeDisplayName(value: string) {
  const normalized = [...value.normalize("NFKC")]
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return [...normalized].slice(0, 40).join("");
}

function toPublicUser(user: { id: string; displayName: string; avatarUrl: string | null }): PublicUser {
  return { id: user.id, displayName: user.displayName, avatarUrl: user.avatarUrl };
}

export async function loginWithGoogle(credential: string) {
  const clientId = getEnv().GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new AppError(503, "GOOGLE_AUTH_NOT_CONFIGURED", "Google sign-in has not been configured yet.");
  }
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown verification error";
    console.error(`Google ID token verification failed: ${reason}`);
    throw new AppError(401, "INVALID_GOOGLE_CREDENTIAL", "Google sign-in could not be verified. Please try again.");
  }

  const payload = ticket.getPayload();
  if (!payload?.sub) {
    throw new AppError(401, "INVALID_GOOGLE_CREDENTIAL", "Google sign-in did not include a valid account identifier.");
  }

  const fallbackName = payload.email?.split("@")[0] ?? "Wheel User";
  const displayName = normalizeDisplayName(payload.name ?? payload.given_name ?? fallbackName);
  if (displayName.length < 2) {
    throw new AppError(400, "INVALID_GOOGLE_PROFILE", "Your Google profile does not include a usable display name.");
  }

  const profile = {
    displayName,
    email: payload.email ?? null,
    emailVerified: payload.email_verified === true,
    avatarUrl: payload.picture ?? null,
    locale: payload.locale?.slice(0, 24) ?? null,
  };

  const [existing] = await db.select({
    id: users.id,
    displayName: users.displayName,
    avatarUrl: users.avatarUrl,
    status: users.status,
  }).from(userIdentities)
    .innerJoin(users, eq(userIdentities.userId, users.id))
    .where(and(
      eq(userIdentities.provider, GOOGLE_PROVIDER),
      eq(userIdentities.providerSubject, payload.sub),
    ))
    .limit(1);

  let user: PublicUser;
  if (existing) {
    if (existing.status === "blocked") {
      throw new AppError(403, "ACCOUNT_BLOCKED", "This account cannot sign in.");
    }
    const [updated] = await db.update(users).set({
      ...profile,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(users.id, existing.id)).returning({
      id: users.id,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    });
    user = toPublicUser(updated);
  } else {
    const userId = randomUUID();
    try {
      const [createdRows] = await db.batch([
        db.insert(users).values({ id: userId, ...profile }).returning({
          id: users.id,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        }),
        db.insert(userIdentities).values({
          id: randomUUID(),
          userId,
          provider: GOOGLE_PROVIDER,
          providerSubject: payload.sub,
        }),
      ] as const);
      user = toPublicUser(createdRows[0]);
    } catch (error) {
      // A simultaneous first login can win the unique provider identity race.
      // The Neon batch is atomic, so refetch the winning account without leaving an orphan user.
      const [raced] = await db.select({
        id: users.id,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        status: users.status,
      }).from(userIdentities)
        .innerJoin(users, eq(userIdentities.userId, users.id))
        .where(and(
          eq(userIdentities.provider, GOOGLE_PROVIDER),
          eq(userIdentities.providerSubject, payload.sub),
        ))
        .limit(1);
      if (!raced) throw error;
      if (raced.status === "blocked") {
        throw new AppError(403, "ACCOUNT_BLOCKED", "This account cannot sign in.");
      }
      user = toPublicUser(raced);
    }
  }

  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(userSessions).values({
    id: randomUUID(),
    userId: user.id,
    tokenHash: sha256(token),
    expiresAt,
  });

  if (Math.random() < 0.01) {
    void db.delete(userSessions).where(lt(userSessions.expiresAt, new Date())).catch(() => undefined);
  }

  return { token, expiresAt, user };
}

export async function getUserBySessionToken(token: string) {
  const [row] = await db.select({
    sessionId: userSessions.id,
    id: users.id,
    displayName: users.displayName,
    avatarUrl: users.avatarUrl,
    status: users.status,
  }).from(userSessions)
    .innerJoin(users, eq(userSessions.userId, users.id))
    .where(and(eq(userSessions.tokenHash, sha256(token)), gt(userSessions.expiresAt, new Date())))
    .limit(1);

  if (!row || row.status !== "active") return null;
  await db.update(userSessions).set({ lastUsedAt: new Date() }).where(eq(userSessions.id, row.sessionId));
  return toPublicUser(row);
}

export async function logoutUser(token: string) {
  await db.delete(userSessions).where(eq(userSessions.tokenHash, sha256(token)));
}
