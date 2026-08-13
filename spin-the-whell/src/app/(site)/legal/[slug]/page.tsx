import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalPage, LEGAL_PAGES } from "@/config/legal";
import { LegalPage } from "@/page/legal/LegalPage";
import { createMetadata } from "@/seo/metadata";
import { getLegalTdk } from "@/seo/tdk";

type LegalRouteProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_PAGES.map((page) => ({ slug: page.id }));
}

export async function generateMetadata({ params }: LegalRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPage(slug);
  const tdk = getLegalTdk(slug);
  if (!page || !tdk) return {};

  return createMetadata({
    ...tdk,
    path: `/legal/${page.id}`,
  });
}

export default async function Page({ params }: LegalRouteProps) {
  const { slug } = await params;
  const page = getLegalPage(slug);
  const tdk = getLegalTdk(slug);
  if (!page || !tdk) notFound();

  return <LegalPage page={page} tdk={tdk} />;
}
