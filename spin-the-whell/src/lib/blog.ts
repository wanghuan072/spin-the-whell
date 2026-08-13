import postsData from "@/data/blog/posts.json";
import type { BlogPost } from "@/types/blog";

const posts = postsData as BlogPost[];

export function getBlogPosts() {
  return [...posts].sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

export function getBlogPostBySlug(slug: string) {
  return posts.find((post) => post.addressBar === slug);
}

export function formatPublishDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

