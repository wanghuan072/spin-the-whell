import type { AuthUser } from "@/types/auth";
import { apiRequest } from "./core";

export function getCurrentUser() {
  return apiRequest<{ user: AuthUser | null }>("/api/auth/me");
}

export function signInWithGoogle(credential: string) {
  return apiRequest<{ user: AuthUser }>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function signOutUser() {
  return apiRequest<void>("/api/auth/logout", { method: "POST" });
}
