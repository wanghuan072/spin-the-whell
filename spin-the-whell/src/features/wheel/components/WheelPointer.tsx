"use client";

import { useId } from "react";
import type { WheelPointerPositionId, WheelPointerStyleId } from "../types";
import styles from "../styles/WheelPointer.module.css";

type WheelPointerProps = {
  styleId: WheelPointerStyleId;
  position?: WheelPointerPositionId;
  isWinning?: boolean;
  /** Compact preview for the style picker */
  preview?: boolean;
  /** Pointer mounted inside another interactive control */
  embedded?: boolean;
};

export function WheelPointer({
  styleId,
  position = "top",
  isWinning = false,
  preview = false,
  embedded = false,
}: WheelPointerProps) {
  const uid = useId().replace(/:/g, "");
  const className = [
    styles.pointer,
    styles[`style-${styleId}`],
    styles[`position-${position}`],
    isWinning ? styles["is-winning"] : "",
    preview ? styles.preview : "",
    embedded ? styles.embedded : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={className} aria-hidden="true" data-style={styleId}>
      {styleId === "jewel" ? <JewelPointer uid={uid} /> : null}
      {styleId === "arrow" ? <ArrowPointer uid={uid} /> : null}
      {styleId === "chevron" ? <ChevronPointer uid={uid} /> : null}
      {styleId === "needle" ? <NeedlePointer uid={uid} /> : null}
      {styleId === "ticket" ? <TicketPointer uid={uid} /> : null}
      {styleId === "claw" ? <ClawPointer uid={uid} /> : null}
      {styleId === "compass" ? <CompassPointer uid={uid} /> : null}
      {styleId === "court" ? <CourtPointer uid={uid} /> : null}
      {styleId === "cinema" ? <CinemaPointer uid={uid} /> : null}
    </span>
  );
}

function CompassPointer({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 48 64" fill="none">
      <defs>
        <linearGradient id={`${uid}-brass`} x1="10" y1="8" x2="36" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff1a8" /><stop offset="0.42" stopColor="#c8963e" /><stop offset="1" stopColor="#593619" />
        </linearGradient>
        <radialGradient id={`${uid}-dial`} cx="36%" cy="30%" r="72%">
          <stop stopColor="#f8e7ac" /><stop offset="0.72" stopColor="#8b5e2c" /><stop offset="1" stopColor="#332014" />
        </radialGradient>
      </defs>
      <path className={styles.shadow} d="M24 63L16 24C11 21 8 16 8 11H40C40 16 37 21 32 24L24 63Z" />
      <path className={styles.body} d="M24 59L18.5 23C14 21 11 17 11 12H37C37 17 34 21 29.5 23L24 59Z" fill={`url(#${uid}-brass)`} />
      <circle className={styles.rim} cx="24" cy="15" r="11" fill={`url(#${uid}-brass)`} />
      <circle cx="24" cy="15" r="7.3" fill={`url(#${uid}-dial)`} stroke="#2f1d12" strokeWidth="1" />
      <path d="M24 8L26 14L24 22L22 14L24 8Z" fill="#f8fafc" stroke="#4b2e16" strokeWidth="0.8" />
      <path d="M24 22L22 15L24 8L26 15L24 22Z" fill="#b91c1c" opacity="0.82" />
      <path className={styles.shine} d="M20 27L22 25L24 49L24 55L20 27Z" />
    </svg>
  );
}

