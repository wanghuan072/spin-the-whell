import { MAX_WHEEL_OPTIONS } from "../config";
import type {
  WheelEntryStat,
  WheelSessionSpin,
} from "../types";

export { MAX_WHEEL_OPTIONS };
export const MAX_SESSION_SPINS = 1000;

// 将文本编辑器内容转换为转盘可直接使用的选项。
export function parseWheelEntries(value: string) {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, MAX_WHEEL_OPTIONS);
}

/** 支持换行 / 逗号 / 分号 / 制表符批量粘贴 */
export function parsePastedEntries(value: string) {
  return value
    .split(/[\n\r,;\t]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.slice(0, 36))
    .slice(0, MAX_WHEEL_OPTIONS);
}

export function formatSessionExport(spins: WheelSessionSpin[]) {
  const header = "round,queueItem,queueTurn,entry,runMode,pickedAt";
  const rows = spins.map((spin, index) => {
    const cells = [
      String(spins.length - index),
      csvEscape(spin.queueItemLabel ?? ""),
      spin.queueTurn ? String(spin.queueTurn) : "",
      csvEscape(spin.entry),
      spin.runMode ?? "classic",
      spin.pickedAt,
    ];
    return cells.join(",");
  });
  return [header, ...rows].join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function createSegmentColors(colors: string[], count: number) {
  if (count <= 0 || colors.length === 0) return [];

  const segmentColors = Array.from(
    { length: count },
    (_, index) => colors[index % colors.length],
  );

  // 转盘首尾相接，必要时替换最后一块，避免接缝两侧同色。
  if (
    count > 1
    && segmentColors[segmentColors.length - 1] === segmentColors[0]
  ) {
    const previousColor = segmentColors[segmentColors.length - 2];
    const replacement = colors.find(
      (color) => color !== segmentColors[0] && color !== previousColor,
    );

    if (replacement) segmentColors[segmentColors.length - 1] = replacement;
  }

  return segmentColors;
}

export function createWheelGradient(segmentColors: string[], sweeps?: number[]) {
  const count = segmentColors.length;
  if (count === 0) return "conic-gradient(#312e57 0deg 360deg)";

  if (!sweeps || sweeps.length !== count) {
    const segmentAngle = 360 / count;
    return `conic-gradient(${segmentColors
      .map((color, index) => `${color} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`)
      .join(", ")})`;
  }

  let cursor = 0;
  return `conic-gradient(${segmentColors
    .map((color, index) => {
      const start = cursor;
      const end = index === count - 1 ? 360 : cursor + sweeps[index];
      cursor = end;
      return `${color} ${start}deg ${end}deg`;
    })
    .join(", ")})`;
}

export function secureRandomIndex(length: number) {
  if (length <= 0) return 0;
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) return Math.floor(Math.random() * length);

  const limit = Math.floor(0x100000000 / length) * length;
  const values = new Uint32Array(1);
  do cryptoApi.getRandomValues(values); while (values[0] >= limit);
  return values[0] % length;
}

export function secureRandomUnit() {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) return Math.random();
  const values = new Uint32Array(1);
  cryptoApi.getRandomValues(values);
  return values[0] / 0x100000000;
}

export function selectWheelStopAngle(start: number, end: number, randomUnit = secureRandomUnit()) {
  const sweep = Math.max(0, end - start);
  if (sweep === 0) return start;
  const margin = Math.min(4, sweep * 0.12);
  const safeStart = start + margin;
  const safeEnd = end - margin;
  return safeStart + Math.min(1, Math.max(0, randomUnit)) * (safeEnd - safeStart);
}

export function getWheelEntryKey(entry: string) {
  return entry.trim().toLocaleLowerCase();
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

/** 只恢复结构完整的场次记录，过滤旧缓存中的空值和错误对象。 */
export function sanitizeSessionSpins(raw: unknown): WheelSessionSpin[] {
  if (!Array.isArray(raw)) return [];
  const usedIds = new Set<string>();

  return raw.flatMap((item) => {
    const record = asRecord(item);
    const id = typeof record?.id === "string" ? record.id.trim() : "";
    const entry = typeof record?.entry === "string" ? record.entry.trim().slice(0, 36) : "";
    const pickedAt = typeof record?.pickedAt === "string" ? record.pickedAt : "";
    if (!id || usedIds.has(id) || !entry || Number.isNaN(Date.parse(pickedAt))) return [];
    usedIds.add(id);
    const runMode = record?.runMode === "turn-queue" ? "turn-queue" : "classic";
    const optionId = typeof record?.optionId === "string"
      ? record.optionId.trim().slice(0, 80)
      : "";
    const queueItemId = typeof record?.queueItemId === "string"
      ? record.queueItemId.trim().slice(0, 80)
      : "";
    const queueItemLabel = typeof record?.queueItemLabel === "string"
      ? record.queueItemLabel.trim().slice(0, 36)
      : "";
    const queueTurn = typeof record?.queueTurn === "number" && Number.isFinite(record.queueTurn)
      ? Math.min(99, Math.max(1, Math.round(record.queueTurn)))
      : undefined;

    return [{
      id,
      ...(optionId ? { optionId } : {}),
      entry,
      pickedAt,
      runMode,
      ...(runMode === "turn-queue" && queueItemId && queueItemLabel && queueTurn
        ? { queueItemId, queueItemLabel, queueTurn }
        : {}),
    } satisfies WheelSessionSpin];
  }).slice(0, MAX_SESSION_SPINS);
}

export function removeWinningOption<T extends { id: string }>(options: T[], winnerId: string) {
  return options.filter((option) => option.id !== winnerId);
}

export function selectWheelEntryIndex(
  options: {
    entries: string[];
    weights?: number[];
  },
) {
  const eligibleIndices = options.entries.map((_, index) => index);
  if (eligibleIndices.length === 0) return 0;

  const weights = options.weights;
  if (!weights || weights.length !== options.entries.length) {
    return eligibleIndices[secureRandomIndex(eligibleIndices.length)] ?? 0;
  }

  const total = eligibleIndices.reduce(
    (sum, index) => sum + Math.max(0, weights[index] ?? 0),
    0,
  );
  if (total <= 0) {
    return eligibleIndices[secureRandomIndex(eligibleIndices.length)] ?? 0;
  }

  let ticket = secureRandomUnit() * total;
  for (const index of eligibleIndices) {
    ticket -= Math.max(0, weights[index] ?? 0);
    if (ticket <= 0) return index;
  }
  return eligibleIndices[eligibleIndices.length - 1] ?? 0;
}

export function createWheelEntryStats(entries: string[], sessionSpins: WheelSessionSpin[]) {
  const stats = new Map<string, WheelEntryStat>();
  entries.forEach((entry) => {
    const key = getWheelEntryKey(entry);
    if (!stats.has(key)) stats.set(key, { entry, pickCount: 0 });
  });

  sessionSpins.forEach((spin) => {
    const key = getWheelEntryKey(spin.entry);
    const current = stats.get(key) ?? {
      entry: spin.entry,
      pickCount: 0,
    };
    current.pickCount += 1;
    stats.set(key, current);
  });

  return [...stats.values()].sort(
    (left, right) => right.pickCount - left.pickCount || left.entry.localeCompare(right.entry),
  );
}

export function shuffleWheelEntries(entries: string[]) {
  const nextEntries = [...entries];
  for (let index = nextEntries.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomIndex(index + 1);
    [nextEntries[index], nextEntries[swapIndex]] = [nextEntries[swapIndex], nextEntries[index]];
  }
  return nextEntries;
}
