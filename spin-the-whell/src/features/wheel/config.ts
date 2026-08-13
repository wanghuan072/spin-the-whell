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
  "#F04444",
  "#F6A51A",
  "#6BC04B",
  "#0B78E3",
  "#A72CDD",
  "#EF3C8F",
];

export const WHEEL_PALETTES: WheelPalette[] = [
  {
    id: "candy",
    name: "Classic",
    blurb: "Crisp blocks with paper grain",
    swatch: "#F04444",
    colors: DEFAULT_WHEEL_COLORS,
    look: "solid",
    textColor: "#ffffff",
    separator: "rgba(0,0,0,0.28)",
  },
  {
    id: "gloss",
    name: "Glass",
    blurb: "Prismatic glass and highlights",
    swatch: "#38bdf8",
    colors: ["#f43f5e", "#f59e0b", "#10b981", "#0ea5e9", "#8b5cf6", "#ec4899"],
    look: "horizon",
    textColor: "#ffffff",
    separator: "rgba(255,255,255,0.4)",
  },
  {
    id: "retro",
    name: "Retro",
    blurb: "Sun-faded ink and print stripes",
    swatch: "#c05640",
    colors: ["#c05640", "#d69e2e", "#2f855a", "#2c7a7b", "#805ad5", "#9c4221"],
    look: "vertical",
    textColor: "#fff7ed",
    separator: "rgba(253,230,138,0.65)",
  },
  {
    id: "neon",
    name: "Neon",
    blurb: "Electric core with luminous rings",
    swatch: "#c084fc",
    colors: ["#24114d", "#062b44", "#073b32", "#45152d", "#2b1b55", "#3b2707"],
    look: "radial",
    textColor: "#f5e9ff",
    separator: "#e879f9",
  },
  {
    id: "ink",
    name: "Comic",
    blurb: "Bold seams with halftone hatching",
    swatch: "#0f172a",
    colors: ["#0f172a", "#e11d48", "#f8fafc", "#2563eb", "#f59e0b", "#111827"],
    look: "spoke",
    textColor: "#ffffff",
    separator: "#ffffff",
  },
  {
    id: "pastel",
    name: "Porcelain",
    blurb: "Soft glaze with seamless edges",
    swatch: "#f9a8d4",
    colors: ["#ffc6c7", "#ffe29a", "#bfe8cf", "#b9dcff", "#d8c5ff", "#ffc9e4"],
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
  { id: "candy", name: "Dreamscape", blurb: "Aurora haze and floating orbs" },
  { id: "sky", name: "Cloud Parade", blurb: "Layered clouds over a blue horizon" },
  { id: "sunny", name: "Spotlight", blurb: "Theater beams and a glowing floor" },
  { id: "party", name: "Confetti Club", blurb: "Paper confetti on a midnight stage" },
  { id: "grid", name: "Laser Runway", blurb: "Perspective grid with horizon glow" },
  { id: "notebook", name: "Paper Pop", blurb: "Cut-paper waves and playful grain" },
];

export const WHEEL_WINNER_SCENES: WheelWinnerScene[] = [
  { id: "festival", name: "Firework Fiesta", blurb: "Board-wide bursts and carnival confetti" },
  { id: "ribbons", name: "Ribbon Parade", blurb: "Sweeping streamers and colorful ribbons" },
  { id: "bloom", name: "Floral Bloom", blurb: "Floating flowers and a soft petal shower" },
  { id: "spotlight", name: "Golden Stage", blurb: "Theater spotlights and falling gold stars" },
  { id: "neon", name: "Neon Victory", blurb: "Electric rings, lasers, and bright sparks" },
  { id: "balloons", name: "Balloon Party", blurb: "Rising balloons and playful color pops" },
];

export const DEFAULT_WINNER_SCENE: WheelWinnerSceneId = "festival";

export const WHEEL_POINTER_STYLES: WheelPointerStyle[] = [
  { id: "needle", name: "Needle" },
  { id: "jewel", name: "Jewel" },
  { id: "arrow", name: "Arrow" },
  { id: "chevron", name: "Chevron" },
  { id: "ticket", name: "Ticket" },
  { id: "claw", name: "Claw" },
  { id: "compass", name: "Compass" },
  { id: "court", name: "Court" },
  { id: "cinema", name: "Cinema" },
];

/** 默认使用细长指针，轮盘停下时更容易准确判断命中的分区。 */
export const DEFAULT_POINTER_STYLE: WheelPointerStyleId = "needle";

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
    name: "Marquee",
    blurb: "Layered gold carnival trim",
    swatch: "linear-gradient(145deg, #fff3ad, #f59e0b 48%, #b73318)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 28% 18%, #fff5bd 0 5%, transparent 28%), linear-gradient(145deg, #ffd45e 0%, #f59e0b 38%, #ef6c1a 63%, #9f2f21 100%)",
      "--wheel-shell-ring": "#ffe28a",
      "--wheel-shell-outer": "#74211d",
      "--wheel-shell-glow": "0 0 28px oklch(79% 0.2 72 / 52%), 0 10px 30px oklch(24% 0.1 35 / 32%)",
      "--wheel-shell-inner-border": "#ffdd62",
      "--wheel-shell-inner-shadow": "inset 0 0 0 2px #9f2f21, inset 0 0 18px oklch(31% 0.16 35 / 70%)",
      "--wheel-shell-inner-bg": "repeating-conic-gradient(from 0deg, transparent 0deg 7deg, oklch(98% 0.12 90 / 22%) 7deg 9deg)",
      "--wheel-shell-ring-width": "4px",
      "--wheel-shell-outer-width": "9px",
      "--wheel-shell-inner-width": "3px",
      "--wheel-shell-inner-style": "solid",
    },
  },
  {
    id: "chrome",
    name: "Brushed",
    blurb: "Cool chrome with machined grain",
    swatch: "repeating-linear-gradient(105deg, #f8fafc 0 5px, #94a3b8 6px, #e2e8f0 10px)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 30% 18%, oklch(100% 0 0 / 70%), transparent 24%), repeating-linear-gradient(105deg, #f8fafc 0 7px, #cbd5e1 8px, #94a3b8 10px, #e2e8f0 15px)",
      "--wheel-shell-ring": "#f8fafc",
      "--wheel-shell-outer": "#475569",
      "--wheel-shell-glow": "0 0 22px oklch(74% 0.03 250 / 32%), 0 10px 30px oklch(20% 0.02 250 / 34%)",
      "--wheel-shell-inner-border": "#f8fafc",
      "--wheel-shell-inner-shadow": "inset 0 0 0 2px #64748b, inset 0 0 15px oklch(30% 0.02 250 / 42%)",
      "--wheel-shell-inner-bg": "linear-gradient(100deg, transparent 24%, oklch(100% 0 0 / 48%) 42%, transparent 58%)",
      "--wheel-shell-ring-width": "2px",
      "--wheel-shell-outer-width": "9px",
      "--wheel-shell-inner-width": "5px",
      "--wheel-shell-inner-style": "double",
    },
  },
  {
    id: "rose",
    name: "Rose Deco",
    blurb: "Faceted rose-gold geometry",
    swatch: "conic-gradient(from 20deg, #7f1d3a, #fb7185, #fecdd3, #be123c, #7f1d3a)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 32% 18%, #ffe4e8 0 5%, transparent 24%), conic-gradient(from 20deg, #7f1d3a, #fb7185 10%, #fecdd3 18%, #be123c 27%, #7f1d3a 36%, #fda4af 48%, #9f1239 62%, #fecdd3 76%, #be123c 88%, #7f1d3a)",
      "--wheel-shell-ring": "#fecdd3",
      "--wheel-shell-outer": "#701a3d",
      "--wheel-shell-glow": "0 0 26px oklch(72% 0.17 8 / 44%), 0 8px 30px oklch(30% 0.12 350 / 32%)",
      "--wheel-shell-inner-border": "#fda4af",
      "--wheel-shell-inner-shadow": "inset 0 0 0 2px #881337, inset 0 0 17px oklch(38% 0.14 8 / 50%)",
      "--wheel-shell-inner-bg": "repeating-conic-gradient(from 0deg, transparent 0deg 12deg, oklch(98% 0.05 10 / 22%) 12deg 14deg)",
      "--wheel-shell-ring-width": "3px",
      "--wheel-shell-outer-width": "9px",
      "--wheel-shell-inner-width": "3px",
      "--wheel-shell-inner-style": "dashed",
    },
  },
  {
    id: "ocean",
    name: "Tidal Glass",
    blurb: "Layered cyan ripple glass",
    swatch: "radial-gradient(circle at 30% 25%, #ecfeff, #22d3ee 38%, #075985 100%)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 30% 18%, #ecfeff 0 4%, transparent 23%), repeating-radial-gradient(circle at 50% 50%, #67e8f9 0 6px, #0ea5e9 8px 13px, #075985 15px 21px)",
      "--wheel-shell-ring": "#cffafe",
      "--wheel-shell-outer": "#083344",
      "--wheel-shell-glow": "0 0 28px oklch(78% 0.14 210 / 50%), 0 10px 34px oklch(28% 0.1 235 / 38%)",
      "--wheel-shell-inner-border": "#a5f3fc",
      "--wheel-shell-inner-shadow": "inset 0 0 0 2px #155e75, inset 0 0 18px oklch(35% 0.11 220 / 50%)",
      "--wheel-shell-inner-bg": "linear-gradient(112deg, transparent 18%, oklch(98% 0.02 210 / 55%) 38%, transparent 52%)",
      "--wheel-shell-ring-width": "3px",
      "--wheel-shell-outer-width": "8px",
      "--wheel-shell-inner-width": "3px",
      "--wheel-shell-inner-style": "solid",
    },
  },
  {
    id: "neon",
    name: "Arcade Neon",
    blurb: "Dark cabinet with split glow",
    swatch: "linear-gradient(135deg, #22d3ee 0 18%, #111827 28% 70%, #f472b6 82%)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 50% 50%, #111827 45%, #2e1065 76%, #050816 100%)",
      "--wheel-shell-ring": "#22d3ee",
      "--wheel-shell-outer": "#f472b6",
      "--wheel-shell-glow": "0 0 14px #22d3ee, 0 0 34px oklch(76% 0.16 210 / 48%), 0 0 58px oklch(70% 0.23 335 / 38%)",
      "--wheel-shell-inner-border": "#e879f9",
      "--wheel-shell-inner-shadow": "inset 0 0 5px #22d3ee, inset 0 0 19px oklch(68% 0.24 320 / 58%)",
      "--wheel-shell-inner-bg": "repeating-conic-gradient(from 0deg, transparent 0deg 13deg, oklch(78% 0.18 210 / 22%) 13deg 15deg)",
      "--wheel-shell-ring-width": "3px",
      "--wheel-shell-outer-width": "8px",
      "--wheel-shell-inner-width": "2px",
      "--wheel-shell-inner-style": "solid",
    },
  },
  {
    id: "emerald",
    name: "Emerald Inlay",
    blurb: "Deep enamel with gold seams",
    swatch: "repeating-conic-gradient(from 0deg, #065f46 0 16deg, #eab308 17deg 19deg)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 30% 18%, #6ee7b7 0 4%, transparent 24%), repeating-conic-gradient(from 0deg, #064e3b 0deg 13deg, #0f766e 13deg 17deg, #d4af37 17deg 18.5deg)",
      "--wheel-shell-ring": "#f6d365",
      "--wheel-shell-outer": "#052e2b",
      "--wheel-shell-glow": "0 0 24px oklch(72% 0.13 155 / 38%), 0 10px 32px oklch(22% 0.08 160 / 40%)",
      "--wheel-shell-inner-border": "#d4af37",
      "--wheel-shell-inner-shadow": "inset 0 0 0 2px #022c22, inset 0 0 17px oklch(30% 0.1 160 / 55%)",
      "--wheel-shell-inner-bg": "repeating-conic-gradient(from 0deg, transparent 0deg 16deg, oklch(84% 0.14 85 / 35%) 16deg 18deg)",
      "--wheel-shell-ring-width": "3px",
      "--wheel-shell-outer-width": "9px",
      "--wheel-shell-inner-width": "3px",
      "--wheel-shell-inner-style": "solid",
    },
  },
  {
    id: "compass",
    name: "Atlas Brass",
    blurb: "Aged compass brass and dark leather",
    swatch: "repeating-conic-gradient(from 0deg, #3f2b1d 0 10deg, #d6aa4b 11deg 13deg, #7b5328 14deg 24deg)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 34% 24%, #f8e6a8 0 3%, transparent 20%), repeating-conic-gradient(from 0deg, #3a291d 0deg 10deg, #c8963e 10deg 12deg, #6b4724 12deg 22deg)",
      "--wheel-shell-ring": "#e4bf69",
      "--wheel-shell-outer": "#241811",
      "--wheel-shell-glow": "0 0 18px rgb(214 170 75 / 28%), 0 12px 32px rgb(20 12 8 / 52%)",
      "--wheel-shell-inner-border": "#d6aa4b",
      "--wheel-shell-inner-shadow": "inset 0 0 0 2px #3a2515, inset 0 0 15px rgb(22 13 8 / 66%)",
      "--wheel-shell-inner-bg": "repeating-conic-gradient(from 0deg, transparent 0deg 13deg, rgb(244 218 150 / 24%) 13deg 14deg)",
      "--wheel-shell-ring-width": "3px",
      "--wheel-shell-outer-width": "8px",
      "--wheel-shell-inner-width": "2px",
      "--wheel-shell-inner-style": "solid",
    },
  },
  {
    id: "court",
    name: "Court Steel",
    blurb: "Black metal, maple and scoreboard red",
    swatch: "linear-gradient(135deg, #111827 0 26%, #c9924d 27% 68%, #ef4444 69% 76%, #111827 77%)",
    vars: {
      "--wheel-shell-bg": "linear-gradient(110deg, rgb(255 255 255 / 12%), transparent 28%), repeating-linear-gradient(90deg, #bd8446 0 8px, #d8a766 8px 16px, #a96f38 16px 18px)",
      "--wheel-shell-ring": "#f8fafc",
      "--wheel-shell-outer": "#111827",
      "--wheel-shell-glow": "0 0 0 2px #ef4444, 0 10px 32px rgb(3 7 18 / 52%)",
      "--wheel-shell-inner-border": "#ef4444",
      "--wheel-shell-inner-shadow": "inset 0 0 0 2px #111827, inset 0 0 14px rgb(3 7 18 / 62%)",
      "--wheel-shell-inner-bg": "linear-gradient(90deg, transparent 48%, rgb(248 250 252 / 48%) 49% 51%, transparent 52%)",
      "--wheel-shell-ring-width": "2px",
      "--wheel-shell-outer-width": "9px",
      "--wheel-shell-inner-width": "3px",
      "--wheel-shell-inner-style": "solid",
    },
  },
  {
    id: "cinema",
    name: "Cinema Noir",
    blurb: "Matte black frame with premiere gold",
    swatch: "linear-gradient(145deg, #050505, #2b2b2b 42%, #c89b3c 48%, #151515 56%, #020202)",
    vars: {
      "--wheel-shell-bg": "radial-gradient(circle at 30% 20%, rgb(255 255 255 / 16%) 0 3%, transparent 20%), linear-gradient(145deg, #080808, #282828 36%, #111111 62%, #020202)",
      "--wheel-shell-ring": "#d7b45d",
      "--wheel-shell-outer": "#020202",
      "--wheel-shell-glow": "0 0 22px rgb(215 180 93 / 28%), 0 14px 34px rgb(0 0 0 / 64%)",
      "--wheel-shell-inner-border": "#d7b45d",
      "--wheel-shell-inner-shadow": "inset 0 0 0 2px #050505, inset 0 0 18px rgb(0 0 0 / 78%)",
      "--wheel-shell-inner-bg": "repeating-conic-gradient(from 0deg, transparent 0deg 14deg, rgb(215 180 93 / 18%) 14deg 15deg)",
      "--wheel-shell-ring-width": "2px",
      "--wheel-shell-outer-width": "10px",
      "--wheel-shell-inner-width": "2px",
      "--wheel-shell-inner-style": "solid",
    },
  },
];

