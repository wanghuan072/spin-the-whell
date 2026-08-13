import { describe, expect, it } from "vitest";
import { createPrivateHash, hashPassword, verifyPassword } from "./crypto.js";

describe("crypto helpers", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("a-long-test-password");
    expect(await verifyPassword("a-long-test-password", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("creates deterministic secret-scoped hashes", () => {
    expect(createPrivateHash("127.0.0.1", "x".repeat(32))).toBe(createPrivateHash("127.0.0.1", "x".repeat(32)));
    expect(createPrivateHash("127.0.0.1", "x".repeat(32))).not.toBe(createPrivateHash("127.0.0.1", "y".repeat(32)));
  });
});
