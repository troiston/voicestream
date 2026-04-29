import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/public-site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/_next/",
          "/api/",
          "/dashboard",
          "/spaces",
          "/capture",
          "/tasks",
          "/integrations",
          "/billing",
          "/usage",
          "/team",
          "/settings",
          "/onboarding",
          "/login",
          "/register",
          "/mfa",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/styleguide",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
