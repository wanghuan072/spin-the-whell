export const siteConfig = {
  name: "Spin the Wheel",
  shortName: "SpinWheel",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://spinanywheel.com").replace(/\/+$/, ""),
  description:
    "A free online Spin the Wheel for classrooms, parties, giveaways, and everyday choices—edit your list, pick a fairness mode, and spin in the browser.",
  locale: "en_US",
  language: "en",
  ogImage: "/images/og-image.png",
  ogImageAlt: "Spin the Wheel free online random picker",
};

export function absoluteUrl(path = "/") {
  if (path === "/" || path === "") return siteConfig.url;
  return new URL(path, siteConfig.url).toString();
}
