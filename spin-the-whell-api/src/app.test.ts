import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  consumeRateLimits: vi.fn(),
  createAdminComment: vi.fn(),
  createPublicComment: vi.fn(),
  deleteAdminComment: vi.fn(),
  getAdminBySessionToken: vi.fn(),
  getUserBySessionToken: vi.fn(),
  listAdminComments: vi.fn(),
  listPublishedComments: vi.fn(),
  loginAdmin: vi.fn(),
  logoutAdmin: vi.fn(),
  loginWithGoogle: vi.fn(),
  logoutUser: vi.fn(),
  updateAdminComment: vi.fn(),
}));

vi.mock("./config/env.js", () => ({
  getEnv: () => ({
    DATABASE_URL: "postgresql://test:test@localhost/test",
    FRONTEND_ORIGIN: "http://localhost:3000",
    GOOGLE_CLIENT_ID: "google-client-id.apps.googleusercontent.com",
    IP_HASH_SECRET: "i".repeat(32),
    NODE_ENV: "test",
    PORT: 4000,
  }),
}));

vi.mock("./lib/request.js", () => ({
  getIpHash: () => "test-ip-hash",
}));

vi.mock("./services/rate-limit.js", () => ({
  adminLoginRules: [{ namespace: "test-admin", limit: 8, windowMs: 60_000 }],
  consumeRateLimits: mocks.consumeRateLimits,
  publicCommentRules: [{ namespace: "test-comment", limit: 3, windowMs: 60_000 }],
  userLoginRules: [{ namespace: "test-user-login", limit: 12, windowMs: 60_000 }],
}));

vi.mock("./services/comments.js", () => ({
  createAdminComment: mocks.createAdminComment,
  createPublicComment: mocks.createPublicComment,
  deleteAdminComment: mocks.deleteAdminComment,
  listAdminComments: mocks.listAdminComments,
  listPublishedComments: mocks.listPublishedComments,
  updateAdminComment: mocks.updateAdminComment,
}));

vi.mock("./services/admin-auth.js", () => ({
  getAdminBySessionToken: mocks.getAdminBySessionToken,
  loginAdmin: mocks.loginAdmin,
  logoutAdmin: mocks.logoutAdmin,
}));

vi.mock("./services/user-auth.js", () => ({
  getUserBySessionToken: mocks.getUserBySessionToken,
  loginWithGoogle: mocks.loginWithGoogle,
  logoutUser: mocks.logoutUser,
}));

import { createApp } from "./app.js";

const trustedOrigin = "http://localhost:3000";
const admin = { id: "8d6faaca-31f7-4a2c-9f2b-64cf555b0478", username: "admin" };
const user = {
  id: "3e2f8721-4f82-4375-bf93-7426123bd8ce",
  displayName: "Wheel Fan",
  avatarUrl: "https://example.test/avatar.png",
};
const publicComment = {
  id: "9e8398e3-826c-43d7-8e92-3ce0f9c77538",
  username: "Wheel Fan",
  body: "Useful picker.",
  createdAt: new Date("2026-08-11T08:00:00.000Z"),
};

