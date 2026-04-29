/**
 * URL pública (canonical) para sitemap, robots, JSON-LD, Open Graph, etc.
 * `next build` executa com `NODE_ENV=production` sem `NEXT_PUBLIC_APP_URL`; por isso
 * nunca se deve lançar exceção só com base nisso — usamos Vercel ou fallback local.
 */
export function getPublicSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) {
    return explicit;
  }
  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) {
    return `https://${vercel}`;
  }
  return "http://localhost:3000";
}
