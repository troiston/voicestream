import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/content";
import { getPublicSiteUrl } from "@/lib/public-site-url";

const STATIC: ReadonlyArray<{
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[0]["changeFrequency"]>;
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/changelog", changeFrequency: "weekly", priority: 0.6 },
  { path: "/security", changeFrequency: "monthly", priority: 0.6 },
  { path: "/cookies", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/styleguide", changeFrequency: "monthly", priority: 0.3 },
];

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getPublicSiteUrl();
  const lastModified = new Date();

  const fromStatic: MetadataRoute.Sitemap = STATIC.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const fromBlog: MetadataRoute.Sitemap = getAllPostSlugs().map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return Promise.resolve([...fromStatic, ...fromBlog]);
}
