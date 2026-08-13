"use client";

import { useEffect, useId, useLayoutEffect, useRef, type RefObject } from "react";
import type { WheelWinnerSceneId } from "../types";
import styles from "../styles/WinnerCelebration.module.css";

interface WinnerCelebrationProps {
  anchorRef: RefObject<HTMLElement | null>;
  colors: string[];
  context?: string;
  effectsEnabled: boolean;
  isComplete: boolean;
  isPreview?: boolean;
  onContinue: () => void;
  onDismiss: () => void;
  paletteId: string;
  sceneId: WheelWinnerSceneId;
  status: string;
  winner: string;
}

interface FireworksController {
  destroy: () => void;
  destroyed: boolean;
}

type CelebrationPattern = "fireworks" | "ribbons" | "flowers" | "spotlight" | "neon" | "balloons";

interface CelebrationProfile {
  accents: string[];
  angleShift: number;
  fireworkRate: number;
  fireworkSplit: number;
  gravity: number;
  pattern: CelebrationPattern;
  usesFireworks: boolean;
}

const CELEBRATION_PROFILES: Record<WheelWinnerSceneId, CelebrationProfile> = {
  festival: { pattern: "fireworks", accents: ["#FFE56B", "#EF57D8", "#FFF4C4"], angleShift: 0, gravity: 0.82, fireworkRate: 3.2, fireworkSplit: 98, usesFireworks: true },
  ribbons: { pattern: "ribbons", accents: ["#67E8F9", "#F9A8D4", "#FDE047"], angleShift: -4, gravity: 0.58, fireworkRate: 0, fireworkSplit: 0, usesFireworks: false },
  bloom: { pattern: "flowers", accents: ["#F9A8D4", "#FBCFE8", "#86EFAC", "#FEF3C7"], angleShift: 0, gravity: 0.34, fireworkRate: 0, fireworkSplit: 0, usesFireworks: false },
  spotlight: { pattern: "spotlight", accents: ["#FDE68A", "#F59E0B", "#FFFFFF"], angleShift: 0, gravity: 0.66, fireworkRate: 0, fireworkSplit: 0, usesFireworks: false },
  neon: { pattern: "neon", accents: ["#22D3EE", "#E879F9", "#A3E635"], angleShift: -10, gravity: 0.46, fireworkRate: 3.5, fireworkSplit: 112, usesFireworks: true },
  balloons: { pattern: "balloons", accents: ["#FB7185", "#60A5FA", "#FDE047", "#4ADE80"], angleShift: 5, gravity: 0.72, fireworkRate: 0, fireworkSplit: 0, usesFireworks: false },
};

