"use client";

import type { ChangeEvent, CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { TurnQueuePanel } from "./TurnQueuePanel";
import { WheelDisc } from "./WheelDisc";
import { WheelHeader } from "./WheelHeader";
import { WheelOptionsPanel } from "./WheelOptionsPanel";
import { WheelPointer } from "./WheelPointer";
import { WheelSheet } from "./WheelSheet";
import type { WheelSettingsTab } from "./WheelSettingsSheet";
import {
  EyeIcon,
  ExportIcon,
  FullscreenIcon,
  ImageIcon,
  LinkIcon,
  SoundIcon,
  TrashIcon,
  UploadIcon,
} from "./WheelIcons";
import {
  DEFAULT_LIGHTS_STYLE,
  DEFAULT_POINTER_POSITION,
  DEFAULT_POINTER_STYLE,
  DEFAULT_RIM_STYLE,
  DEFAULT_WINNER_SCENE,
  DEFAULT_WHEEL_COLORS,
  DEFAULT_WHEEL_ENTRIES,
  MAX_WHEEL_OPTIONS,
  MAX_QUEUE_ITEMS,
  getWheelPalette,
  resolvePaletteId,
  WHEEL_LIGHTS_STYLES,
  WHEEL_PALETTES,
  WHEEL_POINTER_POSITIONS,
  WHEEL_POINTER_STYLES,
  WHEEL_RIM_STYLES,
  WHEEL_STAGE_BACKGROUNDS,
  WHEEL_WINNER_SCENES,
} from "../config";
import {
  buildShareUrl,
  decodeWheelShare,
  encodeWheelShare,
} from "../lib/wheel-share";
import {
  applyPaletteToOptions,
  clampOptionWeight,
  computeWheelSegments,
  createOptionsFromLabels,
  createWheelOption,
  hydrateOptions,
  optionLabels,
  readImageAsDataUrl,
  serializeOptionsForStorage,
} from "../lib/wheel-options";
import {
  clampQueueTurns,
  createQueueItem,
  getNextQueueItemId,
  getQueueItemSpinCount,
  hydrateStarterQueue,
  resolveActiveQueueItemId,
  sanitizeQueueItems,
} from "../lib/wheel-queue";
import {
  formatSessionExport,
  MAX_SESSION_SPINS,
  parsePastedEntries,
  removeWinningOption,
  sanitizeSessionSpins,
  selectWheelEntryIndex,
  selectWheelStopAngle,
  shuffleWheelEntries,
} from "../lib/wheel";
import type {
  WheelGameProps,
  WheelLightsStyleId,
  WheelOption,
  WheelPointerPositionId,
  WheelQueueItem,
  WheelPointerStyleId,
  WheelRimStyleId,
  WheelRunMode,
  WheelSessionSpin,
  WheelSettings,
  WheelWinnerSceneId,
} from "../types";
import styles from "../styles/WheelGame.module.css";
import { useWheelAudio } from "../hooks/useWheelAudio";
import { useWheelFullscreen } from "../hooks/useWheelFullscreen";

const AdvancedOptionsPanel = dynamic(() => import("./AdvancedOptionsPanel").then((module) => module.AdvancedOptionsPanel));
const ExcelImportDialog = dynamic(() => import("./ExcelImportDialog").then((module) => module.ExcelImportDialog));
const SessionSummary = dynamic(() => import("./SessionSummary").then((module) => module.SessionSummary));
const TurnQueueImportDialog = dynamic(() => import("./TurnQueueImportDialog").then((module) => module.TurnQueueImportDialog));
const WinnerCelebration = dynamic(() => import("./WinnerCelebration").then((module) => module.WinnerCelebration));
const WheelSettingsSheet = dynamic(() => import("./WheelSettingsSheet").then((module) => module.WheelSettingsSheet));

type PanelId = "settings" | "summary";
type LeftRailView = "options" | "queue" | "results" | "advanced";
type StyleTab = "look" | "chrome" | "stage";

const MAX_PERSISTED_IMAGE_LENGTH = 1_500_000;
const SPIN_FALLBACK_GRACE_MS = 350;
function spinBelongsToMode(spin: WheelSessionSpin, mode: WheelRunMode) {
  return (spin.runMode === "turn-queue" ? "turn-queue" : "classic") === mode;
}

function getPointerTargetAngle(positionId: WheelPointerPositionId) {
  return WHEEL_POINTER_POSITIONS.find((position) => position.id === positionId)?.targetAngle ?? 0;
}

function createStarterOptions(
  entries: string[],
  colors: string[],
  textColors?: string[],
  images?: Array<string | null>,
) {
  return createOptionsFromLabels(entries, colors).map((option, index) => ({
    ...option,
    textColor: textColors?.[index] ?? option.textColor,
    image: images?.[index] ?? option.image,
  }));
}

export function WheelGame({
  initialEntries = DEFAULT_WHEEL_ENTRIES,
  initialColors = DEFAULT_WHEEL_COLORS,
  initialTextColors,
  initialImages,
  initialBackground = "candy",
  initialPointerStyle = DEFAULT_POINTER_STYLE,
  initialPointerPosition = DEFAULT_POINTER_POSITION,
  initialRimStyle = DEFAULT_RIM_STYLE,
  initialLightsStyle = DEFAULT_LIGHTS_STYLE,
  initialStageImage = null,
  initialRemoveWinner = false,
  initialRunMode = "classic",
  initialQueueItems,
  storageKey = "spin-wheel-home-v5",
  title = "Your decision playground",
}: WheelGameProps) {
  const starterRunMode: WheelRunMode = initialRunMode === "turn-queue" ? "turn-queue" : "classic";
  const starterQueue = hydrateStarterQueue(initialQueueItems);
  const initialPalette = WHEEL_PALETTES.find((palette) =>
    palette.colors.every((color, index) => color === initialColors[index]),
  ) ?? getWheelPalette("candy");
  const [options, setOptions] = useState<WheelOption[]>(
    () => createStarterOptions(initialEntries, initialColors, initialTextColors, initialImages),
  );
  const [colors, setColors] = useState(initialColors);
  const [paletteId, setPaletteId] = useState(initialPalette.id);
  const [stageBackground, setStageBackground] = useState(initialBackground);
  const [pointerStyle, setPointerStyle] = useState<WheelPointerStyleId>(initialPointerStyle);
  const [pointerPosition, setPointerPosition] = useState<WheelPointerPositionId>(initialPointerPosition);
  const [rimStyle, setRimStyle] = useState<WheelRimStyleId>(initialRimStyle);
  const [lightsStyle, setLightsStyle] = useState<WheelLightsStyleId>(initialLightsStyle);
  const [uploadedBackground, setUploadedBackground] = useState<string | null>(initialStageImage);
  const [wheelFaceBackground, setWheelFaceBackground] = useState<string | null>(null);
  const [wheelFaceVisible, setWheelFaceVisible] = useState(true);
  const [spinDuration, setSpinDuration] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(55);
  const [soundStyle, setSoundStyle] = useState("arcade");
  const [removeWinner, setRemoveWinner] = useState(initialRemoveWinner === true);
  const [sessionSpins, setSessionSpins] = useState<WheelSessionSpin[]>([]);
  const [openPanel, setOpenPanel] = useState<PanelId | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [activeSpinDuration, setActiveSpinDuration] = useState(spinDuration);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [isWheelImportOpen, setIsWheelImportOpen] = useState(false);
  const [celebrationEnabled, setCelebrationEnabled] = useState(true);
  const [winnerScene, setWinnerScene] = useState<WheelWinnerSceneId>(DEFAULT_WINNER_SCENE);
  const [isWinnerPreviewOpen, setIsWinnerPreviewOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [leftRailView, setLeftRailView] = useState<LeftRailView>(
    starterRunMode === "turn-queue" ? "queue" : "options",
  );
  const [styleTab, setStyleTab] = useState<StyleTab>("look");
  const [settingsTab, setSettingsTab] = useState<WheelSettingsTab>("rules");
  const [runMode, setRunMode] = useState<WheelRunMode>(starterRunMode);
  const [queueItems, setQueueItems] = useState<WheelQueueItem[]>(starterQueue);
  const [activeQueueItemId, setActiveQueueItemId] = useState<string | null>(starterQueue[0]?.id ?? null);
  const [skippedQueueItemIds, setSkippedQueueItemIds] = useState<string[]>([]);
  const [isQueueImportOpen, setIsQueueImportOpen] = useState(false);
  const [settledOptions, setSettledOptions] = useState<WheelOption[] | null>(null);

  const gameRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelDiscRef = useRef<HTMLDivElement>(null);
  const spinTickFrameRef = useRef<number | null>(null);
  const winnerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinFrameRef = useRef<number | null>(null);
  const spinCompletionRef = useRef<(() => void) | null>(null);
  const isSpinningRef = useRef(false);
  const importTriggerRef = useRef<HTMLButtonElement>(null);
  const styleRailRef = useRef<HTMLElement>(null);
  const skipPersistRef = useRef(false);
  const storageErrorShownRef = useRef(false);
  const { enabledRef: soundEnabledRef, volumeRef, soundStyleRef, playTone } = useWheelAudio(
    soundEnabled,
    volume,
    soundStyle,
  );
  const { isFullscreen, toggleFullscreen: toggleGameFullscreen } = useWheelFullscreen(gameRef);

  function focusStyleRail() {
    setStyleTab("look");
    styleRailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function changePointerPosition(nextPosition: WheelPointerPositionId) {
    if (isSpinningRef.current || nextPosition === pointerPosition) return;
    const angleDelta = getPointerTargetAngle(nextPosition) - getPointerTargetAngle(pointerPosition);
    setPointerPosition(nextPosition);
    // 已有结果时同步调整盘面，确保原中奖项仍对准新的指针位置。
    if (hasSpun && angleDelta !== 0) {
      setActiveSpinDuration(0);
      setWheelRotation((current) => current + angleDelta);
    }
  }
  const entries = useMemo(() => optionLabels(options), [options]);
  const hasBlankOptions = options.some((option) => !option.label.trim());
  const displayOptions = result && settledOptions ? settledOptions : options;
  const celebrationColors = useMemo(
    () => displayOptions.map((option) => option.color),
    [displayOptions],
  );
  const activePalette = useMemo(() => getWheelPalette(paletteId), [paletteId]);
  const wheelChromeStyle = useMemo(() => {
    const rimVars = WHEEL_RIM_STYLES.find((item) => item.id === rimStyle)?.vars ?? {};
    const lightsVars = WHEEL_LIGHTS_STYLES.find((item) => item.id === lightsStyle)?.vars ?? {};
    return { ...rimVars, ...lightsVars } as CSSProperties;
  }, [lightsStyle, rimStyle]);
  const classicSessionSpins = useMemo(
    () => sessionSpins.filter((spin) => spinBelongsToMode(spin, "classic")),
    [sessionSpins],
  );
  const queueSessionSpins = useMemo(
    () => sessionSpins.filter((spin) => spinBelongsToMode(spin, "turn-queue")),
    [sessionSpins],
  );
  const currentSessionSpins = runMode === "turn-queue" ? queueSessionSpins : classicSessionSpins;
  const activeSpin = result ? currentSessionSpins[0] : undefined;
  const resolvedQueueItemId = useMemo(() => resolveActiveQueueItemId({
    items: queueItems,
    spins: queueSessionSpins,
    skippedIds: skippedQueueItemIds,
    activeId: activeQueueItemId,
  }), [activeQueueItemId, queueItems, queueSessionSpins, skippedQueueItemIds]);
  const activeQueueItem = queueItems.find((item) => item.id === resolvedQueueItemId) ?? null;
  const activeQueueTurnsUsed = activeQueueItem
    ? getQueueItemSpinCount(queueSessionSpins, activeQueueItem.id)
    : 0;
  const queueComplete = queueItems.length > 0 && resolvedQueueItemId === null;
  const isTurnQueueComplete = runMode === "turn-queue" && queueComplete;
  const canSpinCurrentOptions = entries.length >= 2 || (removeWinner && entries.length === 1);
  const isFinalOptionRound = removeWinner && entries.length === 1;
  const isWinnerSceneOpen = Boolean(result) || isWinnerPreviewOpen;
  const winnerWasRemoved = Boolean(
    removeWinner
    && activeSpin?.optionId
    && !options.some((option) => option.id === activeSpin.optionId),
  );
  const winnerStatus = removeWinner
    ? (winnerWasRemoved
      ? options.length === 0
        ? "This final winner has been removed. No options remain on the wheel."
        : options.length === 1
          ? "This winner has been removed. One final option remains."
          : "This winner has been removed from the wheel."
      : "Remove winner is on, but this result could not be matched to an option.")
    : isTurnQueueComplete
      ? (skippedQueueItemIds.length > 0
        ? `${skippedQueueItemIds.length} queue item${skippedQueueItemIds.length === 1 ? " was" : "s were"} skipped; all remaining turns are complete.`
        : "Every Turn Queue item has completed its rounds.")
      : "The wheel is ready whenever you are.";
  const winnerContext = activeSpin?.queueItemLabel && activeSpin.queueTurn
    ? `${activeSpin.queueItemLabel} · Turn ${activeSpin.queueTurn}`
    : undefined;

  // 优先读取分享链接；否则恢复本地设置，并提示与模板默认不一致。
  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const shared = decodeWheelShare(new URLSearchParams(window.location.search).get("w"));
      if (shared) {
        skipPersistRef.current = true;
        const sharedOptions = createOptionsFromLabels(shared.entries, shared.colors ?? initialColors)
          .map((option, index) => ({
            ...option,
            weight: shared.weights?.[index] ?? option.weight,
            color: shared.colors?.[index] ?? option.color,
          }));
        setOptions(sharedOptions);
        if (shared.colors) {
          setColors(shared.colors);
          setPaletteId("custom");
        }
        setRemoveWinner(shared.removeWinner);
        setSessionSpins([]);
        setRunMode("classic");
        setQueueItems([]);
        setActiveQueueItemId(null);
        setSkippedQueueItemIds([]);
        setSettledOptions(null);
        setHasLoadedStorage(true);
        window.setTimeout(() => {
          skipPersistRef.current = false;
        }, 0);
        return;
      }

      const savedValue = window.localStorage.getItem(storageKey)
        ?? window.localStorage.getItem(storageKey.replace("v5", "v4"));
      if (savedValue) {
        try {
          const saved = JSON.parse(savedValue) as Partial<WheelSettings>;
          const savedPalette = getWheelPalette(saved.paletteId);
          const paletteColors = savedPalette.colors;
          const labels = saved.entriesText
            ? parsePastedEntries(saved.entriesText)
            : initialEntries;
          const nextOptions = hydrateOptions(saved.options, labels, paletteColors);
          const starterImageByLabel = new Map(
            initialEntries.map((label, index) => [label, initialImages?.[index] ?? null]),
          );
          const nextOptionsWithStarterImages = nextOptions.map((option) => ({
            ...option,
            image: option.image ?? starterImageByLabel.get(option.label) ?? null,
          }));
          setOptions(nextOptionsWithStarterImages);
          if (saved.paletteId) {
            if (saved.paletteId === "custom") {
              setPaletteId("custom");
              setColors(nextOptionsWithStarterImages.map((option) => option.color));
            } else {
              const resolvedId = resolvePaletteId(saved.paletteId);
              setPaletteId(resolvedId);
              setColors(getWheelPalette(resolvedId).colors);
            }
          }
          if (saved.stageBackground) setStageBackground(saved.stageBackground);
          if (
            typeof saved.uploadedBackground === "string"
            && (saved.uploadedBackground.startsWith("data:image/") || saved.uploadedBackground.startsWith("/images/"))
            && saved.uploadedBackground.length <= MAX_PERSISTED_IMAGE_LENGTH
          ) {
            setUploadedBackground(saved.uploadedBackground);
          } else if (initialStageImage) {
            setUploadedBackground(initialStageImage);
          }
          if (saved.pointerStyle && WHEEL_POINTER_STYLES.some((item) => item.id === saved.pointerStyle)) {
            setPointerStyle(saved.pointerStyle);
          }
          if (saved.pointerPosition && WHEEL_POINTER_POSITIONS.some((item) => item.id === saved.pointerPosition)) {
            setPointerPosition(saved.pointerPosition);
          }
          if (saved.rimStyle && WHEEL_RIM_STYLES.some((item) => item.id === saved.rimStyle)) {
            setRimStyle(saved.rimStyle);
          }
          if (saved.lightsStyle && WHEEL_LIGHTS_STYLES.some((item) => item.id === saved.lightsStyle)) {
            setLightsStyle(saved.lightsStyle);
          }
          if (
            typeof saved.wheelFaceBackground === "string"
            && saved.wheelFaceBackground.startsWith("data:image/")
            && saved.wheelFaceBackground.length <= MAX_PERSISTED_IMAGE_LENGTH
          ) {
            setWheelFaceBackground(saved.wheelFaceBackground);
            setWheelFaceVisible(saved.wheelFaceVisible !== false);
          }
      if (typeof saved.spinDuration === "number" && Number.isFinite(saved.spinDuration)) {
        const restoredDuration = Math.min(15, Math.max(3, Math.round(saved.spinDuration)));
        // 旧版默认值为 8 秒，迁移到更舒缓的 10 秒；其他自定义时长保持不变。
        setSpinDuration(restoredDuration === 8 ? 10 : restoredDuration);
          }
          if (typeof saved.soundEnabled === "boolean") setSoundEnabled(saved.soundEnabled);
          if (typeof saved.volume === "number" && Number.isFinite(saved.volume)) {
            setVolume(Math.min(100, Math.max(0, Math.round(saved.volume))));
          }
          if (["arcade", "bell", "soft"].includes(saved.soundStyle ?? "")) {
            setSoundStyle(saved.soundStyle as string);
          }
          if (typeof saved.celebrationEnabled === "boolean") {
            setCelebrationEnabled(saved.celebrationEnabled);
          }
          if (saved.winnerScene && WHEEL_WINNER_SCENES.some((scene) => scene.id === saved.winnerScene)) {
            setWinnerScene(saved.winnerScene);
          }
          setRemoveWinner(saved.removeWinner === true);
          setSessionSpins(sanitizeSessionSpins(saved.sessionSpins));
          const restoredQueue = sanitizeQueueItems(saved.queueItems);
          const restoredQueueIds = new Set(restoredQueue.map((item) => item.id));
          setQueueItems(restoredQueue);
          setRunMode(saved.runMode === "turn-queue" ? "turn-queue" : "classic");
          setLeftRailView(saved.runMode === "turn-queue" ? "queue" : "options");
          setActiveQueueItemId(
            typeof saved.activeQueueItemId === "string" && restoredQueueIds.has(saved.activeQueueItemId)
              ? saved.activeQueueItemId
              : restoredQueue[0]?.id ?? null,
          );
          setSkippedQueueItemIds(Array.isArray(saved.skippedQueueItemIds)
            ? saved.skippedQueueItemIds.filter(
                (id): id is string => typeof id === "string" && restoredQueueIds.has(id),
              )
            : []);
          setSettledOptions(null);
        } catch {
          window.localStorage.removeItem(storageKey);
          window.localStorage.removeItem(storageKey.replace("v5", "v4"));
          setError("Saved wheel data was damaged, so the starter wheel was restored.");
        }
      } else if (initialStageImage) {
        setUploadedBackground(initialStageImage);
      }
      setHasLoadedStorage(true);
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, [
    initialColors,
    initialEntries,
    initialImages,
    initialLightsStyle,
    initialPointerPosition,
    initialPointerStyle,
    initialRimStyle,
    initialStageImage,
    initialTextColors,
    storageKey,
  ]);

  useEffect(() => {
    if (!hasLoadedStorage || skipPersistRef.current) return;
    const settings: WheelSettings = {
      entriesText: optionLabels(options).join("\n"),
      options: serializeOptionsForStorage(options),
      paletteId,
      stageBackground,
      uploadedBackground,
      pointerStyle,
      pointerPosition,
      rimStyle,
      lightsStyle,
      wheelFaceBackground,
      wheelFaceVisible,
      spinDuration,
      soundEnabled,
      volume,
      soundStyle,
      celebrationEnabled,
      winnerScene,
      removeWinner,
      sessionSpins: sessionSpins.slice(0, MAX_SESSION_SPINS),
      runMode,
      queueItems,
      activeQueueItemId: resolvedQueueItemId,
      skippedQueueItemIds,
    };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(settings));
      storageErrorShownRef.current = false;
    } catch {
      if (!storageErrorShownRef.current) {
        storageErrorShownRef.current = true;
        setError("Local storage is full. The current wheel still works, but recent changes may not survive a refresh.");
      }
      // 配额不足时仍保留内存中的选项与图片
    }
  }, [
    options,
    celebrationEnabled,
    hasLoadedStorage,
    activeQueueItemId,
    paletteId,
    lightsStyle,
    pointerStyle,
    pointerPosition,
    removeWinner,
    rimStyle,
    queueItems,
    resolvedQueueItemId,
    runMode,
    sessionSpins,
    soundEnabled,
    soundStyle,
    spinDuration,
    stageBackground,
    storageKey,
    uploadedBackground,
    volume,
    wheelFaceBackground,
    wheelFaceVisible,
    skippedQueueItemIds,
    winnerScene,
  ]);

  useEffect(() => {
    return () => {
      if (spinTickFrameRef.current) cancelAnimationFrame(spinTickFrameRef.current);
      if (winnerTimerRef.current) clearTimeout(winnerTimerRef.current);
      if (spinFrameRef.current) cancelAnimationFrame(spinFrameRef.current);
      spinCompletionRef.current = null;
      isSpinningRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!actionNotice) return;
    const timer = window.setTimeout(() => setActionNotice(null), 2800);
    return () => window.clearTimeout(timer);
  }, [actionNotice]);

  // 先安全地选择结果，再计算旋转角度，让指针停在对应扇区中心。
  function spinWheel() {
    const spinOptions = options;
    const spinEntries = optionLabels(spinOptions);
    const canSpinOptions = spinEntries.length >= 2 || (removeWinner && spinEntries.length === 1);
    if (!canSpinOptions || isSpinningRef.current) {
      if (!canSpinOptions) {
        setError(spinEntries.length === 0
          ? "No options remain. Add options before spinning again."
          : "Add at least two options before spinning, or enable Remove winner to reveal the final option.");
      }
      return;
    }
    if (spinOptions.some((option) => !option.label.trim())) {
      setError("Give every option a name before spinning.");
      setLeftRailView("options");
      return;
    }
    const queueItemForSpin = runMode === "turn-queue" ? activeQueueItem : null;
    if (runMode === "turn-queue" && !queueItemForSpin) {
      setError(queueItems.length === 0
        ? "Add at least one item to the Turn Queue before spinning."
        : "The Turn Queue is complete. Reset its progress to play again.");
      styleRailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    if (queueItemForSpin && !queueItemForSpin.label.trim()) {
      setError("Give the current Turn Queue item a name before spinning.");
      styleRailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    isSpinningRef.current = true;

    setSettledOptions(null);
    setError(null);
    setResult(null);
    const runModeForSpin = runMode;
    const queueTurnForSpin = queueItemForSpin
      ? getQueueItemSpinCount(queueSessionSpins, queueItemForSpin.id) + 1
      : undefined;
    const selectedIndex = selectWheelEntryIndex({
      entries: spinEntries,
      weights: spinOptions.map((option) => clampOptionWeight(option.weight)),
    });
    const selectedOption = spinOptions[selectedIndex];
    const selectedEntry = spinEntries[selectedIndex];
    const segments = computeWheelSegments(spinOptions);
    const selectedSegment = segments[selectedIndex];
    const targetAngle = selectedSegment
      ? selectWheelStopAngle(selectedSegment.start, selectedSegment.end)
      : (selectedIndex + 0.5) * (360 / spinEntries.length);
    const pointerTargetAngle = getPointerTargetAngle(pointerPosition);
    const targetModulo = (pointerTargetAngle - targetAngle + 360) % 360;
    const computedTransform = wheelDiscRef.current
      ? window.getComputedStyle(wheelDiscRef.current).transform
      : "none";
    let transformMatrix: DOMMatrixReadOnly | null = null;
    if (computedTransform !== "none" && typeof DOMMatrixReadOnly === "function") {
      try {
        transformMatrix = new DOMMatrixReadOnly(computedTransform);
      } catch {
        transformMatrix = null;
      }
    }
    const visibleRotation = transformMatrix
      ? (Math.atan2(transformMatrix.b, transformMatrix.a) * 180) / Math.PI
      : wheelRotation;
    const currentModulo = ((visibleRotation % 360) + 360) % 360;
    const delta = (targetModulo - currentModulo + 360) % 360;
    const nextRotation = currentModulo + 5 * 360 + delta;
    const effectiveDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? Math.min(spinDuration, 1)
      : spinDuration;

    // 先移除待机动画并锁定当前可见角度，下一帧再开启正式旋转，避免浏览器直接跳到终点。
    setHasSpun(true);
    setIsSpinning(true);
    setActiveSpinDuration(0);
    setWheelRotation(currentModulo);

    const startSynchronizedSpinTicks = () => {
      if (!soundEnabledRef.current) return;
      let previousSegmentIndex: number | null = null;
      const trackPointerSegment = () => {
        if (!isSpinningRef.current || !wheelDiscRef.current) return;
        const transform = window.getComputedStyle(wheelDiscRef.current).transform;
        try {
          const matrix = transform !== "none" && typeof DOMMatrixReadOnly === "function"
            ? new DOMMatrixReadOnly(transform)
            : null;
          const rotation = matrix
            ? (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI
            : currentModulo;
          const localPointerAngle = ((pointerTargetAngle - rotation) % 360 + 360) % 360;
          const currentSegmentIndex = segments.findIndex(
            (segment) => localPointerAngle >= segment.start && localPointerAngle < segment.end,
          );
          if (
            previousSegmentIndex !== null
            && currentSegmentIndex >= 0
            && currentSegmentIndex !== previousSegmentIndex
          ) {
            playTone(220, 0.035);
          }
          previousSegmentIndex = currentSegmentIndex;
        } catch {
          // The visual spin remains authoritative if computed transforms are unavailable.
        }
        spinTickFrameRef.current = requestAnimationFrame(trackPointerSegment);
      };
      spinTickFrameRef.current = requestAnimationFrame(trackPointerSegment);
    };

    spinFrameRef.current = requestAnimationFrame(() => {
      setActiveSpinDuration(effectiveDuration);
      spinFrameRef.current = requestAnimationFrame(() => {
        setWheelRotation(nextRotation);
        playTone(160, 0.12);

        startSynchronizedSpinTicks();

        const completeSpin = () => {
          if (spinCompletionRef.current !== completeSpin) return;
          spinCompletionRef.current = null;
          if (spinTickFrameRef.current) cancelAnimationFrame(spinTickFrameRef.current);
          spinTickFrameRef.current = null;
          if (winnerTimerRef.current) clearTimeout(winnerTimerRef.current);
          winnerTimerRef.current = null;
          const spinId = typeof window.crypto.randomUUID === "function"
            ? window.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          const spinRecord: WheelSessionSpin = {
            id: spinId,
            optionId: selectedOption.id,
            entry: selectedEntry,
            pickedAt: new Date().toISOString(),
            runMode: runModeForSpin,
            ...(queueItemForSpin && queueTurnForSpin
              ? {
                  queueItemId: queueItemForSpin.id,
                  queueItemLabel: queueItemForSpin.label,
                  queueTurn: queueTurnForSpin,
                }
              : {}),
          };
          setSettledOptions(spinOptions);
          setResult(selectedEntry);
          setLeftRailView("results");
          const nextSessionSpins = [spinRecord, ...sessionSpins].slice(0, MAX_SESSION_SPINS);
          setSessionSpins(nextSessionSpins);
          let nextQueueIdAfterSpin: string | null | undefined;
          if (queueItemForSpin && queueTurnForSpin) {
            nextQueueIdAfterSpin = queueTurnForSpin < queueItemForSpin.turnLimit
              ? queueItemForSpin.id
                : getNextQueueItemId({
                    items: queueItems,
                    spins: [spinRecord, ...queueSessionSpins],
                    skippedIds: skippedQueueItemIds,
                    afterId: queueItemForSpin.id,
                });
            setActiveQueueItemId(nextQueueIdAfterSpin);
          }

          // 立即更新真实选项；settledOptions 继续展示停稳时的原盘面，直到弹层关闭。
          if (removeWinner) {
            setOptions((current) => removeWinningOption(current, selectedOption.id));
            if (
              spinEntries.length === 1
              && runModeForSpin === "turn-queue"
              && nextQueueIdAfterSpin
            ) {
              setError("All wheel options have been drawn without repeats. Add options to continue the remaining queue turns.");
            }
          }

          isSpinningRef.current = false;
          setIsSpinning(false);
          playTone(soundStyleRef.current === "bell" ? 880 : 620, 0.28);
        };
        spinCompletionRef.current = completeSpin;
        winnerTimerRef.current = setTimeout(
          completeSpin,
          effectiveDuration * 1000 + SPIN_FALLBACK_GRACE_MS,
        );
      });
    });
  }

  function replaceOptions(nextOptions: WheelOption[]) {
    if (isSpinningRef.current) return;
    const limited = nextOptions.slice(0, MAX_WHEEL_OPTIONS);
    setOptions(limited);
    setSettledOptions(null);
    setResult(null);
    setError(null);
  }

  function updateEntries(nextEntries: string[]) {
    if (isSpinningRef.current) return;
    const limited = nextEntries.slice(0, MAX_WHEEL_OPTIONS);
    const usedOptionIds = new Set<string>();
    const nextOptions = limited.map((label, index) => {
      const matchingOption = options.find(
        (option) => option.label === label && !usedOptionIds.has(option.id),
      );
      const indexedOption = options[index] && !usedOptionIds.has(options[index].id)
        ? options[index]
        : undefined;
      const previous = matchingOption ?? indexedOption;
      if (previous) usedOptionIds.add(previous.id);
      return createWheelOption(label, index, colors, previous ? {
        id: previous.id,
        weight: previous.weight,
        color: previous.color,
        textColor: previous.textColor,
        image: previous.image,
        imageVisible: previous.imageVisible,
      } : undefined);
    });
    replaceOptions(nextOptions);
  }

  function updateOption(id: string, patch: Partial<WheelOption>) {
    if (isSpinningRef.current) return;
    const currentOption = options.find((option) => option.id === id);
    if (!currentOption) return;
    const nextLabel = patch.label !== undefined ? patch.label.slice(0, 36) : currentOption.label;
    setOptions((current) => current.map((option) => option.id === id
      ? {
          ...option,
          ...patch,
          label: nextLabel,
          weight: patch.weight !== undefined ? clampOptionWeight(patch.weight) : option.weight,
        }
      : option));
    setSettledOptions(null);
    if (patch.color) setPaletteId("custom");
    setResult(null);
    setError(null);
  }

  function removeEntry(index: number) {
    replaceOptions(options.filter((_, entryIndex) => entryIndex !== index));
  }

  function addEntry() {
    if (options.length >= MAX_WHEEL_OPTIONS || isSpinningRef.current) return;
    replaceOptions([
      ...options,
      createWheelOption(`Option ${options.length + 1}`, options.length, colors),
    ]);
  }

  async function copyShareLink() {
    if (entries.length < 2) {
      setError("Add at least two options before sharing.");
      return;
    }
    if (hasBlankOptions) {
      setError("Give every option a name before sharing.");
      setLeftRailView("options");
      return;
    }
    try {
      const token = encodeWheelShare({
        entries,
        weights: options.map((option) => option.weight),
        colors: options.map((option) => option.color),
        removeWinner,
      });
      const url = buildShareUrl(window.location.origin, window.location.pathname, token);
      await navigator.clipboard.writeText(url);
      setActionNotice("Share link copied");
    } catch {
      setError("Could not copy the share link. Check browser clipboard permission and try again.");
    }
  }

  async function handleOptionImageUpload(optionId: string, file: File) {
    if (isSpinningRef.current) return;
    try {
      const dataUrl = await readImageAsDataUrl(file, { maxEdge: 512, quality: 0.7 });
      if (isSpinningRef.current) {
        setActionNotice("Image ready — add it after the current spin finishes");
        return;
      }
      updateOption(optionId, { image: dataUrl, imageVisible: true });
      setActionNotice("Slice image uploaded");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not use that image.");
    }
  }

  async function handleWheelFaceUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isSpinningRef.current) return;
      try {
        const dataUrl = await readImageAsDataUrl(file, { maxEdge: 900, quality: 0.75 });
        if (isSpinningRef.current) return;
        if (dataUrl.length > MAX_PERSISTED_IMAGE_LENGTH) {
          throw new Error("That image is still too detailed to save locally. Choose a smaller image.");
        }
        setWheelFaceBackground(dataUrl);
      setWheelFaceVisible(true);
      setActionNotice("Wheel background image uploaded");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not use that image.");
    }
  }

  function exportSessionCsv() {
    if (currentSessionSpins.length === 0) {
      setActionNotice("No rounds to export yet");
      return;
    }
    const csv = formatSessionExport(currentSessionSpins);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `wheel-${runMode}-session-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setActionNotice("Session CSV downloaded");
  }

  function resetWheel() {
    if (isSpinningRef.current) return;
    if (spinTickFrameRef.current) cancelAnimationFrame(spinTickFrameRef.current);
    if (winnerTimerRef.current) clearTimeout(winnerTimerRef.current);
    if (spinFrameRef.current) cancelAnimationFrame(spinFrameRef.current);
    spinTickFrameRef.current = null;
    spinCompletionRef.current = null;
    setOptions(createStarterOptions(initialEntries, initialColors, initialTextColors, initialImages));
    setColors(initialColors);
    setPaletteId(initialPalette.id);
    setStageBackground(initialBackground);
    setPointerStyle(initialPointerStyle);
    setPointerPosition(initialPointerPosition);
    setRimStyle(initialRimStyle);
    setLightsStyle(initialLightsStyle);
    setUploadedBackground(initialStageImage);
    setWheelFaceBackground(null);
    setWheelFaceVisible(true);
    setSpinDuration(10);
    setSoundEnabled(true);
    setVolume(55);
    setSoundStyle("arcade");
    soundEnabledRef.current = true;
    volumeRef.current = 55;
    soundStyleRef.current = "arcade";
    setRemoveWinner(initialRemoveWinner === true);
    setSettledOptions(null);
    setSessionSpins([]);
    setOpenPanel(null);
    isSpinningRef.current = false;
    setIsSpinning(false);
    setHasSpun(false);
    setWheelRotation(0);
    setActiveSpinDuration(0);
    setResult(null);
    setIsWheelImportOpen(false);
    setIsQueueImportOpen(false);
    setCelebrationEnabled(true);
    setWinnerScene(DEFAULT_WINNER_SCENE);
    setIsWinnerPreviewOpen(false);
    const nextQueue = hydrateStarterQueue(initialQueueItems);
    setRunMode(starterRunMode);
    setQueueItems(nextQueue);
    setActiveQueueItemId(nextQueue[0]?.id ?? null);
    setSkippedQueueItemIds([]);
    setLeftRailView(starterRunMode === "turn-queue" ? "queue" : "options");
    setStyleTab("look");
    setSettingsTab("rules");
    setActionNotice(null);
    setError(null);
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(storageKey.replace("v5", "v4"));
  }

  async function handleBackgroundUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isSpinningRef.current) return;
      try {
        const dataUrl = await readImageAsDataUrl(file, { maxEdge: 1200, quality: 0.72 });
        if (isSpinningRef.current) return;
        if (dataUrl.length > MAX_PERSISTED_IMAGE_LENGTH) {
          throw new Error("That image is still too detailed to save locally. Choose a smaller image.");
        }
        setUploadedBackground(dataUrl);
      setError(null);
      setActionNotice("Stage photo updated");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not use that image.");
    }
  }

  function openWheelImport() {
    if (isSpinningRef.current) return;
    setIsWheelImportOpen(true);
    setError(null);
  }

  function closeWheelImport() {
    setIsWheelImportOpen(false);
    window.setTimeout(() => importTriggerRef.current?.focus(), 0);
  }

  function changeRunMode(nextMode: WheelRunMode) {
    if (isSpinningRef.current || nextMode === runMode) return;
    setRunMode(nextMode);
    setSettledOptions(null);
    setResult(null);
    setHasSpun(false);
    setWheelRotation(0);
    setActiveSpinDuration(0);
    setError(null);
    if (nextMode === "turn-queue") {
      setLeftRailView("queue");
      setActiveQueueItemId((current) => current ?? queueItems[0]?.id ?? null);
    } else if (leftRailView === "queue") {
      setLeftRailView("options");
    }
  }

  function addQueueItem() {
    if (isSpinningRef.current || queueItems.length >= MAX_QUEUE_ITEMS) return;
    const nextItem = createQueueItem(`Item ${queueItems.length + 1}`, 1);
    setQueueItems((current) => [...current, nextItem]);
    setActiveQueueItemId((current) => current ?? nextItem.id);
  }

  function updateQueueItem(
    itemId: string,
    patch: Partial<Pick<WheelQueueItem, "label" | "turnLimit">>,
  ) {
    if (isSpinningRef.current) return;
    setQueueItems((current) => current.map((item) => item.id === itemId
      ? {
          ...item,
          ...(typeof patch.label === "string" ? { label: patch.label.slice(0, 36) } : {}),
          ...(typeof patch.turnLimit === "number"
            ? { turnLimit: clampQueueTurns(patch.turnLimit) }
            : {}),
        }
      : item));
    if (typeof patch.label === "string") {
      const nextLabel = patch.label.slice(0, 36);
      setSessionSpins((current) => current.map((spin) => spin.queueItemId === itemId
        ? { ...spin, queueItemLabel: nextLabel }
        : spin));
    }
  }

  function removeQueueItem(itemId: string) {
    if (isSpinningRef.current) return;
    const nextItems = queueItems.filter((item) => item.id !== itemId);
    setQueueItems(nextItems);
    setSkippedQueueItemIds((current) => current.filter((id) => id !== itemId));
    if (resolvedQueueItemId === itemId) {
      setActiveQueueItemId(getNextQueueItemId({
        items: nextItems,
        spins: queueSessionSpins,
        skippedIds: skippedQueueItemIds.filter((id) => id !== itemId),
        afterId: null,
      }));
    }
  }

  function openQueueImport() {
    if (isSpinningRef.current) return;
    setIsQueueImportOpen(true);
  }

  function importQueueItems(importedItems: WheelQueueItem[], mode: "replace" | "append") {
    if (isSpinningRef.current) return;
    if (mode === "replace") {
      setQueueItems(importedItems.slice(0, MAX_QUEUE_ITEMS));
      setSessionSpins((current) => current.filter((spin) => !spin.queueItemId));
      setSkippedQueueItemIds([]);
      setActiveQueueItemId(importedItems[0]?.id ?? null);
      setSettledOptions(null);
      setResult(null);
      setActionNotice(`${importedItems.length} queue items added`);
      return;
    }
    const accepted = importedItems.slice(0, Math.max(0, MAX_QUEUE_ITEMS - queueItems.length));
    setQueueItems((current) => [...current, ...accepted]);
    setActiveQueueItemId((current) => current ?? accepted[0]?.id ?? null);
    setActionNotice(`${accepted.length} queue items added`);
  }

  function resetQueueProgress() {
    if (isSpinningRef.current) return;
    setSessionSpins((current) => current.filter((spin) => !spin.queueItemId));
    setSkippedQueueItemIds([]);
    setActiveQueueItemId(queueItems[0]?.id ?? null);
    setSettledOptions(null);
    setResult(null);
    setHasSpun(false);
    setWheelRotation(0);
    setActiveSpinDuration(0);
    setActionNotice("Turn Queue progress reset");
  }

  function skipCurrentQueueItem() {
    if (isSpinningRef.current || !activeQueueItem) return;
    const nextSkippedIds = [...new Set([...skippedQueueItemIds, activeQueueItem.id])];
    setSkippedQueueItemIds(nextSkippedIds);
    setActiveQueueItemId(getNextQueueItemId({
      items: queueItems,
      spins: queueSessionSpins,
      skippedIds: nextSkippedIds,
      afterId: activeQueueItem.id,
    }));
    setActionNotice(`${activeQueueItem.label} skipped`);
  }

  async function toggleFullscreen() {
    if (isSpinningRef.current) return;
    try {
      await toggleGameFullscreen();
    } catch {
      setError("Fullscreen is not available in this browser or window.");
    }
  }

  function toggleSound() {
    setSoundEnabled((current) => {
      soundEnabledRef.current = !current;
      return !current;
    });
  }

  function dismissResult() {
    if (!result || isSpinningRef.current) return;
    // Reveal the already-updated wheel after the result card closes.
    setResult(null);
    setSettledOptions(null);
    setHasSpun(false);
    setWheelRotation(0);
    setActiveSpinDuration(0);
  }

  function clearSession() {
    if (isSpinningRef.current) return;
    setSettledOptions(null);
    setSessionSpins((current) => current.filter((spin) => !spinBelongsToMode(spin, runMode)));
    if (runMode === "turn-queue") {
      setSkippedQueueItemIds([]);
      setActiveQueueItemId(queueItems[0]?.id ?? null);
    }
    setResult(null);
    setHasSpun(false);
    setWheelRotation(0);
    setActiveSpinDuration(0);
  }

  function openSessionSummary() {
    if (isSpinningRef.current) return;
    setOpenPanel("summary");
  }

  function closePanel() {
    setOpenPanel(null);
  }

  function handleStageClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (!result || isSpinningRef.current) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea, label")) return;
    dismissResult();
  }

  // 背景图用独立层渲染，避免超长 data-url 写进 stage style 引发异常

  const recentSpins = currentSessionSpins;

  return (
    <>
      <article
        ref={gameRef}
        className={`${styles["wheel-game"]} ${isSpinning ? styles["is-spinning"] : ""}`}
        aria-label="Interactive spin the wheel game"
        aria-busy={isSpinning}
      >
        <WheelHeader
          title={title}
          optionCount={entries.length}
          runMode={runMode}
          isSpinning={isSpinning}
          soundEnabled={soundEnabled}
          isFullscreen={isFullscreen}
          historyCount={currentSessionSpins.length}
          winnerOpen={isWinnerSceneOpen}
          onRunModeChange={changeRunMode}
          onToggleSound={toggleSound}
          onToggleFullscreen={() => void toggleFullscreen()}
          onShare={() => void copyShareLink()}
          onOpenStyle={focusStyleRail}
          onOpenSettings={() => { setSettingsTab("rules"); setOpenPanel("settings"); }}
          onOpenHistory={openSessionSummary}
          onReset={resetWheel}
        />

        {actionNotice ? (
          <p className={styles["action-notice"]} role="status">{actionNotice}</p>
        ) : null}

        {error ? (
          <p className={styles["error-banner"]} role="alert" inert={isWinnerSceneOpen ? true : undefined}>
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label="Dismiss error">×</button>
          </p>
        ) : null}

        <div
          className={`${styles["wheel-game-layout"]} ${isSpinning ? styles["controls-locked"] : ""}`}
          inert={isWinnerSceneOpen ? true : undefined}
        >
          <aside
            className={`${styles["entries-rail"]} ${leftRailView === "advanced" ? styles["advanced-rail"] : ""}`}
            aria-label="Wheel list and results"
            inert={isSpinning ? true : undefined}
          >
            <div
              className={`${styles["rail-tabs"]} ${runMode === "turn-queue" ? styles["queue-mode-tabs"] : styles["classic-mode-tabs"]}`}
              role="tablist"
              aria-label="Wheel controls"
            >
              <button
                id={`${storageKey}-options-tab`}
                type="button"
                role="tab"
                aria-controls={`${storageKey}-options-panel`}
                aria-selected={leftRailView === "options"}
                className={leftRailView === "options" ? styles["is-active"] : ""}
                onClick={() => setLeftRailView("options")}
              >
                Options
                <em>{entries.length}</em>
              </button>
              {runMode === "turn-queue" ? (
                <button
                  id={`${storageKey}-queue-tab`}
                  type="button"
                  role="tab"
                  aria-controls={`${storageKey}-queue-panel`}
                  aria-selected={leftRailView === "queue"}
                  className={leftRailView === "queue" ? styles["is-active"] : ""}
                  onClick={() => setLeftRailView("queue")}
                >
                  Queue
                  <em>{queueItems.length}</em>
                </button>
              ) : null}
              <button
                id={`${storageKey}-results-tab`}
                type="button"
                role="tab"
                aria-controls={`${storageKey}-results-panel`}
                aria-selected={leftRailView === "results"}
                className={leftRailView === "results" ? styles["is-active"] : ""}
                onClick={() => setLeftRailView("results")}
              >
                Results
                {currentSessionSpins.length > 0 ? <em>{currentSessionSpins.length}</em> : null}
              </button>
              <button
                id={`${storageKey}-advanced-tab`}
                type="button"
                role="tab"
                aria-controls={`${storageKey}-advanced-panel`}
                aria-selected={leftRailView === "advanced"}
                className={leftRailView === "advanced" ? styles["is-active"] : ""}
                onClick={() => setLeftRailView("advanced")}
              >
                Advanced
              </button>
            </div>

            {leftRailView === "options" ? (
              <WheelOptionsPanel
                storageKey={storageKey}
                options={options}
                isSpinning={isSpinning}
                importTriggerRef={importTriggerRef}
                onReplace={replaceOptions}
                onAdd={addEntry}
                onImport={openWheelImport}
                onClear={() => updateEntries([])}
                onChange={updateOption}
                onRemove={removeEntry}
                onShuffleIds={shuffleWheelEntries}
              />
            ) : leftRailView === "queue" ? (
              <div
                id={`${storageKey}-queue-panel`}
                className={styles["queue-tab-panel"]}
                role="tabpanel"
                aria-labelledby={`${storageKey}-queue-tab`}
              >
                <TurnQueuePanel
                  variant="editor"
                  items={queueItems}
                  spins={queueSessionSpins}
                  activeItemId={resolvedQueueItemId}
                  skippedItemIds={skippedQueueItemIds}
                  onAdd={addQueueItem}
                  onChange={updateQueueItem}
                  onRemove={removeQueueItem}
                  onOpenImport={openQueueImport}
                  onSkipCurrent={skipCurrentQueueItem}
                  onResetProgress={resetQueueProgress}
                />
                <TurnQueuePanel
                  variant="status"
                  items={queueItems}
                  spins={queueSessionSpins}
                  activeItemId={resolvedQueueItemId}
                  skippedItemIds={skippedQueueItemIds}
                  onAdd={addQueueItem}
                  onChange={updateQueueItem}
                  onRemove={removeQueueItem}
                  onOpenImport={openQueueImport}
                  onSkipCurrent={skipCurrentQueueItem}
                  onResetProgress={resetQueueProgress}
                />
              </div>
            ) : leftRailView === "results" ? (
              <div
                id={`${storageKey}-results-panel`}
                className={styles["results-panel"]}
                role="tabpanel"
                aria-labelledby={`${storageKey}-results-tab`}
              >
                <div className={styles["results-winner"]} aria-live="polite">
                  {result ? (
                    <>
                      <span>Latest winner</span>
                      <strong>{result}</strong>
                      <small>
                        {activeSpin?.queueItemLabel && activeSpin.queueTurn
                          ? `${activeSpin.queueItemLabel} · Turn ${activeSpin.queueTurn}`
                          : removeWinner
                          ? (winnerWasRemoved
                            ? options.length === 0
                              ? "Removed · no options remain"
                              : options.length === 1
                                ? "Removed · final option remains"
                                : "Removed from the wheel"
                            : "Remove winner could not match this result")
                          : "Ready for next spin"}
                      </small>
                    </>
                  ) : (
                    <>
                      <span>Results</span>
                      <strong>
                        {isTurnQueueComplete
                          ? "Session complete"
                          : currentSessionSpins.length > 0
                            ? "Session in progress"
                            : "No spins yet"}
                      </strong>
                      <small>
                        {isTurnQueueComplete
                          ? "Every available queue turn has been completed."
                          : entries.length === 0
                            ? "No options remain. Add options to continue."
                            : "Spin the wheel to land a winner here."}
                      </small>
                    </>
                  )}
                </div>

                <div className={styles["results-actions"]}>
                  <button
                    type="button"
                    className={styles["results-next"]}
                    onClick={spinWheel}
                    disabled={isSpinning || !canSpinCurrentOptions || (runMode === "turn-queue" && !activeQueueItem)}
                  >
                    {isTurnQueueComplete ? "Queue complete" : result ? "Next spin" : "Spin now"}
                  </button>
                  <button
                    type="button"
                    className={styles["text-button"]}
                    onClick={openSessionSummary}
                  >
                    View all rounds
                  </button>
                </div>

                {recentSpins.length > 0 ? (
                  <ol className={styles["results-list"]}>
                    {recentSpins.map((spin, index) => (
                      <li key={spin.id}>
                        <span>{index + 1}</span>
                        <strong>
                          {spin.entry}
                          {spin.queueItemLabel && spin.queueTurn
                            ? <small>{spin.queueItemLabel} · Turn {spin.queueTurn}</small>
                            : null}
                        </strong>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className={styles["results-empty"]}>Winners from this session show up here.</p>
                )}
              </div>
            ) : (
              <div
                id={`${storageKey}-advanced-panel`}
                className={styles["advanced-tab-panel"]}
                role="tabpanel"
                aria-labelledby={`${storageKey}-advanced-tab`}
              >
                <AdvancedOptionsPanel
                  options={options}
                  onOptionChange={updateOption}
                  onImageUpload={(optionId, file) => void handleOptionImageUpload(optionId, file)}
                />
              </div>
            )}
          </aside>

          <div
            ref={stageRef}
            className={`${styles["wheel-stage"]} ${styles[`stage-${stageBackground}`] ?? ""} ${result ? styles["has-result"] : ""}`}
            onClick={handleStageClick}
          >
            {uploadedBackground ? (
              <div
                className={styles["stage-photo"]}
                style={{ backgroundImage: `url("${uploadedBackground.replace(/"/g, "%22")}")` }}
                aria-hidden="true"
              />
            ) : null}
            {runMode === "turn-queue" ? (
              <div className={styles["queue-stage-status"]} aria-live="polite">
                <span>{queueComplete ? "Queue complete" : "Now playing"}</span>
                <strong>{activeQueueItem?.label || (queueItems.length === 0 ? "Add a queue item" : "All turns finished")}</strong>
                {activeQueueItem ? (
                  <em>{activeQueueTurnsUsed} / {activeQueueItem.turnLimit} spins completed</em>
                ) : null}
              </div>
            ) : null}
            <div className={styles["stage-actions"]}>
              <button
                type="button"
                className={styles["stage-icon"]}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSound();
                }}
                aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
                title={soundEnabled ? "Sound on" : "Sound off"}
              >
                <SoundIcon muted={!soundEnabled} />
              </button>
              <button
                type="button"
                className={styles["stage-icon"]}
                onClick={(event) => {
                  event.stopPropagation();
                  void toggleFullscreen();
                }}
                disabled={isSpinning}
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                <FullscreenIcon />
              </button>
            </div>

            <div className={`${styles["wheel-machine"]} ${result ? styles["has-winner"] : ""}`}>
              <div
                className={`${styles["wheel-shell"]} ${styles[`rim-${rimStyle}`] ?? ""} ${styles[`lights-${lightsStyle}`] ?? ""}`}
                style={wheelChromeStyle}
              >
                {pointerPosition !== "center" ? (
                  <WheelPointer
                    styleId={pointerStyle}
                    position={pointerPosition}
                    isWinning={Boolean(result)}
                  />
                ) : null}
                <span className={styles["wheel-bulbs"]} aria-hidden="true">
                  {Array.from({ length: 24 }, (_, index) => (
                    <i
                      key={index}
                      style={{
                        transform: `rotate(${index * 15}deg)`,
                        ["--bulb-i" as string]: index,
                      }}
                    />
                  ))}
                </span>
                <WheelDisc
                  discRef={wheelDiscRef}
                  options={displayOptions}
                  rotation={wheelRotation}
                  duration={activeSpinDuration}
                  isSpinning={isSpinning}
                  isIdle={!hasSpun && !isSpinning}
                  isSettled={Boolean(result)}
                  look={activePalette.look}
                  separator={activePalette.separator}
                  faceBackground={wheelFaceVisible ? wheelFaceBackground : null}
                  onSpinEnd={() => spinCompletionRef.current?.()}
                />
                <button
                  type="button"
                  className={`${styles["spin-button"]} ${result ? styles["is-winner"] : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    spinWheel();
                  }}
                  disabled={isSpinning || !canSpinCurrentOptions || (runMode === "turn-queue" && !activeQueueItem)}
                  aria-label={isSpinning
                    ? "Wheel is spinning"
                    : isTurnQueueComplete
                      ? "Queue complete"
                      : result
                        ? "Continue"
                        : entries.length === 0
                          ? "No options remain"
                          : isFinalOptionRound
                            ? "Spin the final option"
                            : "Spin the wheel"}
                >
                  {pointerPosition === "center" ? (
                    <span className={styles["center-pointer-decoration"]} aria-hidden="true">
                      <WheelPointer
                        styleId={pointerStyle}
                        position="center"
                        isWinning={Boolean(result)}
                        embedded
                      />
                    </span>
                  ) : null}
                  <span className={styles["spin-button-label"]}>
                    {isSpinning
                      ? "WAIT"
                      : isTurnQueueComplete
                        ? "DONE"
                        : result
                          ? "NEXT"
                          : entries.length === 0
                            ? "EMPTY"
                            : isFinalOptionRound
                              ? "FINAL"
                              : "SPIN"}
                  </span>
                </button>
              </div>
              <div className={styles["wheel-base"]} aria-hidden="true">
                <span />
                <i />
              </div>
            </div>

            <div className={styles["result-area"]} aria-live="polite" aria-atomic="true">
              {result ? <span className={styles["sr-only"]}>Winner: {result}</span> : null}
            </div>

            <button
              type="button"
              className={`${styles["stage-remove-winner"]} ${removeWinner ? styles["is-active"] : ""}`}
              aria-pressed={removeWinner}
              disabled={isSpinning}
              onClick={(event) => {
                event.stopPropagation();
                if (isSpinningRef.current) return;
                setRemoveWinner((current) => !current);
              }}
            >
              <TrashIcon />
              <span>Remove winner</span>
              <i aria-hidden="true" />
            </button>
          </div>

          <aside
            ref={styleRailRef}
            className={styles["style-rail"]}
            aria-label="Wheel style"
            inert={isSpinning ? true : undefined}
          >
            <div className={styles["rail-header"]}>
              <strong>Style</strong>
              <span className={styles["style-rail-hint"]}>Live preview</span>
            </div>

            <div className={styles["rail-tabs"]} role="tablist" aria-label="Style categories">
              <button
                type="button"
                role="tab"
                aria-selected={styleTab === "look"}
                className={styleTab === "look" ? styles["is-active"] : ""}
                onClick={() => setStyleTab("look")}
              >
                Look
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={styleTab === "chrome"}
                className={styleTab === "chrome" ? styles["is-active"] : ""}
                onClick={() => setStyleTab("chrome")}
              >
                Chrome
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={styleTab === "stage"}
                className={styleTab === "stage" ? styles["is-active"] : ""}
                onClick={() => setStyleTab("stage")}
              >
                Stage
              </button>
            </div>

            {styleTab === "look" ? (
              <>
                <section className={styles["style-section"]}>
                  <div className={styles["style-section-heading"]}>
                    <strong>Slice style</strong>
                    <span>Fill geometry &amp; borders</span>
                  </div>
                  <fieldset className={styles["palette-grid"]}>
                    <legend className={styles["sr-only"]}>Slice style</legend>
                    {WHEEL_PALETTES.map((palette) => (
                      <label
                        key={palette.id}
                        className={`${paletteId === palette.id ? styles["is-selected"] : ""} ${styles[`palette-look-${palette.look}`] ?? ""}`}
                      >
                        <input
                          className={styles["sr-only"]}
                          type="radio"
                          name={`${storageKey}-palette`}
                          value={palette.id}
                          checked={paletteId === palette.id}
                          onChange={() => {
                            setPaletteId(palette.id);
                            setColors(palette.colors);
                            setOptions((current) => applyPaletteToOptions(current, palette));
                          }}
                        />
                        <span className={styles["palette-preview"]} data-look={palette.look} aria-hidden="true">
                          <i
                            style={{
                              "--c1": palette.colors[0],
                              "--c2": palette.colors[1],
                              "--c3": palette.colors[2],
                            } as CSSProperties}
                          />
                        </span>
                        <strong>{palette.name}</strong>
                        <em>{palette.blurb}</em>
                      </label>
                    ))}
                  </fieldset>
                </section>

                <section className={styles["style-section"]}>
                  <div className={styles["style-section-heading"]}>
                    <strong>Wheel background</strong>
                    <span>Add an image to the wheel face</span>
                  </div>
                  <div className={styles["background-assets"]} aria-label="Wheel background image">
                    <div className={styles["background-asset"]}>
                      <div className={styles["background-asset-copy"]}>
                        <strong>Custom image</strong>
                        <span>
                          {!wheelFaceBackground
                            ? "No custom image"
                            : wheelFaceVisible ? "Image visible" : "Image hidden"}
                        </span>
                      </div>
                      <div className={styles["background-asset-actions"]}>
                        <label className={styles["asset-upload"]}>
                          <ImageIcon /> {wheelFaceBackground ? "Replace" : "Upload"}
                          <input
                            type="file"
                            accept="image/*"
                            aria-label={`${wheelFaceBackground ? "Replace" : "Upload"} wheel background image`}
                            onChange={(event) => void handleWheelFaceUpload(event)}
                          />
                        </label>
                        {wheelFaceBackground ? (
                          <>
                            <button
                              type="button"
                              className={styles["asset-toggle"]}
                              aria-label={`${wheelFaceVisible ? "Hide" : "Show"} wheel background image`}
                              aria-pressed={wheelFaceVisible}
                              onClick={() => {
                                const nextVisible = !wheelFaceVisible;
                                setWheelFaceVisible(nextVisible);
                                setActionNotice(nextVisible ? "Wheel background image shown" : "Wheel background image hidden");
                              }}
                            >
                              <EyeIcon hidden={wheelFaceVisible} /> {wheelFaceVisible ? "Hide" : "Show"}
                            </button>
                            <button
                              type="button"
                              className={styles["asset-remove"]}
                              aria-label="Remove wheel background image"
                              onClick={() => {
                                setWheelFaceBackground(null);
                                setWheelFaceVisible(true);
                              }}
                            >
                              <TrashIcon /> Remove
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </section>
              </>
            ) : null}

            {styleTab === "chrome" ? (
              <>
                <section className={styles["style-section"]}>
                  <div className={styles["style-section-heading"]}>
                    <strong>Pointer</strong>
                    <span>Pick a marker style</span>
                  </div>
                  <fieldset className={styles["pointer-grid"]}>
                    <legend className={styles["sr-only"]}>Pointer style</legend>
                    {WHEEL_POINTER_STYLES.map((pointer) => (
                      <label
                        key={pointer.id}
                        className={pointerStyle === pointer.id ? styles["is-selected"] : ""}
                      >
                        <input
                          className={styles["sr-only"]}
                          type="radio"
                          name={`${storageKey}-pointer`}
                          value={pointer.id}
                          checked={pointerStyle === pointer.id}
                          onChange={() => setPointerStyle(pointer.id)}
                        />
                        <span className={styles["pointer-swatch"]}>
                          <WheelPointer styleId={pointer.id} preview />
                        </span>
                        <strong>{pointer.name}</strong>
                      </label>
                    ))}
                  </fieldset>

                  <div className={styles["style-subsection-heading"]}>
                    <strong>Position</strong>
                    <span>Move the pointer around the wheel</span>
                  </div>
                  <fieldset className={styles["pointer-position-grid"]}>
                    <legend className={styles["sr-only"]}>Pointer position</legend>
                    {WHEEL_POINTER_POSITIONS.map((position) => (
                      <label
                        key={position.id}
                        data-position={position.id}
                        className={pointerPosition === position.id ? styles["is-selected"] : ""}
                      >
                        <input
                          className={styles["sr-only"]}
                          type="radio"
                          name={`${storageKey}-pointer-position`}
                          value={position.id}
                          checked={pointerPosition === position.id}
                          onChange={() => changePointerPosition(position.id)}
                        />
                        <span className={styles["position-swatch"]} aria-hidden="true"><i /></span>
                        <strong>{position.name}</strong>
                      </label>
                    ))}
                  </fieldset>
                </section>

                <section className={styles["style-section"]}>
                  <div className={styles["style-section-heading"]}>
                    <strong>Rim</strong>
                    <span>Wheel frame color</span>
                  </div>
                  <fieldset className={styles["chrome-grid"]}>
                    <legend className={styles["sr-only"]}>Rim color</legend>
                    {WHEEL_RIM_STYLES.map((rim) => (
                      <label
                        key={rim.id}
                        data-rim={rim.id}
                        className={rimStyle === rim.id ? styles["is-selected"] : ""}
                      >
                        <input
                          className={styles["sr-only"]}
                          type="radio"
                          name={`${storageKey}-rim`}
                          value={rim.id}
                          checked={rimStyle === rim.id}
                          onChange={() => setRimStyle(rim.id)}
                        />
                        <span
                          className={styles["rim-swatch"]}
                          style={{ background: rim.swatch }}
                          aria-hidden="true"
                        />
                        <span className={styles["chrome-choice-copy"]}>
                          <strong>{rim.name}</strong>
                          <em>{rim.blurb}</em>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                </section>

                <section className={styles["style-section"]}>
                  <div className={styles["style-section-heading"]}>
                    <strong>Lights</strong>
                    <span>Bulb color and motion</span>
                  </div>
                  <fieldset className={styles["chrome-grid"]}>
                    <legend className={styles["sr-only"]}>Light effect</legend>
                    {WHEEL_LIGHTS_STYLES.map((lights) => (
                      <label
                        key={lights.id}
                        data-lights={lights.id}
                        className={lightsStyle === lights.id ? styles["is-selected"] : ""}
                      >
                        <input
                          className={styles["sr-only"]}
                          type="radio"
                          name={`${storageKey}-lights`}
                          value={lights.id}
                          checked={lightsStyle === lights.id}
                          onChange={() => setLightsStyle(lights.id)}
                        />
                        <span className={styles["lights-swatch"]} data-lights={lights.id} aria-hidden="true">
                          <i style={{ background: lights.swatchA }} />
                          <i style={{ background: lights.swatchB }} />
                        </span>
                        <span className={styles["chrome-choice-copy"]}>
                          <strong>{lights.name}</strong>
                          <em>{lights.blurb}</em>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                </section>
              </>
            ) : null}

            {styleTab === "stage" ? (
              <>
                <section className={styles["style-section"]}>
                <div className={styles["style-section-heading"]}>
                  <strong>Background style</strong>
                  <span>Choose a scene or add a custom image</span>
                </div>
                <fieldset className={styles["background-grid"]}>
                  <legend className={styles["sr-only"]}>Stage backdrop</legend>
                  {WHEEL_STAGE_BACKGROUNDS.map((background) => (
                    <label
                      key={background.id}
                      className={stageBackground === background.id && !uploadedBackground ? styles["is-selected"] : ""}
                    >
                      <input
                        type="radio"
                        name={`${storageKey}-background`}
                        value={background.id}
                        checked={stageBackground === background.id && !uploadedBackground}
                        onChange={() => {
                          setStageBackground(background.id);
                          setUploadedBackground(null);
                        }}
                      />
                      <span
                        className={`${styles["background-swatch"]} ${styles[`stage-${background.id}`]}`}
                        aria-hidden="true"
                      />
                      <span className={styles["background-choice-copy"]}>
                        <strong>{background.name}</strong>
                        <em>{background.blurb}</em>
                      </span>
                    </label>
                  ))}
                </fieldset>

                <div className={styles["background-assets"]} aria-label="Custom stage background image">
                  <div className={styles["background-asset"]}>
                    <div className={styles["background-asset-copy"]}>
                      <strong>Stage background</strong>
                      <span>{uploadedBackground ? "Custom image active" : "Using selected preset"}</span>
                    </div>
                    <div className={styles["background-asset-actions"]}>
                      <label className={styles["asset-upload"]}>
                        <UploadIcon /> {uploadedBackground ? "Replace" : "Upload"}
                        <input
                          type="file"
                          accept="image/*"
                          aria-label={`${uploadedBackground ? "Replace" : "Upload"} stage background image`}
                          onChange={handleBackgroundUpload}
                        />
                      </label>
                      {uploadedBackground ? (
                        <button
                          type="button"
                          className={styles["asset-remove"]}
                          aria-label="Remove stage background image"
                          onClick={() => setUploadedBackground(null)}
                        >
                          <TrashIcon /> Remove
                        </button>
                      ) : null}
                    </div>
                  </div>

                </div>
                </section>

                <section className={styles["style-section"]}>
                  <div className={styles["winner-scene-heading"]}>
                    <div className={styles["style-section-heading"]}>
                      <strong>Winner scene</strong>
                      <span>Choose a scene to preview it across the wheel board</span>
                    </div>
                  </div>
                  <div className={styles["winner-scene-grid"]} role="radiogroup" aria-label="Winner scene">
                    {WHEEL_WINNER_SCENES.map((scene) => (
                      <button
                        type="button"
                        role="radio"
                        key={scene.id}
                        data-scene={scene.id}
                        aria-checked={winnerScene === scene.id}
                        disabled={isSpinning}
                        onClick={() => {
                          setWinnerScene(scene.id);
                          setIsWinnerPreviewOpen(true);
                          window.requestAnimationFrame(() => {
                            stageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                          });
                        }}
                      >
                        <span className={styles["winner-scene-swatch"]} data-scene={scene.id} aria-hidden="true">
                          <i /><b>★</b><i />
                        </span>
                        <span className={styles["background-choice-copy"]}>
                          <strong>{scene.name}</strong>
                          <em>{scene.blurb}</em>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            ) : null}
          </aside>
        </div>

        {result ? (
          <WinnerCelebration
            anchorRef={stageRef}
            colors={celebrationColors}
            context={winnerContext}
            effectsEnabled={celebrationEnabled}
            isComplete={isTurnQueueComplete}
            onContinue={spinWheel}
            onDismiss={dismissResult}
            paletteId={paletteId}
            sceneId={winnerScene}
            status={winnerStatus}
            winner={result}
          />
        ) : null}
        {!result && isWinnerPreviewOpen ? (
          <WinnerCelebration
            anchorRef={stageRef}
            colors={celebrationColors}
            effectsEnabled={celebrationEnabled}
            isComplete
            isPreview
            onContinue={() => setIsWinnerPreviewOpen(false)}
            onDismiss={() => setIsWinnerPreviewOpen(false)}
            paletteId={paletteId}
            sceneId={winnerScene}
            status="Preview only · no result has been recorded"
            winner="Your Winner"
          />
        ) : null}
      </article>

      {openPanel === "settings" ? (
        <WheelSettingsSheet
          key="settings"
          storageKey={storageKey}
          tab={settingsTab}
          celebrationEnabled={celebrationEnabled}
          spinDuration={spinDuration}
          soundEnabled={soundEnabled}
          soundStyle={soundStyle}
          volume={volume}
          soundEnabledRef={soundEnabledRef}
          soundStyleRef={soundStyleRef}
          volumeRef={volumeRef}
          onTabChange={setSettingsTab}
          onCelebrationChange={setCelebrationEnabled}
          onSpinDurationChange={setSpinDuration}
          onSoundEnabledChange={setSoundEnabled}
          onSoundStyleChange={setSoundStyle}
          onVolumeChange={setVolume}
          onClose={closePanel}
        />
      ) : null}

      {openPanel === "summary" ? (
        <WheelSheet key="summary" title="Session" subtitle="History & stats" onClose={closePanel} wide>
          <div className={styles["session-toolbar"]}>
            <button type="button" onClick={exportSessionCsv} disabled={currentSessionSpins.length === 0}>
              <ExportIcon /> Export CSV
            </button>
            <button type="button" onClick={() => void copyShareLink()} disabled={entries.length < 2}>
              <LinkIcon /> Share wheel
            </button>
          </div>
          <SessionSummary
            entries={entries}
            spins={currentSessionSpins}
            runMode={runMode}
            queueItems={queueItems}
            skippedQueueItemIds={skippedQueueItemIds}
            onBack={closePanel}
            onClear={clearSession}
            compact
          />
        </WheelSheet>
      ) : null}

      {isWheelImportOpen ? (
        <ExcelImportDialog
          currentEntries={entries}
          initialEntries={entries}
          initialSource="paste"
          dialogId={`${storageKey}-import`}
          onClose={closeWheelImport}
          onImport={updateEntries}
        />
      ) : null}

      {isQueueImportOpen ? (
        <TurnQueueImportDialog
          currentItems={queueItems}
          initialSource="paste"
          dialogId={`${storageKey}-queue-import`}
          onClose={() => setIsQueueImportOpen(false)}
          onImport={importQueueItems}
        />
      ) : null}
    </>
  );
}