function CourtPointer({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 48 64" fill="none">
      <defs>
        <linearGradient id={`${uid}-steel`} x1="12" y1="8" x2="34" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f8fafc" /><stop offset="0.32" stopColor="#64748b" /><stop offset="0.58" stopColor="#111827" /><stop offset="1" stopColor="#020617" />
        </linearGradient>
        <radialGradient id={`${uid}-ball`} cx="34%" cy="28%" r="72%">
          <stop stopColor="#fdba74" /><stop offset="0.55" stopColor="#ea580c" /><stop offset="1" stopColor="#7c2d12" />
        </radialGradient>
      </defs>
      <path className={styles.shadow} d="M24 63L11 27L14 10H34L37 27L24 63Z" />
      <path className={styles.body} d="M24 59L14 27L17 12H31L34 27L24 59Z" fill={`url(#${uid}-steel)`} />
      <path d="M24 55L20 28H28L24 55Z" fill="#ef4444" />
      <circle className={styles.rim} cx="24" cy="17" r="10" fill={`url(#${uid}-ball)`} />
      <path className={styles.line} d="M14 17H34M24 7C20 12 20 22 24 27M24 7C28 12 28 22 24 27" />
      <path className={styles.shine} d="M18 13C20 10 23 9 25 9L20 15L18 13Z" />
    </svg>
  );
}

function CinemaPointer({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 48 64" fill="none">
      <defs>
        <linearGradient id={`${uid}-noir`} x1="9" y1="8" x2="38" y2="59" gradientUnits="userSpaceOnUse">
          <stop stopColor="#525252" /><stop offset="0.38" stopColor="#171717" /><stop offset="1" stopColor="#000000" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="9" y1="9" x2="38" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff0a8" /><stop offset="0.5" stopColor="#d6aa4b" /><stop offset="1" stopColor="#7c511f" />
        </linearGradient>
      </defs>
      <path className={styles.shadow} d="M24 63L7 29L10 8H38L41 29L24 63Z" />
      <path className={styles.body} d="M24 59L10 28L13 11H35L38 28L24 59Z" fill={`url(#${uid}-noir)`} />
      <path className={styles.rim} d="M13 11H35L37 22H11L13 11Z" fill={`url(#${uid}-gold)`} />
      <path d="M13 11H35L32 17H10L13 11Z" fill="#171717" opacity="0.76" />
      <path d="M16 11L20 17M25 11L29 17M34 11L37 15" stroke="#f8e7ac" strokeWidth="2" />
      <path d="M24 55L18 28H30L24 55Z" fill="#d6aa4b" />
      <path className={styles.shine} d="M20 30L22 28L24 47L24 53L20 30Z" />
    </svg>
  );
}

function JewelPointer({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 48 64" fill="none">
      <defs>
        <linearGradient id={`${uid}-body`} x1="12" y1="8" x2="34" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--wheel-pointer-top)" />
          <stop offset="0.48" stopColor="var(--wheel-pointer-mid)" />
          <stop offset="1" stopColor="var(--wheel-pointer-bottom)" />
        </linearGradient>
        <linearGradient id={`${uid}-rim`} x1="12" y1="8" x2="37" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--wheel-pointer-rim-top)" />
          <stop offset="1" stopColor="var(--wheel-pointer-rim-bottom)" />
        </linearGradient>
        <radialGradient id={`${uid}-jewel`} cx="35%" cy="30%" r="72%">
          <stop stopColor="var(--wheel-pointer-jewel-light)" />
          <stop offset="1" stopColor="var(--wheel-pointer-jewel)" />
        </radialGradient>
      </defs>
      <path className={styles.shadow} d="M24 62L6 29L11 12L24 5L37 12L42 29L24 62Z" />
      <path
        className={styles.body}
        d="M24 58L8.5 28L13 13L24 7L35 13L39.5 28L24 58Z"
        fill={`url(#${uid}-body)`}
      />
      <path className={styles.shine} d="M13 26L16 15L22 11L19 29L24 50L13 26Z" />
      <path className={styles.accent} d="M24 58L19 29H29L24 58Z" opacity="0.55" />
      <path className={styles.line} d="M9 28L19 29L24 8L29 29L39 28M19 29L24 36L29 29" />
      <path className={styles.rim} d="M24 9L34 15L32 27L24 33L16 27L14 15L24 9Z" fill={`url(#${uid}-rim)`} />
      <path d="M24 13L30 17L29 24L24 28L19 24L18 17L24 13Z" fill={`url(#${uid}-jewel)`} />
      <path className={styles.glint} d="M20 17L24 14L27 16L23 19L20 17Z" />
    </svg>
  );
}

