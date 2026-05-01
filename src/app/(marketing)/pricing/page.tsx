"use client";

import { useState } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Sparkles } from "lucide-react";
import { JsonLd, breadcrumbListJsonLd, productPricingJsonLd } from "@/components/seo/jsonld";
import { PriceToggle } from "@/components/marketing/price-toggle";
import { FAQ, faqItens } from "./faq-section";

const site = () => process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
const app = process.env.NEXT_PUBLIC_APP_NAME ?? "VoiceStream";

type Tier = {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  priceSuffix: string;
  tagline: string;
  features: string[];
  cta: { label: string; href: string };
  highlighted?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Gratuito",
    monthlyPrice: 0,
    annualPrice: 0,
    priceSuffix: "/mês",
    tagline: "Para experimentar e organizar a vida pessoal num único Espaço.",
    features: [
      "1 Espaço (pessoal ou família)",
      "120 minutos de transcrição/mês",
      "Resumos automáticos e tarefas",
      "Integração com calendário",
    ],
    cta: { label: "Começar grátis", href: "/register" },
  },
  {
    name: "Pro",
    monthlyPrice: 29,
    annualPrice: 23,
    priceSuffix: "/mês",
    tagline: "Para profissionais que vivem entre vários contextos.",
    features: [
      "Espaços ilimitados",
      "1.000 minutos de transcrição/mês",
      "Integrações completas (Google, Slack, Notion)",
      "Exportação de áudio e transcrição",
      "Suporte prioritário por e-mail",
    ],
    cta: { label: "Assinar Pro", href: "/register?plan=pro" },
    highlighted: true,
  },
  {
    name: "Equipe",
    monthlyPrice: 79,
    annualPrice: 63,
    priceSuffix: "/usuário/mês",
    tagline: "Para times pequenos com governança e auditoria.",
    features: [
      "Tudo do Pro",
      "3.000 minutos compartilhados/mês",
      "Papéis e permissões por Espaço",
      "Trilha de auditoria",
      "Relatórios de uso",
    ],
    cta: { label: "Falar com vendas", href: "mailto:vendas@voicestream.com.br" },
  },
  {
    name: "Empresa",
    monthlyPrice: 0,
    annualPrice: 0,
    priceSuffix: "",
    tagline: "Para grandes equipes com SSO, SLA e localização.",
    features: [
      "Volume customizado",
      "SSO/SAML e provisionamento SCIM",
      "SLA com suporte 24/7",
      "Política de retenção customizada",
      "Onboarding dedicado",
    ],
    cta: { label: "Pedir reunião", href: "mailto:vendas@voicestream.com.br" },
  },
];

