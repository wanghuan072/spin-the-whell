"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/comment-api/core";
import { useAuth } from "./AuthProvider";
import styles from "@/style/components/auth/Auth.module.css";

let scriptPromise: Promise<void> | null = null;

type GoogleIdentityRuntime = {
  clientId: string;
  handlers: Map<symbol, (credential: string) => void>;
};

type GoogleIdentityWindow = Window & {
  __spinGoogleIdentityRuntime?: GoogleIdentityRuntime;
};

function loadGoogleIdentity() {
  if (window.google?.accounts.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    const script = existing ?? document.createElement("script");
    const onLoad = () => resolve();
    const onError = () => reject(new Error("Google sign-in could not be loaded."));
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    if (!existing) {
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

function getGoogleIdentityRuntime(clientId: string) {
  const identityWindow = window as GoogleIdentityWindow;
  const existing = identityWindow.__spinGoogleIdentityRuntime;
  if (existing?.clientId === clientId) return existing;
  if (!window.google) throw new Error("Google sign-in could not be initialized.");

  const runtime: GoogleIdentityRuntime = { clientId, handlers: new Map() };
  identityWindow.__spinGoogleIdentityRuntime = runtime;
  window.google.accounts.id.initialize({
    client_id: clientId,
    auto_select: false,
    cancel_on_tap_outside: true,
    callback: ({ credential }) => {
      const handlers = [...runtime.handlers.values()];
      handlers.at(-1)?.(credential);
    },
  });
  return runtime;
}

export function GoogleSignInButton({ onSignedIn }: { onSignedIn?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { signIn } = useAuth();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [error, setError] = useState<string | null>(
    clientId ? null : "Google sign-in has not been configured yet.",
  );
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    let active = true;
    let unregister: (() => void) | undefined;
    if (!clientId) return;

    loadGoogleIdentity()
      .then(() => {
        if (!active || !containerRef.current || !window.google) return;
        const runtime = getGoogleIdentityRuntime(clientId);
        const handlerId = Symbol("google-credential-handler");
        runtime.handlers.set(handlerId, (credential) => {
          setError(null);
          setSigningIn(true);
          void signIn(credential)
            .then(() => onSignedIn?.())
            .catch((reason: unknown) => {
              if (!active) return;
              setError(reason instanceof ApiError ? reason.message : "Google sign-in failed. Please try again.");
            })
            .finally(() => { if (active) setSigningIn(false); });
        });
        unregister = () => { runtime.handlers.delete(handlerId); };
        containerRef.current.replaceChildren();
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill",
          width: 280,
        });
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Google sign-in could not be loaded.");
      });

    return () => {
      active = false;
      unregister?.();
    };
  }, [clientId, onSignedIn, signIn]);

  return (
    <div className={styles.googleButtonGroup}>
      <div ref={containerRef} className={styles.googleButton} aria-label="Sign in with Google" />
      {signingIn && <p className={styles.authProgress} role="status">Signing you in…</p>}
      {error && <p className={styles.authError} role="alert">{error}</p>}
    </div>
  );
}