describe("HTTP API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.consumeRateLimits.mockResolvedValue(undefined);
    mocks.listPublishedComments.mockResolvedValue({
      items: [publicComment],
      pagination: { total: 1, page: 1, limit: 20, pages: 1 },
    });
    mocks.createPublicComment.mockResolvedValue(publicComment);
    mocks.loginAdmin.mockResolvedValue({
      admin,
      expiresAt: new Date("2026-08-18T08:00:00.000Z"),
      token: "opaque-session-token",
    });
    mocks.getAdminBySessionToken.mockResolvedValue(admin);
    mocks.getUserBySessionToken.mockResolvedValue(user);
    mocks.loginWithGoogle.mockResolvedValue({
      user,
      expiresAt: new Date("2026-09-10T08:00:00.000Z"),
      token: "opaque-user-session-token",
    });
    mocks.listAdminComments.mockResolvedValue({
      items: [{ ...publicComment, status: "published", updatedAt: publicComment.createdAt }],
      pagination: { total: 1, page: 1, limit: 20, pages: 1 },
    });
  });

  it("serves health checks with security headers and hides Express branding", async () => {
    const response = await request(createApp()).get("/api/health").expect(200);

    expect(response.body).toEqual({ status: "ok" });
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("lists public comments through the validated pagination contract", async () => {
    const response = await request(createApp()).get("/api/comments?page=1&limit=20").expect(200);

    const body = response.body as { pagination: { total: number } };
    expect(body.pagination.total).toBe(1);
    expect(mocks.listPublishedComments).toHaveBeenCalledWith(1, 20);
  });

  it("accepts a human-timed public comment and applies anti-abuse limits", async () => {
    const response = await request(createApp())
      .post("/api/comments")
      .set("Origin", trustedOrigin)
      .set("X-Requested-With", "SpinTheWheel")
      .set("Cookie", "spin_user_session=valid")
      .send({
        body: "Useful picker.",
        website: "",
        startedAt: Date.now() - 2_000,
      })
      .expect(201);

    const body = response.body as { comment: { username: string } };
    expect(body.comment.username).toBe("Wheel Fan");
    expect(mocks.consumeRateLimits).toHaveBeenCalledWith("ip:test-ip-hash", expect.any(Array));
    expect(mocks.consumeRateLimits).toHaveBeenCalledWith(`user:${user.id}`, expect.any(Array));
    expect(mocks.createPublicComment).toHaveBeenCalledWith(
      user.id,
      "Wheel Fan",
      "Useful picker.",
      "test-ip-hash",
    );
  });

  it("rejects submissions completed too quickly", async () => {
    const response = await request(createApp())
      .post("/api/comments")
      .set("Origin", trustedOrigin)
      .set("X-Requested-With", "SpinTheWheel")
      .set("Cookie", "spin_user_session=valid")
      .send({ body: "Useful picker.", website: "", startedAt: Date.now() })
      .expect(400);

    const body = response.body as { error: { code: string } };
    expect(body.error.code).toBe("INVALID_SUBMISSION");
    expect(mocks.createPublicComment).not.toHaveBeenCalled();
  });

  it("requires sign-in before accepting a public comment", async () => {
    const response = await request(createApp())
      .post("/api/comments")
      .set("Origin", trustedOrigin)
      .set("X-Requested-With", "SpinTheWheel")
      .send({ body: "Useful picker.", website: "", startedAt: Date.now() - 2_000 })
      .expect(401);

    expect(response.body).toMatchObject({ error: { code: "UNAUTHORIZED" } });
    expect(mocks.createPublicComment).not.toHaveBeenCalled();
  });

  it("creates a local session after Google sign-in", async () => {
    const credential = "a".repeat(200);
    const response = await request(createApp())
      .post("/api/auth/google")
      .set("Origin", trustedOrigin)
      .set("X-Requested-With", "SpinTheWheel")
      .send({ credential })
      .expect(200);

    expect(response.body).toEqual({ user });
    expect(mocks.loginWithGoogle).toHaveBeenCalledWith(credential);
    expect(response.headers["set-cookie"]?.[0]).toContain("spin_user_session=opaque-user-session-token");
    expect(response.headers["set-cookie"]?.[0]).toContain("HttpOnly");
  });

  it("returns the current signed-in user without exposing session data", async () => {
    const response = await request(createApp())
      .get("/api/auth/me")
      .set("Cookie", "spin_user_session=valid")
      .expect(200);

    expect(response.body).toEqual({ user });
  });

  it("sets an HttpOnly admin cookie after a trusted-origin login", async () => {
    const response = await request(createApp())
      .post("/api/admin/auth/login")
      .set("Origin", trustedOrigin)
      .set("X-Requested-With", "SpinTheWheel")
      .send({ username: "admin", password: "correct horse battery staple" })
      .expect(200);

    const body = response.body as { admin: typeof admin };
    expect(body.admin).toEqual(admin);
    expect(response.headers["set-cookie"]?.[0]).toContain("spin_admin_session=opaque-session-token");
    expect(response.headers["set-cookie"]?.[0]).toContain("HttpOnly");
    expect(response.headers["set-cookie"]?.[0]).toContain("SameSite=Lax");
  });

  it("blocks state-changing admin requests from an untrusted origin", async () => {
    const response = await request(createApp())
      .post("/api/admin/auth/login")
      .set("Origin", "https://untrusted.example")
      .set("X-Requested-With", "SpinTheWheel")
      .send({ username: "admin", password: "password" })
      .expect(403);

    const body = response.body as { error: { code: string } };
    expect(body.error.code).toBe("UNTRUSTED_ORIGIN");
    expect(mocks.loginAdmin).not.toHaveBeenCalled();
  });

  it("blocks state-changing requests without the same-origin browser marker", async () => {
    const response = await request(createApp())
      .post("/api/auth/google")
      .set("Origin", trustedOrigin)
      .send({ credential: "a".repeat(200) })
      .expect(403);

    expect(response.body).toMatchObject({ error: { code: "UNTRUSTED_ORIGIN" } });
    expect(mocks.loginWithGoogle).not.toHaveBeenCalled();
  });

  it("requires a valid session before returning admin comments", async () => {
    mocks.getAdminBySessionToken.mockResolvedValueOnce(null);
    await request(createApp())
      .get("/api/admin/comments")
      .set("Cookie", "spin_admin_session=expired")
      .expect(401);

    const response = await request(createApp())
      .get("/api/admin/comments?page=1&limit=20&search=&status=all")
      .set("Cookie", "spin_admin_session=valid")
      .expect(200);

    const body = response.body as { items: unknown[] };
    expect(body.items).toHaveLength(1);
    expect(mocks.listAdminComments).toHaveBeenCalledWith(1, 20, "", "all");
  });

  it("returns a stable JSON error for unknown routes", async () => {
    const response = await request(createApp()).get("/api/missing").expect(404);
    expect(response.body).toEqual({ error: { code: "NOT_FOUND", message: "Route not found." } });
  });
});
