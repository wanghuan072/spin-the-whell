/**
 * Move HomePage media queries after all base styles so they actually apply.
 * Keeps only max-width 1024 (iPad) and 768 (mobile).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/style/page/home/HomePage.module.css",
);

let css = fs.readFileSync(file, "utf8");

const mediaStart = css.indexOf("\n@media (max-width: 1024px) {");
const hoverStart = css.indexOf("\n@media (hover: hover) {", mediaStart);
if (mediaStart < 0 || hoverStart < 0) {
  throw new Error("Could not locate mid-file media blocks");
}

const afterHover = css.indexOf("\n}", hoverStart);
if (afterHover < 0) throw new Error("Could not find end of hover block");
let hoverEnd = afterHover + 2;
// include trailing newlines after hover block
while (css[hoverEnd] === "\n") hoverEnd += 1;

const removed = css.slice(mediaStart, hoverEnd);
css = css.slice(0, mediaStart) + "\n" + css.slice(hoverEnd);

const responsiveBlock = `
/* iPad: max-width 1024 */
@media (max-width: 1024px) {
  .hero-section {
    height: auto;
  }

  .hero-content {
    grid-template-columns: 1fr;
    padding-block: 30px 32px;
  }

  .hero-copy {
    padding-inline: 0;
  }

  .hero-side {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 30%;
    opacity: 0.5;
  }

  .hero-side-left { left: 0; }
  .hero-side-right { right: 0; }

  .side-gift,
  .side-prize {
    width: 48px;
  }

  .side-prize .step-icon {
    width: 48px;
  }

  .hero-copy h1 {
    font-size: clamp(2.3rem, 8.4vw, 4.2rem);
  }

  .hero-description {
    max-width: 520px;
  }

  .editor-content {
    margin-top: -14px;
  }

  .templates-section,
  .use-section,
  .faq-section,
  .how-section,
  .benefits-section {
    padding-block: 36px;
  }

  .template-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .how-grid {
    grid-template-columns: 1fr;
  }

  .use-grid,
  .benefits-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .benefits-content,
  .faq-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .benefits-intro,
  .faq-intro {
    position: static;
    max-width: 650px;
  }

  .trust-content {
    grid-template-columns: 66px 1fr;
  }

  .trust-mark {
    width: 60px;
    height: 60px;
  }

  .trust-facts,
  .trust-note {
    grid-column: 2;
  }

  .faq-list {
    grid-template-columns: 1fr;
  }

  .final-cta-content {
    grid-template-columns: 1fr;
    gap: 18px;
    text-align: center;
  }

  .final-cta-content > a {
    grid-column: auto;
    grid-row: auto;
    width: max-content;
    margin-inline: auto;
  }

  .final-cta-content::after {
    display: none;
  }
}

/* Mobile: max-width 768 */
@media (max-width: 768px) {
  .hero-content {
    padding-top: 28px;
  }

  .hero-copy h1 {
    font-size: clamp(2.15rem, 9.4vw, 3rem);
  }

  .hero-actions {
    gap: 8px;
  }

  .primary-action,
  .secondary-action {
    flex: 1;
    min-height: 42px;
    padding-inline: 10px;
    font-size: 0.7rem;
  }

  .hero-side {
    display: none;
  }

  .templates-section,
  .use-section,
  .faq-section,
  .how-section,
  .benefits-section {
    padding-block: 34px;
  }

  .section-title {
    margin-bottom: 18px;
  }

  .section-title h2,
  .benefits-intro h2,
  .faq-intro h2 {
    font-size: 1.55rem;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }

  .template-card {
    grid-template-columns: 62px minmax(0, 1fr);
  }

  .template-image {
    width: 62px;
  }

  .how-grid {
    grid-template-columns: 1fr;
  }

  .how-grid::before {
    top: 20px;
    bottom: 20px;
    left: 40px;
    width: 1px;
    height: auto;
    border-top: 0;
    border-left: 1px dashed var(--color-line);
  }

  .how-grid li {
    min-height: 0;
    grid-template-columns: 54px 1fr;
    padding: 15px;
  }

  .step-number {
    width: 50px;
    height: 50px;
  }

  .how-grid .step-icon {
    width: 55px;
    opacity: 0.7;
  }

  .benefits-grid,
  .use-grid {
    grid-template-columns: 1fr;
  }

  .benefits-grid article,
  .benefits-grid .benefit-featured,
  .benefits-grid article:last-child {
    min-height: 0;
    padding: 16px;
    padding-right: 16px;
  }

  .benefit-featured::before {
    display: none;
  }

  .use-grid article {
    min-height: 122px;
    grid-template-columns: 18px 35px 1fr;
    gap: 9px;
    padding: 14px 12px;
  }

  .use-grid article:nth-child(even) {
    background: var(--color-surface-alt);
  }

  .use-icon {
    width: 34px;
    height: 34px;
  }

  .use-icon .pictogram {
    width: 21px;
  }

  .use-links {
    flex-wrap: wrap;
    gap: 3px 16px;
  }

  .use-links > span {
    width: 100%;
  }

  .inline-cta {
    width: 100%;
    justify-content: center;
  }

  .trust-content {
    grid-template-columns: 52px 1fr;
    gap: 14px;
    padding: 18px;
  }

  .trust-mark {
    width: 50px;
    height: 50px;
  }

  .trust-mark svg {
    width: 29px;
  }

  .trust-facts,
  .trust-note {
    grid-column: 1 / -1;
  }

  .trust-facts {
    padding-left: 0;
    border-left: 0;
  }

  .trust-copy h2 {
    font-size: 1.2rem;
  }

  .faq-list summary {
    font-size: 0.69rem;
  }

  .final-cta-content {
    display: block;
    padding: 25px;
    text-align: center;
  }

  .final-cta-content > a {
    width: max-content;
    margin: 17px auto 0;
  }
}

@media (hover: hover) {
  .primary-action:hover,
  .secondary-action:hover {
    filter: brightness(1.08);
  }

  .template-card:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-soft);
    transform: translateY(-2px);
  }

  .section-title > a:hover,
  .benefits-intro > a:hover,
  .faq-intro > a:hover,
  .use-links a:hover {
    color: var(--color-primary-dark);
  }

  .inline-cta:hover,
  .final-cta-content > a:hover {
    filter: brightness(1.08);
  }
}
`;

// Avoid duplicating if script re-run
if (css.includes("/* iPad: max-width 1024 */")) {
  console.log("Responsive block already present; mid-file media removed only.");
} else {
  css = `${css.trimEnd()}\n${responsiveBlock}\n`;
}

fs.writeFileSync(file, css);
console.log("HomePage responsive fixed. Removed mid-file media chars:", removed.length);
