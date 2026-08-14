import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TEMPLATE_CATEGORIES, TEMPLATE_MODES } from "@/config/template-categories";
import posts from "@/data/blog/posts.json";
import home from "@/data/home/home.json";
import templates from "@/data/templates/templates.json";
import { legalTdk, pageTdk } from "@/seo/tdk";

type SeoRecord = { title: string; description: string; keywords: string[] };

const seoRecords: SeoRecord[] = [
  ...Object.values(pageTdk),
  ...Object.values(legalTdk),
  ...templates.map((template) => template.seo),
  ...posts.map((post) => post.seo),
];

const staticCopy = JSON.stringify({ home, templates, posts, pageTdk, legalTdk });
const validTemplateSlugs = new Set(templates.map((template) => template.addressBar));
const validPostSlugs = new Set(posts.map((post) => post.addressBar));
const validModes = new Set<string>(TEMPLATE_MODES.filter((item) => item.id !== "all").map((item) => item.id));
const validCategories = new Set<string>(
  TEMPLATE_CATEGORIES.filter((item) => item.id !== "all").map((item) => item.id),
);

function expectBalancedHtml(html: string) {
  const stack: string[] = [];
  const voidTags = new Set(["br", "hr", "img", "input", "meta", "link"]);
  const tags = html.matchAll(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi);

  for (const match of tags) {
    const fullTag = match[0];
    const tag = match[1].toLowerCase();
    if (voidTags.has(tag) || fullTag.endsWith("/>")) continue;

    if (fullTag.startsWith("</")) {
      expect(stack.pop(), `Unexpected closing tag ${fullTag}`).toBe(tag);
    } else {
      stack.push(tag);
    }
  }

  expect(stack, `Unclosed tags in: ${html.slice(0, 140)}...`).toEqual([]);
}

