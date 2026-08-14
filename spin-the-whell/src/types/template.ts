import type { SeoRecord } from "@/types/seo";
import type {
  WheelLightsStyleId,
  WheelPointerPositionId,
  WheelPointerStyleId,
  WheelRimStyleId,
  WheelRunMode,
  WheelStarterQueueItem,
} from "@/features/wheel/types";
import type { TemplateCategoryId } from "@/config/template-categories";

export type WheelTemplate = {
  id: number;
  /** Explicit editorial selection for the homepage template grid. */
  isHome: boolean;
  title: string;
  description: string;
  imageUrl: string;
  /** Current editor capture used by catalog and related-template cards. */
  cardImageUrl: string;
  imageAlt: string;
  addressBar: string;
  updatedDate: string;
  /** Template-specific editorial checks shown above the guide. */
  reviewSummary: string;
  category: Exclude<TemplateCategoryId, "all">;
  entries: string[];
  colors: string[];
  /** Optional per-entry label colors, aligned with entries and colors. */
  textColors?: string[];
  /** Optional per-entry artwork, aligned with entries. */
  entryImages?: Array<string | null>;
  background: string;
  pointerStyle?: WheelPointerStyleId;
  pointerPosition?: WheelPointerPositionId;
  rimStyle?: WheelRimStyleId;
  lightsStyle?: WheelLightsStyleId;
  /** Optional project asset loaded behind the wheel on the stage. */
  stageImage?: string;
  /** When true, Remove winner starts enabled for this starter wheel. */
  removeWinner?: boolean;
  runMode: WheelRunMode;
  queueItems?: WheelStarterQueueItem[];
  /** Visible provenance for factual or curated starter data. */
  source: {
    label: string;
    url?: string;
    checkedAt: string;
    scope: string;
  };
  /** Optional editor screenshots placed beside the written setup guide. */
  contentImages?: Array<{
    src: string;
    alt: string;
    caption: string;
  }>;
  seo: SeoRecord;
  detailsHtml: string;
};
