import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { legalNavigation, type LegalPageContent } from "@/config/legal";
import { JsonLd } from "@/seo/JsonLd";
import { breadcrumbSchema, webPageSchema } from "@/seo/structuredData";
import styles from "@/style/page/legal/LegalPage.module.css";

type LegalTdk = {
  title: string;
  description: string;
  keywords: string[];
};

type LegalPageProps = {
  page: LegalPageContent;
  tdk: LegalTdk;
};

export function LegalPage({ page, tdk }: LegalPageProps) {
  const shortLabel =
    legalNavigation.find((item) => item.href === `/legal/${page.id}`)?.label
    ?? page.id;
  const pageType = page.id === "about-us"
    ? "AboutPage"
    : page.id === "contact-us"
      ? "ContactPage"
      : "WebPage";
  const schemas = [
    webPageSchema({
      name: tdk.title,
      description: tdk.description,
      path: `/legal/${page.id}`,
      dateModified: page.updatedDate,
      type: pageType,
    }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: shortLabel, path: `/legal/${page.id}` },
    ]),
  ];

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Legal"
        title={tdk.title}
        description={tdk.description}
      />

      <nav className={styles["crumb-bar"]} aria-label="Breadcrumb">
        <div className="container">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><span>Legal</span></li>
            <li aria-current="page">{shortLabel}</li>
          </ol>
        </div>
      </nav>

      <section className={styles["legal-body-section"]}>
        <div className={`container ${styles["legal-layout"]}`}>
          <aside className={styles["legal-aside"]}>
            <strong>Legal</strong>
            <ul>
              {legalNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={item.href === `/legal/${page.id}` ? "page" : undefined}
                    className={item.href === `/legal/${page.id}` ? styles["is-active"] : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* bodyHtml 来自项目内受信任的静态配置，不接收用户输入。 */}
          <article
            className={styles["legal-copy"]}
            dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
          />
        </div>
      </section>
      <JsonLd data={schemas} />
    </main>
  );
}