const compareRows: { label: string; values: [string, string, string, string] }[] = [
  { label: "Espaços", values: ["1", "Ilimitados", "Ilimitados", "Ilimitados"] },
  { label: "Minutos de transcrição/mês", values: ["120", "1.000", "3.000", "Customizado"] },
  { label: "Integrações", values: ["Calendário", "Completas", "Completas", "+API privada"] },
  { label: "Exportação de áudio", values: ["—", "✓", "✓", "✓"] },
  { label: "Papéis e permissões", values: ["—", "—", "✓", "✓"] },
  { label: "Trilha de auditoria", values: ["—", "—", "✓", "✓"] },
  { label: "SSO / SAML", values: ["—", "—", "—", "✓"] },
  { label: "SLA contratual", values: ["—", "—", "—", "24/7"] },
  { label: "Suporte", values: ["Comunidade", "E-mail", "Prioritário", "Gerente dedicado"] },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const s = site();

  const getPrice = (tier: Tier) => {
    if (tier.name === "Gratuito" || tier.name === "Empresa") return "R$ 0";
    const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
    return `R$ ${price}`;
  };

  const getSavingsBadge = (tier: Tier) => {
    if (!isAnnual || tier.name === "Gratuito" || tier.name === "Empresa") return null;
    return <span className="text-xs font-bold text-brand ml-2">Economize 20%</span>;
  };

  return (
    <div>
      <JsonLd
        id="jsonld-bread"
        data={breadcrumbListJsonLd([
          { name: "Início", url: `${s}/` },
          { name: "Preços", url: `${s}/pricing` },
        ])}
      />
      <JsonLd
        id="jsonld-prod"
        data={productPricingJsonLd({
          name: `Planos ${app}`,
          url: `${s}/pricing`,
          description: "Planos e preços em reais (BRL) do VoiceStream.",
          offers: tiers.map((t) => ({
            name: t.name,
            price: String(isAnnual ? t.annualPrice : t.monthlyPrice) || "0",
            priceCurrency: "BRL",
          })),
        })}
      />

      {/* Hero */}
      <section
        className="relative overflow-hidden bg-glow-hero px-4 pt-20 pb-12 sm:px-6 sm:pt-24"
        aria-labelledby="pricing-hero"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            <Sparkles className="h-3 w-3" aria-hidden />
            Preços em reais · Sem cartão para começar
          </span>
          <h1
            id="pricing-hero"
            className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            Planos que crescem{" "}
            <span className="gradient-text">com você</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Comece grátis para organizar sua vida pessoal. Escale para Pro quando vários contextos
            começarem a se misturar. Empresa quando o time precisar de governança.
          </p>
          <div className="mt-8 flex justify-center">
            <PriceToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6" aria-labelledby="plans">
        <h2 className="sr-only" id="plans">Planos disponíveis</h2>
        <ol className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <li
              key={tier.name}
              className={
                tier.highlighted
                  ? "gradient-border relative flex flex-col rounded-[var(--radius-xl)] bg-surface-1 p-6 shadow-lg"
                  : "flex flex-col rounded-[var(--radius-xl)] border border-border/60 bg-surface-1 p-6"
              }
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-xs font-bold text-brand backdrop-blur-sm">
                  Mais popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground min-h-[2.5rem]">{tier.tagline}</p>
              <div className="mt-6">
                <span className={`text-4xl font-extrabold ${tier.highlighted ? "gradient-text" : ""}`}>
                  {getPrice(tier)}
                </span>
                {tier.priceSuffix && (
                  <span className="text-sm text-muted-foreground"> {tier.priceSuffix}</span>
                )}
                {getSavingsBadge(tier)}
              </div>
              <ul className="mt-6 grow space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.cta.href}
                className={`mt-8 block rounded-[var(--radius-md)] py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  tier.highlighted
                    ? "btn-gradient text-white"
                    : "border border-border/60 bg-surface-2 text-foreground hover:bg-surface-3"
                }`}
              >
                {tier.cta.label}
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          30 dias de garantia · Sem taxa de cancelamento · Migração gratuita
        </p>
      </section>

      {/* Comparison table */}
      <section className="border-t border-border/40 bg-surface-1/40" aria-labelledby="compare">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <h2 id="compare" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Compare os <span className="gradient-text">planos</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Tudo que importa, lado a lado. Mude de plano a qualquer momento.
            </p>
          </div>
          <div className="mt-10 overflow-x-auto rounded-[var(--radius-xl)] border border-border/60 bg-surface-1">
            <table className="w-full min-w-[720px] border-collapse text-sm" aria-label="Comparação de planos">
              <caption className="sr-only">Funcionalidades por plano</caption>
              <thead className="sticky top-16 bg-background z-10">
                <tr className="border-b border-border/60">
                  <th scope="col" className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Funcionalidade
                  </th>
                  {tiers.map((t) => (
                    <th
                      key={t.name}
                      scope="col"
                      className={`p-4 text-center text-sm font-semibold ${t.highlighted ? "text-brand" : "text-foreground"}`}
                    >
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? "bg-surface-2/30" : ""}>
                    <th scope="row" className="p-4 text-left font-medium text-muted-foreground">
                      {row.label}
                    </th>
                    {row.values.map((v, idx) => (
                      <td key={idx} className="p-4 text-center text-sm text-foreground">
                        {v === "—" ? (
                          <X className="mx-auto h-4 w-4 text-muted-foreground/40" aria-label="Não incluído" />
                        ) : v === "✓" ? (
                          <Check className="mx-auto h-4 w-4 text-brand" aria-label="Incluído" />
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6" aria-labelledby="pf">
        <h2 id="pf" className="text-center text-3xl font-extrabold tracking-tight">
          Perguntas <span className="gradient-text">sobre preços</span>
        </h2>
        <div className="mt-10">
          <FAQ itens={faqItens} />
        </div>
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">Pronto para experimentar?</p>
          <Link
            href="/register"
            className="btn-gradient glow-accent inline-flex items-center justify-center rounded-[var(--radius-md)] px-7 py-3 text-sm font-semibold"
          >
            Criar conta grátis
          </Link>
        </div>
      </section>
    </div>
  );
}
