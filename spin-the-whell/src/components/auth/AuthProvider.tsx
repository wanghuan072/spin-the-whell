"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { getCurrentUser, signInWithGoogle, signOutUser } from "@/lib/comment-api/auth";
import type { AuthStatus, AuthUser } from "@/types/auth";

const AuthModal = dynamic(() => import("./AuthModal").then((module) => module.AuthModal));
const AUTH_SESSION_HINT_KEY = "spin-auth-session";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  signIn: (credential: string) => Promise<void>;
  signOut: () => Promise<void>;
  openSignIn: () => void;
  closeSignIn: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    pathname === "/comments" || hasSessionHint() ? "loading" : "unauthenticated",
  );
  const [signInOpen, setSignInOpen] = useState(false);
  const restoredRef = useRef(false);

  useEffect(() => {
    const shouldRestore = pathname === "/comments" || hasSessionHint();
    if (!shouldRestore || restoredRef.current) return;
    restoredRef.current = true;

    let active = true;
    getCurrentUser()
      .then(({ user: currentUser }) => {
        if (!active) return;
        setUser(currentUser);
        setStatus(currentUser ? "authenticated" : "unauthenticated");
        setSessionHint(Boolean(currentUser));
      })
      .catch(() => {
        if (active) {
          setStatus("unauthenticated");
          setSessionHint(false);
        }
      });
    return () => { active = false; };
  }, [pathname]);

  const signIn = useCallback(async (credential: string) => {
    const result = await signInWithGoogle(credential);
    setUser(result.user);
    setStatus("authenticated");
    setSessionHint(true);
    setSignInOpen(false);
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setStatus("unauthenticated");
    setSessionHint(false);
  }, []);

  const openSignIn = useCallback(() => {
    if (user) return;
    setStatus("loading");
    getCurrentUser()
      .then(({ user: currentUser }) => {
        if (currentUser) {
          setUser(currentUser);
          setStatus("authenticated");
          setSessionHint(true);
          restoredRef.current = true;
          return;
        }
        setStatus("unauthenticated");
        setSessionHint(false);
        setSignInOpen(true);
      })
      .catch(() => {
        setStatus("unauthenticated");
        setSignInOpen(true);
      });
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    signIn,
    signOut,
    openSignIn,
    closeSignIn: () => setSignInOpen(false),
  }), [openSignIn, signIn, signOut, status, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {signInOpen && <AuthModal />}
    </AuthContext.Provider>
  );
}

function hasSessionHint() {
  try {
    return window.localStorage.getItem(AUTH_SESSION_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function setSessionHint(active: boolean) {
  try {
    if (active) window.localStorage.setItem(AUTH_SESSION_HINT_KEY, "1");
    else window.localStorage.removeItem(AUTH_SESSION_HINT_KEY);
  } catch {
    // Authentication still works when storage is unavailable; only eager restoration is skipped.
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
