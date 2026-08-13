import type { WheelRunMode } from "../types";
import styles from "../styles/WheelGame.module.css";
import {
  FullscreenIcon,
  HistoryIcon,
  LinkIcon,
  PaletteIcon,
  QueueIcon,
  ResetIcon,
  SlidersIcon,
  SoundIcon,
} from "./WheelIcons";

type WheelHeaderProps = {
  title: string;
  optionCount: number;
  runMode: WheelRunMode;
  isSpinning: boolean;
  soundEnabled: boolean;
  isFullscreen: boolean;
  historyCount: number;
  winnerOpen: boolean;
  onRunModeChange: (mode: WheelRunMode) => void;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onShare: () => void;
  onOpenStyle: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onReset: () => void;
};

export function WheelHeader({
  title,
  optionCount,
  runMode,
  isSpinning,
  soundEnabled,
  isFullscreen,
  historyCount,
  winnerOpen,
  onRunModeChange,
  onToggleSound,
  onToggleFullscreen,
  onShare,
  onOpenStyle,
  onOpenSettings,
  onOpenHistory,
  onReset,
}: WheelHeaderProps) {
  return (
    <header className={styles["wheel-game-heading"]} inert={winnerOpen ? true : undefined}>
      <div className={styles["heading-copy"]}>
        <h2>{title}</h2>
        <p><span>{optionCount} options</span><span aria-hidden="true">·</span><span>Random draw</span></p>
      </div>
      <div className={styles["run-mode-switch"]} role="radiogroup" aria-label="Wheel play mode">
        <button type="button" role="radio" aria-checked={runMode === "classic"} className={runMode === "classic" ? styles["is-active"] : ""} onClick={() => onRunModeChange("classic")} disabled={isSpinning}>Classic</button>
        <button type="button" role="radio" aria-checked={runMode === "turn-queue"} className={runMode === "turn-queue" ? styles["is-active"] : ""} onClick={() => onRunModeChange("turn-queue")} disabled={isSpinning}><QueueIcon /> Turn Queue</button>
      </div>
      <div className={styles["heading-toolbar"]} role="toolbar" aria-label="Wheel tools">
        <ToolButton onClick={onToggleSound} label={soundEnabled ? "Mute sound" : "Unmute sound"} title={soundEnabled ? "Sound on" : "Sound off"} pressed={soundEnabled}><SoundIcon muted={!soundEnabled} /><span>{soundEnabled ? "Sound on" : "Sound off"}</span></ToolButton>
        <ToolButton onClick={onToggleFullscreen} label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"} disabled={isSpinning}><FullscreenIcon /><span>{isFullscreen ? "Exit full screen" : "Full screen"}</span></ToolButton>
        <ToolButton onClick={onShare} label="Copy share link" title="Share link" disabled={isSpinning || optionCount < 2}><LinkIcon /><span>Share</span></ToolButton>
        <ToolButton onClick={onOpenStyle} label="Style panel" title="Style" disabled={isSpinning}><PaletteIcon /><span>Style</span></ToolButton>
        <ToolButton onClick={onOpenSettings} label="Spin settings" title="Settings" disabled={isSpinning}><SlidersIcon /><span>Settings</span></ToolButton>
        <ToolButton onClick={onOpenHistory} label={`${runMode === "turn-queue" ? "Turn Queue" : "Classic"} history, ${historyCount} rounds`} title="History" disabled={isSpinning} withBadge><HistoryIcon /><span>History</span>{historyCount > 0 ? <em>{historyCount}</em> : null}</ToolButton>
        <ToolButton onClick={onReset} label="Reset wheel" title="Reset" disabled={isSpinning}><ResetIcon /><span>Reset</span></ToolButton>
      </div>
    </header>
  );
}

type ToolButtonProps = {
  children: React.ReactNode;
  label: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  withBadge?: boolean;
};

function ToolButton({ children, label, title, onClick, disabled, pressed, withBadge }: ToolButtonProps) {
  return <button type="button" className={`${styles["tool-button"]} ${withBadge ? styles["tool-with-badge"] : ""}`} onClick={onClick} disabled={disabled} aria-label={label} title={title} aria-pressed={pressed}>{children}</button>;
}
