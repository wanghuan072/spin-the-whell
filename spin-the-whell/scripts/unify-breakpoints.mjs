/**
 * Unify width breakpoints to only 768 (mobile) and 1024 (iPad / desktop gate).
 * Does not touch hover or prefers-reduced-motion queries.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const styleRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/style");

/** @type {Record<string, Array<[RegExp, string]>>} */
const fileRules = {
  "globals.css": [
    // already 768 — keep
  ],
  "layout/AppHeader.module.css": [
    // Desktop nav only above iPad; hamburger at 1024 and below
    [/@media \(min-width: 720px\)/g, "@media (min-width: 1024px)"],
  ],
  "layout/ThemeToggle.module.css": [
    [/@media \(min-width: 720px\)/g, "@media (min-width: 1024px)"],
  ],
  "layout/AppFooter.module.css": [
    [/@media \(max-width: 759px\)/g, "@media (max-width: 768px)"],
  ],
  "layout/PageHero.module.css": [
    // 2-column hero from iPad up
    [/@media \(min-width: 900px\)/g, "@media (min-width: 768px)"],
  ],
  "page/legal/LegalPage.module.css": [
    [/@media \(min-width: 860px\)/g, "@media (min-width: 768px)"],
  ],
  "page/blog/BlogPage.module.css": [
    [/@media \(min-width: 800px\)/g, "@media (min-width: 768px)"],
  ],
  "page/blog/BlogDetailPage.module.css": [
    [/@media \(min-width: 800px\)/g, "@media (min-width: 768px)"],
  ],
  "page/templates/TemplatesPage.module.css": [
    [/@media \(min-width: 720px\)/g, "@media (min-width: 768px)"],
    [/@media \(min-width: 1100px\)/g, "@media (min-width: 1024px)"],
  ],
  "page/templates/TemplateDetailPage.module.css": [
    [/@media \(min-width: 760px\)/g, "@media (min-width: 768px)"],
  ],
  "page/home/HomePage.module.css": [
    [/@media \(max-width: 859px\)/g, "@media (max-width: 1024px)"],
    [/@media \(max-width: 980px\)/g, "@media (max-width: 1024px)"],
    [/@media \(max-width: 720px\)/g, "@media (max-width: 768px)"],
    [/@media \(max-width: 599px\)/g, "@media (max-width: 768px)"],
    [/@media \(max-width: 520px\)/g, "@media (max-width: 768px)"],
  ],
  "components/wheel/WheelSheet.module.css": [
    [/@media \(min-width: 720px\)/g, "@media (min-width: 768px)"],
  ],
  "components/wheel/ExcelImportDialog.module.css": [
    [/@media \(max-width: 620px\)/g, "@media (max-width: 768px)"],
  ],
  "components/wheel/ResultCardEditor.module.css": [
    [/@media \(max-width: 420px\)/g, "@media (max-width: 768px)"],
  ],
  "components/wheel/WinnerResultCard.module.css": [
    [/@media \(max-width: 520px\)/g, "@media (max-width: 768px)"],
  ],
  "components/wheel/WheelGame.module.css": [
    [/@media \(max-width: 640px\)/g, "@media (max-width: 768px)"],
    // iPad + phone chrome; desktop block must come after so 1024px prefers 3-col
    [/@media \(max-width: 859px\)/g, "@media (max-width: 1024px)"],
    [/@media \(min-width: 860px\)/g, "@media (min-width: 1024px)"],
    [/@media \(min-width: 1100px\)/g, "@media (min-width: 1024px)"],
    [/@media \(min-width: 1320px\)/g, "@media (min-width: 1024px)"],
  ],
};

function walk(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".css")) out.push(full);
  }
  return out;
}

let changed = 0;
for (const [rel, rules] of Object.entries(fileRules)) {
  if (!rules.length) continue;
  const file = path.join(styleRoot, rel);
  let css = fs.readFileSync(file, "utf8");
  const before = css;
  for (const [re, to] of rules) css = css.replace(re, to);
  if (css !== before) {
    fs.writeFileSync(file, css);
    changed += 1;
    console.log("updated", rel);
  }
}

