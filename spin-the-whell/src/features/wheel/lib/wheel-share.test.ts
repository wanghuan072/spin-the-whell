import { describe, expect, it } from "vitest";
import { decodeWheelShare, encodeWheelShare } from "./wheel-share";

describe("wheel share links", () => {
  it("round-trips punctuation without splitting option names", () => {
    const state = {
      entries: ["ACME, Inc.", "Tom; Jerry", "Column\tName"],
      weights: [1, 2, 3],
      colors: ["#112233", "#445566", "#778899"],
      removeWinner: true,
    };

    expect(decodeWheelShare(encodeWheelShare(state))).toEqual(state);
  });

  it("rejects a share payload with fewer than two usable options", () => {
    const token = encodeWheelShare({ entries: ["Only one", "   "], removeWinner: false });
    expect(decodeWheelShare(token)).toBeNull();
  });
});
