"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import styles from "@/style/components/auth/Auth.module.css";

export function HeaderAuth() {
  const { user, status, openSignIn, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  if (status === "loading") {
    return <span className={styles.headerAuthSkeleton} aria-label="Checking sign-in status" />;
  }

  if (!user) {
    return (
      <button type="button" className={styles.headerSignIn} onClick={openSignIn}>
        <UserIcon />
        <span>Sign in</span>
      </button>
    );
  }

  return (
    <div ref={rootRef} className={styles.headerAccount}>
      <button
        type="button"
        className={styles.headerAccountButton}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => { setMenuOpen((current) => !current); setSignOutError(false); }}
      >
        <span
          className={`${styles.headerAvatar} ${user.avatarUrl ? styles.hasAvatar : ""}`}
          style={user.avatarUrl ? { backgroundImage: `url(${JSON.stringify(user.avatarUrl)})` } : undefined}
          aria-hidden="true"
        >
          {user.displayName.charAt(0).toUpperCase()}
        </span>
        <span className={styles.headerName}>{user.displayName}</span>
        <span className={styles.chevron} aria-hidden="true">⌄</span>
      </button>
      {menuOpen && (
        <div className={styles.accountMenu} role="menu">
          <div className={styles.accountSummary}>
            <span>Signed in as</span>
            <strong>{user.displayName}</strong>
          </div>
          <Link href="/comments" role="menuitem" onClick={() => setMenuOpen(false)}>Comments</Link>
          <button type="button" role="menuitem" onClick={() => {
            void signOut()
              .then(() => setMenuOpen(false))
              .catch(() => setSignOutError(true));
          }}>Sign out</button>
          {signOutError && <p role="alert">Could not sign out. Try again.</p>}
        </div>
      )}
    </div>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}