export const DEFAULT_RIM_STYLE = WHEEL_RIM_STYLES[0].id;

export const WHEEL_LIGHTS_STYLES: WheelLightsStyle[] = [
  {
    id: "classic",
    name: "Marquee",
    blurb: "Alternating round carnival bulbs",
    swatchA: "#ffe56b",
    swatchB: "#ef57d8",
    vars: {
      "--wheel-bulb-odd-bg": "radial-gradient(circle at 32% 25%, #fffbd1 0 20%, #ffe56b 42%, #f59e0b 100%)",
      "--wheel-bulb-odd-border": "#fff7c5",
      "--wheel-bulb-odd-glow": "0 0 8px #fff4a5, 0 0 16px #ff9b25",
      "--wheel-bulb-even-bg": "radial-gradient(circle at 32% 25%, #ffd2fb 0 18%, #ef57d8 44%, #a21caf 100%)",
      "--wheel-bulb-even-border": "#ffd2fb",
      "--wheel-bulb-even-glow": "0 0 8px #ffc8f7, 0 0 17px #c32bea",
      "--wheel-bulb-width": "9px",
      "--wheel-bulb-height": "9px",
      "--wheel-bulb-radius": "50%",
      "--wheel-bulb-top": "-1px",
    },
  },
  {
    id: "ice",
    name: "Crystal",
    blurb: "Diamond-cut cool shimmer",
    swatchA: "#e0f2fe",
    swatchB: "#7dd3fc",
    vars: {
      "--wheel-bulb-odd-bg": "radial-gradient(circle at 28% 22%, #ffffff 0 18%, #bae6fd 36%, #0284c7 100%)",
      "--wheel-bulb-odd-border": "#ffffff",
      "--wheel-bulb-odd-glow": "0 0 8px #e0f2fe, 0 0 16px #38bdf8",
      "--wheel-bulb-even-bg": "linear-gradient(135deg, #ecfeff, #38bdf8 55%, #0369a1)",
      "--wheel-bulb-even-border": "#e0f2fe",
      "--wheel-bulb-even-glow": "0 0 8px #bae6fd, 0 0 16px #0ea5e9",
      "--wheel-bulb-width": "8px",
      "--wheel-bulb-height": "8px",
      "--wheel-bulb-radius": "2px",
      "--wheel-bulb-top": "0px",
      "--wheel-bulb-rotation": "45deg",
    },
  },
  {
    id: "fire",
    name: "Ember",
    blurb: "Teardrop flames that breathe",
    swatchA: "#fdba74",
    swatchB: "#f97316",
    vars: {
      "--wheel-bulb-odd-bg": "linear-gradient(180deg, #fff7ed, #fdba74 38%, #ea580c 100%)",
      "--wheel-bulb-odd-border": "#fff7ed",
      "--wheel-bulb-odd-glow": "0 0 8px #fdba74, 0 0 18px #f97316",
      "--wheel-bulb-even-bg": "linear-gradient(180deg, #fed7aa, #f97316 48%, #9a3412 100%)",
      "--wheel-bulb-even-border": "#fed7aa",
      "--wheel-bulb-even-glow": "0 0 8px #fb923c, 0 0 18px #ea580c",
      "--wheel-bulb-width": "8px",
      "--wheel-bulb-height": "12px",
      "--wheel-bulb-radius": "50% 50% 44% 44% / 64% 64% 36% 36%",
      "--wheel-bulb-top": "-3px",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    blurb: "Capsule lights in a color wave",
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
    name: "Chase",
    blurb: "Square lamps run around the ring",
    swatchA: "#fde047",
    swatchB: "#facc15",
    vars: {
      "--wheel-bulb-odd-bg": "linear-gradient(135deg, #fefce8, #fde047 58%, #ca8a04)",
      "--wheel-bulb-odd-border": "#fefce8",
      "--wheel-bulb-odd-glow": "0 0 10px #fde047, 0 0 18px #eab308",
      "--wheel-bulb-even-bg": "linear-gradient(135deg, #fef9c3, #facc15 58%, #a16207)",
      "--wheel-bulb-even-border": "#fef9c3",
      "--wheel-bulb-even-glow": "0 0 10px #fde047, 0 0 18px #ca8a04",
      "--wheel-bulb-width": "8px",
      "--wheel-bulb-height": "8px",
      "--wheel-bulb-radius": "2px",
      "--wheel-bulb-top": "0px",
    },
  },
  {
    id: "starlight",
    name: "Starlight",
    blurb: "Star-shaped flashes in a soft orbit",
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
    blurb: "Quiet brass markers for geography wheels",
    swatchA: "#f2d184",
    swatchB: "#8f632d",
    vars: {
      "--wheel-bulb-odd-bg": "radial-gradient(circle at 35% 30%, #fff3bd 0 16%, #d6aa4b 48%, #6b4724 100%)",
      "--wheel-bulb-odd-border": "#f2d184",
      "--wheel-bulb-odd-glow": "0 0 5px rgb(214 170 75 / 60%)",
      "--wheel-bulb-even-bg": "radial-gradient(circle at 35% 30%, #cfaa62 0 18%, #8f632d 58%, #3f2917 100%)",
      "--wheel-bulb-even-border": "#d6aa4b",
      "--wheel-bulb-even-glow": "0 0 4px rgb(143 99 45 / 45%)",
      "--wheel-bulb-width": "7px",
      "--wheel-bulb-height": "7px",
      "--wheel-bulb-radius": "50%",
      "--wheel-bulb-top": "0px",
    },
  },
  {
    id: "scoreboard",
    name: "Scoreboard",
    blurb: "Compact red and white arena LEDs",
    swatchA: "#f8fafc",
    swatchB: "#ef4444",
    vars: {
      "--wheel-bulb-odd-bg": "linear-gradient(135deg, #ffffff, #cbd5e1 58%, #64748b)",
      "--wheel-bulb-odd-border": "#ffffff",
      "--wheel-bulb-odd-glow": "0 0 6px rgb(248 250 252 / 65%)",
      "--wheel-bulb-even-bg": "linear-gradient(135deg, #fecaca, #ef4444 58%, #991b1b)",
      "--wheel-bulb-even-border": "#fecaca",
      "--wheel-bulb-even-glow": "0 0 7px rgb(239 68 68 / 72%)",
      "--wheel-bulb-width": "8px",
      "--wheel-bulb-height": "5px",
      "--wheel-bulb-radius": "2px",
      "--wheel-bulb-top": "1px",
    },
  },
  {
    id: "premiere",
    name: "Premiere",
    blurb: "Warm theater bulbs with a restrained glow",
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
