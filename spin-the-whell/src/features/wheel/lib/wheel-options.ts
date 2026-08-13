import { DEFAULT_WHEEL_COLORS, MAX_WHEEL_OPTIONS } from "../config";
import type { WheelOption } from "../types";

export const MIN_OPTION_WEIGHT = 1;
export const MAX_OPTION_WEIGHT = 100;

/** 仅用于客户端新增/复制；初始名单必须用稳定 id，避免 SSR hydration 不一致 */
function createOptionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function stableStarterId(label: string, index: number) {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `starter-${index}-${slug || "item"}`;
}

export function clampOptionWeight(value: number) {
  if (!Number.isFinite(value)) return MIN_OPTION_WEIGHT;
  return Math.min(MAX_OPTION_WEIGHT, Math.max(MIN_OPTION_WEIGHT, Math.round(value)));
}

export function createWheelOption(
  label: string,
  index: number,
  paletteColors: string[] = DEFAULT_WHEEL_COLORS,
  overrides: Partial<WheelOption> = {},
): WheelOption {
  return {
    id: overrides.id ?? createOptionId(),
    label: label.trim().slice(0, 36),
    weight: clampOptionWeight(overrides.weight ?? 1),
    color: overrides.color ?? paletteColors[index % paletteColors.length] ?? DEFAULT_WHEEL_COLORS[0],
    textColor: overrides.textColor ?? "#ffffff",
    image: overrides.image ?? null,
    imageVisible: overrides.imageVisible ?? true,
  };
}

export function createOptionsFromLabels(
  labels: string[],
  paletteColors: string[] = DEFAULT_WHEEL_COLORS,
): WheelOption[] {
  return labels
    .map((label) => label.trim())
    .filter(Boolean)
    .slice(0, MAX_WHEEL_OPTIONS)
    .map((label, index) => createWheelOption(label, index, paletteColors, {
      id: stableStarterId(label, index),
    }));
}

export function optionLabels(options: WheelOption[]) {
  return options.map((option) => option.label);
}

export function totalOptionWeight(options: WheelOption[]) {
  return options.reduce((sum, option) => sum + clampOptionWeight(option.weight), 0);
}

export function optionChancePercent(options: WheelOption[], index: number) {
  const total = totalOptionWeight(options);
  if (total <= 0 || !options[index]) return 0;
  return Math.round((clampOptionWeight(options[index].weight) / total) * 1000) / 10;
}

export type WheelSegment = {
  index: number;
  start: number;
  end: number;
  mid: number;
  sweep: number;
  ratio: number;
};

/** 扇区角度从盘顶顺时针累计，总和 360° */
export function computeWheelSegments(options: WheelOption[]): WheelSegment[] {
  const total = totalOptionWeight(options);
  if (options.length === 0 || total <= 0) return [];

  let cursor = 0;
  return options.map((option, index) => {
    const ratio = clampOptionWeight(option.weight) / total;
    const sweep = ratio * 360;
    const start = cursor;
    const end = index === options.length - 1 ? 360 : cursor + sweep;
    const mid = (start + end) / 2;
    cursor = end;
    return { index, start, end, mid, sweep: end - start, ratio };
  });
}

export function applyPaletteToOptions(
  options: WheelOption[],
  palette: { colors: string[]; textColor: string },
) {
  return options.map((option, index) => ({
    ...option,
    color: palette.colors[index % palette.colors.length] ?? option.color,
    textColor: palette.textColor,
  }));
}

/** 混合两种 hex 颜色，供不同材质的扇区渐变使用 */
export function mixHex(color: string, toward: string, amount: number) {
  const sourceHex = color.replace("#", "");
  const targetHex = toward.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(sourceHex) || !/^[0-9a-fA-F]{6}$/.test(targetHex)) {
    return color;
  }

  const ratio = Math.min(1, Math.max(0, amount));
  const mix = (source: number, target: number) =>
    Math.round(source + (target - source) * ratio);
  const r = mix(
    Number.parseInt(sourceHex.slice(0, 2), 16),
    Number.parseInt(targetHex.slice(0, 2), 16),
  );
  const g = mix(
    Number.parseInt(sourceHex.slice(2, 4), 16),
    Number.parseInt(targetHex.slice(2, 4), 16),
  );
  const b = mix(
    Number.parseInt(sourceHex.slice(4, 6), 16),
    Number.parseInt(targetHex.slice(4, 6), 16),
  );
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

/** 压缩图片，避免 localStorage / 内存被撑爆 */
export async function readImageAsDataUrl(
  file: File,
  {
    maxEdge = 640,
    quality = 0.72,
  }: { maxEdge?: number; quality?: number } = {},
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("That image is larger than 5 MB.");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not process that image.");
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that image."));
    image.src = src;
  });
}

export function serializeOptionsForStorage(options: WheelOption[]) {
  return options.map((option) => ({
    id: option.id,
    label: option.label,
    weight: option.weight,
    color: option.color,
    textColor: option.textColor,
    imageVisible: option.imageVisible,
  }));
}

export function hydrateOptions(
  raw: unknown,
  fallbackLabels: string[],
  paletteColors: string[],
): WheelOption[] {
  if (Array.isArray(raw) && raw.length > 0) {
    const usedIds = new Set<string>();
    return raw.slice(0, MAX_WHEEL_OPTIONS).map((item, index) => {
      const record = item && typeof item === "object"
        ? item as Partial<WheelOption>
        : {};
      const rawId = typeof record.id === "string" && record.id.trim() && !usedIds.has(record.id)
        ? record.id
        : undefined;
      const rawLabel = typeof record.label === "string" ? record.label.trim() : "";
      const option = createWheelOption(
        rawLabel || fallbackLabels[index] || `Option ${index + 1}`,
        index,
        paletteColors,
        {
          id: rawId,
          weight: typeof record.weight === "number" ? record.weight : 1,
          color: typeof record.color === "string" ? record.color : undefined,
          textColor: typeof record.textColor === "string" ? record.textColor : "#ffffff",
          image: typeof record.image === "string" ? record.image : null,
          imageVisible: typeof record.imageVisible === "boolean" ? record.imageVisible : true,
        },
      );
      usedIds.add(option.id);
      return option;
    });
  }
  return createOptionsFromLabels(fallbackLabels, paletteColors);
}
