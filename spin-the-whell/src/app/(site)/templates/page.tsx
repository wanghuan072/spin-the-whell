import type { Metadata } from "next";
import { TemplatesPage } from "@/page/templates/TemplatesPage";
import { createMetadata } from "@/seo/metadata";
import { getPageTdk } from "@/seo/tdk";

const tdk = getPageTdk("templates");

export const metadata: Metadata = createMetadata({
  ...tdk,
  path: "/templates",
});

export default function Page() {
  return <TemplatesPage />;
}
