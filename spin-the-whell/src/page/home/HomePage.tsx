import Image from "next/image";
import Link from "next/link";
import { WheelGame } from "@/features/wheel/components/WheelGame";
import { absoluteUrl } from "@/config/site";
import homeContentData from "@/data/home/home.json";
import { getTemplates } from "@/lib/templates";
import { JsonLd } from "@/seo/JsonLd";
import { getStaticSitemapRoute } from "@/seo/routes";
import { getPageTdk } from "@/seo/tdk";
import { webPageSchema, wheelAppSchema } from "@/seo/structuredData";
import styles from "@/style/page/home/HomePage.module.css";
import type { HomeContent } from "@/types/home";

const homeTdk = getPageTdk("home");
const homeRoute = getStaticSitemapRoute("/");

const {
  faqItems,
  howSteps,
  features,
  modeExamples,
} = homeContentData as HomeContent;

export function HomePage() {
  const templates = getTemplates().slice(0, 8);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to set up and use the wheel",
    description: "Build a list, choose Classic or Turn Queue, style the wheel, then spin and export the results.",
    totalTime: "PT3M",
    step: howSteps.map((step) => ({
      "@type": "HowToStep",
      position: Number(step.number),
      name: step.title,
      text: step.copy,
      url: absoluteUrl(`/#step-${step.number}`),
    })),
  };
  const pageSchema = webPageSchema({
    name: homeTdk.title,
    description: homeTdk.description,
    path: "/",
    dateModified: homeRoute.lastModified,
  });

  return (
    <main id="main-content" className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <p className={styles.kicker}>
            <span className={styles.kickerDot} aria-hidden="true" />
            No sign-in needed to spin · Saved locally
          </p>
          <h1 className={styles.brand}>
            <span>Spin the Wheel</span>
            <span>for names, choices &amp; prize rounds</span>
          </h1>
          <p className={styles.heroLead}>
            Paste a list, use Classic for one result or Turn Queue for a planned series,
            then spin. Adjust the odds, colors, stage, and timing when you need them—no
            account required.
          </p>
          <div className={styles.heroActions}>
            <a href="#wheel-game" className={styles.btnPrimary}>
              <BoltIcon /> Try the live wheel
            </a>
            <Link href="/templates" className={styles.btnGhost}>
              Browse templates
            </Link>
            <Link href="/comments" className={styles.btnGhost}>
              Leave a comment
            </Link>
          </div>
          <ul className={styles.heroChips} aria-label="Quick highlights">
            <li><ChipIcon name="LIST" /> Custom lists &amp; Excel import</li>
            <li><ChipIcon name="QUEUE" /> Classic + Turn Queue</li>
            <li><ChipIcon name="RESULTS" /> Results &amp; CSV export</li>
            <li><ChipIcon name="LOOK" /> Wheel styles &amp; stage</li>
          </ul>
        </div>
      </section>

      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {Array.from({ length: 2 }).map((_, loop) => (
            <p key={loop}>
              <span>No sign-in needed to spin</span>
              <span>Saved locally</span>
              <span>Classic + Turn Queue</span>
              <span>Excel import</span>
              <span>Visible weights</span>
              <span>CSV results</span>
              <span>Fullscreen</span>
            </p>
          ))}
        </div>
      </div>

      <section id="wheel-game" className={styles.editor}>
        <div className="container">
          <div className={styles.editorIntro}>
            <p className={styles.kicker}>Build yours</p>
            <h2>Set up the wheel on this page</h2>
            <p>
              Build the list on the left, style the wheel and stage on the right, and use
              the toolbar for sound, timing, fullscreen, sharing, or reset.
            </p>
          </div>
          <div className={styles.editorFrame}>
            <WheelGame title="Spin the Wheel" />
          </div>
        </div>
      </section>

      <section id="templates" className={styles.templates}>
        <div className="container">
          <header className={`${styles.sectionHead} ${styles.sectionHeadRow}`}>
            <div>
              <p className={styles.kicker}>Ready-made setups</p>
              <h2>Start with the event raffle setup</h2>
              <p>
                The template library is being rebuilt. For now, open the event raffle,
                replace the sample names and prize tiers, then adjust the style to suit the room.
              </p>
            </div>
            <Link href="/templates" className={styles.btnGhost}>View all templates</Link>
          </header>
          <div className={styles.templateGrid}>
            {templates.map((template) => (
              <Link
                key={template.id}
                href={`/templates/${template.addressBar}`}
                className={styles.templateCard}
              >
                <div className={styles.templateImage}>
                  <Image
                    src={template.imageUrl}
                    alt={template.imageAlt}
                    width={420}
                    height={280}
                  />
                </div>
                <div className={styles.templateBody}>
                  <small>{template.category}</small>
                  <h3>{template.title}</h3>
                  <span>Use this wheel <ArrowIcon /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className={styles.features}>
        <div className="container">
          <header className={styles.sectionHead}>
            <p className={styles.kicker}>Controls at a glance</p>
            <h2>Options on the left. Style on the right.</h2>
            <p>
              The left side controls entries and results. The right side controls how the
              wheel and stage look. The toolbar handles the session itself.
            </p>
          </header>
          <div className={styles.bento}>
            {features.map((feature) => (
              <article
                key={feature.code}
                className={`${styles.bentoCard} ${feature.span === "wide" ? styles.bentoWide : ""}`}
              >
                <div className={styles.bentoIcon} aria-hidden="true">
                  <Pictogram name={feature.code} />
                </div>
                <p className={styles.bentoLabel}>{feature.label}</p>
                <h3>{feature.title}</h3>
                <p className={styles.bentoCopy}>{feature.copy}</p>
              </article>
            ))}
          </div>
          <header className={`${styles.sectionHead} ${styles.modeSectionHead}`}>
            <p className={styles.kicker}>Two ways to play</p>
            <h2>Classic or Turn Queue?</h2>
            <p>
              Use Classic for a single choice. Use Turn Queue when people, teams, or prize
              tiers need a planned number of spins.
            </p>
          </header>
          <div className={styles.modeGrid}>
            {modeExamples.map((item, index) => (
              <article
                key={item.code}
                className={`${styles.modeCard} ${index === 0 ? styles.modeClassic : styles.modeQueue}`}
              >
                <div className={styles.modeTop}>
                  <div className={styles.whyIcon} aria-hidden="true">
                    <Pictogram name={item.code} />
                  </div>
                  <p className={styles.bentoLabel}>{item.label}</p>
                </div>
                <h3>{item.title}</h3>
                <p className={styles.modeCopy}>{item.copy}</p>
                {item.points && item.points.length > 0 ? (
                  <ul className={styles.modePoints}>
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
                {item.href ? (
                  <Link href={item.href} className={styles.modeLink}>
                    Open example template <ArrowIcon />
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-to" className={styles.how}>
        <div className="container">
          <header className={styles.sectionHead}>
            <p className={styles.kicker}>A simple four-step flow</p>
            <h2>From your list to a result</h2>
            <p>
              Prepare the list, state the repeat and redraw rules, and then let the wheel
              show the result.
            </p>
          </header>
          <ol className={styles.howList}>
            {howSteps.map((step) => (
              <li id={`step-${step.number}`} key={step.number} className={styles.howItem}>
                <div className={styles.howNum}>
                  <span>Step</span>
                  <strong>{step.number}</strong>
                </div>
                <div>
                  <p className={styles.bentoLabel}>{step.label}</p>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              </li>
            ))}
          </ol>
          <a href="#wheel-game" className={styles.inlineCta}>
            <BoltIcon /> Back to the live wheel <ArrowIcon />
          </a>
        </div>
      </section>

      <section id="fairness-note" className={styles.trust}>
        <div className={`container ${styles.trustInner}`}>
          <div className={styles.trustMark} aria-hidden="true"><ShieldIcon /></div>
          <div>
            <p className={styles.kicker}>What stays private</p>
            <h2>Your list and history stay in this browser</h2>
            <p>
              Results use the browser&apos;s random generator and the visible weights you set.
              Lists and history stay local. For a formal giveaway, publish separate rules
              and use a system that meets the requirements of your event.
            </p>
          </div>
          <dl className={styles.trustFacts}>
            <div><dt>Choices</dt><dd>2–100 options</dd></div>
            <div><dt>Modes</dt><dd>Classic or Turn Queue</dd></div>
            <div><dt>Records</dt><dd>CSV from Results</dd></div>
          </dl>
        </div>
      </section>

      <section id="faq" className={styles.faq}>
        <div className={`container ${styles.faqInner}`}>
          <div className={styles.faqIntro}>
            <p className={styles.kicker}>FAQ</p>
            <h2>Common questions before you spin</h2>
            <p>Odds, modes, imports, saved data, and what a shared link contains.</p>
            <a href="#wheel-game" className={styles.btnGhost}>Open the wheel</a>
          </div>
          <div className={styles.faqList}>
            {faqItems.map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary>
                  <span>{item.question}</span>
                  <i aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={`container ${styles.finalInner}`}>
          <p className={styles.kicker}>Your turn</p>
          <h2>Ready for the first spin?</h2>
          <p>Open the live wheel, or start from the multi-prize event raffle setup.</p>
          <div className={styles.heroActions}>
            <a href="#wheel-game" className={styles.btnPrimary}>
              <BoltIcon /> Spin the wheel
            </a>
            <Link href="/templates/event-raffle-wheel" className={styles.btnGhost}>
              Try the event raffle wheel
            </Link>
          </div>
        </div>
      </section>

      <JsonLd data={[pageSchema, wheelAppSchema, howToSchema, faqSchema]} />
    </main>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path d="m13 2-8 12h6l-1 8 9-13h-6Z" fill="currentColor" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 5 54 13v16c0 15-9 25-22 30C19 54 10 44 10 29V13L32 5Z" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="m21 31 7 7 15-16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChipIcon({ name }: { name: string }) {
  return (
    <span className={styles.chipIcon} aria-hidden="true">
      <Pictogram name={name} />
    </span>
  );
}

function Pictogram({ name }: { name: string }) {
  const common = {
    className: styles.pictogram,
    viewBox: "0 0 48 48",
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "LIST":
      return <svg {...common}><path d="M10 12h28M10 24h28M10 36h18" /><circle cx="38" cy="36" r="4" /></svg>;
    case "QUEUE":
      return <svg {...common}><rect x="8" y="10" width="32" height="28" rx="4" /><path d="M14 18h12M14 24h20M14 30h10" /></svg>;
    case "RESULTS":
      return <svg {...common}><path d="M12 8h24v10c0 10-5 16-12 16S12 28 12 18V8Z" /><path d="M18 40h12M24 34v6" /></svg>;
    case "ADVANCED":
      return <svg {...common}><circle cx="24" cy="24" r="8" /><path d="M24 8v4M24 36v4M8 24h4M36 24h4M12 12l3 3M33 33l3 3M36 12l-3 3M15 33l-3 3" /></svg>;
    case "LOOK":
      return <svg {...common}><circle cx="24" cy="24" r="14" /><circle cx="24" cy="24" r="5" /><path d="M24 10v6" /></svg>;
    case "STAGE":
      return <svg {...common}><path d="M6 34h36L36 18H12L6 34Z" /><path d="M18 18V12h12v6" /></svg>;
    case "TOOLS":
      return <svg {...common}><path d="M14 34 34 14" /><path d="M20 12h4l12 12-4 4-12-12V12Z" /><circle cx="14" cy="34" r="5" /></svg>;
    case "CONTROL":
      return <svg {...common}><path d="M8 14h32M8 24h32M8 34h32" /><circle cx="18" cy="14" r="3.5" fill="currentColor" stroke="none" /><circle cx="30" cy="24" r="3.5" fill="currentColor" stroke="none" /><circle cx="22" cy="34" r="3.5" fill="currentColor" stroke="none" /></svg>;
    case "MODES":
      return <svg {...common}><circle cx="24" cy="24" r="14" /><path d="M24 12v12l8 5" /></svg>;
    case "CARDS":
      return <svg {...common}><rect x="10" y="12" width="18" height="24" rx="3" /><rect x="20" y="10" width="18" height="24" rx="3" /></svg>;
    case "SESSION":
      return <svg {...common}><rect x="8" y="12" width="32" height="24" rx="3" /><path d="M14 20h12M14 26h20" /><circle cx="34" cy="32" r="6" /><path d="M34 29v6m-3-3h6" /></svg>;
    case "CLASSIC":
      return <svg {...common}><circle cx="24" cy="24" r="14" /><path d="M24 12v12l9 5" /></svg>;
    case "ABC":
      return <svg {...common}><rect x="8" y="10" width="32" height="26" rx="3" /><path d="m14 28 5-12 5 12m-8-5h6M28 16h6a4 4 0 0 1 0 8h-6v8" /></svg>;
    case "TEAM":
      return <svg {...common}><circle cx="17" cy="16" r="5" /><circle cx="31" cy="16" r="5" /><path d="M8 36c1-7 4-11 9-11s8 4 9 11m6-11c4 0 8 4 9 11" /></svg>;
    case "GIFT":
      return <svg {...common}><rect x="10" y="20" width="28" height="18" rx="2" /><path d="M8 20h32v-5H8zm14 0v23m4-23v23M22 15c-6-1-8-6-5-7s5 4 5 7Zm4 0c6-1 8-6 5-7s-5 4-5 7Z" /></svg>;
    case "DAY":
      return <svg {...common}><rect x="10" y="12" width="28" height="24" rx="3" /><path d="M10 20h28M16 8v8m16-8v8M16 28h6m6 0h6" /></svg>;
    default:
      return <svg {...common}><circle cx="24" cy="24" r="14" /></svg>;
  }
}
