
/**
 * Central TDK for static pages (title / description / keywords).
 * Detail pages keep seo in their own data files (templates.json, posts.json).
 *
 * Targets:
 * - title: 25–60 characters
 * - description: 140–160 characters
 * - include the page's primary keyword naturally
 */

/** @typedef {{ title: string, description: string, keywords: string[] }} TdkRecord */

/** @type {Record<string, TdkRecord>} */
export const pageTdk = {
  home: {
    title: "Spin the Wheel | Spinanywheel - Free Online Random Picker",
    description:
      "Spinanywheel is a free online random picker. Build a Spin the Wheel in Classic or Turn Queue mode, adjust odds and styles, review results, and export CSV.",
    keywords: [
      "spinanywheel",
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
    title: "Spin the Wheel Templates - Ready-Made Picker Setups",
    description:
      "Explore common Spin the Wheel templates on Spinanywheel for decisions, classrooms, games, events, sports, and creative activities, then edit any setup.",
    keywords: [
      "spinanywheel",
      "spin the wheel templates",
      "event raffle wheel",
      "random picker templates",
      "wheel spinner presets",
    ],
  },
  blog: {
    title: "Spin the Wheel Blog - Practical Guides | Spinanywheel",
    description:
      "Read the Spinanywheel blog for practical Spin the Wheel guides covering options, Excel import, styles, Results, Turn Queue prize draws, and group rounds.",
    keywords: [
      "spinanywheel",
      "spin the wheel blog",
      "how to use spin the wheel",
      "spin wheel setup guide",
      "turn queue wheel guide",
      "wheel spinner tips",
    ],
  },
  comments: {
    title: "Spin the Wheel Comments - Ideas & Feedback | Spinanywheel",
    description:
      "Share ideas and feedback with Spinanywheel. Suggest a Spin the Wheel template or feature and explain how you use the random picker with your group.",
    keywords: [
      "spinanywheel",
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
    title: "Privacy Policy - Spinanywheel",
    description:
      "Read the Spinanywheel Privacy Policy to learn what stays in your browser, how local wheel settings and comments work, what providers process, and how to contact us.",
    keywords: [
      "spinanywheel",
      "spin the wheel privacy policy",
      "privacy policy",
      "spin the wheel privacy",
      "data privacy",
    ],
  },
  "terms-of-service": {
    title: "Terms of Service - Spinanywheel",
    description:
      "Review the Spinanywheel Terms of Service covering acceptable use, randomness limits, intellectual property, disclaimers, and how to contact our team.",
    keywords: [
      "spinanywheel",
      "spin the wheel terms",
      "terms of service",
      "terms of use",
      "spin the wheel rules",
    ],
  },
  copyright: {
    title: "Copyright Notice - Spinanywheel",
    description:
      "Read the Spinanywheel copyright notice for site ownership, permitted use, user-uploaded content, third-party rights, and copyright complaint instructions.",
    keywords: [
      "spinanywheel",
      "spin the wheel copyright",
      "copyright notice",
      "intellectual property",
      "copyright complaint",
    ],
  },
  "about-us": {
    title: "About Spinanywheel - Free Online Random Picker",
    description:
      "Learn about Spinanywheel, the brand behind a free online Spin the Wheel for decisions, classrooms, parties, games, and giveaways with editable visual rounds.",
    keywords: [
      "spinanywheel",
      "about spin the wheel",
      "spin the wheel about us",
      "random picker tool",
      "free spin the wheel",
    ],
  },
  "contact-us": {
    title: "Contact Spinanywheel - Support and Feedback",
    description:
      "Contact Spinanywheel by email for privacy questions, copyright notices, template corrections, product feedback, partnerships, and general support.",
    keywords: [
      "spinanywheel",
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
