import { Router } from "express";
import { requireTrustedOrigin } from "../middleware/origin.js";
import { requireUser } from "../middleware/user-auth.js";
import { getIpHash } from "../lib/request.js";
import { AppError } from "../lib/errors.js";
import { createPublicComment, listPublishedComments } from "../services/comments.js";
import { consumeRateLimits, publicCommentRules } from "../services/rate-limit.js";
import { publicCommentSchema, publicListQuerySchema } from "../validation/comments.js";

export const commentsRouter = Router();

commentsRouter.get("/", async (request, response) => {
  const query = publicListQuerySchema.parse(request.query);
  response.json(await listPublishedComments(query.page, query.limit));
});

commentsRouter.post("/", requireTrustedOrigin, requireUser, async (request, response) => {
  const input = publicCommentSchema.parse(request.body);
  const elapsed = Date.now() - input.startedAt;
  if (input.website || elapsed < 1500 || elapsed > 24 * 60 * 60 * 1000) {
    throw new AppError(400, "INVALID_SUBMISSION", "Please refresh the page and try again.");
  }

  const ipHash = getIpHash(request);
  const user = request.user!;
  await consumeRateLimits(`ip:${ipHash}`, publicCommentRules);
  await consumeRateLimits(`user:${user.id}`, publicCommentRules);
  const comment = await createPublicComment(user.id, user.displayName, input.body, ipHash);
  response.status(201).json({ comment });
});
