/** 鍗曢」閫夐」锛氭潈閲嶅奖鍝嶆墖鍖哄ぇ灏忎笌鎶戒腑鍑犵巼 */
export type WheelOption = {
  id: string;
  label: string;
  weight: number;
  color: string;
  textColor: string;
  /** data URL锛涗綋绉ぇ鏃朵粎浼氳瘽鍐呬繚鐣欙紝榛樿涓嶈繘闀挎湡瀛樺偍 */
  image: string | null;
  /** 淇濈暀宸蹭笂浼犲浘鐗囦絾鍏佽涓存椂闅愯棌 */
  imageVisible: boolean;
};

export type WheelSettings = {
  entriesText: string;
  /** 鏂扮増閫夐」缁撴瀯锛堝惈鏉冮噸/棰滆壊锛夛紱鏃у瓨妗ｅ彲浠呮湁 entriesText */
  options?: Array<Omit<WheelOption, "image"> & { image?: string | null }>;
  paletteId: string;
  stageBackground: string;
  /** Compressed custom stage image stored locally when it fits the browser quota. */
  uploadedBackground?: string | null;
  /** 杞洏椤堕儴鎸囬拡鏍峰紡 */
  pointerStyle?: WheelPointerStyleId;
  /** 鎸囬拡鍦ㄨ浆鐩樹笂鐨勫畨瑁呬綅缃?*/
  pointerPosition?: WheelPointerPositionId;
  /** 杞洏澶栧湀杈规鑹?*/
  rimStyle?: WheelRimStyleId;
  /** 杞洏鐏彔鏁堟灉 */
  lightsStyle?: WheelLightsStyleId;
  /** 杞洏鐩橀潰鑳屾櫙锛堥潪鑸炲彴锛?*/
  wheelFaceBackground?: string | null;
  /** 闅愯棌鐩橀潰鍥剧墖鏃朵粛淇濈暀鍥剧墖鏁版嵁锛屾柟渚垮啀娆″紑鍚?*/
  wheelFaceVisible?: boolean;
  spinDuration: number;
  soundEnabled: boolean;
  volume: number;
  soundStyle: string;
  celebrationEnabled?: boolean;
  /** Winner card and celebration treatment displayed inside the wheel. */
  winnerScene?: WheelWinnerSceneId;
  removeWinner: boolean;
  sessionSpins: WheelSessionSpin[];
  /** 鑷敱鏃嬭浆鎴栨寜瀵硅薄杞祦鎵ц鍥哄畾娆℃暟 */
  runMode?: WheelRunMode;
  queueItems?: WheelQueueItem[];
  activeQueueItemId?: string | null;
  skippedQueueItemIds?: string[];
};

export type WheelStarterQueueItem = {
  label: string;
  turnLimit?: number;
};

export type WheelGameProps = {
  initialEntries?: string[];
  initialColors?: string[];
  initialTextColors?: string[];
  /** Optional per-entry starter artwork, aligned with initialEntries. */
  initialImages?: Array<string | null>;
  initialBackground?: string;
  /** Optional starter chrome used by themed templates. */
  initialPointerStyle?: WheelPointerStyleId;
  initialPointerPosition?: WheelPointerPositionId;
  initialRimStyle?: WheelRimStyleId;
  initialLightsStyle?: WheelLightsStyleId;
  /** Optional project asset used as the starter stage photo. */
  initialStageImage?: string | null;
  /** Template/home presets applied when local storage is empty or after Reset. */
  initialRemoveWinner?: boolean;
  initialRunMode?: WheelRunMode;
  initialQueueItems?: WheelStarterQueueItem[];
  storageKey?: string;
  title?: string;
};

/**
 * 鎵囧尯缁撴瀯椋庢牸锛氬喅瀹氬～鍏呭嚑浣曚笌杈圭晫锛岃€屼笉鏄彧鎹㈣壊鏉裤€? * solid=绾壊+杈圭晫 / horizon=妯悜娓愬彉 / vertical=绔栧悜娓愬彉 /
 * radial=鍦嗗績寰勫悜 / spoke=娌挎墖鍖轰腑绾?/ seamless=鏃犳墖褰㈣竟鐣? */