function ArrowPointer({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 48 64" fill="none">
      <defs>
        <linearGradient id={`${uid}-body`} x1="8" y1="8" x2="39" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--wheel-pointer-top)" />
          <stop offset="0.5" stopColor="var(--wheel-pointer-mid)" />
          <stop offset="1" stopColor="var(--wheel-pointer-bottom)" />
        </linearGradient>
        <linearGradient id={`${uid}-cap`} x1="10" y1="7" x2="38" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--wheel-pointer-rim-top)" />
          <stop offset="1" stopColor="var(--wheel-pointer-rim-bottom)" />
        </linearGradient>
      </defs>
      <path className={styles.shadow} d="M10 7H38V27H45L24 62L3 27H10V7Z" />
      <path className={styles.body} d="M12 9H36V29H41L24 58L7 29H12V9Z" fill={`url(#${uid}-body)`} />
      <path className={styles.rim} d="M12 9H36V23H12V9Z" fill={`url(#${uid}-cap)`} />
      <path className={styles.detail} d="M17 14H31V18H17V14Z" opacity="0.8" />
      <path className={styles.accent} d="M24 53L14 31H20V23H28V31H34L24 53Z" />
      <path className={styles.shine} d="M14 11H24V14H14V11Z" />
      <path className={styles.line} d="M9 29H17M31 29H39" />
    </svg>
  );
}

function ChevronPointer({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 48 64" fill="none">
      <defs>
        <linearGradient id={`${uid}-body`} x1="8" y1="10" x2="36" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--wheel-pointer-top)" />
          <stop offset="0.5" stopColor="var(--wheel-pointer-mid)" />
          <stop offset="1" stopColor="var(--wheel-pointer-bottom)" />
        </linearGradient>
        <linearGradient id={`${uid}-rim`} x1="7" y1="10" x2="41" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--wheel-pointer-rim-top)" />
          <stop offset="1" stopColor="var(--wheel-pointer-rim-bottom)" />
        </linearGradient>
      </defs>
      <path className={styles.shadow} d="M24 62L3 20L14 8L24 24L34 8L45 20L24 62Z" />
      <path
        className={styles.body}
        d="M24 58L6 20L14 11L24 28L34 11L42 20L24 58Z"
        fill={`url(#${uid}-body)`}
      />
      <path className={styles.rim} d="M6 20L14 11L24 28L34 11L42 20L37 24L34 20L24 38L14 20L11 24L6 20Z" fill={`url(#${uid}-rim)`} />
      <path className={styles.accent} d="M24 50L14 26L18 23L24 34L30 23L34 26L24 50Z" />
      <path className={styles.shine} d="M11 18L14 14L23 30L20 32L11 18Z" />
      <circle className={styles.glint} cx="14" cy="15" r="1.7" />
    </svg>
  );
}

function NeedlePointer({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 48 64" fill="none">
      <defs>
        <linearGradient id={`${uid}-body`} x1="18" y1="18" x2="29" y2="59" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--wheel-pointer-top)" />
          <stop offset="0.45" stopColor="var(--wheel-pointer-mid)" />
          <stop offset="1" stopColor="var(--wheel-pointer-bottom)" />
        </linearGradient>
        <linearGradient id={`${uid}-rim`} x1="14" y1="7" x2="34" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--wheel-pointer-rim-top)" />
          <stop offset="1" stopColor="var(--wheel-pointer-rim-bottom)" />
        </linearGradient>
        <radialGradient id={`${uid}-target`} cx="35%" cy="30%" r="70%">
          <stop stopColor="var(--wheel-pointer-jewel-light)" />
          <stop offset="1" stopColor="var(--wheel-pointer-jewel)" />
        </radialGradient>
      </defs>
      <path className={styles.shadow} d="M24 62L16 19L14 16C14 9.9 18.5 5 24 5C29.5 5 34 9.9 34 16L32 19L24 62Z" />
      <path className={styles.body} d="M24 59L18.5 20H29.5L24 59Z" fill={`url(#${uid}-body)`} />
      <path className={styles.accent} d="M24 54L22 22H26L24 54Z" />
      <circle className={styles.rim} cx="24" cy="16" r="10" fill={`url(#${uid}-rim)`} />
      <circle className={styles.detail} cx="24" cy="16" r="6.5" />
      <circle cx="24" cy="16" r="4.5" fill={`url(#${uid}-target)`} />
      <path className={styles.line} d="M24 8V11M16 16H19M29 16H32" />
      <circle className={styles.glint} cx="22.5" cy="14.5" r="1.4" />
    </svg>
  );
}

