/** @vitest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: {
    user: null as { id: string; displayName: string; avatarUrl: string | null } | null,
    status: "unauthenticated" as "loading" | "authenticated" | "unauthenticated",
    openSignIn: vi.fn(),
  },
  getComments: vi.fn(),
  submitComment: vi.fn(),
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => mocks.auth,
}));

vi.mock("@/components/auth/GoogleSignInButton", () => ({
  GoogleSignInButton: () => <button type="button">Mock Google sign-in</button>,
}));

vi.mock("@/lib/comment-api/public", () => ({
  getComments: mocks.getComments,
  submitComment: mocks.submitComment,
}));

import { CommentsPage } from "./CommentsPage";

describe("CommentsPage authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.user = null;
    mocks.auth.status = "unauthenticated";
    mocks.getComments.mockResolvedValue({
      items: [],
      pagination: { total: 0, page: 1, limit: 12, pages: 1 },
    });
    mocks.submitComment.mockResolvedValue(undefined);
  });

  it("shows Google sign-in instead of the comment form for visitors", async () => {
    render(<CommentsPage />);

    expect(screen.getByRole("heading", { name: "Sign in to comment" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mock Google sign-in" })).toBeTruthy();
    expect(screen.queryByLabelText("Message")).toBeNull();
    await waitFor(() => expect(mocks.getComments).toHaveBeenCalledWith(1));
  });

  it("posts only the message body for an authenticated user", async () => {
    mocks.auth.user = { id: "user-1", displayName: "Wheel Fan", avatarUrl: null };
    mocks.auth.status = "authenticated";
    render(<CommentsPage />);

    expect(screen.getByText("Wheel Fan")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "A useful wheel tip." } });
    fireEvent.click(screen.getByRole("button", { name: "Post comment" }));

    await waitFor(() => expect(mocks.submitComment).toHaveBeenCalledWith({
      body: "A useful wheel tip.",
      website: "",
      startedAt: expect.any(Number),
    }));
  });
});
