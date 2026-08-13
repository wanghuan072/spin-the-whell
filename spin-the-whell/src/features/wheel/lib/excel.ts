import type { ExcelSheet } from "../types";

const EXCEL_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function getExcelColumnLabel(index: number) {
  let value = index + 1;
  let label = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }

  return label;
}

export function formatExcelCell(value: unknown) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return EXCEL_DATE_FORMATTER.format(value);
  return String(value).trim();
}

// Excel只提供候选内容，最终仍服从转盘36字符的单项限制。
export function extractExcelEntries(sheet: ExcelSheet | undefined, columnIndex: number) {
  if (!sheet) return [];

  return sheet.data
    .map((row) => formatExcelCell(row[columnIndex]))
    .filter(Boolean)
    .map((entry) => entry.slice(0, 36).trim());
}