function TicketPointer({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 48 64" fill="none">
      <defs>
        <linearGradient id={`${uid}-body`} x1="10" y1="8" x2="35" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--wheel-pointer-top)" />
          <stop offset="0.5" stopColor="var(--wheel-pointer-mid)" />
          <stop offset="1" stopColor="var(--wheel-pointer-bottom)" />
        </linearGradient>
        <linearGradient id={`${uid}-band`} x1="11" y1="9" x2="37" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--wheel-pointer-rim-top)" />
          <stop offset="1" stopColor="var(--wheel-pointer-rim-bottom)" />
        </linearGradient>
      </defs>
      <path className={styles.shadow} d="M10 7H38V18C34 18 34 24 38 24V33L24 60L10 33V24C14 24 14 18 10 18V7Z" />
      <path
        className={styles.body}
        d="M12 9H36V16.5C31.5 18 31.5 24 36 25.5V32L24 56L12 32V25.5C16.5 24 16.5 18 12 16.5V9Z"
        fill={`url(#${uid}-body)`}
      />
      <path className={styles.rim} d="M12 9H36V17H12V9Z" fill={`url(#${uid}-band)`} />
      <path className={styles.detail} d="M24 18L26 22L30.5 22.5L27.2 25.6L28 30L24 28L20 30L20.8 25.6L17.5 22.5L22 22L24 18Z" />
      <path className={styles.line} d="M14 33H34" strokeDasharray="2.5 2.5" />
      <path className={styles.accent} d="M24 53L19 35H29L24 53Z" opacity="0.8" />
      <path className={styles.shine} d="M14 11H23V14H14V11Z" />
    </svg>
  );
}

function ClawPointer({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 48 64" fill="none">
      <defs>
        <linearGradient id={`${uid}-body`} x1="9" y1="9" x2="36" y2="59" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--wheel-pointer-top)" />
          <stop offset="0.45" stopColor="var(--wheel-pointer-mid)" />
          <stop offset="1" stopColor="var(--wheel-pointer-bottom)" />
        </linearGradient>
        <linearGradient id={`${uid}-wing`} x1="7" y1="9" x2="41" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--wheel-pointer-rim-top)" />
          <stop offset="1" stopColor="var(--wheel-pointer-rim-bottom)" />
        </linearGradient>
      </defs>
      <path className={styles.shadow} d="M24 62L17 39L5 31L7 13L18 23L21 8H27L30 23L41 13L43 31L31 39L24 62Z" />
      <path
        className={styles.body}
        d="M24 58L19 37L8 30L9 17L19 27L22.5 10H25.5L29 27L39 17L40 30L29 37L24 58Z"
        fill={`url(#${uid}-body)`}
      />
      <path className={styles.rim} d="M8 14L20 25L22 10H26L28 25L40 14L39 29L30 35L26 29H22L18 35L9 29L8 14Z" fill={`url(#${uid}-wing)`} />
      <path className={styles.detail} d="M24 17L30 25L27 34H21L18 25L24 17Z" />
      <path className={styles.accent} d="M24 21L27 26L25.5 31H22.5L21 26L24 21Z" />
      <path className={styles.line} d="M18 36L24 52L30 36" />
      <circle className={styles.glint} cx="23" cy="24.5" r="1.2" />
    </svg>
  );
}
