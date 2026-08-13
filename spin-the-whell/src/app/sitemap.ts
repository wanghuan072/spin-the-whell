import type { MetadataRoute } from "next";
import { LEGAL_PAGES } from "@/config/legal";
import { absoluteUrl } from "@/config/site";
import { getBlogPosts } from "@/lib/blog";
import { getTemplates } from "@/lib/templates";
import { STATIC_SITEMAP_ROUTES } from "@/seo/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = STATIC_SITEMAP_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const templateRoutes: MetadataRoute.Sitemap = getTemplates().map((template) => ({
    url: absoluteUrl(`/templates/${template.addressBar}`),
    lastModified: template.updatedDate,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getBlogPosts().map((post) => ({
    url: absoluteUrl(`/blog/${post.addressBar}`),
    lastModified: post.updatedDate,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const legalRoutes: MetadataRoute.Sitemap = LEGAL_PAGES.map((page) => ({
    url: absoluteUrl(`/legal/${page.id}`),
    lastModified: page.updatedDate,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...staticRoutes, ...templateRoutes, ...blogRoutes, ...legalRoutes];
}