export function WinnerCelebration({
  anchorRef,
  colors,
  context,
  effectsEnabled,
  isComplete,
  isPreview = false,
  onContinue,
  onDismiss,
  paletteId,
  sceneId,
  status,
  winner,
}: WinnerCelebrationProps) {
  const titleId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const fireworksCanvasRef = useRef<HTMLCanvasElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const onDismissRef = useRef(onDismiss);
  const profile = CELEBRATION_PROFILES[sceneId];

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    primaryButtonRef.current?.focus({ preventScroll: true });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismissRef.current();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const anchor = anchorRef.current;
    if (!overlay || !anchor) return;
    const overlayElement = overlay;
    const anchorElement = anchor;

    function syncAnchorPosition() {
      const overlayBounds = overlayElement.getBoundingClientRect();
      const anchorBounds = anchorElement.getBoundingClientRect();
      overlayElement.style.setProperty("--winner-anchor-x", `${anchorBounds.left - overlayBounds.left + anchorBounds.width / 2}px`);
      overlayElement.style.setProperty("--winner-anchor-y", `${anchorBounds.top - overlayBounds.top + anchorBounds.height / 2}px`);
      overlayElement.style.setProperty("--winner-anchor-width", `${Math.min(anchorBounds.width, overlayBounds.width)}px`);
    }

    syncAnchorPosition();
    const resizeObserver = new ResizeObserver(syncAnchorPosition);
    resizeObserver.observe(overlayElement);
    resizeObserver.observe(anchorElement);
    window.addEventListener("resize", syncAnchorPosition);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncAnchorPosition);
    };
  }, [anchorRef]);

  useEffect(() => {
    if (!effectsEnabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let fireworksController: FireworksController | undefined;
    let resetConfetti: (() => void) | undefined;
    const timers: number[] = [];

    async function launchCelebration() {
      const fireworksCanvas = fireworksCanvasRef.current;
      const confettiCanvas = confettiCanvasRef.current;
      if (!fireworksCanvas || !confettiCanvas) return;

      const confettiModule = await import("canvas-confetti");
      if (cancelled) return;

      const sceneWidth = fireworksCanvas.parentElement?.clientWidth || fireworksCanvas.clientWidth;
      const isCompact = sceneWidth < 420;
      const celebrationColors = [...new Set([...colors, ...profile.accents])];
      const compactScale = isCompact ? 0.52 : 0.72;
      if (profile.usesFireworks) {
        const { fireworks } = await import("@tsparticles/fireworks/lazy");
        if (cancelled) return;
        const fireworksInstance = await fireworks.create(fireworksCanvas, {
          background: "transparent",
          brightness: { min: 2, max: sceneId === "neon" ? 54 : 44 },
          colors: celebrationColors,
          gravity: sceneId === "neon" ? 17 : 22,
          minHeight: { min: 8, max: 54 },
          rate: profile.fireworkRate * compactScale,
          saturation: { min: 8, max: 34 },
          sounds: false,
          speed: { min: sceneId === "neon" ? 15 : 19, max: sceneId === "neon" ? 44 : 38 },
          splitCount: Math.round(profile.fireworkSplit * compactScale),
        });

        if (cancelled) {
          fireworksInstance?.destroy();
          return;
        }
        fireworksController = fireworksInstance;
      }
      const fireConfetti = confettiModule.default.create(confettiCanvas, {
        resize: true,
        useWorker: true,
        disableForReducedMotion: true,
      });
      resetConfetti = fireConfetti.reset;

      const baseCount = isCompact ? 44 : 74;
      const shared = {
        colors: celebrationColors,
        disableForReducedMotion: true,
        gravity: profile.gravity,
        scalar: isCompact ? 0.86 : 1.08,
        ticks: 320,
      };
      const schedule = (callback: () => void, delay: number) => {
        timers.push(window.setTimeout(callback, delay));
      };
      const sideCannons = (delay: number, velocity = 60) => schedule(() => {
        fireConfetti({ ...shared, angle: 58 + profile.angleShift, origin: { x: 0.02, y: 0.88 }, particleCount: baseCount, shapes: ["square", "circle"], spread: 64, startVelocity: velocity });
        fireConfetti({ ...shared, angle: 122 - profile.angleShift, origin: { x: 0.98, y: 0.88 }, particleCount: baseCount, shapes: ["square", "circle"], spread: 64, startVelocity: velocity });
      }, delay);

      if (profile.pattern === "fireworks") {
        sideCannons(0, isCompact ? 48 : 62);
        schedule(() => fireConfetti({ ...shared, origin: { x: 0.5, y: 0.42 }, particleCount: Math.round(baseCount * 1.15), shapes: ["star"], spread: 360, startVelocity: isCompact ? 30 : 42, gravity: 0.5 }), 420);
        sideCannons(980, isCompact ? 42 : 54);
        schedule(() => fireConfetti({ ...shared, origin: { x: 0.5, y: 0.18 }, particleCount: Math.round(baseCount * 0.8), shapes: ["star", "circle"], spread: 260, startVelocity: 34, gravity: 0.62 }), 1600);
        sideCannons(2350, isCompact ? 38 : 48);
      } else if (profile.pattern === "ribbons") {
        sideCannons(0, isCompact ? 38 : 48);
        schedule(() => fireConfetti({ ...shared, angle: 270, origin: { x: 0.24, y: -0.04 }, particleCount: baseCount, shapes: ["square"], spread: 42, startVelocity: 12, gravity: 0.55, ticks: 460 }), 420);
        schedule(() => fireConfetti({ ...shared, angle: 270, origin: { x: 0.76, y: -0.04 }, particleCount: baseCount, shapes: ["square"], spread: 42, startVelocity: 12, gravity: 0.55, ticks: 460 }), 980);
        sideCannons(1850, isCompact ? 34 : 42);
      } else if (profile.pattern === "flowers") {
        [0.16, 0.38, 0.62, 0.84].forEach((x, index) => schedule(() => fireConfetti({ ...shared, angle: 270, origin: { x, y: -0.04 }, particleCount: Math.round(baseCount * 0.48), shapes: ["circle"], spread: 34, startVelocity: 8, gravity: 0.28, scalar: isCompact ? 1 : 1.3, ticks: 520 }), index * 520));
      } else if (profile.pattern === "spotlight") {
        schedule(() => fireConfetti({ ...shared, angle: 270, origin: { x: 0.5, y: -0.06 }, particleCount: Math.round(baseCount * 0.82), shapes: ["star"], spread: 72, startVelocity: 14, gravity: 0.48, ticks: 480 }), 0);
        schedule(() => fireConfetti({ ...shared, origin: { x: 0.5, y: 0.48 }, particleCount: Math.round(baseCount * 0.75), shapes: ["star"], spread: 300, startVelocity: 26, gravity: 0.58 }), 900);
      } else if (profile.pattern === "neon") {
        sideCannons(0, isCompact ? 46 : 58);
        schedule(() => fireConfetti({ ...shared, origin: { x: 0.5, y: 0.42 }, particleCount: Math.round(baseCount * 1.08), shapes: ["star", "circle"], spread: 360, startVelocity: 38, gravity: 0.38 }), 360);
        sideCannons(1180, isCompact ? 40 : 50);
        schedule(() => fireConfetti({ ...shared, origin: { x: 0.5, y: 0.3 }, particleCount: Math.round(baseCount * 0.68), shapes: ["circle"], spread: 260, startVelocity: 32, gravity: 0.34 }), 2200);
      } else {
        sideCannons(0, isCompact ? 36 : 46);
        schedule(() => fireConfetti({ ...shared, origin: { x: 0.2, y: 0.82 }, particleCount: Math.round(baseCount * 0.62), shapes: ["circle"], spread: 92, startVelocity: 38, gravity: 0.68 }), 650);
        schedule(() => fireConfetti({ ...shared, origin: { x: 0.8, y: 0.82 }, particleCount: Math.round(baseCount * 0.62), shapes: ["circle"], spread: 92, startVelocity: 38, gravity: 0.68 }), 1250);
      }

      schedule(() => {
        if (fireworksController && !fireworksController.destroyed) fireworksController.destroy();
        fireworksController = undefined;
      }, 7200);
      schedule(() => {
        resetConfetti?.();
        resetConfetti = undefined;
      }, 7800);
    }

    void launchCelebration().catch(() => {
      resetConfetti?.();
      if (fireworksController && !fireworksController.destroyed) fireworksController.destroy();
    });

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      resetConfetti?.();
      if (fireworksController && !fireworksController.destroyed) fireworksController.destroy();
    };
  }, [colors, effectsEnabled, profile, sceneId, winner]);

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      data-palette={paletteId}
      data-scene={sceneId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      <div className={styles.backdrop} aria-hidden="true" onMouseDown={onDismiss} />
      <div className={styles.spotlight} aria-hidden="true" />
      <div className={styles.rays} aria-hidden="true" />
      {effectsEnabled ? (
        <div className={styles.effects} aria-hidden="true">
          <canvas ref={fireworksCanvasRef} className={styles.fireworks} />
          <canvas ref={confettiCanvasRef} className={styles.confetti} />
          <div className={styles.sparkles}>
            {Array.from({ length: 14 }, (_, index) => <i key={index} />)}
          </div>
          <div className={styles.sceneDecor} data-effect={profile.pattern}>
            {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
          </div>
        </div>
      ) : null}

      <div className={styles.cardAnchor}>
        <section
          ref={dialogRef}
          className={styles.card}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
        >
        <button
          type="button"
          className={styles.close}
          onClick={onDismiss}
          aria-label="Close winner announcement"
        >
          ×
        </button>
        <div className={styles.crown} aria-hidden="true">
          <span>★</span><span>★</span><span>★</span>
        </div>
        <div className={styles.medal} aria-hidden="true">
          <svg viewBox="0 0 72 72" fill="none">
            <path d="M22 7h12l5 23-12 5L22 7Z" fill="currentColor" opacity=".72" />
            <path d="M50 7H38l-5 23 12 5 5-28Z" fill="currentColor" opacity=".9" />
            <circle cx="36" cy="42" r="21" fill="currentColor" />
            <circle cx="36" cy="42" r="15" fill="none" stroke="white" strokeOpacity=".72" strokeWidth="2" />
            <path d="m36 30 3.7 7.4 8.2 1.2-6 5.8 1.5 8.2-7.4-3.9-7.4 3.9 1.5-8.2-6-5.8 8.2-1.2L36 30Z" fill="white" />
          </svg>
        </div>
        <p className={styles.eyebrow}>{isPreview ? "Style preview" : "The wheel has spoken"}</p>
        <h2 id={titleId}>{isPreview ? "Winner scene preview" : "We have a winner!"}</h2>
        {context ? <div className={styles.context}>{context}</div> : null}
        <div className={styles.winner} title={winner}>
          <span aria-hidden="true">✦</span>
          <strong>{winner}</strong>
          <span aria-hidden="true">✦</span>
        </div>
        <p className={styles.status}>{status}</p>
        <div className={`${styles.actions} ${isPreview ? styles.singleAction : ""}`}>
          {!isPreview ? (
            <button type="button" className={styles.secondary} onClick={onDismiss}>
              View results
            </button>
          ) : null}
          <button
            ref={primaryButtonRef}
            type="button"
            className={styles.primary}
            onClick={isPreview || isComplete ? onDismiss : onContinue}
          >
            <span>{isPreview ? "Close preview" : isComplete ? "Done" : "Next spin"}</span>
            <i aria-hidden="true">{isPreview || isComplete ? "✓" : "↻"}</i>
          </button>
        </div>
        <p className={styles.hint}>Press Esc or use a button to continue.</p>
        <div className={styles.cardGlow} aria-hidden="true" />
        </section>
      </div>

      <div className={`${styles.ribbon} ${styles.ribbonLeft}`} aria-hidden="true" />
      <div className={`${styles.ribbon} ${styles.ribbonRight}`} aria-hidden="true" />
    </div>
  );
}
