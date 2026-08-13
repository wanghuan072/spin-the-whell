import { describe, expect, it } from "vitest";
import { publicCommentSchema } from "./comments.js";

describe("publicCommentSchema", () => {
  it("normalizes safe plain text", () => {
    const value = publicCommentSchema.parse({
      body: "Hello\r\nworld", website: "", startedAt: Date.now() - 2000,
    });
    expect(value.body).toBe("Hello\nworld");
  });

  it("rejects oversized comments and bot honeypot values", () => {
    expect(() => publicCommentSchema.parse({
      body: "x".repeat(1001), website: "bot", startedAt: Date.now(),
    })).toThrow();
  });
});
