import { describe, expect, it } from "vitest";
import { getQueueProgress, hydrateStarterQueue } from "./wheel-queue";
import type { WheelQueueItem, WheelSessionSpin } from "../types";

const items: WheelQueueItem[] = [
  { id: "alice", label: "Alice", turnLimit: 2 },
  { id: "bob", label: "Bob", turnLimit: 1 },
];

function spin(id: string, queueItemId: string, queueTurn: number): WheelSessionSpin {
  return {
    id,
    entry: "Prize",
    pickedAt: "2026-08-08T08:00:00.000Z",
    runMode: "turn-queue",
    queueItemId,
    queueItemLabel: queueItemId,
    queueTurn,
  };
}

describe("hydrateStarterQueue", () => {
  it("builds stable starter ids and clamps turns", () => {
    expect(hydrateStarterQueue([
      { label: "3rd prize", turnLimit: 3 },
      { label: "  ", turnLimit: 1 },
      { label: "1st prize", turnLimit: 0 },
    ])).toEqual([
      { id: "starter-queue-0-3rd-prize", label: "3rd prize", turnLimit: 3 },
      { id: "starter-queue-2-1st-prize", label: "1st prize", turnLimit: 1 },
    ]);
  });
});

describe("Turn Queue progress", () => {
  it("counts normal queue progress", () => {
    expect(getQueueProgress({
      items,
      spins: [spin("spin-1", "alice", 1)],
    })).toEqual({ completedTurns: 1, resolvedItems: 0, totalTurns: 3 });
  });

  it("removes skipped items from available turns while resolving the item", () => {
    expect(getQueueProgress({
      items,
      spins: [spin("spin-1", "alice", 1)],
      skippedIds: ["alice"],
    })).toEqual({ completedTurns: 0, resolvedItems: 1, totalTurns: 1 });
  });

  it("ignores history belonging to a deleted queue item", () => {
    expect(getQueueProgress({
      items: [items[1]],
      spins: [spin("spin-1", "alice", 1)],
    })).toEqual({ completedTurns: 0, resolvedItems: 0, totalTurns: 1 });
  });

  it("caps progress when a turn limit is reduced below recorded history", () => {
    expect(getQueueProgress({
      items: [{ ...items[0], turnLimit: 1 }],
      spins: [spin("spin-1", "alice", 1), spin("spin-2", "alice", 2)],
    })).toEqual({ completedTurns: 1, resolvedItems: 1, totalTurns: 1 });
  });
});
