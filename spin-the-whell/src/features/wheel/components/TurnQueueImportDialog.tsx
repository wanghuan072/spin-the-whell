"use client";

import type { ChangeEvent, DragEvent as ReactDragEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon, ExcelIcon, PasteIcon } from "./WheelIcons";
import { MAX_QUEUE_ITEMS } from "../config";
import { formatExcelCell, getExcelColumnLabel } from "../lib/excel";
import { clampQueueTurns, createQueueItem, parseQueueText } from "../lib/wheel-queue";
import type { ExcelImportMode, ExcelSheet, WheelQueueItem } from "../types";
import styles from "../styles/TurnQueueImportDialog.module.css";

const EXCEL_FILE_LIMIT = 5 * 1024 * 1024;

type QueueImportSource = "paste" | "excel";

type TurnQueueImportDialogProps = {
  currentItems: WheelQueueItem[];
  initialSource: QueueImportSource;
  dialogId: string;
  onClose: () => void;
  onImport: (items: WheelQueueItem[], mode: ExcelImportMode) => void;
};

export function TurnQueueImportDialog({
  currentItems,
  initialSource,
  dialogId,
  onClose,
  onImport,
}: TurnQueueImportDialogProps) {
  const [source, setSource] = useState<QueueImportSource>(initialSource);
  const [draft, setDraft] = useState("");
  const [sheets, setSheets] = useState<ExcelSheet[]>([]);
  const [fileName, setFileName] = useState("");
  const [sheetIndex, setSheetIndex] = useState(0);
  const [itemColumn, setItemColumn] = useState(0);
  const [turnsColumn, setTurnsColumn] = useState(-1);
  const [message, setMessage] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const isMountedRef = useRef(true);

  const activeSheet = sheets[sheetIndex];
  const columnCount = useMemo(
    () => activeSheet?.data.reduce((maximum, row) => Math.max(maximum, row.length), 0) ?? 0,
    [activeSheet],
  );
  const pastedItems = useMemo(
    () => parseQueueText(draft),
    [draft],
  );
  const excelItems = useMemo(() => {
    if (!activeSheet) return [];
    return activeSheet.data.flatMap((row, index) => {
      const label = formatExcelCell(row[itemColumn]).slice(0, 36);
      if (!label) return [];
      const turnsValue = turnsColumn >= 0 ? Number(formatExcelCell(row[turnsColumn])) : 1;
      return [{
        id: `excel-preview-${index}`,
        label,
        turnLimit: clampQueueTurns(turnsValue, 1),
      } satisfies WheelQueueItem];
    });
  }, [activeSheet, itemColumn, turnsColumn]);
  const previewItems = source === "paste" ? pastedItems : excelItems;

  useEffect(() => {
    isMountedRef.current = true;
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    document.body.style.overflow = "hidden";
    dialog?.querySelector<HTMLElement>("button, textarea, input, select")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      isMountedRef.current = false;
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function readExcelFile(file: File) {
    if (isReading) return;
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setMessage("Choose an Excel file ending in .xlsx or .xls.");
      return;
    }
    if (file.size > EXCEL_FILE_LIMIT) {
      setMessage("That workbook is larger than 5 MB.");
      return;
    }

    setIsReading(true);
    setMessage(null);
    try {
      // 仅在读取文件时加载SheetJS，避免增加转盘首屏脚本。
      const { read, utils } = await import("xlsx");
      const workbook = read(await file.arrayBuffer(), { cellDates: true });
      const parsed = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const data = worksheet
          ? utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: null, raw: true }) as unknown[][]
          : [];
        return { sheet: sheetName, data };
      }).filter((sheet) => sheet.data.some((row) => row.some((cell) => formatExcelCell(cell))));
      if (!isMountedRef.current) return;
      const firstColumns = guessQueueColumns(parsed[0]);
      setSheets(parsed);
      setFileName(file.name);
      setSheetIndex(0);
      setItemColumn(firstColumns.itemColumn);
      setTurnsColumn(firstColumns.turnsColumn);
      setMessage(parsed.length > 0 ? "Workbook ready. Choose the two columns below." : "No usable cells were found.");
    } catch {
      if (!isMountedRef.current) return;
      setSheets([]);
      setFileName(file.name);
      setMessage("We could not read this workbook. It may be damaged or password-protected.");
    } finally {
      if (isMountedRef.current) setIsReading(false);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (file) await readExcelFile(file);
  }

  function handleDragOver(event: ReactDragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (isReading) return;
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }

  async function handleDrop(event: ReactDragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) await readExcelFile(file);
  }

  function commitImport(mode: ExcelImportMode) {
    if (previewItems.length === 0) {
      setMessage(source === "paste" ? "Paste at least one non-empty item." : "Choose an item column with at least one value.");
      return;
    }
    const available = mode === "replace" ? MAX_QUEUE_ITEMS : MAX_QUEUE_ITEMS - currentItems.length;
    if (available <= 0) {
      setMessage(`The queue already has ${MAX_QUEUE_ITEMS} items.`);
      return;
    }
    onImport(
      previewItems.slice(0, available).map((item) => createQueueItem(item.label, item.turnLimit)),
      mode,
    );
    onClose();
  }

  return (
    <div
      className={styles["queue-import-backdrop"]}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className={styles["queue-import-modal"]} role="dialog" aria-modal="true" aria-labelledby={`${dialogId}-title`}>
        <header className={styles["queue-import-header"]}>
          <div>
            <span>Turn Queue</span>
            <h2 id={`${dialogId}-title`}>Add items and turns</h2>
            <p>The first value is any person, team, task, or item. The second is its number of turns.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close queue importer"><CloseIcon /></button>
        </header>

        <div className={styles["source-tabs"]} role="tablist" aria-label="Queue import source">
          <button type="button" role="tab" aria-selected={source === "paste"} className={source === "paste" ? styles["is-active"] : ""} onClick={() => setSource("paste")}>
            <PasteIcon /> Paste list
          </button>
          <button type="button" role="tab" aria-selected={source === "excel"} className={source === "excel" ? styles["is-active"] : ""} onClick={() => setSource("excel")}>
            <ExcelIcon /> Excel file
          </button>
        </div>

        <div className={styles["queue-import-content"]}>
          {source === "paste" ? (
            <label className={styles["paste-area"]}>
              <span>One item per line — add a comma, tab, or semicolon before the turn count</span>
              <textarea
                rows={10}
                value={draft}
                placeholder={"Alice, 3\nTeam Blue, 5\nLevel One, 2"}
                onChange={(event) => setDraft(event.target.value)}
              />
              <small>Lines without a number start with 1 turn and can be edited after import.</small>
            </label>
          ) : (
            <>
              <div
                className={`${styles["excel-drop-zone"]} ${isDragging ? styles["is-dragging"] : ""}`}
                onDragEnter={handleDragOver}
                onDragOver={handleDragOver}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <ExcelIcon />
                <div><strong>{isReading ? "Reading workbook…" : fileName || "Drop an Excel file here"}</strong><span>.xlsx or .xls · maximum 5 MB</span></div>
                <label>{fileName ? "Choose another" : "Choose file"}<input type="file" accept=".xlsx,.xls" disabled={isReading} onChange={handleFileChange} /></label>
              </div>
              {activeSheet ? (
                <div className={styles["excel-selectors"]}>
                  <label><span>Worksheet</span><select value={sheetIndex} onChange={(event) => { const nextIndex = Number(event.target.value); const guessed = guessQueueColumns(sheets[nextIndex]); setSheetIndex(nextIndex); setItemColumn(guessed.itemColumn); setTurnsColumn(guessed.turnsColumn); }}>{sheets.map((sheet, index) => <option key={`${sheet.sheet}-${index}`} value={index}>{sheet.sheet}</option>)}</select></label>
                  <label><span>Item column</span><select value={itemColumn} onChange={(event) => setItemColumn(Number(event.target.value))}>{Array.from({ length: columnCount }, (_, index) => <option key={index} value={index}>Column {getExcelColumnLabel(index)}</option>)}</select></label>
                  <label><span>Turns column</span><select value={turnsColumn} onChange={(event) => setTurnsColumn(Number(event.target.value))}><option value={-1}>No column (use 1)</option>{Array.from({ length: columnCount }, (_, index) => <option key={index} value={index}>Column {getExcelColumnLabel(index)}</option>)}</select></label>
                </div>
              ) : null}
            </>
          )}

          <section className={styles["queue-preview"]} aria-label="Queue import preview">
            <div><strong>Preview</strong><span>{previewItems.length} item{previewItems.length === 1 ? "" : "s"}</span></div>
            {previewItems.length > 0 ? (
              <ol>{previewItems.slice(0, 20).map((item, index) => <li key={`${item.label}-${index}`}><span>{index + 1}</span><strong title={item.label}>{item.label}</strong><em>{item.turnLimit} turns</em></li>)}</ol>
            ) : <p>Your imported queue will appear here.</p>}
            {previewItems.length > 20 ? <small>Plus {previewItems.length - 20} more items.</small> : null}
          </section>
        </div>

        <footer className={styles["queue-import-footer"]}>
          <p role="status">{message ?? `Up to ${MAX_QUEUE_ITEMS} queue items are supported.`}</p>
          <div>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="button" onClick={() => commitImport("append")} disabled={previewItems.length === 0 || currentItems.length >= MAX_QUEUE_ITEMS}>Add to queue</button>
            <button type="button" onClick={() => commitImport("replace")} disabled={previewItems.length === 0}>Replace queue</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function guessQueueColumns(sheet: ExcelSheet | undefined) {
  if (!sheet) return { itemColumn: 0, turnsColumn: -1 };
  const columnCount = sheet.data.reduce((maximum, row) => Math.max(maximum, row.length), 0);
  let bestTurnsColumn = -1;
  let bestScore = 0;

  for (let column = 1; column < columnCount; column += 1) {
    const values = sheet.data
      .map((row) => formatExcelCell(row[column]))
      .filter(Boolean);
    if (values.length === 0) continue;
    const validTurns = values.filter((value) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) && numeric >= 1 && numeric <= 99;
    }).length;
    const score = validTurns / values.length;
    if (validTurns > 0 && score > bestScore) {
      bestScore = score;
      bestTurnsColumn = column;
    }
  }

  return { itemColumn: 0, turnsColumn: bestScore >= 0.6 ? bestTurnsColumn : -1 };
}
