/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pathname: "/blog",
  getCurrentUser: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

vi.mock("@/lib/comment-api/auth", () => ({
  getCurrentUser: mocks.getCurrentUser,
  signInWithGoogle: mocks.signInWithGoogle,
  signOutUser: mocks.signOutUser,
}));

import { AuthProvider, useAuth } from "./AuthProvider";

function AuthStatusProbe() {
  const { status } = useAuth();
  return <span>{status}</span>;
}

describe("AuthProvider session restoration", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mocks.pathname = "/blog";
    mocks.getCurrentUser.mockResolvedValue({ user: null });
  });

  it("does not request the session for an anonymous public page", () => {
    render(
      <AuthProvider>
        <AuthStatusProbe />
      </AuthProvider>,
    );

    expect(screen.getByText("unauthenticated")).toBeTruthy();
    expect(mocks.getCurrentUser).not.toHaveBeenCalled();
  });

  it("restores the session on the comments page", async () => {
    mocks.pathname = "/comments";

    render(
      <AuthProvider>
        <AuthStatusProbe />
      </AuthProvider>,
    );

    expect(screen.getByText("loading")).toBeTruthy();
    await waitFor(() => expect(mocks.getCurrentUser).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText("unauthenticated")).toBeTruthy());
  });

  it("restores a hinted session on another public page", async () => {
    window.localStorage.setItem("spin-auth-session", "1");
    mocks.getCurrentUser.mockResolvedValue({
      user: { id: "user-1", displayName: "Wheel Fan", avatarUrl: null },
    });

    render(
      <AuthProvider>
        <AuthStatusProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(mocks.getCurrentUser).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText("authenticated")).toBeTruthy());
  });
});
