export const legalNavigation = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms of Service", href: "/legal/terms-of-service" },
  { label: "Copyright", href: "/legal/copyright" },
  { label: "About Us", href: "/legal/about-us" },
  { label: "Contact Us", href: "/legal/contact-us" },
] as const;

export const CONTACT_EMAIL = "wyong@spinanywheel.com";

export type LegalPageId =
  | "privacy-policy"
  | "terms-of-service"
  | "copyright"
  | "about-us"
  | "contact-us";

export type LegalPageContent = {
  id: LegalPageId;
  updatedDate: string;
  /** HTML body from trusted static content only */
  bodyHtml: string;
};

export const LEGAL_PAGES: LegalPageContent[] = [
  {
    id: "privacy-policy",
    updatedDate: "2026-08-11",
    bodyHtml: `
<p>This Privacy Policy explains how Spin the Wheel (“we”, “our”, or “the site”) approaches information when you use our free online random picker. We designed the tool to work primarily in your browser so you can create and spin a wheel without creating an account.</p>
<h2>Information that stays in your browser</h2>
<p>Most wheel data—such as option labels, colors, weights, style choices, Turn Queue settings, and session history—is stored locally in your browser using storage mechanisms available on your device. That information is used to restore your last wheel and keep the editor usable between visits on the same browser. It is not uploaded to Spin the Wheel as a user account profile.</p>
<p>Compressed stage and wheel background images may be saved in your browser's local storage when they fit within its storage limit. Individual slice images remain temporary and are removed when the tab closes. Text options and settings can remain saved locally.</p>
<h2>Public comments</h2>
<p>If you post on the Comments page, we store your account display name, message, account identifier, and the time of submission. Comments are public as soon as they are accepted, so do not include private, confidential, or sensitive information. Your email address is not displayed with a comment. An administrator may edit, hide, or delete a comment when needed to operate the community page or address misuse.</p>
<p>To limit automated and repeated submissions, the comment service also creates a one-way, secret-keyed hash from the request IP address. The service stores the hash rather than the plain IP address in the comments database and uses it for rate limiting and duplicate detection. Hosting providers may still process the original IP address in ordinary server logs.</p>
<h2>Google sign-in and account information</h2>
<p>When you choose Sign in with Google, Google sends the site a signed identity credential. Our server verifies that credential and stores the minimum profile information used to operate your community account: Google's stable account identifier, display name, email address and verification status, profile image URL, locale when available, and login timestamps. We do not receive your Google password, and we do not store Google access tokens or refresh tokens.</p>
<p>Google provides the sign-in interface and may receive standard technical information when that interface loads or when you use it. Google's handling of that information is governed by Google's own terms and privacy policy. Signing out of Spin the Wheel ends the local site session but does not sign you out of Google.</p>
<h2>Information we may receive automatically</h2>
<p>Like most websites, our hosting or infrastructure providers may automatically receive standard technical data when you visit the site. This can include your IP address, browser type, referring page, date and time of access, and similar server-log details. We use this kind of information to operate the site, maintain security, diagnose issues, and understand aggregate traffic patterns—not to build a personal profile of your wheel contents.</p>
<h2>Cookies and similar technologies</h2>
<p>We use essential cookies or local storage needed for basic site functions, such as remembering a theme preference, keeping the wheel editor state, and maintaining a signed-in community session. The community session cookie is HttpOnly, is not available to page scripts, and normally expires after 30 days. If analytics or similar tools are enabled in the future, we will update this policy to describe them clearly. You can control cookies through your browser settings; blocking some storage may limit features such as saving a wheel or posting a comment.</p>
<h2>Sharing of information</h2>
<p>We do not sell your personal information. We do not require an account to use the core Spin the Wheel tool. Google processes information needed to provide Google sign-in, while hosting and database providers may process account and technical data as needed to operate the service.</p>
<h2>Retention and removal</h2>
<p>Account records, public comments, sessions, and anti-abuse hashes may remain stored while the community page operates, unless they are removed or the information is no longer needed for operation, security, or legal obligations. Expired sessions may be deleted automatically. Infrastructure logs follow the retention periods of the relevant hosting provider. You may ask us to review or remove a comment or account by sending the displayed name, approximate posting date, and enough information to verify and identify the request.</p>
<h2>Children’s privacy</h2>
<p>Spin the Wheel is a general-purpose tool and is not directed at children under 13. If you believe a child has provided personal information to us in a way that requires parental consent under applicable law, contact us and we will review the request.</p>
<h2>Your choices</h2>
<p>You can sign out and clear local storage and site data in your browser at any time. This removes the local session and locally saved wheel settings from that browser, but it does not remove an account or public comment stored by the comment service; contact us if you want us to review a removal request. You can also stop using the site. If you contact us by email, we will use your message only to respond to your request and related follow-up.</p>
<h2>International visitors</h2>
<p>The site may be accessed from different countries. Technical processing related to hosting may occur where our providers operate. By using the site, you understand that information described in this policy may be handled in accordance with this notice and applicable law.</p>
<h2>Changes to this policy</h2>
<p>We may update this Privacy Policy from time to time. When we do, we will revise the effective information on this page. Continued use of Spin the Wheel after an update means you should review the revised policy.</p>
<h2>Contact</h2>
<p>If you have questions about this Privacy Policy, email us at <a href="mailto:wyong@spinanywheel.com">wyong@spinanywheel.com</a>.</p>
`.trim(),
  },
  {
    id: "terms-of-service",
    updatedDate: "2026-08-06",
    bodyHtml: `
<p>These Terms of Service (“Terms”) govern your use of Spin the Wheel, a free online random picker and decision tool. By accessing or using the site, you agree to these Terms. If you do not agree, please do not use the site.</p>
<h2>What Spin the Wheel provides</h2>
<p>Spin the Wheel lets you create custom lists, style a wheel, organize Turn Queue activities, spin for a random result, and reuse templates and guides. Features may change as we improve the product. The service is provided for personal, educational, entertainment, classroom, event, and similar lawful uses.</p>
<h2>No account required for the wheel</h2>
<p>You can use the core tool without registering or signing in. Settings and lists are typically kept in your browser. A supported account is required to post public comments. You are responsible for backing up any lists that matter to you, because clearing browser data or switching devices can remove locally stored content.</p>
<h2>Acceptable use</h2>
<p>You agree not to misuse the site. That includes attempts to disrupt the service, reverse engineer systems beyond what the law allows, overload infrastructure, upload unlawful content, harass others, or use the wheel to run activities that violate applicable laws or third-party rights. You are responsible for the options and images you place on a wheel, especially when projecting or sharing results in public or classroom settings.</p>
<h2>Fairness and randomness</h2>
<p>Spin the Wheel is designed to pick from the options currently shown on your wheel using browser-based random selection and the fairness mode you choose. We do not guarantee outcomes for contests, regulated lotteries, gambling, or any use that requires certified randomness or independent auditing. If you run a giveaway or formal draw, you remain responsible for your rules, eligibility checks, and compliance with local law.</p>
<h2>Intellectual property</h2>
<p>The Spin the Wheel name, site design, code, templates, and guides are protected by intellectual property laws. You may use the site for its intended purpose. You may not copy the product wholesale, scrape content for competing services, or remove branding in a misleading way. Content you enter remains your responsibility; do not upload material you do not have rights to use.</p>
<h2>Third-party links and tools</h2>
<p>The site may link to templates, guides, or other websites. We are not responsible for third-party sites or services. Your use of those destinations is governed by their own terms and policies.</p>
<h2>Disclaimer of warranties</h2>
<p>Spin the Wheel is provided on an “as is” and “as available” basis. To the fullest extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the site will be uninterrupted, error-free, or free of harmful components.</p>
<h2>Limitation of liability</h2>
<p>To the fullest extent permitted by law, Spin the Wheel and its operators will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data, profits, or goodwill, arising from your use of the site. Some jurisdictions do not allow certain limitations; in those cases, our liability is limited to the maximum extent permitted.</p>
<h2>Changes and termination</h2>
<p>We may update these Terms or modify, suspend, or discontinue parts of the site. Continued use after changes become effective constitutes acceptance of the updated Terms. We may restrict access if we reasonably believe these Terms have been violated.</p>
<h2>Contact</h2>
<p>Questions about these Terms can be sent to <a href="mailto:wyong@spinanywheel.com">wyong@spinanywheel.com</a>.</p>
`.trim(),
  },
  {
    id: "copyright",
    updatedDate: "2026-08-06",
    bodyHtml: `
<p>This Copyright page describes ownership of materials on Spin the Wheel and how to reach us about copyright concerns.</p>
<h2>Ownership</h2>
<p>Unless otherwise stated, the Spin the Wheel website—including its name, logos, layout, interface design, original text, templates presentation, and software—is owned by Spin the Wheel or used under license. All rights not expressly granted are reserved.</p>
<h2>Permitted use</h2>
<p>You may access the site and use the wheel tool for personal, classroom, team, event, and similar lawful purposes. You may share links to public pages on the site. You may not republish substantial portions of our guides or product interface as your own product, mirror the site, or use our branding in a way that suggests affiliation or endorsement without permission.</p>
<h2>User-provided content</h2>
<p>Options, prompts, images, and other materials you add to a wheel remain your responsibility. By uploading or entering content, you represent that you have the rights needed to use that content in the tool and to display it to anyone with whom you share a screen or link. Do not upload copyrighted images or text you are not allowed to use.</p>
<h2>Third-party materials</h2>
<p>Some fonts, libraries, or assets used to operate the site may be subject to their own licenses. Those materials remain the property of their respective owners and are used according to applicable license terms.</p>
<h2>Copyright complaints</h2>
<p>If you believe material on Spin the Wheel infringes your copyright, please email <a href="mailto:wyong@spinanywheel.com">wyong@spinanywheel.com</a> with:</p>
<ul>
<li>a description of the copyrighted work;</li>
<li>the URL or location of the material you believe is infringing;</li>
<li>your contact information;</li>
<li>a statement that you have a good-faith belief the use is not authorized; and</li>
<li>a statement, under penalty of perjury where applicable, that the information in your notice is accurate and that you are the owner or authorized to act for the owner.</li>
</ul>
<p>We will review complete notices and take appropriate action, which may include removing or disabling access to the material at issue.</p>
<h2>Trademark note</h2>
<p>Product and company names mentioned on the site may be trademarks of their respective owners. Mention does not imply endorsement unless explicitly stated.</p>
`.trim(),
  },
  {
    id: "about-us",
    updatedDate: "2026-08-06",
    bodyHtml: `
<p>Spin the Wheel is a free online random picker built for moments when a list needs a fair, visible result. We focus on a simple idea: put the options everyone accepts on one wheel, style it for the room, and let people watch the same spin together.</p>
<h2>What we care about</h2>
<p>People use wheels for dinner plans, classroom participation, team roles, party prompts, chore rotations, workouts, and giveaways. Those situations need clarity more than spectacle. That is why we invest in editable lists, readable labels, shareable setups, visible option weights, and Turn Queue play for activities that need an ordered rotation.</p>
<h2>How the product works</h2>
<p>You can start from the home wheel or open a template, then edit options, weights, colors, slice styles, pointer, rim, lights, and stage backgrounds. Spins run in your browser. Entries and settings can be saved locally so you can return to the same list without creating an account. Templates and guides exist to help you move from a blank page to a useful session faster.</p>
<h2>Our approach to trust</h2>
<p>We believe a random picker should be easy to understand. The active mode stays visible, winners can be removed when your rules require it, and recent results remain available during a session. We do not claim certified lottery-grade randomness for regulated draws. For classroom and casual use, transparency and good list hygiene matter most.</p>
<h2>Who it is for</h2>
<p>Teachers, facilitators, streamers, party hosts, families, and teams all use the same core tool in different ways. If you need a starter list, browse templates. If you want better habits around decisions or classroom spins, read the Spin the Wheel Guide.</p>
<h2>Get in touch</h2>
<p>Feedback, partnership questions, and general inquiries are welcome at <a href="mailto:wyong@spinanywheel.com">wyong@spinanywheel.com</a>. We read messages carefully and respond when we can.</p>
`.trim(),
  },
  {
    id: "contact-us",
    updatedDate: "2026-08-06",
    bodyHtml: `
<p>We are glad you reached the Contact Us page. Spin the Wheel is a lightweight product, so we keep support simple and text-based—no account portal and no contact form required.</p>
<h2>Email</h2>
<p>Write to us at <a href="mailto:wyong@spinanywheel.com">wyong@spinanywheel.com</a>. Please include enough detail for us to help, such as the page URL, what you were trying to do, and the browser or device you used when something did not work as expected.</p>
<h2>What to email us about</h2>
<ul>
<li>Privacy questions related to local storage or this site</li>
<li>Copyright or branding concerns</li>
<li>Product feedback and feature ideas</li>
<li>Template or guide corrections</li>
<li>Partnership or educational-use questions</li>
</ul>
<h2>Response expectations</h2>
<p>We aim to reply within a reasonable time, but response speed can vary with volume. Urgent legal notices should include “Copyright” or “Privacy” in the subject line so they are easier to prioritize.</p>
<h2>Before you write about a bug</h2>
<p>Try refreshing the page, confirming you have at least two options on the wheel, and checking whether browser extensions are modifying the page. If a saved wheel looks unexpected, remember that lists are stored in the current browser and do not sync across devices by default.</p>
<h2>Mailing address</h2>
<p>Spin the Wheel is operated online. For correspondence that must be sent by email only, use <a href="mailto:wyong@spinanywheel.com">wyong@spinanywheel.com</a>.</p>
`.trim(),
  }
];

export function getLegalPage(id: string) {
  return LEGAL_PAGES.find((page) => page.id === id);
}
