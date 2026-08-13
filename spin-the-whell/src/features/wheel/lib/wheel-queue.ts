import { MAX_QUEUE_ITEMS, MAX_QUEUE_TURNS } from "../config";
import type { WheelQueueItem, WheelSessionSpin } from "../types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function clampQueueTurns(value: number, fallback = 1) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(MAX_QUEUE_TURNS, Math.max(1, Math.round(value)));
}

export function createQueueItem(label = "", turnLimit = 1): WheelQueueItem {
  const cryptoApi = globalThis.crypto;
  const id = typeof cryptoApi?.randomUUID === "function"
    ? cryptoApi.randomUUID()
    : `queue-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { id, label: label.slice(0, 36), turnLimit: clampQueueTurns(turnLimit) };
}

/** Stable starter queue ids keep SSR/client markup aligned for template presets. */
export function hydrateStarterQueue(
  items?: Array<{ label: string; turnLimit?: number }> | null,
): WheelQueueItem[] {
  if (!items?.length) return [];

  return items
    .slice(0, MAX_QUEUE_ITEMS)
    .flatMap((item, index) => {
      const label = item.label.trim().slice(0, 36);
      if (!label) return [];
      const slug = label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 24);
      return [{
        id: `starter-queue-${index}-${slug || "item"}`,
        label,
        turnLimit: clampQueueTurns(Number(item.turnLimit ?? 1)),
      } satisfies WheelQueueItem];
    });
}

/** 清理本地队列，保证ID唯一、标签可见、次数在可操作范围内。 */
export function sanitizeQueueItems(raw: unknown): WheelQueueItem[] {
  if (!Array.isArray(raw)) return [];
  const usedIds = new Set<string>();

  return raw.flatMap((item) => {
    const record = asRecord(item);
    const label = typeof record?.label === "string" ? record.label.trim().slice(0, 36) : "";
    let id = typeof record?.id === "string" ? record.id.trim().slice(0, 80) : "";
    if (!label) return [];
    if (!id || usedIds.has(id)) id = createQueueItem(label).id;
    usedIds.add(id);
    return [{
      id,
      label,
      turnLimit: clampQueueTurns(Number(record?.turnLimit)),
    } satisfies WheelQueueItem];
  }).slice(0, MAX_QUEUE_ITEMS);
}

/** 支持一行一个对象，也支持“对象,次数”、分号或从Excel复制的制表符。 */
export function parseQueueText(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line, index) => {
      const match = line.match(/^(.*?)(?:\t|,|;)\s*(\d+)\s*$/);
      const label = (match?.[1] ?? line).trim().slice(0, 36);
      if (!label) return [];
      return [{
        id: `queue-preview-${index}`,
        label,
        turnLimit: clampQueueTurns(match ? Number(match[2]) : 1),
      } satisfies WheelQueueItem];
    })
    .slice(0, MAX_QUEUE_ITEMS);
}

export function getQueueItemSpinCount(spins: WheelSessionSpin[], queueItemId: string) {
  return spins.filter((spin) => spin.queueItemId === queueItemId).length;
}

export function getQueueTotalTurns(items: WheelQueueItem[]) {
  return items.reduce((total, item) => total + item.turnLimit, 0);
}

/**
 * Progress only reflects items that are still part of the current queue.
 * Skipped and deleted items can keep their history without making the live
 * counter exceed its total or making an untouched item look complete.
 */
export function getQueueProgress({
  items,
  spins,
  skippedIds = [],
}: {
  items: WheelQueueItem[];
  spins: WheelSessionSpin[];
  skippedIds?: string[];
}) {
  const skipped = new Set(skippedIds);
  const availableItems = items.filter((item) => !skipped.has(item.id));
  const totalTurns = getQueueTotalTurns(availableItems);
  const completedTurns = availableItems.reduce(
    (total, item) => total + Math.min(getQueueItemSpinCount(spins, item.id), item.turnLimit),
    0,
  );
  const resolvedItems = items.filter(
    (item) => skipped.has(item.id) || getQueueItemSpinCount(spins, item.id) >= item.turnLimit,
  ).length;

  return { completedTurns, resolvedItems, totalTurns };
}

export function getNextQueueItemId({
  items,
  spins,
  skippedIds,
  afterId,
}: {
  items: WheelQueueItem[];
  spins: WheelSessionSpin[];
  skippedIds: string[];
  afterId?: string | null;
}) {
  if (items.length === 0) return null;
  const skipped = new Set(skippedIds);
  const startIndex = Math.max(-1, items.findIndex((item) => item.id === afterId));

  for (let offset = 1; offset <= items.length; offset += 1) {
    const item = items[(startIndex + offset) % items.length];
    if (!skipped.has(item.id) && getQueueItemSpinCount(spins, item.id) < item.turnLimit) {
      return item.id;
    }
  }
  return null;
}

export function resolveActiveQueueItemId({
  items,
  spins,
  skippedIds,
  activeId,
}: {
  items: WheelQueueItem[];
  spins: WheelSessionSpin[];
  skippedIds: string[];
  activeId?: string | null;
}) {
  // Turn Queue严格按列表顺序运行；旧存档中的activeId仅在它仍是队首时保留。
  const queueHeadId = getNextQueueItemId({ items, spins, skippedIds, afterId: null });
  return activeId === queueHeadId ? activeId : queueHeadId;
}
