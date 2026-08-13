import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { TemplatesCatalog } from "@/components/templates/TemplatesCatalog";
import { getTemplates } from "@/lib/templates";
import { JsonLd } from "@/seo/JsonLd";
import { getStaticSitemapRoute } from "@/seo/routes";
import { getPageTdk } from "@/seo/tdk";
import { itemListSchema, webPageSchema } from "@/seo/structuredData";
import styles from "@/style/page/templates/TemplatesPage.module.css";

const templatesTdk = getPageTdk("templates");
const templatesRoute = getStaticSitemapRoute("/templates");

export function TemplatesPage() {
  const templates = getTemplates();
  const sceneCount = new Set(templates.map((template) => template.category)).size;
  const queueCount = templates.filter((template) => template.runMode === "turn-queue").length;
  const schemas = [
    webPageSchema({
      name: templatesTdk.title,
      description: templatesTdk.description,
      path: "/templates",
      dateModified: templatesRoute.lastModified,
      type: "CollectionPage",
    }),
    itemListSchema(
      "Spin the Wheel templates",
      templates.map((template) => ({
        name: template.title,
        path: `/templates/${template.addressBar}`,
        image: template.cardImageUrl,
      })),
    ),
  ];

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Ready-made wheel setup"
        title={templatesTdk.title}
        description={templatesTdk.description}
        actions={
          <>
            <a href="#template-catalog" className={styles["hero-primary"]}>Browse templates</a>
            <Link href="/#wheel-game" className={styles["hero-secondary"]}>Build from scratch</Link>
            <Link href="/comments#leave-a-comment" className={styles["hero-secondary"]}>Suggest a template</Link>
          </>
        }
        aside={
          <ul className={styles["hero-stats"]} aria-label="Template library highlights">
            <li><strong>{templates.length}</strong><span>ready wheel{templates.length === 1 ? "" : "s"}</span></li>
            <li><strong>{sceneCount}</strong><span>scenario{sceneCount === 1 ? "" : "s"}</span></li>
            <li><strong>{queueCount}</strong><span>queue setup{queueCount === 1 ? "" : "s"}</span></li>
          </ul>
        }
      />

      <section id="template-catalog" className={styles["templates-list-section"]}>
        <div className="container">
          <TemplatesCatalog templates={templates} />
        </div>
      </section>

      <section className={styles["templates-cta-section"]}>
        <div className="container">
          <div className={styles["templates-cta-content"]}>
            <div>
              <h2>Need a blank list instead?</h2>
              <p>Start with a blank wheel, or tell me about a useful setup that is missing from the collection.</p>
            </div>
            <div className={styles["templates-cta-actions"]}>
              <Link href="/#wheel-game">Create your own wheel</Link>
              <Link href="/comments#leave-a-comment">Leave a suggestion</Link>
            </div>
          </div>
        </div>
      </section>
      <JsonLd data={schemas} />
    </main>
  );
}
