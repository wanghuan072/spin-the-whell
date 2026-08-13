"use client";

import type { CSSProperties, Ref, TransitionEvent as ReactTransitionEvent } from "react";
import { useId } from "react";
import { resolveSliceLook, type ResolvedSliceLook } from "../config";
import { computeWheelSegments, mixHex } from "../lib/wheel-options";
import type { WheelOption, WheelSliceLook } from "../types";
import styles from "../styles/WheelDisc.module.css";

type WheelDiscProps = {
  options: WheelOption[];
  rotation: number;
  duration: number;
  isSpinning: boolean;
  isIdle: boolean;
  isSettled: boolean;
  look?: WheelSliceLook;
  separator?: string;
  faceBackground?: string | null;
  discRef?: Ref<HTMLDivElement>;
  onSpinEnd?: () => void;
};

type Segment = ReturnType<typeof computeWheelSegments>[number];

/** Keep SVG path strings identical across the Node and browser math engines. */
function stableCoordinate(value: number) {
  return Number(value.toFixed(6));
}

function polar(cx: number, cy: number, radius: number, degFromTop: number) {
  const rad = ((degFromTop - 90) * Math.PI) / 180;
  return {
    x: stableCoordinate(cx + radius * Math.cos(rad)),
    y: stableCoordinate(cy + radius * Math.sin(rad)),
  };
}

function wedgePath(start: number, end: number, radius = 100, cx = 100, cy = 100) {
  const sweep = Math.max(0.001, end - start);
  if (sweep >= 359.999) {
    return [
      `M ${cx} ${cy - radius}`,
      `A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius}`,
      `A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius}`,
      "Z",
    ].join(" ");
  }
  const largeArc = sweep > 180 ? 1 : 0;
  const from = polar(cx, cy, radius, start);
  const to = polar(cx, cy, radius, end);
  return [
    `M ${cx} ${cy}`,
    `L ${from.x} ${from.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${to.x} ${to.y}`,
    "Z",
  ].join(" ");
}

function strokeWidthForLook(look: ResolvedSliceLook) {
  if (look === "seamless") return 0;
  if (look === "spoke") return 2;
  if (look === "radial") return 1.35;
  if (look === "horizon" || look === "vertical") return 1.05;
  return 0.85;
}

function labelTone(option: WheelOption, look: ResolvedSliceLook) {
  if (look === "spoke" && option.color.toLowerCase() === "#f8fafc") return "#0f172a";
  if (look === "seamless") return option.textColor || "#334155";
  return option.textColor || "#ffffff";
}

function gradientId(uid: string, optionId: string) {
  return `${uid}-slice-${optionId}`;
}

function sliceImageClipId(uid: string, optionId: string) {
  return `${uid}-slice-image-clip-${optionId}`;
}