// Merge WheelGame duplicate @media (min-width: 1024px) blocks into one (keep first, append unique later rules)
const wheelFile = path.join(styleRoot, "components/wheel/WheelGame.module.css");
let wheel = fs.readFileSync(wheelFile, "utf8");

function extractMediaBlocks(css, query) {
  const needle = `@media ${query}`;
  /** @type {{ start: number, end: number, body: string }[]} */
  const blocks = [];
  let from = 0;
  while (true) {
    const start = css.indexOf(needle, from);
    if (start === -1) break;
    let i = start + needle.length;
    while (css[i] && /\s/.test(css[i])) i += 1;
    if (css[i] !== "{") {
      from = start + needle.length;
      continue;
    }
    let depth = 0;
    let j = i;
    for (; j < css.length; j += 1) {
      if (css[j] === "{") depth += 1;
      else if (css[j] === "}") {
        depth -= 1;
        if (depth === 0) {
          j += 1;
          break;
        }
      }
    }
    blocks.push({ start, end: j, body: css.slice(i + 1, j - 1) });
    from = j;
  }
  return blocks;
}

wheel = fs.readFileSync(wheelFile, "utf8");
const desktopBlocks = extractMediaBlocks(wheel, "(min-width: 1024px)");
if (desktopBlocks.length > 1) {
  const mergedBody = desktopBlocks.map((b) => b.body.trim()).join("\n\n");
  const merged = `@media (min-width: 1024px) {\n${mergedBody}\n}\n`;
  const first = desktopBlocks[0];
  const last = desktopBlocks[desktopBlocks.length - 1];
  // Preserve any rules between first and last (e.g. max-width blocks) by
  // removing each desktop block individually, then appending one merged block at end of the span.
  let between = wheel.slice(first.start, last.end);
  for (let k = desktopBlocks.length - 1; k >= 0; k -= 1) {
    const b = desktopBlocks[k];
    const localStart = b.start - first.start;
    const localEnd = b.end - first.start;
    between = `${between.slice(0, localStart)}${between.slice(localEnd)}`;
  }
  between = `${between.trim()}\n\n${merged}`;
  wheel = `${wheel.slice(0, first.start)}${between}${wheel.slice(last.end)}`;
  fs.writeFileSync(wheelFile, wheel);
  console.log("merged WheelGame desktop media blocks:", desktopBlocks.length, "-> 1 (after iPad rules)");
}

// Merge HomePage duplicate max-width blocks
const homeFile = path.join(styleRoot, "page/home/HomePage.module.css");
let home = fs.readFileSync(homeFile, "utf8");
for (const query of ["(max-width: 1024px)", "(max-width: 768px)"]) {
  const blocks = extractMediaBlocks(home, query);
  if (blocks.length > 1) {
    const mergedBody = blocks.map((b) => b.body.trim()).join("\n\n");
    const merged = `@media ${query} {\n${mergedBody}\n}\n`;
    // Only safe if blocks are contiguous-ish; if not, replace each and keep one
    // Strategy: remove all, insert merged at first position
    let next = home;
    for (let k = blocks.length - 1; k >= 0; k -= 1) {
      const b = blocks[k];
      next = `${next.slice(0, b.start)}${k === 0 ? merged : ""}${next.slice(b.end)}`;
    }
    home = next;
    console.log("merged HomePage", query, blocks.length, "-> 1");
  }
}
fs.writeFileSync(homeFile, home);

// Verify no stray width breakpoints remain (except 768/1024)
const widthRe = /@media[^{]*\((?:min|max)-width:\s*(\d+)px\)/g;
const offenders = [];
for (const file of walk(styleRoot)) {
  const css = fs.readFileSync(file, "utf8");
  let m;
  while ((m = widthRe.exec(css))) {
    const n = Number(m[1]);
    if (n !== 768 && n !== 1024) {
      offenders.push(`${path.relative(styleRoot, file)}: ${m[0]}`);
    }
  }
}

console.log("files touched:", changed);
if (offenders.length) {
  console.log("REMAINING non-768/1024 width queries:");
  for (const line of offenders) console.log(" ", line);
  process.exitCode = 1;
} else {
  console.log("OK: only 768 and 1024 width breakpoints remain");
}
