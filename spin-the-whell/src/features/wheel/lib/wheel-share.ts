import { MAX_WHEEL_OPTIONS } from "../config";

export type SharedWheelState = {
  entries: string[];
  weights?: number[];
  colors?: string[];
  removeWinner: boolean;
};

type CompactShare = {
  e: string[];
  wt?: number[];
  cl?: string[];
  r?: 0 | 1;
};

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeWheelShare(state: SharedWheelState) {
  const entries = state.entries.slice(0, MAX_WHEEL_OPTIONS);
  const payload: CompactShare = { e: entries };
  if (state.weights?.length === entries.length && state.weights.some((weight) => weight !== 1)) {
    payload.wt = state.weights.map((weight) => Math.min(100, Math.max(1, Math.round(weight))));
  }
  if (state.colors?.length === entries.length) {
    payload.cl = state.colors;
  }
  if (state.removeWinner) payload.r = 1;
  return toBase64Url(JSON.stringify(payload));
}

export function decodeWheelShare(token: string | null | undefined): SharedWheelState | null {
  if (!token) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(token)) as CompactShare;
    if (!Array.isArray(parsed.e) || parsed.e.length < 2) return null;
    const acceptedIndices = parsed.e
      .slice(0, MAX_WHEEL_OPTIONS)
      .flatMap((entry, index) => {
        if (typeof entry !== "string") return [];
        return entry.trim() ? [index] : [];
      });
    const entries = acceptedIndices.map((index) => parsed.e[index].trim().slice(0, 36));
    if (entries.length < 2) return null;
    const weights = Array.isArray(parsed.wt) && parsed.wt.length === parsed.e.length
      ? acceptedIndices.map((index) => Math.min(100, Math.max(1, Number(parsed.wt?.[index]) || 1)))
      : undefined;
    const colors = Array.isArray(parsed.cl) && parsed.cl.length === parsed.e.length
      ? acceptedIndices.map((index) => String(parsed.cl?.[index] ?? ""))
      : undefined;
    return {
      entries,
      weights,
      colors,
      removeWinner: parsed.r === 1,
    };
  } catch {
    return null;
  }
}

export function buildShareUrl(origin: string, pathname: string, token: string) {
  const url = new URL(pathname || "/", origin);
  url.searchParams.set("w", token);
  return url.toString();
}
