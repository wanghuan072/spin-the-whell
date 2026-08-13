"use client";

import type { ChangeEvent, DragEvent as ReactDragEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MAX_WHEEL_OPTIONS } from "../config";
import { extractExcelEntries, formatExcelCell, getExcelColumnLabel } from "../lib/excel";
import { parsePastedEntries } from "../lib/wheel";
import type { ExcelImportMode, ExcelSheet } from "../types";
import { CloseIcon, ExcelIcon, PasteIcon } from "./WheelIcons";
import styles from "../styles/ExcelImportDialog.module.css";

const EXCEL_FILE_LIMIT = 5 * 1024 * 1024;
type WheelImportSource = "paste" | "excel";

type ExcelImportDialogProps = {
  currentEntries: string[];
  initialEntries: string[];
  initialSource: WheelImportSource;
  dialogId: string;
  onClose: () => void;
  onImport: (entries: string[]) => void;
};

/**
 * 在独立弹窗中完成Excel解析和预览，避免把临时工作簿状态放进主转盘组件。
 */
export function ExcelImportDialog({
  currentEntries,
  initialEntries,
  initialSource,
  dialogId,
  onClose,
  onImport,
}: ExcelImportDialogProps) {
  const [source, setSource] = useState<WheelImportSource>(initialSource);
  const [draft, setDraft] = useState(initialEntries.join("\n"));
  const [sheets, setSheets] = useState<ExcelSheet[]>([]);
  const [fileName, setFileName] = useState("");
  const [sheetIndex, setSheetIndex] = useState(0);
  const [columnIndex, setColumnIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const onCloseRef = useRef(onClose);

  const activeSheet = sheets[sheetIndex];
  const columnCount = useMemo(
    () => activeSheet?.data.reduce((maximum, row) => Math.max(maximum, row.length), 0) ?? 0,
    [activeSheet],
  );
  const extractedEntries = useMemo(
    () => extractExcelEntries(activeSheet, columnIndex),
    [activeSheet, columnIndex],
  );
  const pastedEntries = useMemo(() => parsePastedEntries(draft), [draft]);
  const importEntriesPreview = source === "paste" ? pastedEntries : extractedEntries;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // 锁定背景滚动并维持弹窗内的键盘焦点循环。
  useEffect(() => {
    // React开发模式会执行一次额外的挂载/卸载检查，每次挂载都必须恢复可写状态。
    isMountedRef.current = true;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    document.body.style.overflow = "hidden";
    dialog?.querySelector<HTMLElement>("button, textarea, input, select")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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
      setMessage("That workbook is larger than 5 MB. Choose a smaller file.");
      return;
    }

    setIsReading(true);
    setMessage(null);

    try {
      // 仅在用户选择文件后加载SheetJS，保持首页首屏脚本轻量。
      const { read, utils } = await import("xlsx");
      const workbook = read(await file.arrayBuffer(), { cellDates: true });
      const parsedSheets: ExcelSheet[] = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const data = worksheet
          ? utils.sheet_to_json<unknown[]>(worksheet, {
              header: 1,
              defval: null,
              raw: true,
            }) as unknown[][]
          : [];
        return { sheet: sheetName, data };
      });
      const populatedSheets = parsedSheets.filter((sheet) =>
        sheet.data.some((row) => row.some((cell) => formatExcelCell(cell))),
      );

      if (!isMountedRef.current) return;
      setFileName(file.name);
      setSheetIndex(0);
      setColumnIndex(0);

      if (populatedSheets.length === 0) {
        setSheets([]);
        setMessage("No usable cells were found in this workbook.");
        return;
      }

      setSheets(populatedSheets);
      setMessage(
        `${populatedSheets.length} sheet${populatedSheets.length === 1 ? "" : "s"} ready. Every row is included.`,
      );
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

  function handleDragLeave(event: ReactDragEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setIsDragging(false);
  }

  async function handleDrop(event: ReactDragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) await readExcelFile(file);
  }

  function importEntries(mode: ExcelImportMode) {
    if (importEntriesPreview.length === 0) {
      setMessage(source === "paste"
        ? "Paste at least one non-empty option."
        : "Choose a column containing at least one non-empty cell.");
      return;
    }

    if (mode === "replace" && importEntriesPreview.length < 2) {
      setMessage("A replacement wheel needs at least two non-empty cells.");
      return;
    }

    const availableSlots = mode === "replace"
      ? MAX_WHEEL_OPTIONS
      : MAX_WHEEL_OPTIONS - currentEntries.length;
    if (availableSlots <= 0) {
      setMessage(`The wheel already has ${MAX_WHEEL_OPTIONS} options. Replace it or remove an option first.`);
      return;
    }

    const acceptedEntries = importEntriesPreview.slice(0, availableSlots);
    onImport(mode === "replace" ? acceptedEntries : [...currentEntries, ...acceptedEntries]);
    onClose();
  }

  return (
    <div
      className={styles["excel-modal-backdrop"]}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles["excel-modal"]}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${dialogId}-title`}
      >
        <header className={styles["excel-modal-header"]}>
          <div>
            <span>Wheel option importer</span>
            <h2 id={`${dialogId}-title`}>Import wheel options</h2>
            <p>Paste a list or choose one Excel column. Every non-empty value becomes a wheel option.</p>
          </div>
          <button type="button" aria-label="Close wheel importer" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>

        <div className={styles["import-source-tabs"]} role="tablist" aria-label="Wheel import source">
          <button type="button" role="tab" aria-selected={source === "paste"} className={source === "paste" ? styles["is-active"] : ""} onClick={() => setSource("paste")}>
            <PasteIcon /> Paste list
          </button>
          <button type="button" role="tab" aria-selected={source === "excel"} className={source === "excel" ? styles["is-active"] : ""} onClick={() => setSource("excel")}>
            <ExcelIcon /> Excel file
          </button>
        </div>

        <div className={styles["excel-modal-content"]}>
          {source === "paste" ? (
            <section className={styles["paste-workspace"]} aria-label="Pasted wheel options">
              <label>
                <span>One option per line, or separate values with commas, tabs, or semicolons</span>
                <textarea rows={12} value={draft} placeholder={"Alice\nBob\nCarol"} onChange={(event) => setDraft(event.target.value)} />
              </label>
              <div className={styles["excel-preview"]}>
                <div><strong>Options to import</strong><span>{pastedEntries.length} options</span></div>
                {pastedEntries.length > 0 ? (
                  <ol>{pastedEntries.slice(0, MAX_WHEEL_OPTIONS).map((entry, index) => <li key={`${entry}-${index}`}><span>{index + 1}</span><strong title={entry}>{entry}</strong></li>)}</ol>
                ) : <p>Paste at least one option to preview it here.</p>}
              </div>
            </section>
          ) : (
          <>
          <div
            className={`${styles["excel-drop-zone"]} ${isDragging ? styles["is-dragging"] : ""}`}
            onDragEnter={handleDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className={styles["excel-drop-icon"]} aria-hidden="true"><ExcelIcon /></span>
            <div>
              <strong>{isReading ? "Reading your workbook…" : "Drop an Excel file here"}</strong>
              <span>.xlsx or .xls · maximum 5 MB</span>
            </div>
            <label aria-disabled={isReading}>
              {fileName ? "Choose another file" : "Choose a file"}
              <input
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                disabled={isReading}
                onChange={handleFileChange}
              />
            </label>
          </div>

          {activeSheet && (
            <section className={styles["excel-workspace"]} aria-label="Workbook content">
              <div className={styles["excel-file-row"]}>
                <span aria-hidden="true"><ExcelIcon /></span>
                <div>
                  <strong title={fileName}>{fileName}</strong>
                  <small>{sheets.length} sheet{sheets.length === 1 ? "" : "s"} found</small>
                </div>
              </div>

              <div className={styles["excel-import-selectors"]}>
                <label>
                  <span>Worksheet</span>
                  <select
                    value={sheetIndex}
                    onChange={(event) => {
                      setSheetIndex(Number(event.target.value));
                      setColumnIndex(0);
                      setMessage(null);
                    }}
                  >
                    {sheets.map((sheet, index) => (
                      <option key={`${sheet.sheet}-${index}`} value={index}>{sheet.sheet}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Import column</span>
                  <select
                    value={columnIndex}
                    onChange={(event) => {
                      setColumnIndex(Number(event.target.value));
                      setMessage(null);
                    }}
                  >
                    {Array.from({ length: columnCount }, (_, index) => (
                      <option key={index} value={index}>Column {getExcelColumnLabel(index)}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles["excel-preview"]}>
                <div>
                  <strong>Options to import</strong>
                  <span>{extractedEntries.length} non-empty cells</span>
                </div>
                {extractedEntries.length > 0 ? (
                  <ol>
                    {extractedEntries.slice(0, MAX_WHEEL_OPTIONS).map((entry, index) => (
                      <li key={`${entry}-${index}`}>
                        <span>{index + 1}</span>
                        <strong title={entry}>{entry}</strong>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>No non-empty cells are available in this column.</p>
                )}
                {extractedEntries.length > MAX_WHEEL_OPTIONS && (
                  <p>{extractedEntries.length - MAX_WHEEL_OPTIONS} more rows are outside the {MAX_WHEEL_OPTIONS}-option wheel limit.</p>
                )}
              </div>
            </section>
          )}
          </>
          )}
        </div>

        <footer className={styles["excel-modal-footer"]}>
          <p className={styles["excel-import-status"]} aria-live="polite">
            {message ?? (source === "paste"
              ? "Review the list, then replace the wheel or add the values to it."
              : "Select one column, then replace the wheel or add the values to it.")}
          </p>
          <div className={styles["excel-import-actions"]}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button
              type="button"
              onClick={() => importEntries("append")}
              disabled={importEntriesPreview.length === 0 || currentEntries.length >= MAX_WHEEL_OPTIONS}
            >
              Add to wheel
            </button>
            <button
              type="button"
              onClick={() => importEntries("replace")}
              disabled={importEntriesPreview.length < 2}
            >
              Replace wheel
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
