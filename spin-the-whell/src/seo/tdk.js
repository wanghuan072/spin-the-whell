
/**
 * Central TDK for static pages (title / description / keywords).
 * Detail pages keep seo in their own data files (templates.json, posts.json).
 *
 * Targets:
 * - title: 40–60 characters
 * - description: 140–160 characters
 * - include the page's primary keyword naturally
 */

/** @typedef {{ title: string, description: string, keywords: string[] }} TdkRecord */

/** @type {Record<string, TdkRecord>} */
export const pageTdk = {
  home: {
    title: "Spin the Wheel - Free Online Random Picker",
    description:
      "Spin a custom wheel in Classic or Turn Queue mode. Import a list, adjust visible weights and styles, review results, and export a CSV—no account required.",
    keywords: [
      "spin the wheel",
      "spin the wheel online",
      "random picker wheel",
      "decision wheel",
      "name picker wheel",
      "turn queue spinner",
      "event raffle wheel",
    ],
  },
  templates: {
    title: "Spin the Wheel Templates - Common Setups for Everyday Picks",
    description:
      "I've collected common Spin the Wheel templates for decisions, classrooms, games, events, and more. Have a better setup in mind? Share it in Comments.",
    keywords: [
      "spin the wheel templates",
      "event raffle wheel",
      "random picker templates",
      "wheel spinner presets",
    ],
  },
  blog: {
    title: "Spin the Wheel Blog - Practical Setup and Play Guides",
    description:
      "Read practical Spin the Wheel guides based on the current editor: lists and Excel import, styles, Results, Turn Queue prize draws, group rounds, and product limits.",
    keywords: [
      "spin the wheel blog",
      "how to use spin the wheel",
      "spin wheel setup guide",
      "turn queue wheel guide",
      "wheel spinner tips",
    ],
  },
  comments: {
    title: "Spin the Wheel Comments - Share Your Ideas and Feedback",
    description:
      "Tell us how you use Spin the Wheel, suggest a template or feature, and share practical feedback that may help shape the site and support other visitors.",
    keywords: [
      "spin the wheel comments",
      "wheel spinner community",
      "random picker feedback",
      "spin the wheel ideas",
    ],
  },
};

/** @type {Record<string, TdkRecord>} */
export const legalTdk = {
  "privacy-policy": {
    title: "Spin the Wheel - Privacy Policy for Users",
    description:
      "Read the Spin the Wheel Privacy Policy to learn what stays in your browser, how local settings work, what server logs may collect, and how to contact us.",
    keywords: [
      "spin the wheel privacy policy",
      "privacy policy",
      "spin the wheel privacy",
      "data privacy",
    ],
  },
  "terms-of-service": {
    title: "Spin the Wheel - Terms of Service Online",
    description:
      "Review the Spin the Wheel Terms of Service covering acceptable use, randomness limits, intellectual property, disclaimers, and how to reach our team by email.",
    keywords: [
      "spin the wheel terms",
      "terms of service",
      "terms of use",
      "spin the wheel rules",
    ],
  },
  copyright: {
    title: "Spin the Wheel Copyright Notice & Rights",
    description:
      "See the Spin the Wheel copyright notice for site ownership, permitted use, user-uploaded content rules, and how to send a copyright complaint by email.",
    keywords: [
      "spin the wheel copyright",
      "copyright notice",
      "intellectual property",
      "copyright complaint",
    ],
  },
  "about-us": {
    title: "About Spin the Wheel - Our Free Online Tool",
    description:
      "Learn about Spin the Wheel, a free online picker for decisions, classrooms, parties, and giveaways, with custom lists, visual styles, and Turn Queue rounds.",
    keywords: [
      "about spin the wheel",
      "spin the wheel about us",
      "random picker tool",
      "free spin the wheel",
    ],
  },
  "contact-us": {
    title: "Spin the Wheel - Contact Us & Support Help",
    description:
      "Contact Spin the Wheel by email for privacy questions, copyright notices, product feedback, and general support. No form is needed—just write wyong@spinanywheel.com.",
    keywords: [
      "contact spin the wheel",
      "spin the wheel email",
      "spin the wheel support",
      "contact us",
    ],
  },
};

/**
 * @param {keyof typeof pageTdk} key
 * @returns {TdkRecord}
 */
export function getPageTdk(key) {
  const record = pageTdk[key];
  if (!record) {
    throw new Error(`Missing page TDK for "${String(key)}"`);
  }
  return record;
}

/**
 * @param {string} slug
 * @returns {TdkRecord | undefined}
 */
export function getLegalTdk(slug) {
  return legalTdk[slug];
}
