// 转盘内的轻量图标统一维护，避免主组件被重复SVG结构淹没。
export function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 10v4h3l4 3V7L8 10H5Z" />
      {muted ? <path d="m16 10 4 4m0-4-4 4" /> : <path d="M16 9c1.2 1.2 1.2 4.8 0 6m2-8c2.7 2.7 2.7 7.3 0 10" />}
    </svg>
  );
}

export function FullscreenIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M8 21H3v-5m13 5h5v-5" /></svg>;
}

export function ResetIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6M4 4v4.6h4.6" /></svg>;
}

export function ShuffleIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3c4 0 5 10 9 10h4m-3-3 3 3-3 3M4 17h3c1.7 0 2.8-1.8 3.8-4M17 4l3 3-3 3m-4-3h3.5" /></svg>;
}

export function SortIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16m-3-3 3 3 3-3M14 7h6m-6 5h5m-5 5h3" /></svg>;
}

export function UploadIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m-4 4 4-4 4 4M5 14v5h14v-5" /></svg>;
}

export function ExcelIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6V3Zm9 0v5h4M9 11l5 6m0-6-5 6" /></svg>;
}

export function GripIcon() {
  return <svg viewBox="0 0 16 20" aria-hidden="true"><circle cx="5" cy="5" r="1" /><circle cx="11" cy="5" r="1" /><circle cx="5" cy="10" r="1" /><circle cx="11" cy="10" r="1" /><circle cx="5" cy="15" r="1" /><circle cx="11" cy="15" r="1" /></svg>;
}

export function CloseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>;
}

export function PlusIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
}

export function SlidersIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h5m4 0h7M9 4v6m-5 7h9m4 0h3m-3-3v6" /></svg>;
}

export function EditIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16-1 5 5-1L19 9l-4-4L4 16Zm9-9 4 4" /></svg>;
}

export function SessionIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5V4Zm3 4h8M8 12h8m-8 4h5" /></svg>;
}

export function PaletteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 0 18h1.2a2.4 2.4 0 0 0 0-4.8H12" />
      <circle cx="7.5" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="11" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 2.2-5.5M4 4v4.5h4.5" />
      <path d="M12 8v5l3.5 2" />
    </svg>
  );
}

export function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PasteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 4h6v3H9V4Zm-2 3H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1" />
      <path d="M9 13h6m-6 4h4" />
    </svg>
  );
}

export function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
      <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" />
    </svg>
  );
}

export function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v10m-4-4 4 4 4-4M5 18h14" />
    </svg>
  );
}

export function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16v12H4V6Z" />
      <path d="m4 15 4-4 3 3 4-5 5 6" />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function EyeIcon({ hidden = false }: { hidden?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden ? <path d="m4 4 16 16" /> : null}
    </svg>
  );
}

export function ChevronIcon({ open }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={open ? { transform: "rotate(90deg)" } : undefined}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14M9 7V5h6v2m-7 0 1 12h6l1-12" />
    </svg>
  );
}

export function QueueIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="7" r="2" />
      <circle cx="6" cy="17" r="2" />
      <path d="M11 7h9M11 17h9M4 12h16" />
    </svg>
  );
}

export function SkipIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 6 9 6-9 6V6Zm11 0v12" />
    </svg>
  );
}
