import type {
  WheelLightsStyle,
  WheelPalette,
  WheelPointerPosition,
  WheelPointerStyle,
  WheelPointerStyleId,
  WheelRimStyle,
  WheelSliceLook,
  WheelStageBackground,
  WheelWinnerScene,
  WheelWinnerSceneId,
} from "./types";

export type ResolvedSliceLook =
  | "solid"
  | "horizon"
  | "vertical"
  | "radial"
  | "spoke"
  | "seamless";

/** 名单上限：兼顾可读性与课堂/抽奖场景 */
export const MAX_WHEEL_OPTIONS = 100;

/** 轮次队列允许更长的对象名单，但限制单项次数以控制本地记录体积。 */
export const MAX_QUEUE_ITEMS = 200;
export const MAX_QUEUE_TURNS = 99;

// 转盘默认配置集中维护，页面模板只负责覆盖需要变化的值。
export const DEFAULT_WHEEL_ENTRIES = [
  "Pizza",
  "Burger",
  "Sushi",
  "Tacos",
  "Pasta",
  "Salad",
  "Ice Cream",
  "Steak",
  "Ramen",
];

export const DEFAULT_WHEEL_COLORS = [
  "#FF5C8A",
  "#FFB648",
  "#80D95B",
  "#48A6FF",
  "#8A63F6",
  "#42CEC4",
];

export const WHEEL_PALETTES: WheelPalette[] = [
  {
    id: "candy",
    name: "Vivid",
    blurb: "Bright, balanced color blocks",
    swatch: "#8A63F6",
    colors: DEFAULT_WHEEL_COLORS,
    look: "solid",
    textColor: "#ffffff",
    separator: "rgba(255,255,255,0.46)",
  },
  {
    id: "gloss",
    name: "Prism",
    blurb: "Translucent color with soft light",
    swatch: "#60A5FA",
    colors: ["#FB6F9E", "#FFB84D", "#58D3B5", "#50A7F8", "#906AF5", "#D45DDB"],
    look: "horizon",
    textColor: "#ffffff",
    separator: "rgba(255,255,255,0.58)",
  },
  {
    id: "retro",
    name: "Satin",
    blurb: "Soft vertical sheen and rich tones",
    swatch: "#6D5DE7",
    colors: ["#E86F9C", "#ECA94A", "#5CBF9D", "#4B91D8", "#6D5DE7", "#B56AD9"],
    look: "vertical",
    textColor: "#ffffff",
    separator: "rgba(255,255,255,0.34)",
  },
  {
    id: "neon",
    name: "Aurora",
    blurb: "Deep color with luminous rings",
    swatch: "#A78BFA",
    colors: ["#4E2F8F", "#164D7C", "#116A66", "#7D2F61", "#3C3B91", "#7A4D20"],
    look: "radial",
    textColor: "#ffffff",
    separator: "rgba(204,194,255,0.72)",
  },
  {
    id: "ink",
    name: "Editorial",
    blurb: "Crisp contrast and fine line texture",
    swatch: "#172554",
    colors: ["#172554", "#D9507F", "#F8FAFF", "#3976D4", "#F1A43A", "#5034A8"],
    look: "spoke",
    textColor: "#ffffff",
    separator: "rgba(255,255,255,0.82)",
  },
  {
    id: "pastel",
    name: "Cloud",
    blurb: "Airy pastels with a glazed finish",
    swatch: "#C9B8FF",
    colors: ["#FFB7CC", "#FFD794", "#AFE2C4", "#ADD6FF", "#C9B8FF", "#F2B7E8"],
    look: "seamless",
    textColor: "#334155",
    separator: "transparent",
  },
];

/** 旧存档配色 id → 新风格 id */
const LEGACY_PALETTE_IDS: Record<string, string> = {
  sunset: "gloss",
  gold: "retro",
  lime: "pastel",
  garden: "pastel",
  ocean: "gloss",
  berry: "neon",
  rose: "pastel",
  midnight: "neon",
  indigo: "neon",
  plum: "neon",
  wine: "ink",
  template: "candy",
};

export function resolvePaletteId(id: string | undefined | null): string {
  if (!id) return "candy";
  if (WHEEL_PALETTES.some((palette) => palette.id === id)) return id;
  return LEGACY_PALETTE_IDS[id] ?? "candy";
}

/** Map legacy look names from older builds onto structural styles */
export function resolveSliceLook(look: WheelSliceLook | string | undefined | null): ResolvedSliceLook {
  switch (look) {
    case "horizon":
    case "vertical":
    case "radial":
    case "spoke":
    case "seamless":
    case "solid":
      return look;
    case "gloss":
      return "horizon";
    case "retro":
      return "vertical";
    case "neon":
      return "radial";
    case "ink":
      return "spoke";
    case "pastel":
      return "seamless";
    case "flat":
    default:
      return "solid";
  }
}

