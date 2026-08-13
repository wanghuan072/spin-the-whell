import type { SeoRecord } from "@/types/seo";

export type BlogPost = {
  id: number;
  title: string;
  intro: string;
  publishDate: string;
  updatedDate: string;
  author: string;
  category: string;
  readTime: string;
  imageUrl: string;
  imageAlt: string;
  addressBar: string;
  seo: SeoRecord;
  detailsHtml: string;
};
