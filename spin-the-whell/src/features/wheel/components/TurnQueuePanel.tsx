import { PasteIcon, PlusIcon, ResetIcon, SkipIcon, TrashIcon } from "./WheelIcons";
import { MAX_QUEUE_ITEMS, MAX_QUEUE_TURNS } from "../config";
import { getNextQueueItemId, getQueueItemSpinCount, getQueueProgress } from "../lib/wheel-queue";
import type { WheelQueueItem, WheelSessionSpin } from "../types";
import styles from "../styles/TurnQueuePanel.module.css";

type TurnQueuePanelProps = {
  variant: "editor" | "status";
  items: WheelQueueItem[];
  spins: WheelSessionSpin[];
  activeItemId: string | null;
  skippedItemIds: string[];
  onAdd: () => void;
  onChange: (id: string, patch: Partial<Pick<WheelQueueItem, "label" | "turnLimit">>) => void;
  onRemove: (id: string) => void;
  onOpenImport: () => void;
  onResetProgress: () => void;
  onSkipCurrent: () => void;
};

export function TurnQueuePanel({
  variant,
  items,
  spins,
  activeItemId,
  skippedItemIds,
  onAdd,
  onChange,
  onRemove,
  onOpenImport,
  onResetProgress,
  onSkipCurrent,
}: TurnQueuePanelProps) {
  const { completedTurns, resolvedItems, totalTurns } = getQueueProgress({
    items,
    spins,
    skippedIds: skippedItemIds,
  });
  const activeItem = items.find((item) => item.id === activeItemId) ?? null;
  const activeTurnsUsed = activeItem ? getQueueItemSpinCount(spins, activeItem.id) : 0;
  const nextItemId = activeItem
    ? getNextQueueItemId({
        items,
        spins,
        skippedIds: [...skippedItemIds, activeItem.id],
        afterId: activeItem.id,
      })
    : null;
  const nextItem = items.find((item) => item.id === nextItemId) ?? null;
  return (
    <div className={`${styles["queue-panel"]} ${styles[`queue-${variant}`]}`}>
      {variant === "status" ? (
        <>
          <section className={styles["queue-live"]} aria-label="Live Turn Queue status">
        <div className={styles["queue-live-heading"]}>
          <span>Turn Queue</span>
          <strong>{completedTurns}/{totalTurns}</strong>
        </div>
        {activeItem ? (
          <>
            <div className={styles["queue-live-current"]}>
              <span>Now playing</span>
              <strong title={activeItem.label}>{activeItem.label}</strong>
              <em>{activeTurnsUsed} / {activeItem.turnLimit} spins completed</em>
            </div>
            <div
              className={styles["queue-progress"]}
              aria-label={`${completedTurns} of ${totalTurns} available queue turns finished`}
            >
              <i style={{ width: `${totalTurns > 0 ? Math.min(100, (completedTurns / totalTurns) * 100) : 0}%` }} />
            </div>
            <div className={styles["queue-live-next"]}>
              <span>Up next</span>
              <strong>{nextItem?.label ?? "Finish queue"}</strong>
            </div>
          </>
        ) : (
          <div className={styles["queue-live-empty"]}>
            <strong>{items.length === 0 ? "Queue not set" : "Session complete"}</strong>
            <p>{items.length === 0 ? "Add items in the Queue tab to start." : "Every available turn has been played or skipped."}</p>
          </div>
        )}
          </section>

          <div className={styles["queue-progress-actions"]}>
            <button
              type="button"
              className={styles["skip-current"]}
              onClick={onSkipCurrent}
              disabled={!activeItem}
            >
              <SkipIcon /> Skip current item
            </button>
            <button
              type="button"
              className={styles["reset-progress"]}
              onClick={onResetProgress}
              disabled={spins.length === 0 && skippedItemIds.length === 0}
            >
              <ResetIcon /> Reset queue progress
            </button>
          </div>
        </>
      ) : (
        <>

          <div className={styles["queue-summary"]}>
            <span>Queue items</span>
            <strong>{resolvedItems}/{items.length} resolved</strong>
          </div>

          <div className={styles["queue-tools"]}>
            <button type="button" onClick={onAdd} disabled={items.length >= MAX_QUEUE_ITEMS}>
              <PlusIcon /> Add item
            </button>
            <button type="button" onClick={onOpenImport} title="Import queue" aria-label="Import queue items">
              <PasteIcon />
              <span>Import</span>
            </button>
          </div>

          {items.length > 0 ? (
            <div className={styles["queue-list"]} role="list" aria-label="Turn queue items">
          {items.map((item, index) => {
            const used = getQueueItemSpinCount(spins, item.id);
            const isSkipped = skippedItemIds.includes(item.id);
            const isComplete = used >= item.turnLimit;
            const isActive = activeItemId === item.id && !isSkipped && !isComplete;
            return (
              <div
                key={item.id}
                role="listitem"
                className={`${styles["queue-item"]} ${isActive ? styles["is-active"] : ""} ${isComplete ? styles["is-complete"] : ""} ${isSkipped ? styles["is-skipped"] : ""}`}
              >
                <span className={styles["queue-order"]} aria-label={`Queue position ${index + 1}`}>
                  {index + 1}
                </span>
                <div className={styles["queue-fields"]}>
                  <input
                    type="text"
                    maxLength={36}
                    value={item.label}
                    placeholder={`Item ${index + 1}`}
                    aria-label={`Queue item ${index + 1}`}
                    onChange={(event) => onChange(item.id, { label: event.target.value })}
                  />
                  <div>
                    <label>
                      <span>Turns</span>
                      <input
                        type="number"
                        min="1"
                        max={MAX_QUEUE_TURNS}
                        value={item.turnLimit}
                        aria-label={`Turns for ${item.label || `item ${index + 1}`}`}
                        onChange={(event) => onChange(item.id, { turnLimit: Number(event.target.value) })}
                      />
                    </label>
                    <span className={styles["item-status"]}>
                      {isSkipped ? "Skipped" : isComplete ? "Done" : `${used}/${item.turnLimit}`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles["queue-remove"]}
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove ${item.label || `item ${index + 1}`}`}
                >
                  <TrashIcon />
                </button>
              </div>
            );
          })}
            </div>
          ) : (
            <div className={styles["queue-empty"]}>
              <strong>Build your turn queue</strong>
              <p>Add people, teams, tasks, levels, or anything else that takes a turn.</p>
              <button type="button" onClick={onAdd}><PlusIcon /> Add first item</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
