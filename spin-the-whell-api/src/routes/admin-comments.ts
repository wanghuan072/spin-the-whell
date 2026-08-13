import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../middleware/admin-auth.js";
import { requireTrustedOrigin } from "../middleware/origin.js";
import {
  createAdminComment,
  deleteAdminComment,
  listAdminComments,
  updateAdminComment,
} from "../services/comments.js";
import {
  adminCreateCommentSchema,
  adminListQuerySchema,
  adminUpdateCommentSchema,
} from "../validation/comments.js";

export const adminCommentsRouter = Router();
const idSchema = z.uuid();

adminCommentsRouter.use(requireAdmin);

adminCommentsRouter.get("/", async (request, response) => {
  const query = adminListQuerySchema.parse(request.query);
  response.json(await listAdminComments(query.page, query.limit, query.search, query.status));
});

adminCommentsRouter.post("/", requireTrustedOrigin, async (request, response) => {
  const input = adminCreateCommentSchema.parse(request.body);
  response.status(201).json({ comment: await createAdminComment(input) });
});

adminCommentsRouter.patch("/:id", requireTrustedOrigin, async (request, response) => {
  const id = idSchema.parse(request.params.id);
  const input = adminUpdateCommentSchema.parse(request.body);
  response.json({ comment: await updateAdminComment(id, input) });
});

adminCommentsRouter.delete("/:id", requireTrustedOrigin, async (request, response) => {
  const id = idSchema.parse(request.params.id);
  await deleteAdminComment(id);
  response.status(204).end();
});
