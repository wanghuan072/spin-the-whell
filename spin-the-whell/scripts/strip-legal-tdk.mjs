import fs from "fs";

const src = fs.readFileSync("src/config/legal.ts", "utf8");
const pages = [];
const re = /\{\s*id:\s*"([^"]+)"[\s\S]*?bodyHtml:\s*`([\s\S]*?)`\.trim\(\),?\s*\}/g;
let match;
while ((match = re.exec(src))) {
  pages.push({ id: match[1], bodyHtml: match[2] });
}

if (pages.length !== 5) {
  console.error("parse fail", pages.length);
  process.exit(1);
}

const out = `export const legalNavigation = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms of Service", href: "/legal/terms-of-service" },
  { label: "Copyright", href: "/legal/copyright" },
  { label: "About Us", href: "/legal/about-us" },
  { label: "Contact Us", href: "/legal/contact-us" },
] as const;

export const CONTACT_EMAIL = "wyong@example.com";

export type LegalPageId =
  | "privacy-policy"
  | "terms-of-service"
  | "copyright"
  | "about-us"
  | "contact-us";

export type LegalPageContent = {
  id: LegalPageId;
  /** HTML body from trusted static content only */
  bodyHtml: string;
};

export const LEGAL_PAGES: LegalPageContent[] = [
${pages
  .map(
    (page) => `  {
    id: "${page.id}",
    bodyHtml: \`${page.bodyHtml}\`.trim(),
  }`,
  )
  .join(",\n")}
];

export function getLegalPage(id: string) {
  return LEGAL_PAGES.find((page) => page.id === id);
}
`;

fs.writeFileSync("src/config/legal.ts", out);
console.log("ok", pages.map((page) => page.id));
