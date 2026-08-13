"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_THEME,
  applyTheme,
  getStoredTheme,
  persistTheme,
  type ThemeMode,
} from "@/lib/theme";
import styles from "@/style/layout/ThemeToggle.module.css";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  function toggleTheme() {
    const next: ThemeMode = theme === "night" ? "day" : "night";
    applyTheme(next);
    persistTheme(next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  const isNight = theme === "night";

  return (
    <button
      type="button"
      className={styles["theme-toggle"]}
      onClick={toggleTheme}
      aria-label={isNight ? "Switch to day theme" : "Switch to night theme"}
      title={isNight ? "Day mode" : "Night mode"}
      aria-pressed={isNight}
      data-ready="true"
    >
      <span className={styles["theme-toggle-track"]} aria-hidden="true">
        <span className={`${styles["theme-toggle-thumb"]} ${isNight ? styles["is-night"] : ""}`}>
          {isNight ? <MoonIcon /> : <SunIcon />}
        </span>
        <SunIcon />
        <MoonIcon />
      </span>
      <span className={styles["theme-toggle-label"]}>{isNight ? "Night" : "Day"}</span>
    </button>
  );
}

const THEME_CHANGE_EVENT = "spin-theme-change";

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getThemeSnapshot(): ThemeMode {
  const current = document.documentElement.getAttribute("data-theme");
  return current === "day" || current === "night"
    ? current
    : getStoredTheme() ?? DEFAULT_THEME;
}

function getServerThemeSnapshot(): ThemeMode {
  return DEFAULT_THEME;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />
    </svg>
  );
}