export function getWheelPalette(id: string | undefined | null): WheelPalette {
  const resolved = resolvePaletteId(id);
  const palette = WHEEL_PALETTES.find((item) => item.id === resolved) ?? WHEEL_PALETTES[0];
  return {
    ...palette,
    look: resolveSliceLook(palette.look),
  };
}

export const WHEEL_STAGE_BACKGROUNDS: WheelStageBackground[] = [
  { id: "candy", name: "Soft Aurora", blurb: "Lavender light and floating color orbs" },
  { id: "sky", name: "Blue Air", blurb: "Layered sky tones and feather-light clouds" },
  { id: "sunny", name: "Warm Beam", blurb: "Peach light with a soft studio glow" },
  { id: "party", name: "Night Pop", blurb: "Deep indigo with restrained confetti" },
  { id: "grid", name: "Future Grid", blurb: "Violet horizon lines with calm depth" },
  { id: "notebook", name: "Paper Wave", blurb: "Clean paper layers and playful curves" },
];

export const WHEEL_WINNER_SCENES: WheelWinnerScene[] = [
  { id: "festival", name: "Color Burst", blurb: "Bright sparks and a clean confetti shower" },
  { id: "ribbons", name: "Ribbon Flow", blurb: "Smooth streamers sweeping across the stage" },
  { id: "bloom", name: "Soft Bloom", blurb: "Floating petals with a gentle color wash" },
  { id: "spotlight", name: "Warm Spotlight", blurb: "Soft beams and a fall of golden stars" },
  { id: "neon", name: "Aurora Win", blurb: "Luminous rings and violet-blue sparks" },
  { id: "balloons", name: "Bubble Rise", blurb: "Pastel bubbles drifting through the scene" },
];

export const DEFAULT_WINNER_SCENE: WheelWinnerSceneId = "festival";

export const WHEEL_POINTER_STYLES: WheelPointerStyle[] = [
  { id: "needle", name: "Color Pin" },
  { id: "jewel", name: "Raffle Gem" },
  { id: "arrow", name: "Decision" },
  { id: "chevron", name: "Game" },
  { id: "ticket", name: "Prize Ticket" },
  { id: "claw", name: "Creature" },
  { id: "compass", name: "Map Compass" },
  { id: "court", name: "Court Marker" },
  { id: "cinema", name: "Premiere" },
];

/** 默认使用细长指针，轮盘停下时更容易准确判断命中的分区。 */
export const DEFAULT_POINTER_STYLE: WheelPointerStyleId = "jewel";

export const WHEEL_POINTER_POSITIONS: WheelPointerPosition[] = [
  { id: "top", name: "Top", targetAngle: 0 },
  { id: "center", name: "Center", targetAngle: 0 },
  { id: "bottom", name: "Bottom", targetAngle: 180 },
  { id: "left", name: "Left", targetAngle: 270 },
  { id: "right", name: "Right", targetAngle: 90 },
];

export const DEFAULT_POINTER_POSITION = WHEEL_POINTER_POSITIONS[0].id;

