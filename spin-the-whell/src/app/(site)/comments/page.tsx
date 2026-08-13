import type { Metadata } from "next";
import { CommentsPage } from "@/page/comments/CommentsPage";
import { createMetadata } from "@/seo/metadata";
import { getPageTdk } from "@/seo/tdk";

const tdk = getPageTdk("comments");

export const metadata: Metadata = createMetadata({ ...tdk, path: "/comments" });

export default function Page() {
  return <CommentsPage />;
}
