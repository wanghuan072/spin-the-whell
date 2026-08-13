import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";
import type { SeoRecord } from "@/types/seo";

type MetadataOptions = SeoRecord & {
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export function createMetadata({
  title,
  description,
  keywords,
  path,
  image = siteConfig.ogImage,
  type = "website",
  publishedTime,
  modifiedTime,
}: MetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const socialImage = {
    url: absoluteUrl(image),
    width: 1200,
    height: 630,
    alt: siteConfig.ogImageAlt,
  };

  // Absolute titles avoid doubling the brand via the root layout template
  // (e.g. "Spin the Wheel - … | Spin the Wheel").
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: type === "article"
      ? {
          type: "article",
          title,
          description,
          url: canonical,
          siteName: siteConfig.name,
          locale: siteConfig.locale,
          images: [socialImage],
          ...(publishedTime ? { publishedTime } : {}),
          ...(modifiedTime ? { modifiedTime } : {}),
        }
      : {
          type: "website",
          title,
          description,
          url: canonical,
          siteName: siteConfig.name,
          locale: siteConfig.locale,
          images: [socialImage],
        },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: socialImage.url, alt: socialImage.alt }],
    },
  };
}
