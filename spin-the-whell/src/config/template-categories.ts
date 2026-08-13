/** First-level template modes shown before the scenario filter. */
export const TEMPLATE_MODES = [
  { id: "all", name: "All modes" },
  { id: "classic", name: "Classic" },
  { id: "turn-queue", name: "Turn Queue" },
] as const;

/** Second-level scenario categories shown in filters and labels. */
export const TEMPLATE_CATEGORIES = [
  { id: "all", name: "All scenarios" },
  { id: "Events", name: "Events" },
  { id: "Decisions", name: "Decisions" },
  { id: "Geography", name: "Geography" },
  { id: "Games", name: "Games" },
  { id: "Sports", name: "Sports" },
  { id: "Creative", name: "Creative" },
  { id: "Entertainment", name: "Entertainment" },
] as const;

export type TemplateModeId = (typeof TEMPLATE_MODES)[number]["id"];
export type TemplateCategoryId = (typeof TEMPLATE_CATEGORIES)[number]["id"];
