import { CONTACT_EMAIL } from "@/config/legal";
import { absoluteUrl, siteConfig } from "@/config/site";
import type { BlogPost } from "@/types/blog";
import type { WheelTemplate } from "@/types/template";

const organizationId = absoluteUrl("/#organization");
const websiteId = absoluteUrl("/#website");

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": organizationId,
  name: siteConfig.name,
  url: siteConfig.url,
  email: CONTACT_EMAIL,
  logo: absoluteUrl("/icon.svg"),
  description: siteConfig.description,
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": websiteId,
  name: siteConfig.name,
  url: siteConfig.url,
  inLanguage: siteConfig.language,
  description: siteConfig.description,
  publisher: { "@id": organizationId },
};

export const wheelAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": absoluteUrl("/#wheel-app"),
  name: "Spin the Wheel - Free Online Random Picker",
  alternateName: siteConfig.name,
  url: siteConfig.url,
  image: absoluteUrl(siteConfig.ogImage),
  isPartOf: { "@id": websiteId },
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires a modern web browser with JavaScript enabled.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description: siteConfig.description,
};

type WebPageSchemaOptions = {
  name: string;
  description: string;
  path: string;
  dateModified: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
};

export function webPageSchema({
  name,
  description,
  path,
  dateModified,
  type = "WebPage",
}: WebPageSchemaOptions) {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    dateModified,
    inLanguage: siteConfig.language,
    isPartOf: { "@id": websiteId },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(siteConfig.ogImage),
      width: 1200,
      height: 630,
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListSchema(
  name: string,
  items: { name: string; path: string; image?: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
      ...(item.image ? { image: absoluteUrl(item.image) } : {}),
    })),
  };
}

export function templateAppSchema(template: WheelTemplate) {
  const url = absoluteUrl(`/templates/${template.addressBar}`);

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${url}#wheel-template`,
    name: template.title,
    url,
    description: template.seo.description || template.description,
    image: absoluteUrl(template.imageUrl),
    dateModified: template.updatedDate,
    inLanguage: siteConfig.language,
    isPartOf: { "@id": websiteId },
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern web browser with JavaScript enabled.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function articleSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seo?.title || post.title,
    description: post.seo?.description || post.intro,
    datePublished: post.publishDate,
    dateModified: post.updatedDate,
    image: absoluteUrl(post.imageUrl),
    inLanguage: siteConfig.language,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${absoluteUrl(`/blog/${post.addressBar}`)}#webpage`,
    },
    author: {
      "@type": "Organization",
      name: post.author,
      url: absoluteUrl("/legal/about-us"),
    },
    publisher: { "@id": organizationId },
  };
}