export const WHEEL_RIM_STYLES: WheelRimStyle[] = [
  {
    id: "classic",
    name: "Pearl Carnival",
    blurb: "Bright raffle frame with a violet edge",
    swatch: "linear-gradient(145deg, #ffffff 0 42%, #eeeaff 68%, #9b83f4)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 31% 18%, #ffffff 0 9%, transparent 31%), linear-gradient(145deg, #ffffff 0%, #f8f6ff 43%, #e7e2fb 75%, #c9bdf1 100%)",
      "--wheel-shell-ring": "#ffffff",
      "--wheel-shell-outer": "#d7cff1",
      "--wheel-shell-glow": "0 18px 44px rgb(78 60 154 / 18%), inset 0 2px 9px rgb(255 255 255 / 94%)",
      "--wheel-shell-inner-border": "#efeaff",
      "--wheel-shell-inner-shadow": "inset 0 0 0 1px #cec4f0, inset 0 0 18px rgb(103 74 196 / 12%)",
      "--wheel-shell-inner-bg": "linear-gradient(112deg, transparent 19%, rgb(255 255 255 / 52%) 41%, transparent 60%)",
      "--wheel-shell-ring-width": "4px",
      "--wheel-shell-outer-width": "7px",
      "--wheel-shell-inner-width": "2px",
      "--wheel-shell-inner-style": "solid",
      "--wheel-disc-inset": "inset 0 0 18px rgb(68 48 145 / 16%)",
      "--wheel-base-border": "#6542d1",
      "--wheel-base-fill": "linear-gradient(180deg, #9a78f5, #6640d3 72%)",
      "--wheel-base-mid": "linear-gradient(90deg, #4d2fa8, #7c54df 50%, #4d2fa8)",
      "--wheel-base-mid-border": "#8061dd",
      "--wheel-base-bar": "linear-gradient(180deg, #8060df, #4b2a9f 72%)",
      "--wheel-base-bar-border": "#896ce1",
      "--wheel-base-glow": "0 10px 24px rgb(79 48 184 / 22%)",
      "--wheel-spin-border": "#d7ccff",
      "--wheel-spin-outline": "#5334b7",
      "--wheel-spin-bg": "radial-gradient(circle at 42% 28%, #a88aff, #6c45df 72%)",
    },
  },
  {
    id: "chrome",
    name: "Studio Silver",
    blurb: "Clean glass-metal for neutral wheels",
    swatch: "linear-gradient(120deg, #ffffff, #dce6f3 42%, #aebdd1 55%, #eef5fb 78%, #a9b7cc)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 31% 17%, rgb(255 255 255 / 88%) 0 7%, transparent 25%), linear-gradient(118deg, #f8fbff 0%, #d9e3f0 32%, #aab9cd 48%, #eef4fb 66%, #b8c5d8 100%)",
      "--wheel-shell-ring": "#fafdff",
      "--wheel-shell-outer": "#aebbd0",
      "--wheel-shell-glow": "0 16px 38px rgb(45 60 92 / 20%), inset 0 2px 8px rgb(255 255 255 / 88%)",
      "--wheel-shell-inner-border": "#f6f9ff",
      "--wheel-shell-inner-shadow": "inset 0 0 0 1px #96a7bf, inset 0 0 16px rgb(51 72 110 / 16%)",
      "--wheel-shell-inner-bg": "linear-gradient(104deg, transparent 20%, rgb(255 255 255 / 54%) 39%, transparent 57%)",
      "--wheel-shell-ring-width": "3px",
      "--wheel-shell-outer-width": "7px",
      "--wheel-shell-inner-width": "2px",
      "--wheel-shell-inner-style": "solid",
      "--wheel-disc-inset": "inset 0 0 18px rgb(45 65 100 / 17%)",
      "--wheel-base-border": "#667892",
      "--wheel-base-fill": "linear-gradient(180deg, #aab9ce, #62748f 72%)",
      "--wheel-base-mid": "linear-gradient(90deg, #46566f, #7b8da6 50%, #46566f)",
      "--wheel-base-mid-border": "#8797ad",
      "--wheel-base-bar": "linear-gradient(180deg, #8294aa, #485b75 72%)",
      "--wheel-base-bar-border": "#91a1b6",
      "--wheel-base-glow": "0 10px 24px rgb(42 58 89 / 22%)",
      "--wheel-spin-border": "#e9f2fb",
      "--wheel-spin-outline": "#50647f",
      "--wheel-spin-bg": "radial-gradient(circle at 42% 28%, #8db8ec, #5279c4 72%)",
    },
  },
  {
    id: "rose",
    name: "Decision Rose",
    blurb: "Confident blush frame for yes-or-no",
    swatch: "linear-gradient(145deg, #fff7fa, #ffd6e3 40%, #f399ba 72%, #e674a5)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 30% 17%, #ffffff 0 7%, transparent 26%), linear-gradient(145deg, #fff8fb 0%, #ffdce7 38%, #f4a4bf 72%, #dc74a1 100%)",
      "--wheel-shell-ring": "#fff4f8",
      "--wheel-shell-outer": "#ec9abb",
      "--wheel-shell-glow": "0 18px 42px rgb(209 75 135 / 22%), inset 0 2px 8px rgb(255 255 255 / 86%)",
      "--wheel-shell-inner-border": "#ffe2ed",
      "--wheel-shell-inner-shadow": "inset 0 0 0 1px #dc82aa, inset 0 0 18px rgb(182 59 119 / 15%)",
      "--wheel-shell-inner-bg": "linear-gradient(116deg, transparent 22%, rgb(255 255 255 / 46%) 42%, transparent 59%)",
      "--wheel-shell-ring-width": "3px",
      "--wheel-shell-outer-width": "7px",
      "--wheel-shell-inner-width": "2px",
      "--wheel-shell-inner-style": "solid",
      "--wheel-disc-inset": "inset 0 0 18px rgb(178 56 113 / 15%)",
      "--wheel-base-border": "#b54476",
      "--wheel-base-fill": "linear-gradient(180deg, #f494b6, #c94c81 72%)",
      "--wheel-base-mid": "linear-gradient(90deg, #8f315f, #dd6592 50%, #8f315f)",
      "--wheel-base-mid-border": "#e2779e",
      "--wheel-base-bar": "linear-gradient(180deg, #df6c96, #9e3567 72%)",
      "--wheel-base-bar-border": "#e983a8",
      "--wheel-base-glow": "0 10px 24px rgb(184 61 116 / 22%)",
      "--wheel-spin-border": "#ffe3ed",
      "--wheel-spin-outline": "#a63669",
      "--wheel-spin-bg": "radial-gradient(circle at 42% 28%, #ff9fba, #da4d82 72%)",
    },
  },
  {
    id: "ocean",
    name: "Color Glass",
    blurb: "Clear cyan frame for color and name draws",
    swatch: "linear-gradient(145deg, #f4fdff, #b7edfa 40%, #62b9eb 72%, #5388de)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 30% 18%, #ffffff 0 6%, transparent 25%), linear-gradient(145deg, #effcff 0%, #bdeff6 38%, #69bee9 70%, #5b82d9 100%)",
      "--wheel-shell-ring": "#edfeff",
      "--wheel-shell-outer": "#8bc8e8",
      "--wheel-shell-glow": "0 18px 42px rgb(52 145 208 / 24%), inset 0 2px 8px rgb(255 255 255 / 84%)",
      "--wheel-shell-inner-border": "#d7f8ff",
      "--wheel-shell-inner-shadow": "inset 0 0 0 1px #5ea7da, inset 0 0 18px rgb(33 113 183 / 16%)",
      "--wheel-shell-inner-bg": "linear-gradient(112deg, transparent 19%, rgb(255 255 255 / 50%) 40%, transparent 59%)",
      "--wheel-shell-ring-width": "3px",
      "--wheel-shell-outer-width": "7px",
      "--wheel-shell-inner-width": "2px",
      "--wheel-shell-inner-style": "solid",
      "--wheel-disc-inset": "inset 0 0 18px rgb(37 119 184 / 16%)",
      "--wheel-base-border": "#357fc0",
      "--wheel-base-fill": "linear-gradient(180deg, #70ccea, #3e86ce 72%)",
      "--wheel-base-mid": "linear-gradient(90deg, #315ea7, #51a7df 50%, #315ea7)",
      "--wheel-base-mid-border": "#61b1df",
      "--wheel-base-bar": "linear-gradient(180deg, #55aee0, #315fa9 72%)",
      "--wheel-base-bar-border": "#70bbe4",
      "--wheel-base-glow": "0 10px 24px rgb(37 114 182 / 22%)",
      "--wheel-spin-border": "#dcf8ff",
      "--wheel-spin-outline": "#316eb3",
      "--wheel-spin-bg": "radial-gradient(circle at 42% 28%, #72d4ed, #4776d4 72%)",
    },
  },
  {
    id: "neon",
    name: "Game Portal",
    blurb: "Deep indigo with an electric game aura",
    swatch: "linear-gradient(145deg, #171734 0 45%, #704de0 68%, #38bdf8 100%)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 32% 18%, rgb(152 129 255 / 34%) 0 6%, transparent 25%), linear-gradient(145deg, #26234a 0%, #17172f 47%, #3d297b 75%, #13162d 100%)",
      "--wheel-shell-ring": "#9f8bff",
      "--wheel-shell-outer": "#4f46a5",
      "--wheel-shell-glow": "0 0 22px rgb(112 78 236 / 42%), 0 18px 46px rgb(23 18 60 / 36%), inset 0 2px 7px rgb(255 255 255 / 15%)",
      "--wheel-shell-inner-border": "#8c7af0",
      "--wheel-shell-inner-shadow": "inset 0 0 0 1px #2e2861, inset 0 0 18px rgb(38 28 90 / 54%)",
      "--wheel-shell-inner-bg": "linear-gradient(115deg, transparent 20%, rgb(131 103 242 / 18%) 42%, transparent 58%)",
      "--wheel-shell-ring-width": "3px",
      "--wheel-shell-outer-width": "7px",
      "--wheel-shell-inner-width": "2px",
      "--wheel-shell-inner-style": "solid",
      "--wheel-disc-inset": "inset 0 0 22px rgb(83 58 186 / 36%)",
      "--wheel-base-border": "#41358f",
      "--wheel-base-fill": "linear-gradient(180deg, #7256de, #32256f 72%)",
      "--wheel-base-mid": "linear-gradient(90deg, #1d1b48, #5539ae 50%, #1d1b48)",
      "--wheel-base-mid-border": "#6352bb",
      "--wheel-base-bar": "linear-gradient(180deg, #5942ba, #211c55 72%)",
      "--wheel-base-bar-border": "#6957c5",
      "--wheel-base-glow": "0 0 24px rgb(112 79 232 / 34%)",
      "--wheel-spin-border": "#9defff",
      "--wheel-spin-outline": "#3c2b91",
      "--wheel-spin-bg": "radial-gradient(circle at 42% 28%, #9b72ff, #5739d0 68%, #282368)",
    },
  },
  {
    id: "emerald",
    name: "Garden Enamel",
    blurb: "Fresh mint glass with botanical depth",
    swatch: "linear-gradient(145deg, #f2fff9, #b9efd5 40%, #54c9a2 72%, #319a8a)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 31% 18%, #ffffff 0 6%, transparent 25%), linear-gradient(145deg, #effff8 0%, #bcefd5 38%, #61c9a3 71%, #2e9585 100%)",
      "--wheel-shell-ring": "#f0fff8",
      "--wheel-shell-outer": "#8dd7bb",
      "--wheel-shell-glow": "0 18px 42px rgb(45 158 126 / 22%), inset 0 2px 8px rgb(255 255 255 / 80%)",
      "--wheel-shell-inner-border": "#d8faea",
      "--wheel-shell-inner-shadow": "inset 0 0 0 1px #4da98f, inset 0 0 17px rgb(30 111 91 / 17%)",
      "--wheel-shell-inner-bg": "linear-gradient(113deg, transparent 20%, rgb(255 255 255 / 45%) 41%, transparent 58%)",
      "--wheel-shell-ring-width": "3px",
      "--wheel-shell-outer-width": "7px",
      "--wheel-shell-inner-width": "2px",
      "--wheel-shell-inner-style": "solid",
      "--wheel-disc-inset": "inset 0 0 18px rgb(30 125 97 / 16%)",
      "--wheel-base-border": "#2e8974",
      "--wheel-base-fill": "linear-gradient(180deg, #75d8b4, #319579 72%)",
      "--wheel-base-mid": "linear-gradient(90deg, #286b61, #4fb89a 50%, #286b61)",
      "--wheel-base-mid-border": "#61bea1",
      "--wheel-base-bar": "linear-gradient(180deg, #58bea0, #296f63 72%)",
      "--wheel-base-bar-border": "#71caae",
      "--wheel-base-glow": "0 10px 24px rgb(29 126 98 / 22%)",
      "--wheel-spin-border": "#ddfff0",
      "--wheel-spin-outline": "#277565",
      "--wheel-spin-bg": "radial-gradient(circle at 42% 28%, #7ce0bb, #319679 72%)",
    },
  },
  {
    id: "compass",
    name: "Atlas Brass",
    blurb: "Refined map brass with parchment light",
    swatch: "linear-gradient(145deg, #fffdf8, #f7e5bd 40%, #ddb873 70%, #c89c56)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 31% 18%, #fff7d8 0 6%, transparent 24%), repeating-conic-gradient(from -3deg, #3c5264 0deg 12deg, #d2ab62 12deg 13.3deg, #526d7a 13.3deg 25deg, #f1d490 25deg 26.3deg)",
      "--wheel-shell-ring": "#f4d68f",
      "--wheel-shell-outer": "#283d4d",
      "--wheel-shell-glow": "0 18px 42px rgb(28 47 62 / 28%), 0 0 18px rgb(217 177 99 / 22%), inset 0 2px 7px rgb(255 245 207 / 34%)",
      "--wheel-shell-inner-border": "#d8b56f",
      "--wheel-shell-inner-shadow": "inset 0 0 0 1px #243846, inset 0 0 17px rgb(18 35 48 / 46%)",
      "--wheel-shell-inner-bg": "repeating-conic-gradient(from 0deg, transparent 0deg 14deg, rgb(255 234 183 / 18%) 14deg 15deg)",
      "--wheel-shell-ring-width": "3px",
      "--wheel-shell-outer-width": "7px",
      "--wheel-shell-inner-width": "2px",
      "--wheel-shell-inner-style": "solid",
      "--wheel-disc-inset": "inset 0 0 20px rgb(22 45 60 / 34%)",
      "--wheel-base-border": "#263f4d",
      "--wheel-base-fill": "linear-gradient(180deg, #668392, #2d4b5b 72%)",
      "--wheel-base-mid": "linear-gradient(90deg, #1f3542, #b28a4f 50%, #1f3542)",
      "--wheel-base-mid-border": "#d0aa68",
      "--wheel-base-bar": "linear-gradient(180deg, #c8a15d, #6f532f 72%)",
      "--wheel-base-bar-border": "#e0c07b",
      "--wheel-base-glow": "0 10px 26px rgb(24 44 57 / 32%)",
      "--wheel-spin-border": "#efd99f",
      "--wheel-spin-outline": "#263f4d",
      "--wheel-spin-bg": "radial-gradient(circle at 42% 28%, #607f8d, #2b4858 72%)",
    },
  },
  {
    id: "court",
    name: "Arena Frame",
    blurb: "Graphite steel, maple and score red",
    swatch: "linear-gradient(145deg, #30384d 0 30%, #dfa35f 31% 68%, #ff6e72 69% 76%, #20263a 77%)",
    vars: {
      "--wheel-shell-bg": "linear-gradient(110deg, rgb(255 255 255 / 15%), transparent 28%), repeating-linear-gradient(90deg, #c7894c 0 8px, #e2aa65 8px 16px, #ba7840 16px 18px)",
      "--wheel-shell-ring": "#f8fafc",
      "--wheel-shell-outer": "#283046",
      "--wheel-shell-glow": "0 0 0 2px #ff696f, 0 18px 42px rgb(23 29 48 / 34%), inset 0 2px 7px rgb(255 255 255 / 18%)",
      "--wheel-shell-inner-border": "#ff777c",
      "--wheel-shell-inner-shadow": "inset 0 0 0 1px #22283a, inset 0 0 16px rgb(15 19 33 / 46%)",
      "--wheel-shell-inner-bg": "linear-gradient(90deg, transparent 48%, rgb(255 255 255 / 42%) 49% 51%, transparent 52%)",
      "--wheel-shell-ring-width": "2px",
      "--wheel-shell-outer-width": "7px",
      "--wheel-shell-inner-width": "2px",
      "--wheel-shell-inner-style": "solid",
      "--wheel-disc-inset": "inset 0 0 20px rgb(20 24 42 / 34%)",
      "--wheel-base-border": "#242a3e",
      "--wheel-base-fill": "linear-gradient(180deg, #5b6478, #2c3248 72%)",
      "--wheel-base-mid": "linear-gradient(90deg, #20263a, #d48d4e 50%, #20263a)",
      "--wheel-base-mid-border": "#edac6c",
      "--wheel-base-bar": "linear-gradient(180deg, #d79555, #744a2f 72%)",
      "--wheel-base-bar-border": "#efb371",
      "--wheel-base-glow": "0 10px 26px rgb(17 21 38 / 34%)",
      "--wheel-spin-border": "#ffb37b",
      "--wheel-spin-outline": "#272d42",
      "--wheel-spin-bg": "radial-gradient(circle at 42% 28%, #ff8b68, #dd4e57 72%)",
    },
  },
  {
    id: "cinema",
    name: "Premiere Noir",
    blurb: "Velvet midnight with a marquee-gold line",
    swatch: "linear-gradient(145deg, #26304f, #12172e 46%, #dcb86a 51%, #171b33 63%, #0f1327)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 31% 18%, rgb(255 255 255 / 20%) 0 6%, transparent 24%), linear-gradient(145deg, #293352 0%, #151a33 45%, #11162d 72%, #0d1124 100%)",
      "--wheel-shell-ring": "#e4c67e",
      "--wheel-shell-outer": "#161b32",
      "--wheel-shell-glow": "0 18px 44px rgb(8 11 29 / 42%), 0 0 18px rgb(228 198 126 / 18%), inset 0 2px 7px rgb(255 255 255 / 14%)",
      "--wheel-shell-inner-border": "#d6b76f",
      "--wheel-shell-inner-shadow": "inset 0 0 0 1px #090d20, inset 0 0 18px rgb(3 5 16 / 62%)",
      "--wheel-shell-inner-bg": "linear-gradient(113deg, transparent 20%, rgb(228 198 126 / 12%) 41%, transparent 58%)",
      "--wheel-shell-ring-width": "2px",
      "--wheel-shell-outer-width": "7px",
      "--wheel-shell-inner-width": "2px",
      "--wheel-shell-inner-style": "solid",
      "--wheel-disc-inset": "inset 0 0 22px rgb(4 7 20 / 48%)",
      "--wheel-base-border": "#0b0f22",
      "--wheel-base-fill": "linear-gradient(180deg, #303850, #12172c 72%)",
      "--wheel-base-mid": "linear-gradient(90deg, #0e1327, #9d793d 50%, #0e1327)",
      "--wheel-base-mid-border": "#c5a253",
      "--wheel-base-bar": "linear-gradient(180deg, #bd9850, #5d4727 72%)",
      "--wheel-base-bar-border": "#e1c171",
      "--wheel-base-glow": "0 12px 28px rgb(4 6 17 / 46%), 0 0 16px rgb(211 176 90 / 16%)",
      "--wheel-spin-border": "#e4c67e",
      "--wheel-spin-outline": "#11172d",
      "--wheel-spin-bg": "radial-gradient(circle at 42% 28%, #37415e, #141a31 72%)",
    },
  },
];

