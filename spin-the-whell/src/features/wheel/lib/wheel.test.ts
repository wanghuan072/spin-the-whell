import { afterEach, describe, expect, it, vi } from "vitest";
import { computeWheelSegments, createOptionsFromLabels } from "./wheel-options";
import {
  removeWinningOption,
  sanitizeSessionSpins,
  selectWheelEntryIndex,
  selectWheelStopAngle,
} from "./wheel";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("wheel probability and geometry", () => {
  it("uses the same proportions for weights and visible segments", () => {
    const options = createOptionsFromLabels(["A", "B", "C"]).map((option, index) => ({
      ...option,
      weight: [1, 2, 3][index],
    }));
    const segments = computeWheelSegments(options);

    expect(segments.map((segment) => segment.sweep)).toEqual([60, 120, 180]);
    expect(segments.at(-1)?.end).toBe(360);
  });

  it("selects inside the expected weighted range", () => {
    vi.stubGlobal("crypto", {
      getRandomValues(values: Uint32Array) {
        values[0] = 0x80000000;
        return values;
      },
    });

    expect(selectWheelEntryIndex({ entries: ["A", "B"], weights: [1, 3] })).toBe(1);
  });

  it("keeps a randomized stop safely inside its segment", () => {
    expect(selectWheelStopAngle(20, 60, 0)).toBe(24);
    expect(selectWheelStopAngle(20, 60, 1)).toBe(56);
    expect(selectWheelStopAngle(20, 60, 0.5)).toBe(40);
  });
});

describe("wheel state transitions", () => {
  it("removes every winner until the candidate pool is exhausted", () => {
    const options = createOptionsFromLabels(["A", "B", "C"]);
    expect(removeWinningOption(options, options[1].id).map((option) => option.label))
      .toEqual(["A", "C"]);
    expect(removeWinningOption(options.slice(0, 2), options[1].id).map((option) => option.label))
      .toEqual(["A"]);
    expect(removeWinningOption([options[0]], options[0].id)).toEqual([]);
  });

  it("preserves stable option ids in restored history", () => {
    const spins = sanitizeSessionSpins([{
      id: "spin-1",
      optionId: "option-2",
      entry: "Duplicate",
      pickedAt: "2026-08-08T08:00:00.000Z",
    }]);

    expect(spins[0]?.optionId).toBe("option-2");
  });
});
