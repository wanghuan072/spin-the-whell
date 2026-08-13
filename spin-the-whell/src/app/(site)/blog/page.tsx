import type { Metadata } from "next";
import { BlogPage } from "@/page/blog/BlogPage";
import { createMetadata } from "@/seo/metadata";
import { getPageTdk } from "@/seo/tdk";

const tdk = getPageTdk("blog");

export const metadata: Metadata = createMetadata({
  ...tdk,
  path: "/blog",
});

export default function Page() {
  return <BlogPage />;
}
