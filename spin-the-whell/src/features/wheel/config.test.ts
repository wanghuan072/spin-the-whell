import { describe, expect, it } from "vitest";
import { DEFAULT_WINNER_SCENE, WHEEL_WINNER_SCENES } from "./config";

describe("winner scene presets", () => {
  it("keeps every scene selectable with a unique persisted id", () => {
    const ids = WHEEL_WINNER_SCENES.map((scene) => scene.id);

    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(DEFAULT_WINNER_SCENE);
  });

  it("includes non-firework celebration choices", () => {
    expect(WHEEL_WINNER_SCENES.map((scene) => scene.id)).toEqual(
      expect.arrayContaining(["ribbons", "bloom", "spotlight", "balloons"]),
    );
  });
});
