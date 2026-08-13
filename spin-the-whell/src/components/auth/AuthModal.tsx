"use client";

import { useEffect, useRef } from "react";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useAuth } from "./AuthProvider";
import styles from "@/style/components/auth/Auth.module.css";

export function AuthModal() {
  const { closeSignIn } = useAuth();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSignIn();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeSignIn]);

  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeSignIn();
    }}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="sign-in-title">
        <button ref={closeRef} type="button" className={styles.modalClose} onClick={closeSignIn} aria-label="Close sign-in dialog">
          ×
        </button>
        <p className={styles.modalEyebrow}>Community account</p>
        <h2 id="sign-in-title">Sign in to join the conversation</h2>
        <p>Your wheel stays local and works without an account. Google sign-in is only used for community features such as comments.</p>
        <GoogleSignInButton />
        <p className={styles.modalPrivacy}>We store your Google account ID, name, email, and profile image to operate your account. We never receive your Google password.</p>
      </section>
    </div>
  );
}
