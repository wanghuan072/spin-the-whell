import type { MutableRefObject } from "react";
import styles from "../styles/WheelGame.module.css";
import { WheelSheet } from "./WheelSheet";

export type WheelSettingsTab = "rules" | "sound";

type WheelSettingsSheetProps = {
  storageKey: string;
  tab: WheelSettingsTab;
  celebrationEnabled: boolean;
  spinDuration: number;
  soundEnabled: boolean;
  soundStyle: string;
  volume: number;
  soundEnabledRef: MutableRefObject<boolean>;
  soundStyleRef: MutableRefObject<string>;
  volumeRef: MutableRefObject<number>;
  onTabChange: (tab: WheelSettingsTab) => void;
  onCelebrationChange: (enabled: boolean) => void;
  onSpinDurationChange: (duration: number) => void;
  onSoundEnabledChange: (enabled: boolean) => void;
  onSoundStyleChange: (style: string) => void;
  onVolumeChange: (volume: number) => void;
  onClose: () => void;
};

export function WheelSettingsSheet(props: WheelSettingsSheetProps) {
  const { storageKey, tab, celebrationEnabled, spinDuration, soundEnabled, soundStyle, volume, soundEnabledRef, soundStyleRef, volumeRef } = props;
  return (
    <WheelSheet title="Spin settings" subtitle="Rules, pace & sound" onClose={props.onClose}>
      <div className={styles["sheet-tabs"]} role="tablist" aria-label="Settings categories">
        <button type="button" role="tab" aria-selected={tab === "rules"} className={tab === "rules" ? styles["is-active"] : ""} onClick={() => props.onTabChange("rules")}>Rules</button>
        <button type="button" role="tab" aria-selected={tab === "sound"} className={tab === "sound" ? styles["is-active"] : ""} onClick={() => props.onTabChange("sound")}>Sound</button>
      </div>
      {tab === "rules" ? <>
        <label className={styles["toggle-row"]}><span><strong>Celebration</strong><small>Confetti when a winner lands.</small></span><input type="checkbox" checked={celebrationEnabled} onChange={(event) => props.onCelebrationChange(event.target.checked)} /><i aria-hidden="true" /></label>
        <div className={styles["setting-group"]}>
          <div className={styles["setting-label"]}><label htmlFor={`${storageKey}-duration`}>Spin duration</label><output htmlFor={`${storageKey}-duration`}>{spinDuration}s</output></div>
          <input id={`${storageKey}-duration`} type="range" min="3" max="15" step="1" value={spinDuration} onChange={(event) => props.onSpinDurationChange(Number(event.target.value))} />
          <div className={styles["duration-presets"]}><button type="button" onClick={() => props.onSpinDurationChange(4)}>Quick</button><button type="button" onClick={() => props.onSpinDurationChange(10)}>Normal</button><button type="button" onClick={() => props.onSpinDurationChange(14)}>Dramatic</button></div>
        </div>
      </> : <>
        <label className={styles["toggle-row"]}><span><strong>Sound on</strong><small>Play ticks while spinning and a chime on the winner.</small></span><input type="checkbox" checked={soundEnabled} onChange={(event) => { soundEnabledRef.current = event.target.checked; props.onSoundEnabledChange(event.target.checked); }} /><i aria-hidden="true" /></label>
        <div className={styles["setting-group"]}><label htmlFor={`${storageKey}-sound-style`}>Sound style</label><select id={`${storageKey}-sound-style`} value={soundStyle} onChange={(event) => { soundStyleRef.current = event.target.value; props.onSoundStyleChange(event.target.value); }} disabled={!soundEnabled}><option value="arcade">Arcade click</option><option value="bell">Bright bell</option><option value="soft">Soft tone</option></select></div>
        <div className={styles["setting-group"]}><div className={styles["setting-label"]}><label htmlFor={`${storageKey}-volume`}>Volume</label><output htmlFor={`${storageKey}-volume`}>{volume}%</output></div><input id={`${storageKey}-volume`} type="range" min="0" max="100" value={volume} disabled={!soundEnabled} onChange={(event) => { const next = Number(event.target.value); volumeRef.current = next; props.onVolumeChange(next); }} /></div>
      </>}
    </WheelSheet>
  );
}
