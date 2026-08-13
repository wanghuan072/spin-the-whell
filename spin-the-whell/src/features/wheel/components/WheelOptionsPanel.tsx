import type { RefObject } from "react";
import { MAX_WHEEL_OPTIONS } from "../config";
import { optionChancePercent } from "../lib/wheel-options";
import type { WheelOption } from "../types";
import styles from "../styles/WheelGame.module.css";
import { PasteIcon, PlusIcon, ShuffleIcon, SortIcon, TrashIcon } from "./WheelIcons";

type WheelOptionsPanelProps = {
  storageKey: string;
  options: WheelOption[];
  isSpinning: boolean;
  importTriggerRef: RefObject<HTMLButtonElement | null>;
  onReplace: (options: WheelOption[]) => void;
  onAdd: () => void;
  onImport: () => void;
  onClear: () => void;
  onChange: (id: string, patch: Partial<WheelOption>) => void;
  onRemove: (index: number) => void;
  onShuffleIds: (ids: string[]) => string[];
};

export function WheelOptionsPanel({ storageKey, options, isSpinning, importTriggerRef, onReplace, onAdd, onImport, onClear, onChange, onRemove, onShuffleIds }: WheelOptionsPanelProps) {
  const hasBlankOptions = options.some((option) => !option.label.trim());
  const shuffle = () => {
    const byId = new Map(options.map((option) => [option.id, option]));
    onReplace(onShuffleIds(options.map((option) => option.id)).flatMap((id) => {
      const option = byId.get(id);
      return option ? [option] : [];
    }));
  };

  return (
    <div id={`${storageKey}-options-panel`} className={styles["options-panel"]} role="tabpanel" aria-labelledby={`${storageKey}-options-tab`}>
      <div className={styles["options-toolbar"]}>
        <div className={styles["toolbar-primary"]}>
          <button type="button" className={styles["toolbar-action"]} onClick={shuffle} disabled={options.length < 2}><ShuffleIcon /> Shuffle</button>
          <button type="button" className={styles["toolbar-action"]} onClick={() => onReplace([...options].sort((left, right) => left.label.localeCompare(right.label)))} disabled={options.length < 2}><SortIcon /> Sort</button>
        </div>
        <div className={styles["toolbar-secondary"]}>
          <button type="button" className={styles["add-option-button"]} onClick={onAdd} disabled={options.length >= MAX_WHEEL_OPTIONS}><PlusIcon /><span>Add</span></button>
          <button ref={importTriggerRef} type="button" className={styles["icon-tool"]} disabled={isSpinning} onClick={onImport} aria-label="Import wheel options" title="Import options"><PasteIcon /><span>Import</span></button>
          <button type="button" className={styles["text-button"]} onClick={onClear}>Clear</button>
        </div>
      </div>
      {hasBlankOptions ? <p id={`${storageKey}-blank-option-help`} className={styles["options-warning"]} role="status">Name or remove every blank option before spinning.</p> : null}
      <div className={styles["entry-list"]} role="list">
        {options.map((option, index) => {
          const chance = optionChancePercent(options, index);
          return <div className={`${styles["option-card"]} ${!option.label.trim() ? styles["is-invalid"] : ""}`} role="listitem" key={option.id} style={{ ["--option-color" as string]: option.color }}>
            <div className={styles["option-main"]}>
              <i className={styles["option-swatch"]} aria-hidden="true" />
              <input type="text" value={option.label} maxLength={36} aria-label={`Option ${index + 1}`} aria-invalid={!option.label.trim()} aria-describedby={!option.label.trim() ? `${storageKey}-blank-option-help` : undefined} onChange={(event) => onChange(option.id, { label: event.target.value })} />
              <span className={styles["option-chance"]} title="Chance on the wheel">{chance}%</span>
              <button type="button" className={styles["option-delete"]} aria-label={`Remove ${option.label || `option ${index + 1}`}`} onClick={() => onRemove(index)}><TrashIcon /></button>
            </div>
          </div>;
        })}
      </div>
    </div>
  );
}
