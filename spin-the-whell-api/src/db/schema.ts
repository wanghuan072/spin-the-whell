import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  displayName: varchar("display_name", { length: 40 }).notNull(),
  email: varchar("email", { length: 320 }),
  emailVerified: boolean("email_verified").notNull().default(false),
  avatarUrl: text("avatar_url"),
  locale: varchar("locale", { length: 24 }),
  status: varchar("status", { length: 16 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check("users_status_check", sql`${table.status} in ('active', 'blocked')`),
  index("users_email_idx").on(table.email),
]);

export const userIdentities = pgTable("user_identities", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 32 }).notNull(),
  providerSubject: varchar("provider_subject", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("user_identities_provider_subject_unique").on(table.provider, table.providerSubject),
  index("user_identities_user_idx").on(table.userId),
]);

export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("user_sessions_token_hash_unique").on(table.tokenHash),
  index("user_sessions_user_idx").on(table.userId),
  index("user_sessions_expiry_idx").on(table.expiresAt),
]);

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  username: varchar("username", { length: 40 }).notNull(),
  body: text("body").notNull(),
  status: varchar("status", { length: 16 }).notNull().default("published"),
  ipHash: varchar("ip_hash", { length: 64 }).notNull(),
  contentHash: varchar("content_hash", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check("comments_status_check", sql`${table.status} in ('published', 'hidden')`),
  check("comments_body_length_check", sql`char_length(${table.body}) between 3 and 1000`),
  index("comments_status_created_at_idx").on(table.status, table.createdAt),
  index("comments_user_created_at_idx").on(table.userId, table.createdAt),
  index("comments_duplicate_guard_idx").on(table.ipHash, table.contentHash, table.createdAt),
]);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey(),
  username: varchar("username", { length: 64 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("admin_users_username_unique").on(table.username),
]);

export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").primaryKey(),
  adminUserId: uuid("admin_user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("admin_sessions_token_hash_unique").on(table.tokenHash),
  index("admin_sessions_user_idx").on(table.adminUserId),
  index("admin_sessions_expiry_idx").on(table.expiresAt),
]);

export const rateLimitWindows = pgTable("rate_limit_windows", {
  key: text("key").primaryKey(),
  hits: integer("hits").notNull().default(1),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check("rate_limit_windows_hits_check", sql`${table.hits} > 0`),
  index("rate_limit_windows_expiry_idx").on(table.expiresAt),
]);

export type CommentRow = typeof comments.$inferSelect;
export type AdminUserRow = typeof adminUsers.$inferSelect;
export type UserRow = typeof users.$inferSelect;
