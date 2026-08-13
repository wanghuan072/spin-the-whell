import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { WheelGame } from "@/features/wheel/components/WheelGame";
import { getRelatedTemplates } from "@/lib/templates";
import { JsonLd } from "@/seo/JsonLd";
import { breadcrumbSchema, templateAppSchema, webPageSchema } from "@/seo/structuredData";
import styles from "@/style/page/templates/TemplateDetailPage.module.css";
import type { WheelTemplate } from "@/types/template";

type TemplateDetailPageProps = {
  template: WheelTemplate;
};

export function TemplateDetailPage({ template }: TemplateDetailPageProps) {
  const relatedTemplates = getRelatedTemplates(template, 3);
  const modeLabel = template.runMode === "turn-queue" ? "Turn Queue" : "Classic";
  const schemas = [
    webPageSchema({
      name: template.seo.title,
      description: template.seo.description || template.description,
      path: `/templates/${template.addressBar}`,
      dateModified: template.updatedDate,
    }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Templates", path: "/templates" },
      { name: template.title, path: `/templates/${template.addressBar}` },
    ]),
    templateAppSchema(template),
  ];

  return (
    <main id="main-content">
      <PageHero
        eyebrow={`${modeLabel} · ${template.category}`}
        title={template.title}
        description={template.description}
        actions={
          <>
            <a href="#template-wheel" className={styles["hero-primary"]}>
              Play this wheel <ArrowIcon />
            </a>
            <Link href="/templates" className={styles["hero-secondary"]}>All templates</Link>
          </>
        }
        aside={
          <div className={styles["hero-visual"]}>
            <Image
              src={template.imageUrl}
              alt={template.imageAlt}
              width={640}
              height={420}
              preload
            />
            <div className={styles["hero-meta"]}>
              <span>{modeLabel}</span>
              <span>{template.category}</span>
              <span>{template.entries.length} options</span>
            </div>
          </div>
        }
      />

      <nav className={styles["crumb-bar"]} aria-label="Breadcrumb">
        <div className="container">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/templates">Templates</Link></li>
            <li aria-current="page">{template.title}</li>
          </ol>
        </div>
      </nav>

      <section id="template-wheel" className={styles["template-wheel-section"]}>
        <div className="container">
          <div className={styles["template-wheel-content"]}>
            <div className={styles["section-heading"]}>
              <p>Ready to spin</p>
              <h2>Spin the {template.title}</h2>
              <span>
                {template.runMode === "turn-queue"
                  ? "This preset opens with separate wheel options and an ordered Queue. Read the setup guide below before replacing both lists."
                  : "This preset opens in Classic mode for one clear result. Replace only the options that do not fit your decision."}
              </span>
            </div>
            <WheelGame
              initialEntries={template.entries}
              initialColors={template.colors}
              initialTextColors={template.textColors}
              initialImages={template.entryImages}
              initialBackground={template.background}
              initialPointerStyle={template.pointerStyle}
              initialPointerPosition={template.pointerPosition}
              initialRimStyle={template.rimStyle}
              initialLightsStyle={template.lightsStyle}
              initialStageImage={template.stageImage}
              initialRemoveWinner={template.removeWinner === true}
              initialRunMode={template.runMode}
              initialQueueItems={template.queueItems}
              storageKey={`spin-wheel-template-v8-${template.addressBar}`}
              title={template.title}
            />
          </div>
        </div>
      </section>

      <section className={styles["template-guide-section"]}>
        <div className="container">
          <div className={styles["template-guide-content"]}>
            <aside>
              <p>Preset overview</p>
              <dl className={styles["preset-facts"]}>
                <div><dt>Mode</dt><dd>{modeLabel}</dd></div>
                <div><dt>Scenario</dt><dd>{template.category}</dd></div>
                <div><dt>Options</dt><dd>{template.entries.length}</dd></div>
                {template.runMode === "turn-queue" ? (
                  <div><dt>Queue items</dt><dd>{template.queueItems?.length ?? 0}</dd></div>
                ) : null}
                <div><dt>Remove winner</dt><dd>{template.removeWinner ? "On" : "Off"}</dd></div>
                <div><dt>Dataset</dt><dd>{template.source.scope}</dd></div>
              </dl>
              {template.source.url ? (
                <a href={template.source.url} target="_blank" rel="noreferrer">
                  Check the {template.source.label} source
                </a>
              ) : null}
              <Link href="/templates">Back to the template library</Link>
            </aside>
            <div className={styles["article-column"]}>
              <div className={styles["review-note"]}>
                <strong>How this preset was checked</strong>
                <p>
                  Updated {formatTemplateDate(template.updatedDate)}. {template.reviewSummary}
                  {" "}Source: {template.source.label}, checked {formatTemplateDate(template.source.checkedAt)}.
                </p>
              </div>
              {template.contentImages?.length ? (
                <div className={styles["guide-media-grid"]}>
                  {template.contentImages.map((image) => (
                    <figure key={image.src}>
                      <Image src={image.src} alt={image.alt} width={1120} height={700} />
                      <figcaption>{image.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : null}
              {/* detailsHtml comes from trusted project JSON and never accepts user input. */}
              <article
                className={styles["template-article"]}
                dangerouslySetInnerHTML={{ __html: template.detailsHtml }}
              />
              <div className={styles["template-feedback"]}>
                <div>
                  <strong>Have a better template idea?</strong>
                  <p>Tell me what should go on the wheel, which mode it needs, and how you would use it.</p>
                </div>
                <Link href="/comments#leave-a-comment">Leave a suggestion</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {relatedTemplates.length > 0 ? (
        <section className={styles["related-templates-section"]}>
          <div className="container">
            <div className={styles["related-templates-content"]}>
              <div className={styles["section-heading"]}>
                <p>Keep playing</p>
                <h2>Try another wheel</h2>
              </div>
              <div className={styles["related-grid"]}>
                {relatedTemplates.map((item) => (
                  <Link key={item.id} href={`/templates/${item.addressBar}`}>
                    <Image src={item.cardImageUrl} alt={item.imageAlt} width={480} height={320} />
                    <span>{item.runMode === "turn-queue" ? "Turn Queue" : "Classic"} · {item.category}</span>
                    <h3>{item.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <JsonLd data={schemas} />
    </main>
  );
}

function formatTemplateDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>;
}
