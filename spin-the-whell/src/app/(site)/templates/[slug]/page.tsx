import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTemplateBySlug, getTemplates } from "@/lib/templates";
import { TemplateDetailPage } from "@/page/templates/TemplateDetailPage";
import { createMetadata } from "@/seo/metadata";

type TemplateRouteProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getTemplates().map((template) => ({ slug: template.addressBar }));
}

export async function generateMetadata({ params }: TemplateRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) return {};

  return createMetadata({
    title: template.seo?.title || `Spin the Wheel Template - ${template.title}`,
    description: template.seo?.description || template.description,
    keywords: template.seo?.keywords,
    path: `/templates/${template.addressBar}`,
  });
}

export default async function Page({ params }: TemplateRouteProps) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) notFound();

  return <TemplateDetailPage template={template} />;
}