/** SVG 扇区：按结构风格渲染纯色 / 横竖径向渐变 / 有无边界 */
export function WheelDisc({
  options,
  rotation,
  duration,
  isSpinning,
  isIdle,
  isSettled,
  look = "solid",
  separator = "rgba(0,0,0,0.18)",
  faceBackground,
  discRef,
  onSpinEnd,
}: WheelDiscProps) {
  const uid = useId().replace(/:/g, "");
  const resolvedLook = resolveSliceLook(look);
  const segments = computeWheelSegments(options);
  const style = {
    transform: `rotate(${rotation}deg)`,
    transitionDuration: `${isSpinning ? duration : 0}s`,
  } satisfies CSSProperties;
  const strokeWidth = strokeWidthForLook(resolvedLook);
  const showBorders = resolvedLook !== "seamless" && strokeWidth > 0;
  const finishInterruptedOrCompletedSpin = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget
      && event.propertyName === "transform"
      && isSpinning
    ) {
      onSpinEnd?.();
    }
  };

  return (
    <div
      ref={discRef}
      className={`${styles.disc} ${styles[`look-${resolvedLook}`]} ${faceBackground ? styles["has-face"] : ""} ${isSpinning ? styles.spinning : ""} ${isIdle ? styles.idle : ""} ${isSettled ? styles.settled : ""}`}
      style={style}
      data-look={resolvedLook}
      aria-hidden="true"
      onTransitionEnd={finishInterruptedOrCompletedSpin}
      onTransitionCancel={finishInterruptedOrCompletedSpin}
    >
      {faceBackground ? (
        <div
          className={styles.face}
          style={{ backgroundImage: `url("${faceBackground.replace(/"/g, "%22")}")` }}
        />
      ) : null}

      <svg className={styles.svg} viewBox="0 0 200 200">
        <defs>
          {/* 材质纹理只覆盖默认扇区层，单项图片与颜色仍在其上方。 */}
          <pattern id={`${uid}-paper-grain`} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="2" r="0.7" fill="#ffffff" fillOpacity="0.2" />
            <circle cx="6" cy="5.5" r="0.55" fill="#0f172a" fillOpacity="0.12" />
            <path d="M0 7.5L8 6.5" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.7" />
          </pattern>
          <linearGradient id={`${uid}-glass-finish`} x1="20" y1="20" x2="178" y2="182" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="24%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="58%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.32" />
          </linearGradient>
          <pattern
            id={`${uid}-retro-stripes`}
            width="9"
            height="9"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-16)"
          >
            <rect width="3" height="9" fill="#fff7d6" fillOpacity="0.16" />
            <rect x="6" width="1" height="9" fill="#3f1d0b" fillOpacity="0.12" />
          </pattern>
          <radialGradient id={`${uid}-retro-vignette`} cx="50%" cy="42%" r="64%">
            <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.18" />
            <stop offset="68%" stopColor="#7c2d12" stopOpacity="0" />
            <stop offset="100%" stopColor="#431407" stopOpacity="0.28" />
          </radialGradient>
          <pattern id={`${uid}-neon-grid`} width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.9" fill="#f0abfc" fillOpacity="0.34" />
            <path d="M0 9.5H10M9.5 0V10" stroke="#22d3ee" strokeOpacity="0.1" strokeWidth="0.7" />
          </pattern>
          <pattern
            id={`${uid}-ink-hatch`}
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(22)"
          >
            <path d="M0 1H7M0 5H7" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
            <circle cx="5.5" cy="3" r="0.75" fill="#0f172a" fillOpacity="0.28" />
          </pattern>
          <radialGradient id={`${uid}-porcelain-glaze`} cx="36%" cy="24%" r="78%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.58" />
            <stop offset="36%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="78%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.12" />
          </radialGradient>
          {resolvedLook === "radial" ? (
            <radialGradient id={`${uid}-radial-sheen`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
              <stop offset="34%" stopColor="#22d3ee" stopOpacity="0.12" />
              <stop offset="68%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#f0abfc" stopOpacity="0.16" />
            </radialGradient>
          ) : null}
          {segments.map((segment) => {
            const option = options[segment.index];
            if (!option || resolvedLook === "solid") return null;
            return (
              <SliceGradient
                key={`grad-${option.id}`}
                id={gradientId(uid, option.id)}
                look={resolvedLook}
                color={option.color}
                segment={segment}
              />
            );
          })}
          {segments.map((segment) => {
            const option = options[segment.index];
            return option?.image && option.imageVisible ? (
              <clipPath key={`image-clip-${option.id}`} id={sliceImageClipId(uid, option.id)}>
                <path d={wedgePath(segment.start, segment.end)} />
              </clipPath>
            ) : null;
          })}
        </defs>

        {/* 图层顺序：整盘背景图 → 默认扇区色 → 单项图片 → 单项颜色遮罩。 */}
        {segments.map((segment) => {
          const option = options[segment.index];
          if (!option) return null;
          const fill = resolvedLook === "solid"
            ? option.color
            : `url(#${gradientId(uid, option.id)})`;

          return (
            <g key={option.id}>
              <path
                d={wedgePath(segment.start, segment.end)}
                fill={fill}
                stroke={showBorders ? separator : "none"}
                strokeWidth={showBorders ? strokeWidth : 0}
                strokeLinejoin="round"
                opacity={faceBackground ? 0.32 : 1}
              />
              <SliceMaterialOverlay
                uid={uid}
                look={resolvedLook}
                segment={segment}
                subdued={Boolean(faceBackground)}
              />
              {resolvedLook === "radial" ? (
                <path
                  d={wedgePath(segment.start, segment.end)}
                  fill={`url(#${uid}-radial-sheen)`}
                  stroke="none"
                  opacity={faceBackground ? 0.18 : 0.55}
                />
              ) : null}
            </g>
          );
        })}

        {segments.map((segment) => {
          const option = options[segment.index];
          if (!option?.image || !option.imageVisible) return null;

          return (
            <g
              key={`image-background-${option.id}`}
              clipPath={`url(#${sliceImageClipId(uid, option.id)})`}
            >
              <image
                href={option.image}
                x="0"
                y="0"
                width="200"
                height="100"
                preserveAspectRatio="xMidYMid slice"
                transform={`rotate(${segment.mid} 100 100)`}
                opacity={faceBackground ? 0.78 : 1}
              />
              <path
                d={wedgePath(segment.start, segment.end)}
                fill={option.color}
                opacity={0.14}
              />
              <path
                d={wedgePath(segment.start, segment.end)}
                fill="#020617"
                opacity={0.12}
              />
            </g>
          );
        })}

        <DiscMaterialFinish
          uid={uid}
          look={resolvedLook}
          subdued={Boolean(faceBackground)}
        />

      </svg>

      {segments.map((segment) => {
        const option = options[segment.index];
        if (!option) return null;
        return (
          <span
            key={`label-${option.id}`}
            className={`${styles.label} ${options.length > 12 || segment.sweep < 18 ? styles.compact : ""} ${option.label.length > 12 ? styles.long : ""}`}
            style={{
              transform: `rotate(${segment.mid - 90}deg)`,
              color: labelTone(option, resolvedLook),
            }}
          >
            <span>{option.label}</span>
          </span>
        );
      })}

      <span className={styles.rim} />
    </div>
  );
}

