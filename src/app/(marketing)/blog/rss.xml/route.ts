import { getAllPosts } from "@/lib/content";
import { getPublicSiteUrl } from "@/lib/public-site-url";

function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function rfc822Date(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) {
    return new Date().toUTCString();
  }
  return d.toUTCString();
}

export function GET(): Response {
  const base = getPublicSiteUrl();
  const posts = getAllPosts();
  const selfUrl = `${base}/blog/rss.xml`;
  const blogUrl = `${base}/blog`;

  const items = posts
    .map((p) => {
      const url = `${base}/blog/${p.slug}`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${escapeXml(rfc822Date(p.date))}</pubDate>
      <description>${escapeXml(p.description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CloudVoice — Blog</title>
    <link>${escapeXml(blogUrl)}</link>
    <description>Artigos sobre produto, voz e segurança.</description>
    <language>pt-BR</language>
    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