export const DEFAULT_RIM_STYLE = WHEEL_RIM_STYLES[0].id;

export const WHEEL_LIGHTS_STYLES: WheelLightsStyle[] = [
  {
    id: "classic",
    name: "Raffle Glow",
    blurb: "Pearl lights with a festive violet pulse",
    swatchA: "#ffffff",
    swatchB: "#b9a9ff",
    vars: {
      "--wheel-bulb-odd-bg": "radial-gradient(circle at 32% 25%, #ffffff 0 28%, #f4f1ff 58%, #d9d1f5 100%)",
      "--wheel-bulb-odd-border": "#ffffff",
      "--wheel-bulb-odd-glow": "0 0 7px rgb(255 255 255 / 82%), 0 2px 5px rgb(66 51 129 / 14%)",
      "--wheel-bulb-even-bg": "radial-gradient(circle at 32% 25%, #f7f4ff 0 22%, #b9a9ff 55%, #7c5be5 100%)",
      "--wheel-bulb-even-border": "#ebe6ff",
      "--wheel-bulb-even-glow": "0 0 7px rgb(151 125 255 / 36%)",
      "--wheel-bulb-width": "8px",
      "--wheel-bulb-height": "8px",
      "--wheel-bulb-radius": "50%",
      "--wheel-bulb-top": "-1px",
    },
  },
  {
    id: "ice",
    name: "Ice Crystal",
    blurb: "Diamond-cut blue and lilac shimmer",
    swatchA: "#eaf8ff",
    swatchB: "#8cbcf8",
    vars: {
      "--wheel-bulb-odd-bg": "radial-gradient(circle at 28% 22%, #ffffff 0 18%, #c9ecff 38%, #5599e8 100%)",
      "--wheel-bulb-odd-border": "#ffffff",
      "--wheel-bulb-odd-glow": "0 0 8px #e8f8ff, 0 0 16px rgb(85 153 232 / 64%)",
      "--wheel-bulb-even-bg": "linear-gradient(135deg, #faf8ff, #b7a5ff 55%, #7558df)",
      "--wheel-bulb-even-border": "#f0ecff",
      "--wheel-bulb-even-glow": "0 0 8px #ddd5ff, 0 0 16px rgb(117 88 223 / 58%)",
      "--wheel-bulb-width": "8px",
      "--wheel-bulb-height": "8px",
      "--wheel-bulb-radius": "2px",
      "--wheel-bulb-top": "0px",
      "--wheel-bulb-rotation": "45deg",
    },
  },
  {
    id: "fire",
    name: "Ember Pulse",
    blurb: "Warm coral drops with a soft breath",
    swatchA: "#ffd0b3",
    swatchB: "#ff7893",
    vars: {
      "--wheel-bulb-odd-bg": "linear-gradient(180deg, #fffaf6, #ffc89f 40%, #ff8b72 100%)",
      "--wheel-bulb-odd-border": "#fff4eb",
      "--wheel-bulb-odd-glow": "0 0 8px #ffd1b3, 0 0 18px rgb(255 139 114 / 58%)",
      "--wheel-bulb-even-bg": "linear-gradient(180deg, #fff0f4, #ff9caf 48%, #e85883 100%)",
      "--wheel-bulb-even-border": "#ffe2ea",
      "--wheel-bulb-even-glow": "0 0 8px #ffb6c4, 0 0 18px rgb(232 88 131 / 54%)",
      "--wheel-bulb-width": "8px",
      "--wheel-bulb-height": "12px",
      "--wheel-bulb-radius": "50% 50% 44% 44% / 64% 64% 36% 36%",
      "--wheel-bulb-top": "-3px",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    blurb: "Mint, blue and violet in a color wave",
    swatchA: "#6ee7b7",
    swatchB: "#c084fc",
    vars: {
      "--wheel-bulb-odd-bg": "linear-gradient(90deg, #5eead4, #a7f3d0, #22d3ee)",
      "--wheel-bulb-odd-border": "#ecfdf5",
      "--wheel-bulb-odd-glow": "0 0 8px #6ee7b7, 0 0 16px #34d399",
      "--wheel-bulb-even-bg": "linear-gradient(90deg, #818cf8, #c084fc, #f472b6)",
      "--wheel-bulb-even-border": "#f3e8ff",
      "--wheel-bulb-even-glow": "0 0 8px #d8b4fe, 0 0 16px #a855f7",
      "--wheel-bulb-width": "13px",
      "--wheel-bulb-height": "7px",
      "--wheel-bulb-radius": "999px",
      "--wheel-bulb-top": "0px",
    },
  },
  {
    id: "chase",
    name: "Arcade Chase",
    blurb: "Compact violet lights race around the frame",
    swatchA: "#d9d0ff",
    swatchB: "#8b72ef",
    vars: {
      "--wheel-bulb-odd-bg": "linear-gradient(135deg, #ffffff, #d9d0ff 58%, #9278ef)",
      "--wheel-bulb-odd-border": "#f6f3ff",
      "--wheel-bulb-odd-glow": "0 0 10px #d9d0ff, 0 0 18px rgb(137 108 235 / 54%)",
      "--wheel-bulb-even-bg": "linear-gradient(135deg, #f4fbff, #96d6f7 58%, #548fdf)",
      "--wheel-bulb-even-border": "#eaf8ff",
      "--wheel-bulb-even-glow": "0 0 10px #b9e6fb, 0 0 18px rgb(84 143 223 / 48%)",
      "--wheel-bulb-width": "8px",
      "--wheel-bulb-height": "8px",
      "--wheel-bulb-radius": "2px",
      "--wheel-bulb-top": "0px",
    },
  },
  {
    id: "starlight",
    name: "Stardust",
    blurb: "Warm white stars in a lilac orbit",
    swatchA: "#fff4a8",
    swatchB: "#c4b5fd",
    vars: {
      "--wheel-bulb-odd-bg": "radial-gradient(circle at 40% 34%, #fffde8 0 16%, #fde68a 42%, #f59e0b 100%)",
      "--wheel-bulb-odd-border": "transparent",
      "--wheel-bulb-odd-glow": "0 0 9px #fff4a8, 0 0 19px #f59e0b",
      "--wheel-bulb-even-bg": "radial-gradient(circle at 40% 34%, #faf5ff 0 16%, #c4b5fd 44%, #7c3aed 100%)",
      "--wheel-bulb-even-border": "transparent",
      "--wheel-bulb-even-glow": "0 0 9px #ede9fe, 0 0 19px #8b5cf6",
      "--wheel-bulb-width": "14px",
      "--wheel-bulb-height": "14px",
      "--wheel-bulb-radius": "0",
      "--wheel-bulb-top": "-3px",
    },
  },
  {
    id: "map-pins",
    name: "Map Pins",
    blurb: "Small brass and compass-blue markers",
    swatchA: "#f4d68f",
    swatchB: "#5e8398",
    vars: {
      "--wheel-bulb-odd-bg": "radial-gradient(circle at 35% 30%, #fff8dd 0 16%, #d7b66f 48%, #765329 100%)",
      "--wheel-bulb-odd-border": "#f4dda8",
      "--wheel-bulb-odd-glow": "0 0 6px rgb(215 182 111 / 54%)",
      "--wheel-bulb-even-bg": "radial-gradient(circle at 35% 30%, #e9f6fb 0 18%, #78a4b8 55%, #31566d 100%)",
      "--wheel-bulb-even-border": "#d7eef6",
      "--wheel-bulb-even-glow": "0 0 6px rgb(78 126 150 / 48%)",
      "--wheel-bulb-width": "7px",
      "--wheel-bulb-height": "7px",
      "--wheel-bulb-radius": "50%",
      "--wheel-bulb-top": "0px",
    },
  },
  {
    id: "scoreboard",
    name: "Scoreboard",
    blurb: "Slim arena LEDs in white and score red",
    swatchA: "#ffffff",
    swatchB: "#ff7899",
    vars: {
      "--wheel-bulb-odd-bg": "linear-gradient(135deg, #ffffff, #e6ebf4 58%, #aab6ca)",
      "--wheel-bulb-odd-border": "#ffffff",
      "--wheel-bulb-odd-glow": "0 0 6px rgb(248 250 252 / 65%)",
      "--wheel-bulb-even-bg": "linear-gradient(135deg, #fff0f4, #ff94ad 58%, #dc4f78)",
      "--wheel-bulb-even-border": "#ffe0e8",
      "--wheel-bulb-even-glow": "0 0 7px rgb(255 120 153 / 62%)",
      "--wheel-bulb-width": "8px",
      "--wheel-bulb-height": "5px",
      "--wheel-bulb-radius": "2px",
      "--wheel-bulb-top": "1px",
    },
  },
  {
    id: "premiere",
    name: "Marquee",
    blurb: "Warm premiere bulbs with a velvet glow",
    swatchA: "#fff4bf",
    swatchB: "#d6aa4b",
    vars: {
      "--wheel-bulb-odd-bg": "radial-gradient(circle at 34% 28%, #ffffff 0 18%, #ffe7a0 42%, #c78b2c 100%)",
      "--wheel-bulb-odd-border": "#fff4bf",
      "--wheel-bulb-odd-glow": "0 0 7px rgb(255 231 160 / 78%)",
      "--wheel-bulb-even-bg": "radial-gradient(circle at 34% 28%, #fff6d8 0 18%, #d6aa4b 48%, #7c511f 100%)",
      "--wheel-bulb-even-border": "#f3d17c",
      "--wheel-bulb-even-glow": "0 0 7px rgb(214 170 75 / 68%)",
      "--wheel-bulb-width": "7px",
      "--wheel-bulb-height": "7px",
      "--wheel-bulb-radius": "50%",
      "--wheel-bulb-top": "0px",
    },
  },
];

export const DEFAULT_LIGHTS_STYLE = WHEEL_LIGHTS_STYLES[0].id;
