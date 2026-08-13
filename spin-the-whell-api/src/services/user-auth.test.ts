import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  batch: vi.fn(),
  deleteWhere: vi.fn(),
  insertValues: vi.fn(),
  selectResult: [] as Array<Record<string, unknown>>,
  updateResult: [] as Array<Record<string, unknown>>,
  verifyIdToken: vi.fn(),
}));

vi.mock("google-auth-library", () => ({
  OAuth2Client: class {
    verifyIdToken = mocks.verifyIdToken;
  },
}));

vi.mock("../config/env.js", () => ({
  getEnv: () => ({ GOOGLE_CLIENT_ID: "client.apps.googleusercontent.com" }),
}));

vi.mock("../db/client.js", () => ({
  db: {
    batch: mocks.batch,
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve(mocks.selectResult)),
          })),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve(mocks.updateResult)),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: mocks.insertValues,
    })),
    delete: vi.fn(() => ({ where: mocks.deleteWhere })),
  },
}));

import { AppError } from "../lib/errors.js";
import { loginWithGoogle } from "./user-auth.js";

const existingUser = {
  id: "4d7ffbf8-1cd4-466b-bc18-1ddc25b269c8",
  displayName: "Old Name",
  avatarUrl: null,
  status: "active",
};

describe("Google user authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(1);
    mocks.selectResult = [existingUser];
    mocks.updateResult = [{
      id: existingUser.id,
      displayName: "Updated Google Name",
      avatarUrl: "https://example.test/avatar.png",
    }];
    mocks.insertValues.mockReturnValue({ returning: vi.fn() });
    mocks.verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: "google-subject-123",
        name: "Updated Google Name",
        email: "person@example.test",
        email_verified: true,
        picture: "https://example.test/avatar.png",
        locale: "en",
      }),
    });
  });

  it("refreshes a returning user's profile and creates an opaque local session", async () => {
    const result = await loginWithGoogle("credential".repeat(20));

    expect(mocks.verifyIdToken).toHaveBeenCalledWith({
      idToken: "credential".repeat(20),
      audience: "client.apps.googleusercontent.com",
    });
    expect(result.user).toEqual({
      id: existingUser.id,
      displayName: "Updated Google Name",
      avatarUrl: "https://example.test/avatar.png",
    });
    expect(result.token).toMatch(/^[A-Za-z0-9_-]+$/);
    const insertedValues: unknown[] = mocks.insertValues.mock.calls.map((call) => call[0] as unknown);
    const sessionValues = insertedValues.find((value): value is Record<string, unknown> => (
      typeof value === "object" && value !== null && "tokenHash" in value
    ));
    expect(sessionValues?.userId).toBe(existingUser.id);
    expect(sessionValues?.tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects a credential that Google cannot verify", async () => {
    mocks.verifyIdToken.mockRejectedValueOnce(new Error("bad token"));

    await expect(loginWithGoogle("invalid".repeat(20))).rejects.toMatchObject<AppError>({
      statusCode: 401,
      code: "INVALID_GOOGLE_CREDENTIAL",
    });
    expect(mocks.insertValues).not.toHaveBeenCalled();
  });

  it("creates a new user and identity in an atomic Neon batch", async () => {
    mocks.selectResult = [];
    mocks.insertValues.mockReturnValue({ returning: vi.fn(() => ({ query: "create-user" })) });
    mocks.batch.mockResolvedValueOnce([[
      { id: "851effc9-fe3e-45e1-a229-a6ef69dc8b84", displayName: "Updated Google Name", avatarUrl: null },
    ], []]);

    const result = await loginWithGoogle("credential".repeat(20));

    expect(mocks.batch).toHaveBeenCalledOnce();
    expect(result.user.displayName).toBe("Updated Google Name");
    expect(mocks.insertValues).toHaveBeenCalledWith(expect.objectContaining({
      provider: "google",
      providerSubject: "google-subject-123",
    }));
  });
});