type MaterialOverlayProps = {
  uid: string;
  look: ResolvedSliceLook;
  segment: Segment;
  subdued: boolean;
};

/** 每个扇区自己的材质层；放在默认色之上、上传图片之下。 */
function SliceMaterialOverlay({ uid, look, segment, subdued }: MaterialOverlayProps) {
  const path = wedgePath(segment.start, segment.end);
  const opacityScale = subdued ? 0.28 : 1;

  if (look === "solid") {
    return <path d={path} fill={`url(#${uid}-paper-grain)`} opacity={0.55 * opacityScale} />;
  }

  if (look === "horizon") {
    return <path d={path} fill={`url(#${uid}-glass-finish)`} opacity={0.78 * opacityScale} />;
  }

  if (look === "vertical") {
    return <path d={path} fill={`url(#${uid}-retro-stripes)`} opacity={0.72 * opacityScale} />;
  }

  if (look === "radial") {
    return <path d={path} fill={`url(#${uid}-neon-grid)`} opacity={0.62 * opacityScale} />;
  }

  if (look === "spoke") {
    return <path d={path} fill={`url(#${uid}-ink-hatch)`} opacity={0.78 * opacityScale} />;
  }

  return <path d={path} fill={`url(#${uid}-porcelain-glaze)`} opacity={0.9 * opacityScale} />;
}

type DiscMaterialFinishProps = {
  uid: string;
  look: ResolvedSliceLook;
  subdued: boolean;
};