function countWords(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

describe("static content integrity", () => {
  it("contains no replacement characters, common mojibake, or truncated word fragments", () => {
    expect(staticCopy).not.toMatch(/\uFFFD|鈥|芒鈧|脙|闁硘|閳/u);
    expect(staticCopy).not.toMatch(/\s-\s(?:[a-z]|\/h[1-6]>)/u);
  });

  it("keeps trusted article and template HTML balanced", () => {
    for (const item of [...templates, ...posts]) {
      expectBalancedHtml(item.detailsHtml);
    }
  });

  it("keeps SEO titles and descriptions within useful snippet ranges", () => {
    for (const seo of seoRecords) {
      expect(seo.title.length, seo.title).toBeGreaterThanOrEqual(25);
      expect(seo.title.length, seo.title).toBeLessThanOrEqual(60);
      expect(seo.description.length, seo.description).toBeGreaterThanOrEqual(110);
      expect(seo.description.length, seo.description).toBeLessThanOrEqual(170);
      expect(seo.description.toLowerCase(), `${seo.title}: missing brand in description`).toContain("spinanywheel");
      expect(seo.keywords.map((keyword) => keyword.toLowerCase()), `${seo.title}: missing brand keyword`)
        .toContain("spinanywheel");
    }
  });

  it("links only to template and guide slugs that exist", () => {
    for (const item of [...templates, ...posts]) {
      const links = item.detailsHtml.matchAll(/href="\/(templates|blog)\/([^"#?]+)"/g);
      for (const [, section, slug] of links) {
        const slugs = section === "templates" ? validTemplateSlugs : validPostSlugs;
        expect(slugs.has(slug), `Broken internal link: /${section}/${slug}`).toBe(true);
      }
    }
  });

  it("keeps every template identifiable and in the two-level taxonomy", () => {
    expect(new Set(templates.map((template) => template.id)).size).toBe(templates.length);
    expect(validTemplateSlugs.size).toBe(templates.length);
    expect(new Set(templates.map((template) => template.title)).size).toBe(templates.length);

    for (const template of templates) {
      expect(typeof template.isHome, `${template.title}: isHome must be explicit`).toBe("boolean");
      expect(validModes.has(template.runMode), `${template.title}: invalid mode`).toBe(true);
      expect(validCategories.has(template.category), `${template.title}: invalid scenario`).toBe(true);
      expect(template.reviewSummary.trim(), `${template.title}: review summary is missing`).not.toBe("");
    }

    expect(new Set(templates.map((template) => template.reviewSummary)).size).toBe(templates.length);

    const categoryIds = TEMPLATE_CATEGORIES.filter((item) => item.id !== "all").map((item) => item.id);
    for (const category of categoryIds) {
      expect(
        templates.some((template) => template.category === category),
        `${category}: empty template category`,
      ).toBe(true);
    }

    expect(templates.some((template) => template.addressBar === "classroom-elimination-wheel")).toBe(false);
    expect(templates.map((template) => template.title)).toEqual(expect.arrayContaining([
      "Spin The Wheel Yes Or No",
      "Country Spin The Wheel",
      "Pokemon Spin The Wheel",
      "Color Spin The Wheel",
      "NBA Teams Spin The Wheel",
      "NBA Player Spin The Wheel",
      "Games Spin The Wheel",
      "Movie Spin The Wheel",
      "Spin the Wheel Names",
    ]));

    expect(templates.filter((template) => template.isHome).map((template) => template.title)).toEqual([
      "Raffle Wheel",
      "Spin The Wheel Yes Or No",
      "Color Spin The Wheel",
      "Country Spin The Wheel",
    ]);
  });

  it("uses a unique optimized screenshot for every template", () => {
    const imageUrls = templates.map((template) => template.imageUrl);
    const cardImageUrls = templates.map((template) => template.cardImageUrl);
    expect(new Set(imageUrls).size).toBe(templates.length);
    expect(new Set(cardImageUrls).size).toBe(templates.length);

    for (const template of templates) {
      expect(template.imageUrl, template.title).toMatch(/^\/images\/templates\/screenshots\/[a-z0-9-]+\.webp$/);
      expect(template.cardImageUrl, template.title).toMatch(/^\/images\/templates\/screenshots\/[a-z0-9-]+-latest\.webp$/);
      const screenshotPath = join(process.cwd(), "public", template.imageUrl.slice(1));
      const cardScreenshotPath = join(process.cwd(), "public", template.cardImageUrl.slice(1));
      expect(existsSync(screenshotPath), `${template.title}: screenshot is missing`).toBe(true);
      expect(existsSync(cardScreenshotPath), `${template.title}: latest card screenshot is missing`).toBe(true);
      expect(statSync(screenshotPath).size, `${template.title}: screenshot is unexpectedly small`).toBeGreaterThan(20_000);
      expect(statSync(cardScreenshotPath).size, `${template.title}: latest card screenshot is unexpectedly small`).toBeGreaterThan(20_000);
    }
  });

  it("publishes a reviewable scope and valid supporting screenshots", () => {
    for (const template of templates) {
      expect(template.source.label.trim(), `${template.title}: source label is missing`).not.toBe("");
      expect(template.source.scope.trim(), `${template.title}: data scope is missing`).not.toBe("");
      expect(template.source.checkedAt, `${template.title}: source review date is invalid`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (template.source.url) {
        expect(template.source.url, `${template.title}: source URL must use HTTPS`).toMatch(/^https:\/\//);
      }

      for (const image of template.contentImages ?? []) {
        expect(image.src, `${template.title}: content image must be an optimized WebP`).toMatch(
          /^\/images\/templates\/screenshots\/[a-z0-9-]+\.webp$/,
        );
        expect(image.alt.trim(), `${template.title}: content image alt text is missing`).not.toBe("");
        expect(image.caption.trim(), `${template.title}: content image caption is missing`).not.toBe("");
        const imagePath = join(process.cwd(), "public", image.src.slice(1));
        expect(existsSync(imagePath), `${template.title}: content image is missing`).toBe(true);
        expect(statSync(imagePath).size, `${template.title}: content image is unexpectedly small`).toBeGreaterThan(20_000);
      }
    }
  });

  it("keeps each template guide substantial and structurally distinct", () => {
    const headingSignatures = templates.map((template) =>
      [...template.detailsHtml.matchAll(/<h2>(.*?)<\/h2>/g)].map((match) => match[1]).join("|"),
    );

    expect(new Set(templates.map((template) => template.detailsHtml)).size).toBe(templates.length);
    expect(new Set(headingSignatures).size).toBe(templates.length);
    for (const template of templates) {
      expect(countWords(template.detailsHtml), template.title).toBeGreaterThanOrEqual(250);
      expect((template.detailsHtml.match(/<h2>/g) ?? []).length, template.title).toBeGreaterThanOrEqual(5);
    }
  });

  it("avoids shared template-guide boilerplate", () => {
    const normalizedParagraphs = templates.flatMap((template) =>
      [...template.detailsHtml.matchAll(/<p>(.*?)<\/p>/g)].map((match) => ({
        template: template.addressBar,
        text: match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().toLowerCase(),
      })),
    );
    const substantial = normalizedParagraphs.filter(({ text }) => text.split(" ").length >= 18);
    const seen = new Map<string, string>();

    for (const paragraph of substantial) {
      const owner = seen.get(paragraph.text);
      expect(owner, `Duplicate paragraph in ${owner} and ${paragraph.template}`).toBeUndefined();
      seen.set(paragraph.text, paragraph.template);
    }
  });

  it("keeps blog guides product-led, substantial, and illustrated", () => {
    const headingSignatures = posts.map((post) =>
      [...post.detailsHtml.matchAll(/<h2>(.*?)<\/h2>/g)].map((match) => match[1]).join("|"),
    );

    expect(new Set(posts.map((post) => post.addressBar)).size).toBe(posts.length);
    expect(new Set(headingSignatures).size).toBe(posts.length);
    for (const post of posts) {
      expect(countWords(post.detailsHtml), post.title).toBeGreaterThanOrEqual(700);
      expect((post.detailsHtml.match(/<h2>/g) ?? []).length, post.title).toBeGreaterThanOrEqual(7);
      expect(post.detailsHtml, `${post.title}: missing a structured reference table`).toContain("<table>");
      expect((post.detailsHtml.match(/<figure>/g) ?? []).length, `${post.title}: too few in-article images`)
        .toBeGreaterThanOrEqual(5);
      expect(post.detailsHtml, `${post.title}: missing review disclosure`).toContain("How this guide was checked");

      const imagePaths = [post.imageUrl, ...[...post.detailsHtml.matchAll(/<img src="([^"]+)"/g)].map((match) => match[1])];
      for (const imageUrl of imagePaths) {
        const imagePath = join(process.cwd(), "public", imageUrl.slice(1));
        expect(existsSync(imagePath), `${post.title}: image is missing: ${imageUrl}`).toBe(true);
      }
    }
  });

  it("keeps Turn Queue presets runnable with their Remove winner setting", () => {
    for (const template of templates) {
      if (template.runMode === "classic") {
        expect(template.queueItems ?? [], `${template.title}: Classic should not preload a Queue`).toHaveLength(0);
        continue;
      }

      const queue = template.queueItems ?? [];
      const scheduledTurns = queue.reduce((total, item) => total + item.turnLimit, 0);
      expect(queue.length, `${template.title}: Queue is empty`).toBeGreaterThan(0);
      expect(scheduledTurns, `${template.title}: Queue has no turns`).toBeGreaterThan(0);
      if (template.removeWinner) {
        expect(scheduledTurns, `${template.title}: Queue can outlast its wheel options`).toBeLessThanOrEqual(
          template.entries.length,
        );
      }
    }
  });
});
