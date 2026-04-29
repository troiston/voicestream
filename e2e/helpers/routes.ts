import { getAllPostSlugs } from "../../src/lib/content";

/** Rotas públicas alinhadas com `src/app/sitemap.ts` (paths relativos ao site). */
export const SITEMAP_STATIC_PATHS: readonly string[] = [
  "",
  "/pricing",
  "/about",
  "/contact",
  "/blog",
  "/changelog",
  "/security",
  "/cookies",
  "/privacy",
  "/terms",
  "/styleguide",
];

/** Auth e páginas públicas fora do sitemap. */
export const EXTRA_PUBLIC_PATHS: readonly string[] = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/reset-password?token=mock",
  "/verify-email",
  "/mfa",
];

/** Rotas da área autenticada (exigem cookie de sessão mock). */
export const APP_AUTHENTICATED_PATHS: readonly string[] = [
  "/dashboard",
  "/spaces",
  "/spaces/sp_1",
  "/capture",
  "/tasks",
  "/integrations",
  "/billing",
  "/usage",
  "/team",
  "/settings",
  "/onboarding",
];

export function getBlogPostPaths(): string[] {
  return getAllPostSlugs().map((slug) => `/blog/${slug}`);
}

export function getAllPublicSmokePaths(): string[] {
  return [...SITEMAP_STATIC_PATHS, ...getBlogPostPaths(), ...EXTRA_PUBLIC_PATHS];
}
