import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/data/blog/posts.json",
);
const posts = JSON.parse(fs.readFileSync(file, "utf8"));

const ordered = posts.map((post) => {
  if ("excerpt" in post) {
    post.intro = post.excerpt;
    delete post.excerpt;
  }
  post.author = "Spin the Wheel Team";
  post.detailsHtml = post.detailsHtml.replace(
    "<h2>Quick checklist</h2>",
    "<h2>Before you spin</h2>",
  );

  return {
    id: post.id,
    title: post.title,
    intro: post.intro,
    publishDate: post.publishDate,
    author: post.author,
    category: post.category,
    readTime: post.readTime,
    imageUrl: post.imageUrl,
    imageAlt: post.imageAlt,
    addressBar: post.addressBar,
    seo: post.seo,
    detailsHtml: post.detailsHtml,
  };
});

if (!ordered[0].detailsHtml.includes("This guide reflects how people actually use")) {
  ordered[0].detailsHtml = ordered[0].detailsHtml.replace(
    "<p>A spinning wheel is most helpful when it settles a real choice.",
    "<p>This guide reflects how people actually use Spin the Wheel for dinner picks, chores, plans, and team decisions. A spinning wheel is most helpful when it settles a real choice.",
  );
}

if (!ordered[1].detailsHtml.includes("These classroom ideas are written for teachers")) {
  ordered[1].detailsHtml = ordered[1].detailsHtml.replace(
    "<p>A classroom spin the wheel can do more than call on a student.",
    "<p>These classroom ideas are written for teachers and facilitators who need a visible, repeatable ritual—not a gimmick. A classroom spin the wheel can do more than call on a student.",
  );
}

fs.writeFileSync(file, `${JSON.stringify(ordered, null, 2)}\n`);
console.log("blog refreshed", ordered.length);
