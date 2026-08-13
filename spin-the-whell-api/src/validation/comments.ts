import { z } from "zod";

function normalizeUsername(value: string) {
  return [...value.normalize("NFKC")]
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 31 && code !== 127;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBody(value: string) {
  return value
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .split("")
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 10 || code === 9 || (code > 31 && code !== 127);
    })
    .join("")
    .trim();
}

export const usernameSchema = z.string().transform(normalizeUsername).pipe(
  z.string().min(2, "Username must be at least 2 characters.").max(40, "Username must be 40 characters or fewer."),
);

export const commentBodySchema = z.string().transform(normalizeBody).pipe(
  z.string().min(3, "Comment must be at least 3 characters.").max(1000, "Comment must be 1,000 characters or fewer."),
);

export const publicCommentSchema = z.object({
  body: commentBodySchema,
  website: z.string().max(0).optional().default(""),
  startedAt: z.coerce.number().int().positive(),
}).strict();

export const adminCreateCommentSchema = z.object({
  username: usernameSchema,
  body: commentBodySchema,
  status: z.enum(["published", "hidden"]).default("published"),
}).strict();

export const adminUpdateCommentSchema = z.object({
  username: usernameSchema.optional(),
  body: commentBodySchema.optional(),
  status: z.enum(["published", "hidden"]).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one field is required.");

export const publicListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).default(""),
  status: z.enum(["all", "published", "hidden"]).default("all"),
});

export type AdminCreateCommentInput = z.infer<typeof adminCreateCommentSchema>;
export type AdminUpdateCommentInput = z.infer<typeof adminUpdateCommentSchema>;
