export type ThemeMode = "day" | "night";

export const THEME_STORAGE_KEY = "spin-theme";
export const DEFAULT_THEME: ThemeMode = "day";

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "day" || value === "night";
}

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(value) ? value : null;
  } catch {
    return null;
  }
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme === "night" ? "dark" : "light";

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "night" ? "#0b0e1d" : "#f7f8fe");
  }
}

export function persistTheme(theme: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore private-mode storage failures.
  }
}

/** Inline bootstrap script — runs before paint to avoid theme flash. */
export const themeBootstrapScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var d=${JSON.stringify(DEFAULT_THEME)};var t=localStorage.getItem(k);if(t!=="day"&&t!=="night")t=d;document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t==="night"?"dark":"light";}catch(e){document.documentElement.setAttribute("data-theme",${JSON.stringify(DEFAULT_THEME)});}})();`;
