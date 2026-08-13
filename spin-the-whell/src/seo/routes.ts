import type { MetadataRoute } from "next";

export type StaticSitemapRoute = {
  path: string;
  lastModified: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

/**
 * 静态路由的更新时间必须手动维护：只有页面内容或重要 SEO 信息发生变化时才更新。
 * 不使用 new Date() 或构建时间，避免每次部署都向搜索引擎发送错误的新鲜度信号。
 */
export const STATIC_SITEMAP_ROUTES: StaticSitemapRoute[] = [
  { path: "/", lastModified: "2026-08-10", changeFrequency: "weekly", priority: 1 },
  { path: "/templates", lastModified: "2026-08-12", changeFrequency: "monthly", priority: 0.9 },
  { path: "/blog", lastModified: "2026-08-12", changeFrequency: "monthly", priority: 0.7 },
  { path: "/comments", lastModified: "2026-08-12", changeFrequency: "daily", priority: 0.6 },
];

export function getStaticSitemapRoute(path: string) {
  const route = STATIC_SITEMAP_ROUTES.find((item) => item.path === path);
  if (!route) throw new Error(`Missing static sitemap route for "${path}"`);
  return route;
}
