import { randomUUID } from "node:crypto";
import { and, count, desc, eq, gte, ilike, or, type SQL } from "drizzle-orm";
import { db } from "../db/client.js";
import { comments } from "../db/schema.js";
import { sha256 } from "../lib/crypto.js";
import { AppError } from "../lib/errors.js";
import type { AdminCreateCommentInput, AdminUpdateCommentInput } from "../validation/comments.js";

const publicColumns = {
  id: comments.id,
  username: comments.username,
  body: comments.body,
  createdAt: comments.createdAt,
};

export async function listPublishedComments(page: number, limit: number) {
  const where = eq(comments.status, "published");
  const [{ total }] = await db.select({ total: count() }).from(comments).where(where);
  const items = await db.select(publicColumns).from(comments).where(where)
    .orderBy(desc(comments.createdAt)).limit(limit).offset((page - 1) * limit);

  return { items, pagination: createPagination(total, page, limit) };
}

export async function createPublicComment(userId: string, username: string, body: string, ipHash: string) {
  const contentHash = sha256(`${username.toLocaleLowerCase()}\n${body}`);
  const duplicateSince = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [duplicate] = await db.select({ id: comments.id }).from(comments).where(and(
    eq(comments.contentHash, contentHash),
    gte(comments.createdAt, duplicateSince),
    or(eq(comments.userId, userId), eq(comments.ipHash, ipHash)),
  )).limit(1);

  if (duplicate) {
    throw new AppError(409, "DUPLICATE_COMMENT", "This comment was already submitted recently.");
  }

  const [created] = await db.insert(comments).values({
    id: randomUUID(), userId, username, body, status: "published", ipHash, contentHash,
  }).returning(publicColumns);
  return created;
}

export async function listAdminComments(page: number, limit: number, search: string, status: string) {
  const filters: SQL[] = [];
  if (status !== "all") filters.push(eq(comments.status, status));
  if (search) {
    const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
    filters.push(or(ilike(comments.username, pattern), ilike(comments.body, pattern))!);
  }
  const where = filters.length ? and(...filters) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(comments).where(where);
  const items = await db.select({
    id: comments.id, username: comments.username, body: comments.body,
    status: comments.status, createdAt: comments.createdAt, updatedAt: comments.updatedAt,
  }).from(comments).where(where).orderBy(desc(comments.createdAt))
    .limit(limit).offset((page - 1) * limit);
  return { items, pagination: createPagination(total, page, limit) };
}

export async function createAdminComment(input: AdminCreateCommentInput) {
  const [created] = await db.insert(comments).values({
    id: randomUUID(),
    ...input,
    ipHash: "admin",
    contentHash: sha256(`${input.username.toLocaleLowerCase()}\n${input.body}`),
  }).returning();
  return created;
}

export async function updateAdminComment(id: string, input: AdminUpdateCommentInput) {
  const [existing] = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  if (!existing) throw new AppError(404, "COMMENT_NOT_FOUND", "Comment not found.");
  const username = input.username ?? existing.username;
  const body = input.body ?? existing.body;
  const [updated] = await db.update(comments).set({
    ...input,
    contentHash: sha256(`${username.toLocaleLowerCase()}\n${body}`),
    updatedAt: new Date(),
  }).where(eq(comments.id, id)).returning();
  return updated;
}

export async function deleteAdminComment(id: string) {
  const [deleted] = await db.delete(comments).where(eq(comments.id, id)).returning({ id: comments.id });
  if (!deleted) throw new AppError(404, "COMMENT_NOT_FOUND", "Comment not found.");
}

function createPagination(total: number, page: number, limit: number) {
  return { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
}
