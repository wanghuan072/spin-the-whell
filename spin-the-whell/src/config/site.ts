export const siteConfig = {
  name: "Spinanywheel",
  displayName: "Spin Any Wheel",
  productName: "Spin the Wheel",
  shortName: "Spinanywheel",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://spinanywheel.com").replace(/\/+$/, ""),
  description:
    "Spinanywheel is a free online Spin the Wheel for classrooms, parties, giveaways, and everyday choices—edit a list, choose a mode, and spin in your browser.",
  locale: "en_US",
  language: "en",
  ogImage: "/images/og-image.png",
  ogImageAlt: "Spinanywheel free online Spin the Wheel random picker",
};

export function absoluteUrl(path = "/") {
  if (path === "/" || path === "") return siteConfig.url;
  return new URL(path, siteConfig.url).toString();
}
