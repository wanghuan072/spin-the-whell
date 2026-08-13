import { SessionIcon } from "./WheelIcons";
import { createWheelEntryStats } from "../lib/wheel";
import { getQueueItemSpinCount, getQueueProgress } from "../lib/wheel-queue";
import type { WheelQueueItem, WheelRunMode, WheelSessionSpin } from "../types";
import styles from "../styles/SessionSummary.module.css";

type SessionSummaryProps = {
  entries: string[];
  spins: WheelSessionSpin[];
  runMode: WheelRunMode;
  queueItems: WheelQueueItem[];
  skippedQueueItemIds: string[];
  onBack: () => void;
  onClear: () => void;
  compact?: boolean;
};

export function SessionSummary({
  entries,
  spins,
  runMode,
  queueItems,
  skippedQueueItemIds,
  onBack,
  onClear,
  compact = false,
}: SessionSummaryProps) {
  const stats = createWheelEntryStats(entries, spins);
  const uniquePicks = stats.filter((item) => item.pickCount > 0).length;
  const queueSpinCount = spins.filter((spin) => spin.queueItemId).length;
  const {
    completedTurns,
    resolvedItems,
    totalTurns: queueTotalTurns,
  } = getQueueProgress({
    items: queueItems,
    spins,
    skippedIds: skippedQueueItemIds,
  });

  return (
    <section
      className={styles["session-summary"]}
      aria-labelledby={compact ? undefined : "session-summary-title"}
      aria-label={compact ? "Session history" : undefined}
    >
      {compact ? null : (
        <div className={styles["summary-heading"]}>
          <div>
            <span><SessionIcon /> Live session</span>
            <h3 id="session-summary-title">Session history</h3>
          </div>
          <button type="button" onClick={onBack}>Back</button>
        </div>
      )}

      <div className={styles["summary-metrics"]}>
        <div><strong>{runMode === "turn-queue" ? queueSpinCount : spins.length}</strong><span>{runMode === "turn-queue" ? "Queue rounds" : "Rounds"}</span></div>
        <div><strong>{uniquePicks}</strong><span>Picked</span></div>
        <div><strong>{runMode === "turn-queue" ? `${resolvedItems}/${queueItems.length}` : entries.length}</strong><span>{runMode === "turn-queue" ? "Items resolved" : "Options"}</span></div>
      </div>

      {runMode === "turn-queue" && queueItems.length > 0 ? (
        <div className={styles["participation-section"]}>
          <div className={styles["section-heading"]}>
            <strong>Turn Queue</strong>
            <span>{completedTurns}/{queueTotalTurns} available turns</span>
          </div>
          <ol>
            {queueItems.map((item) => {
              const used = getQueueItemSpinCount(spins, item.id);
              const isSkipped = skippedQueueItemIds.includes(item.id);
              const width = isSkipped
                ? 100
                : item.turnLimit > 0 ? Math.min(100, (used / item.turnLimit) * 100) : 0;
              return (
                <li key={item.id}>
                  <div><strong>{item.label}</strong><span>{isSkipped ? "Skipped" : `${used} of ${item.turnLimit}`}</span></div>
                  <i><span style={{ width: `${width}%` }} /></i>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      <div className={styles["participation-section"]}>
        <div className={styles["section-heading"]}>
          <strong>Participation</strong>
          <span>{stats.length} options</span>
        </div>
        <ol>
          {stats.map((item) => {
            const width = spins.length > 0 ? Math.max(5, (item.pickCount / spins.length) * 100) : 0;
            return (
              <li key={item.entry}>
                <div><strong>{item.entry}</strong><span>{item.pickCount} picks</span></div>
                <i><span style={{ width: `${width}%` }} /></i>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={styles["rounds-section"]}>
        <div className={styles["section-heading"]}>
          <strong>Rounds</strong>
          <span>{spins.length} recorded</span>
        </div>
        {spins.length > 0 ? (
          <ol>
            {spins.map((spin, index) => (
              <li key={spin.id}>
                <span>{spins.length - index}</span>
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
          <p>Spin the wheel to start a session. Every winner will appear here.</p>
        )}
      </div>

      <button type="button" className={styles["clear-session"]} onClick={onClear} disabled={spins.length === 0}>
        Clear session only
      </button>
    </section>
  );
}