export type WheelSliceLook =
  | "solid"
  | "horizon"
  | "vertical"
  | "radial"
  | "spoke"
  | "seamless"
  /** @deprecated legacy saves */
  | "flat"
  | "gloss"
  | "neon"
  | "pastel"
  | "ink"
  | "retro";

export type WheelPalette = {
  id: string;
  name: string;
  /** 涓€鍙ヨ瘽璇存槑椋庢牸宸紓 */
  blurb: string;
  swatch: string;
  colors: string[];
  look: WheelSliceLook;
  /** 搴旂敤璇ラ鏍兼椂鍐欏叆閫夐」鐨勯粯璁ゆ枃瀛楄壊 */
  textColor: string;
  /** 鎵囧尯鍒嗗壊绾匡紱seamless 鐢ㄩ€忔槑 */
  separator: string;
};

export type WheelStageBackground = {
  id: string;
  name: string;
  blurb: string;
};

export type WheelWinnerSceneId =
  | "festival"
  | "ribbons"
  | "bloom"
  | "spotlight"
  | "neon"
  | "balloons";

export type WheelWinnerScene = {
  id: WheelWinnerSceneId;
  name: string;
  blurb: string;
};

export type WheelPointerStyleId =
  | "jewel"
  | "arrow"
  | "chevron"
  | "needle"
  | "ticket"
  | "claw"
  | "compass"
  | "court"
  | "cinema";

export type WheelPointerStyle = {
  id: WheelPointerStyleId;
  name: string;
};

export type WheelPointerPositionId =
  | "top"
  | "center"
  | "bottom"
  | "left"
  | "right";

export type WheelPointerPosition = {
  id: WheelPointerPositionId;
  name: string;
  /** 浠庢涓婃柟寮€濮嬮『鏃堕拡璁＄畻鐨勪腑濂栨寚鍚戣搴?*/
  targetAngle: number;
};

export type WheelRimStyleId =
  | "classic"
  | "chrome"
  | "rose"
  | "ocean"
  | "neon"
  | "emerald"
  | "compass"
  | "court"
  | "cinema";

export type WheelRimStyle = {
  id: WheelRimStyleId;
  name: string;
  blurb: string;
  swatch: string;
  /** CSS variables applied to the wheel shell; empty = theme default */
  vars: Record<string, string>;
};

export type WheelLightsStyleId =
  | "classic"
  | "ice"
  | "fire"
  | "aurora"
  | "chase"
  | "starlight"
  | "map-pins"
  | "scoreboard"
  | "premiere";

export type WheelLightsStyle = {
  id: WheelLightsStyleId;
  name: string;
  blurb: string;
  swatchA: string;
  swatchB: string;
  vars: Record<string, string>;
};

export type ExcelSheet = {
  sheet: string;
  data: unknown[][];
};

export type ExcelImportMode = "replace" | "append";

/** Classic淇濈暀鍘熺帺娉曪紱Turn Queue涓轰换鎰忓璞″畨鎺掔嫭绔嬭疆娆°€?*/
export type WheelRunMode = "classic" | "turn-queue";

export type WheelQueueItem = {
  id: string;
  label: string;
  turnLimit: number;
};

export type WheelSessionSpin = {
  id: string;
  /** Stable option identity keeps duplicate labels distinguishable. */
  optionId?: string;
  entry: string;
  pickedAt: string;
  /** 鏃ц褰曟病鏈塺unMode鏃舵寜classic澶勭悊 */
  runMode?: WheelRunMode;
  queueItemId?: string;
  queueItemLabel?: string;
  queueTurn?: number;
};

export type WheelEntryStat = {
  entry: string;
  pickCount: number;
};
