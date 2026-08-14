import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { formatPublishDate, getBlogPosts } from "@/lib/blog";
import { JsonLd } from "@/seo/JsonLd";
import { articleSchema, breadcrumbSchema, webPageSchema } from "@/seo/structuredData";
import styles from "@/style/page/blog/BlogDetailPage.module.css";
import type { BlogPost } from "@/types/blog";

type BlogDetailPageProps = {
  post: BlogPost;
};

type ArticleHeading = {
  id: string;
  label: string;
};

export function BlogDetailPage({ post }: BlogDetailPageProps) {
  const relatedPosts = getBlogPosts().filter((item) => item.id !== post.id).slice(0, 2);
  const articleNavigation = buildArticleNavigation(post.detailsHtml);
  const seoTitle = post.seo?.title || post.title;
  const schemas = [
    webPageSchema({
      name: seoTitle,
      description: post.seo.description || post.intro,
      path: `/blog/${post.addressBar}`,
      dateModified: post.updatedDate,
    }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.addressBar}` },
    ]),
    articleSchema(post),
  ];

  return (
    <main id="main-content">
      <article>
        <PageHero
          eyebrow={`${post.category} · ${post.readTime}`}
          title={post.title}
          description={post.seo?.description || post.intro}
          actions={
            <div className={styles["hero-byline"]}>
              <span aria-hidden="true">S</span>
              <p>
                <strong><Link href="/legal/about-us">{post.author}</Link></strong>
                <span>
                  Published <time dateTime={post.publishDate}>{formatPublishDate(post.publishDate)}</time>
                </span>
                <span>
                  Updated <time dateTime={post.updatedDate}>{formatPublishDate(post.updatedDate)}</time>
                </span>
              </p>
            </div>
          }
          aside={
            <div className={styles["hero-visual"]}>
              <Image src={post.imageUrl} alt={post.imageAlt} width={760} height={520} preload />
            </div>
          }
        />

        <nav className={styles["crumb-bar"]} aria-label="Breadcrumb">
          <div className="container">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li aria-current="page">{post.title}</li>
            </ol>
          </div>
        </nav>

        <section className={styles["article-body-section"]}>
          <div className="container">
            <div className={styles["article-layout"]}>
              <nav className={styles["article-toc"]} aria-label="Article contents">
                <p>Article guide</p>
                <strong>On this page</strong>
                <ol>
                  {articleNavigation.headings.map((heading) => (
                    <li key={heading.id}>
                      <a href={`#${heading.id}`}>{heading.label}</a>
                    </li>
                  ))}
                </ol>
              </nav>

              <div className={styles["article-main"]}>
                <div className={styles["review-note"]}>
                  <strong>How this guide was checked</strong>
                  <p>
                    Updated {formatPublishDate(post.updatedDate)} after checking the steps
                    against the current Options, Queue, Advanced, and Results controls.
                    Examples are for informal sessions; product limits are stated in the guide.
                  </p>
                </div>
            {/* detailsHtml 来自项目内受信任的静态 JSON，不接收用户输入。 */}
                <div
                  className={styles["article-copy"]}
                  dangerouslySetInnerHTML={{ __html: articleNavigation.html }}
                />
              </div>
            </div>
          </div>
        </section>
      </article>

      {relatedPosts.length > 0 && (
        <section className={styles["related-posts-section"]}>
          <div className="container">
            <div className={styles["related-posts-content"]}>
              <div className={styles["section-heading"]}>
                <p>Keep reading</p>
                <h2>More from the Spin the Wheel Blog</h2>
              </div>
              <div className={styles["related-grid"]}>
                {relatedPosts.map((item) => (
                  <Link key={item.id} href={`/blog/${item.addressBar}`} className={styles["related-row"]}>
                    <Image src={item.imageUrl} alt={item.imageAlt} width={520} height={340} />
                    <div>
                      <span>{item.category} · {item.readTime}</span>
                      <h3>{item.title}</h3>
                      <p>{item.intro}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <JsonLd data={schemas} />
    </main>
  );
}

function buildArticleNavigation(detailsHtml: string): {
  html: string;
  headings: ArticleHeading[];
} {
  const headings: ArticleHeading[] = [];
  const seenIds = new Map<string, number>();

  const html = detailsHtml.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (_match, attributes: string, innerHtml: string) => {
      const label = decodeHeadingText(innerHtml.replace(/<[^>]+>/g, "")).trim();
      const slug = label
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || `section-${headings.length + 1}`;
      const usedCount = seenIds.get(slug) ?? 0;
      const id = usedCount === 0 ? slug : `${slug}-${usedCount + 1}`;
      const cleanAttributes = attributes.replace(/\s+id=(?:"[^"]*"|'[^']*')/i, "");

      seenIds.set(slug, usedCount + 1);
      headings.push({ id, label });
      return `<h2${cleanAttributes} id="${id}">${innerHtml}</h2>`;
    },
  );

  return { html, headings };
}

function decodeHeadingText(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
