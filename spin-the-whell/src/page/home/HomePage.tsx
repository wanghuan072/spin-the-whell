import Image from "next/image";
import Link from "next/link";
import { WheelGame } from "@/features/wheel/components/WheelGame";
import { absoluteUrl } from "@/config/site";
import homeContentData from "@/data/home/home.json";
import { getHomeTemplates } from "@/lib/templates";
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

const capabilityItems = [
  { code: "LIST", label: "Excel import" },
  { code: "QUEUE", label: "Classic + Turn Queue" },
  { code: "MODES", label: "Visible weights" },
  { code: "RESULTS", label: "CSV results" },
  { code: "SESSION", label: "Saved locally" },
  { code: "TOOLS", label: "Fullscreen" },
];

export function HomePage() {
  const templates = getHomeTemplates();
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
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              <ShieldMiniIcon />
              No sign-in needed · Saved locally
            </p>
            <h1 className={styles.brand}>
              <span>Spin the Wheel</span>
              <span>for names, choices &amp; prize rounds</span>
            </h1>
            <p className={styles.heroLead}>
              Paste a list, choose or plan a series, then spin. Adjust odds, colors,
              stage, and timing — all in your browser. No account required.
            </p>
            <div className={styles.heroActions}>
              <a href="#wheel-game" className={styles.btnPrimary}>
                <BoltIcon /> Try the live wheel
              </a>
              <Link href="/templates" className={styles.btnGhost}>
                <TemplateIcon /> Browse templates
              </Link>
              <Link href="/comments" className={styles.btnGhost}>
                <CommentIcon /> Leave a comment
              </Link>
            </div>
          </div>
          <HeroChoiceGraphic />
        </div>
      </section>

      <section className={styles.capabilityBar} aria-label="Wheel capabilities">
        <div className={`container ${styles.capabilityGrid}`}>
          {capabilityItems.map((item) => (
            <div key={item.label}>
              <Pictogram name={item.code} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="wheel-game" className={styles.editor}>
        <div className="container">
          <div className={styles.editorShell}>
            <div className={styles.editorIntro}>
              <div>
                <p className={styles.kicker}>Build yours</p>
                <h2>Set up the wheel your way</h2>
              </div>
              <p>
                Add choices on the left, make it yours on the right, then spin from the center.
              </p>
            </div>
            <div className={styles.editorFrame}>
              <WheelGame title="Spin the Wheel" />
            </div>
          </div>
        </div>
      </section>

      <section id="templates" className={styles.templates}>
        <div className="container">
          <header className={`${styles.sectionHead} ${styles.sectionHeadRow}`}>
            <div>
              <p className={styles.kicker}>Popular starting points</p>
              <h2>Pick a ready-made wheel</h2>
            </div>
            <Link href="/templates" className={styles.textLink}>View all templates <ArrowIcon /></Link>
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
                    src={template.cardImageUrl}
                    alt={template.imageAlt}
                    width={420}
                    height={280}
                  />
                </div>
                <div className={styles.templateBody}>
                  <h3>{template.title}</h3>
                  <p>{template.description}</p>
                  <span>Use template <ArrowIcon /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className={styles.features}>
        <div className={`container ${styles.featureStrip}`}>
          {features.map((feature) => (
            <article key={feature.code}>
              <div className={styles.bentoIcon} aria-hidden="true">
                <Pictogram name={feature.code} />
              </div>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.summarySection}>
        <div className={`container ${styles.summaryGrid}`}>
          <article className={`${styles.summaryCard} ${styles.modes}`}>
            <header>
              <p className={styles.kicker}>Choose your flow</p>
              <h2>Two ways to play</h2>
            </header>
            <div className={styles.modeGrid}>
              {modeExamples.map((item) => (
                <section key={item.code} className={styles.modeCard}>
                  <div className={styles.modeTop}>
                    <div className={styles.whyIcon} aria-hidden="true"><Pictogram name={item.code} /></div>
                    <p className={styles.bentoLabel}>{item.label}</p>
                  </div>
                  <h3>{item.title}</h3>
                  <p className={styles.modeCopy}>{item.copy}</p>
                  {item.points?.length ? (
                    <ul className={styles.modePoints}>
                      {item.points.map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  ) : null}
                  {item.facts?.length ? (
                    <dl className={styles.modeFacts}>
                      {item.facts.map((fact) => (
                        <div key={fact.label}>
                          <dt>{fact.label}</dt>
                          <dd>{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {item.href ? (
                    <Link href={item.href} className={styles.modeLink}>Open example <ArrowIcon /></Link>
                  ) : null}
                </section>
              ))}
            </div>
            <div className={styles.modeHint}>
              <strong>Not sure which mode to choose?</strong>
              <p>Start with Classic for a quick pick. You can switch to Turn Queue whenever the session needs an ordered plan.</p>
            </div>
          </article>

          <article id="how-to" className={`${styles.summaryCard} ${styles.how}`}>
            <header>
              <p className={styles.kicker}>Simple by design</p>
              <h2>From your list to a result</h2>
            </header>
            <ol className={styles.howList}>
              {howSteps.map((step) => (
                <li id={`step-${step.number}`} key={step.number} className={styles.howItem}>
                  <div className={styles.howNum}><strong>{step.number}</strong></div>
                  <div>
                    <p className={styles.bentoLabel}>{step.label}</p>
                    <h3>{step.title}</h3>
                    <p>{step.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
            <a href="#wheel-game" className={styles.inlineCta}>Open the live wheel <ArrowIcon /></a>
          </article>

          <section id="faq" className={`${styles.summaryCard} ${styles.faq}`}>
            <header>
              <p className={styles.kicker}>Quick answers</p>
              <h2>FAQ</h2>
            </header>
            <div className={styles.faqGrid}>
              {faqItems.map((item, index) => (
                <article key={item.question} className={styles.faqItem}>
                  <span className={styles.faqNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section id="fairness-note" className={styles.trust}>
        <div className={`container ${styles.trustInner}`}>
          <div className={styles.trustMark} aria-hidden="true"><ShieldIcon /></div>
          <div>
            <p className={styles.kicker}>Private by default</p>
            <h2>Your list and history stay in this browser</h2>
            <p>
              Results use the browser&apos;s random generator and the visible weights you set.
              Share carries the setup, while your winner history stays local.
            </p>
          </div>
          <dl className={styles.trustFacts}>
            <div><dt>Choices</dt><dd>Up to 100</dd></div>
            <div><dt>Modes</dt><dd>Classic + Queue</dd></div>
            <div><dt>Records</dt><dd>CSV export</dd></div>
          </dl>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={`container ${styles.finalInner}`}>
          <div className={styles.ideaIcon} aria-hidden="true">✦</div>
          <div>
            <h2>Have a better template idea?</h2>
            <p>Tell us what you&apos;d love to see next.</p>
          </div>
          <Link href="/comments#leave-a-comment" className={styles.btnPrimary}>
            Leave a suggestion <ArrowIcon />
          </Link>
        </div>
      </section>

      <JsonLd data={[pageSchema, wheelAppSchema, howToSchema, faqSchema]} />
    </main>
  );
}

function HeroChoiceGraphic() {
  const choices = [
    { label: "Alex", icon: "●", className: styles.choiceAlex },
    { label: "Bella", icon: "●", className: styles.choiceBella },
    { label: "Chris", icon: "●", className: styles.choiceChris },
    { label: "Pizza", icon: "△", className: styles.choicePizza },
    { label: "Movie night", icon: "▣", className: styles.choiceMovie },
    { label: "Prize", icon: "□", className: styles.choicePrize },
  ];

  return (
    <div className={styles.heroGraphic} aria-hidden="true">
      <svg className={styles.choicePath} viewBox="0 0 620 470" fill="none">
        <path d="M115 94C224 36 307 94 256 181C207 264 326 285 430 220C526 160 563 260 493 329C418 403 295 391 238 319C185 252 113 258 97 190C84 136 121 101 115 94Z" />
        <path d="M488 103c54 13 81 54 70 99" />
      </svg>
      {choices.map((choice) => (
        <div key={choice.label} className={`${styles.choiceCard} ${choice.className}`}>
          <span>{choice.icon}</span>{choice.label}
        </div>
      ))}
      <div className={styles.selectedCard}>
        <span>★</span>
        <strong>Selected!</strong>
      </div>
      <div className={styles.cursorHand}>↖</div>
      <div className={styles.trophy}>🏆</div>
      <span className={`${styles.sparkle} ${styles.sparkleOne}`}>✦</span>
      <span className={`${styles.sparkle} ${styles.sparkleTwo}`}>✧</span>
      <span className={`${styles.sparkle} ${styles.sparkleThree}`}>★</span>
    </div>
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

function TemplateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <rect x="4" y="3" width="16" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 8h8M8 12h5M8 16h8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path d="M5 5h14v11H9l-4 3V5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 10h.01M12 10h.01M15 10h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ShieldMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path d="m12 3 7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9 12 2 2 4-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
    case "MODES":
      return <svg {...common}><circle cx="24" cy="24" r="14" /><path d="M24 12v12l8 5" /></svg>;
    case "SESSION":
      return <svg {...common}><rect x="8" y="12" width="32" height="24" rx="3" /><path d="M14 20h12M14 26h20" /><circle cx="34" cy="32" r="6" /><path d="M34 29v6m-3-3h6" /></svg>;
    case "CLASSIC":
      return <svg {...common}><circle cx="24" cy="24" r="14" /><path d="M24 12v12l9 5" /></svg>;
    default:
      return <svg {...common}><circle cx="24" cy="24" r="14" /></svg>;
  }
}
