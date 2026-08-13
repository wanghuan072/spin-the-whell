# Spin the Wheel — Design System

## Dual Theme

| Mode | Name | Role |
|------|------|------|
| `night` (default) | Neon Arcade | Previous purple neon look — primary / evening |
| `day` | Daylight Fair | Coral / amber fairground — daytime |

- Toggle: header (`ThemeToggle`), persists `localStorage` key `spin-theme`
- FOUC prevention: inline script in `layout.tsx` sets `data-theme` before paint
- Tokens live in `src/style/globals.css` under `:root` / `html[data-theme="day"]` and `html[data-theme="night"]`

## Night — Neon Arcade

- Canvas: `#12082a` → `#1a0f3a`
- Magenta `#ff2d95`, cyan `#00f5d4`, amber `#ffd166`
- Wheel chrome: purple shell, neon bulbs, magenta spin button
- Font: Outfit

## Day — Daylight Fair

- Canvas: warm ivory / peach wash
- Coral `#e85d4c`, amber `#f0a202`, teal `#0d9488`
- Wheel chrome: brass / gold shell, warm bulbs
- Same Outfit typeface and component structure

## Rules

1. Theme via CSS variables only — no duplicate component trees
2. Do not change wheel selection / spin logic for styling
3. Header hosts the only theme control
4. Default theme is **night** (legacy Neon Arcade)
