import type { ReactNode } from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { JsonLd, organizationJsonLd } from "@/components/seo/jsonld";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const orgName = process.env.NEXT_PUBLIC_APP_NAME ?? "VoiceStream";

  return (
    <>
      <a
        className="sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:not-sr-only focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-foreground"
        href="#main"
      >
        Pular para o conteúdo
      </a>
      <Navbar />
      <main className="flex-1" id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />

      <JsonLd
        id="jsonld-organization"
        data={organizationJsonLd({
          name: orgName,
          url: siteUrl,
          logoUrl: `${siteUrl}/brand/logos/logo-01.png`,
        })}
      />
    </>
  );
}
