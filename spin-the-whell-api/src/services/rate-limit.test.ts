import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  returning: vi.fn(),
}));

vi.mock("../db/client.js", () => ({
  db: {
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn(() => ({ returning: mocks.returning })),
      })),
    })),
  },
}));

import { AppError } from "../lib/errors.js";
import { consumeRateLimits, publicCommentRules } from "./rate-limit.js";

describe("consumeRateLimits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(1);
  });

  it("consumes every configured window while the subject is under its limits", async () => {
    mocks.returning.mockResolvedValue([{ hits: 1 }]);

    await expect(consumeRateLimits("subject", publicCommentRules)).resolves.toBeUndefined();
    expect(mocks.returning).toHaveBeenCalledTimes(publicCommentRules.length);
  });

  it("returns a retry interval when a window exceeds its limit", async () => {
    mocks.returning.mockResolvedValueOnce([{ hits: publicCommentRules[0].limit + 1 }]);

    try {
      await consumeRateLimits("subject", publicCommentRules);
      expect.fail("Expected the rate limit to reject the request.");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      const appError = error as AppError;
      expect(appError.code).toBe("RATE_LIMITED");
      expect(appError.statusCode).toBe(429);
      expect((appError.details as { retryAfter: number }).retryAfter).toBeGreaterThan(0);
    }
  });
});
