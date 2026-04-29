import type { Metadata } from "next";
import { CTA } from "@/components/marketing/CTA";
import { FAQ } from "@/components/marketing/FAQ";
import { Features } from "@/components/marketing/Features";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { LogoBar } from "@/components/marketing/LogoBar";
import { Pricing } from "@/components/marketing/Pricing";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { Testimonials } from "@/components/marketing/Testimonials";
import { JsonLd, breadcrumbListJsonLd } from "@/components/seo/jsonld";

export const metadata: Metadata = {
  title: "CloudVoice — Copiloto de vida por Espaços",
  description:
    "Capture conversas, gere resumos e ações em Espaços para cada contexto da sua vida — trabalho, família, saúde — com privacidade por contexto.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

export default function HomePage() {
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  return (
    <>
      <JsonLd
        id="jsonld-breadcrumbs"
        data={breadcrumbListJsonLd([{ name: "Início", url: `${siteUrl}/` }])}
      />
      <Hero />
      <LogoBar />
      <ProblemSection />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
