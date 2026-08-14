import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { formatPublishDate, getBlogPosts } from "@/lib/blog";
import { JsonLd } from "@/seo/JsonLd";
import { getStaticSitemapRoute } from "@/seo/routes";
import { getPageTdk } from "@/seo/tdk";
import { itemListSchema, webPageSchema } from "@/seo/structuredData";
import styles from "@/style/page/blog/BlogPage.module.css";

const blogTdk = getPageTdk("blog");
const blogRoute = getStaticSitemapRoute("/blog");

export function BlogPage() {
  const posts = getBlogPosts();
  const schemas = [
    webPageSchema({
      name: blogTdk.title,
      description: blogTdk.description,
      path: "/blog",
      dateModified: blogRoute.lastModified,
      type: "CollectionPage",
    }),
    itemListSchema(
      "Spin the Wheel blog",
      posts.map((post) => ({
        name: post.title,
        path: `/blog/${post.addressBar}`,
        image: post.imageUrl,
      })),
    ),
  ];

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Practical setup guides for real wheel sessions"
        title="Spin the Wheel Blog - Practical Setup and Play Guides"
        description={blogTdk.description}
        actions={
          <>
            <a href="#blog-posts" className={styles["hero-primary"]}>Read the blog</a>
            <Link href="/#wheel-game" className={styles["hero-secondary"]}>Open the wheel</Link>
          </>
        }
        aside={
          <aside className={styles["hero-card"]} aria-label="Featured blog articles">
            <p className={styles["hero-card-label"]}>Start with your session</p>
            <h2>Set up the wheel with confidence</h2>
            <p className={styles["hero-card-intro"]}>
              Follow the current editor from list preparation to the finished
              result, with exact formats and limits where they matter.
            </p>
            <ul className={styles["hero-article-list"]}>
              {posts.slice(0, 2).map((post) => (
                <li key={post.id}>
                  <Link href={`/blog/${post.addressBar}`}>
                    <span>{post.category} · {post.readTime}</span>
                    <strong>{post.title}</strong>
                    <ArrowIcon />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        }
      />

      <section id="blog-posts" className={styles["post-list-section"]}>
        <div className="container">
          <div className={styles["post-list"]}>
            {posts.map((post, index) => (
              <article key={post.id} className={styles["post-row"]}>
                <Link href={`/blog/${post.addressBar}`} className={styles["post-link"]}>
                  <div className={styles["post-art"]}>
                    <Image
                      src={post.imageUrl}
                      alt={post.imageAlt}
                      width={720}
                      height={480}
                      preload={index === 0}
                    />
                  </div>
                  <div className={styles["post-copy"]}>
                    <div className={styles["post-meta"]}>
                      <span>{post.category}</span>
                      <span>{formatPublishDate(post.publishDate)}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h2>{post.title}</h2>
                    <p>{post.intro}</p>
                    <strong>Read the article <ArrowIcon /></strong>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles["blog-cta-section"]}>
        <div className="container">
          <div className={styles["blog-cta-content"]}>
            <div>
              <h2>Put an idea into practice</h2>
              <p>Open the free wheel, load your options, and spin.</p>
            </div>
            <Link href="/#wheel-game">Open the wheel <ArrowIcon /></Link>
          </div>
        </div>
      </section>
      <JsonLd data={schemas} />
    </main>
  );
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>;
}
