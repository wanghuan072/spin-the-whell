import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";
import { BlogDetailPage } from "@/page/blog/BlogDetailPage";
import { createMetadata } from "@/seo/metadata";

type BlogRouteProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.addressBar }));
}

export async function generateMetadata({ params }: BlogRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};

  return createMetadata({
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.intro,
    keywords: post.seo?.keywords,
    path: `/blog/${post.addressBar}`,
    type: "article",
    publishedTime: post.publishDate,
    modifiedTime: post.updatedDate,
  });
}

export default async function Page({ params }: BlogRouteProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  return <BlogDetailPage post={post} />;
}