/** 跨扇区高光让材质形成完整盘面，而不是重复的小色块。 */
function DiscMaterialFinish({ uid, look, subdued }: DiscMaterialFinishProps) {
  const opacityScale = subdued ? 0.22 : 1;

  if (look === "horizon") {
    return (
      <g opacity={opacityScale}>
        <path
          d="M24 62C58 26 132 20 176 56"
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeOpacity="0.28"
          strokeWidth="6"
        />
        <path
          d="M35 75C72 45 128 42 164 68"
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeOpacity="0.12"
          strokeWidth="2"
        />
      </g>
    );
  }

  if (look === "vertical") {
    return (
      <circle
        cx="100"
        cy="100"
        r="99"
        fill={`url(#${uid}-retro-vignette)`}
        opacity={opacityScale}
      />
    );
  }

  if (look === "radial") {
    return (
      <g fill="none" opacity={opacityScale}>
        <circle cx="100" cy="100" r="31" stroke="#22d3ee" strokeOpacity="0.32" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="58" stroke="#f0abfc" strokeDasharray="3 6" strokeOpacity="0.36" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="86" stroke="#67e8f9" strokeOpacity="0.2" strokeWidth="1" />
      </g>
    );
  }

  if (look === "spoke") {
    return (
      <g fill="none" opacity={opacityScale}>
        <circle cx="100" cy="100" r="82" stroke="#ffffff" strokeDasharray="1.5 5" strokeOpacity="0.38" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="28" stroke="#0f172a" strokeOpacity="0.58" strokeWidth="3" />
      </g>
    );
  }

  if (look === "seamless") {
    return (
      <g opacity={opacityScale}>
        <ellipse cx="73" cy="53" rx="54" ry="24" fill="#ffffff" fillOpacity="0.14" transform="rotate(-16 73 53)" />
        <circle cx="100" cy="100" r="96" fill="none" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="2" />
      </g>
    );
  }

  return null;
}

type SliceGradientProps = {
  id: string;
  look: ResolvedSliceLook;
  color: string;
  segment: Segment;
};

function SliceGradient({ id, look, color, segment }: SliceGradientProps) {
  const light = mixHex(color, "#ffffff", look === "seamless" ? 0.34 : 0.32);
  const highlight = mixHex(color, "#ffffff", look === "horizon" ? 0.52 : 0.2);
  const dark = mixHex(color, "#000000", look === "vertical" || look === "spoke" ? 0.34 : 0.24);
  const deep = mixHex(color, "#020617", look === "radial" ? 0.48 : 0.32);

  if (look === "horizon") {
    return (
      <linearGradient id={id} x1="0" y1="100" x2="200" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor={dark} />
        <stop offset="18%" stopColor={color} />
        <stop offset="46%" stopColor={highlight} />
        <stop offset="56%" stopColor={light} />
        <stop offset="74%" stopColor={color} />
        <stop offset="100%" stopColor={deep} />
      </linearGradient>
    );
  }

  if (look === "vertical") {
    return (
      <linearGradient id={id} x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor={light} />
        <stop offset="20%" stopColor={color} />
        <stop offset="68%" stopColor={dark} />
        <stop offset="100%" stopColor={deep} />
      </linearGradient>
    );
  }

  if (look === "radial") {
    return (
      <radialGradient id={id} cx="100" cy="100" r="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor={highlight} />
        <stop offset="18%" stopColor={light} />
        <stop offset="48%" stopColor={color} />
        <stop offset="82%" stopColor={dark} />
        <stop offset="100%" stopColor={deep} />
      </radialGradient>
    );
  }

  if (look === "seamless") {
    return (
      <radialGradient id={id} cx="72" cy="54" r="128" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor={light} />
        <stop offset="34%" stopColor={highlight} />
        <stop offset="70%" stopColor={color} />
        <stop offset="100%" stopColor={mixHex(color, "#64748b", 0.14)} />
      </radialGradient>
    );
  }

  // spoke: gradient along each wedge bisector (hub → rim)
  const rim = polar(100, 100, 100, segment.mid);
  return (
    <linearGradient
      id={id}
      x1="100"
      y1="100"
      x2={rim.x}
      y2={rim.y}
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0%" stopColor={highlight} />
      <stop offset="22%" stopColor={light} />
      <stop offset="56%" stopColor={color} />
      <stop offset="86%" stopColor={dark} />
      <stop offset="100%" stopColor={deep} />
    </linearGradient>
  );
}
