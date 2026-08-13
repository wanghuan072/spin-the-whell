# Spin the Wheel — Design System

## Dual Theme

| Mode | Name | Role |
|------|------|------|
| `night` (default) | Cartoon Carnival | Plum tent night + candy coral / teal / gold |
| `day` | Daylight Fair | Cotton-candy paper + coral / teal / mustard |

## Direction

Cartoon fairground / 嘉年华海报风（相对 Neon Arcade 更暖、更圆、更厚）：
- Chunk borders + sticker button shadows（下沉按压感）
- Candy stripe marquee + rounded playful type
- Hero stays clean — atmosphere from gradient stage only

## Typography

- Display: **Fredoka** (`--font-display`)
- Body: **Nunito** (`--font-body`)
- Titles: vertical candy gradient (ink → coral → gold)

## Layout cues

1. Hero: clean candy gradient stage (no hanging props / side confetti)
2. Marquee: diagonal candy stripes + ★ separators
3. Cards: 3–4px borders, chunky bottom shadows, press-on-hover
4. Modes: gold vs teal thick frames
5. Keep H1 at exactly two lines

## Rules

1. Theme via CSS variables only
2. Respect `prefers-reduced-motion`
3. Prefer translate press / shadow change over scale
4. Do not change wheel spin logic for styling
