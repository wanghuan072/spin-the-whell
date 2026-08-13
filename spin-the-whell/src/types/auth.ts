export type AuthUser = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
