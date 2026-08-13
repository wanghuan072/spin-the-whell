/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WheelGame } from "./WheelGame";

const storageKey = "wheel-integration-test-v5";

describe("WheelGame integration", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
      })),
    });
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders a Turn Queue preset and lets the user return to Classic mode", () => {
    render(
      <WheelGame
        initialEntries={["Alpha", "Beta"]}
        initialQueueItems={[{ label: "Round A", turnLimit: 2 }]}
        initialRunMode="turn-queue"
        storageKey={storageKey}
        title="Team picker"
      />,
    );

    expect(screen.getByRole("heading", { name: "Team picker" })).toBeTruthy();
    expect(screen.getByDisplayValue("Round A")).toBeTruthy();
    expect(screen.getByRole("radio", { name: /Turn Queue/ }).getAttribute("aria-checked")).toBe("true");

    fireEvent.click(screen.getByRole("tab", { name: /Options/ }));
    expect(screen.getByDisplayValue("Alpha")).toBeTruthy();
    expect(screen.getByDisplayValue("Beta")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "Classic" }));
    expect(screen.getByRole("radio", { name: "Classic" }).getAttribute("aria-checked")).toBe("true");
  });

  it("restores options, queue state, and mode from local storage", async () => {
    window.localStorage.setItem(storageKey, JSON.stringify({
      activeQueueItemId: "saved-queue",
      entriesText: "Saved Alpha\nSaved Beta",
      options: [
        { id: "saved-alpha", label: "Saved Alpha", weight: 2, color: "#112233", textColor: "#ffffff", imageVisible: true },
        { id: "saved-beta", label: "Saved Beta", weight: 1, color: "#445566", textColor: "#ffffff", imageVisible: true },
      ],
      paletteId: "custom",
      queueItems: [{ id: "saved-queue", label: "Saved Round", turnLimit: 3 }],
      removeWinner: false,
      runMode: "turn-queue",
      sessionSpins: [],
      soundEnabled: false,
      soundStyle: "soft",
      spinDuration: 5,
      stageBackground: "candy",
      volume: 25,
    }));

    render(<WheelGame initialEntries={["Fallback A", "Fallback B"]} storageKey={storageKey} />);

    expect(await screen.findByDisplayValue("Saved Round")).toBeTruthy();
    expect(screen.getByRole("radio", { name: /Turn Queue/ }).getAttribute("aria-checked")).toBe("true");

    fireEvent.click(screen.getByRole("tab", { name: /Options/ }));
    expect(screen.getByDisplayValue("Saved Alpha")).toBeTruthy();
    expect(screen.getByDisplayValue("Saved Beta")).toBeTruthy();
  });

  it("persists option edits after storage hydration completes", async () => {
    render(<WheelGame initialEntries={["Alpha", "Beta"]} storageKey={storageKey} />);

    await waitFor(() => expect(window.localStorage.getItem(storageKey)).not.toBeNull());
    fireEvent.change(screen.getByLabelText("Option 1"), { target: { value: "Updated Alpha" } });

    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as {
        options?: Array<{ label: string }>;
      };
      expect(saved.options?.[0]?.label).toBe("Updated Alpha");
    });
  });
});
