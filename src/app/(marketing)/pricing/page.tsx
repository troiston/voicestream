"use client";
import Link from "next/link";
import { Check, X, Sparkles } from "lucide-react";

import { JsonLd, breadcrumbListJsonLd, productPricingJsonLd } from "@/components/seo/jsonld";
import { FAQ, faqItens } from "./faq-section";
import { BILLING_ADD_ONS, BILLING_PLAN_ORDER, BILLING_PLANS, formatBRLFromCents } from "@/lib/billing/plans";

const site = () => process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
const app = process.env.NEXT_PUBLIC_APP_NAME ?? "VoiceStream";

type CompareRow = {
  label: string;
  values: [string, string, string];
};

const compareRows: CompareRow[] = [
  {
    label: "Espaços",
    values: [
      BILLING_PLANS.free.spaces === "unlimited" ? "Ilimitados" : String(BILLING_PLANS.free.spaces),
      BILLING_PLANS.pro.spaces === "unlimited" ? "Ilimitados" : String(BILLING_PLANS.pro.spaces),
      BILLING_PLANS.enterprise.spaces === "unlimited" ? "Ilimitados" : String(BILLING_PLANS.enterprise.spaces),
    ],
  },
  {
    label: "Minutos/mês",
    values: [
      String(BILLING_PLANS.free.minutesPerMonth),
      String(BILLING_PLANS.pro.minutesPerMonth),
      String(BILLING_PLANS.enterprise.minutesPerMonth),
    ],
  },
  {
    label: "Exportação CSV",
    values: ["—", "✓", "✓"],
  },
  {
    label: "API",
    values: ["—", "—", "✓"],
  },
  {
    label: "SSO / SAML",
    values: ["—", "—", "✓"],
  },
  {
    label: "Suporte prioritário",
    values: ["—", "✓", "✓"],
  },
];

export default function PricingPage() {
  const s = site();
  const offers = [
    ...BILLING_PLAN_ORDER.map((key) => ({
      name: BILLING_PLANS[key].label,
      price: String(BILLING_PLANS[key].priceCents / 100),
      priceCurrency: "BRL",
    })),
    {
      name: `Add-on ${BILLING_ADD_ONS.extraMinutes200.label}`,
      price: String(BILLING_ADD_ONS.extraMinutes200.priceCents / 100),
      priceCurrency: "BRL",
    },
  ];

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
          offers,
        })}
      />

      <section className="relative overflow-hidden bg-glow-hero px-4 pt-20 pb-12 sm:px-6 sm:pt-24" aria-labelledby="pricing-hero">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            <Sparkles className="h-3 w-3" aria-hidden />
            Preços em reais · Sem cartão para começar
          </span>
          <h1 id="pricing-hero" className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Planos que crescem <span className="gradient-text">com você</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Comece grátis com uma cota enxuta. Suba para Pro quando precisar de mais minutos e
            vá para Empresa quando a operação pedir escala e governança.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6" aria-labelledby="plans">
        <h2 className="sr-only" id="plans">Planos disponíveis</h2>
        <ol className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3">
          {BILLING_PLAN_ORDER.map((planKey) => {
            const plan = BILLING_PLANS[planKey];
            const highlighted = planKey === "pro";
            const cta =
              planKey === "free"
                ? { label: "Criar conta grátis", href: "/register" }
                : planKey === "pro"
                  ? { label: "Assinar Pro", href: "/register?plan=pro" }
                  : { label: "Falar com vendas", href: "mailto:vendas@voicestream.com.br" };

            return (
              <li
                key={plan.key}
                className={
                  highlighted
                    ? "gradient-border relative flex flex-col rounded-[var(--radius-xl)] bg-surface-1 p-6 shadow-lg"
                    : "flex flex-col rounded-[var(--radius-xl)] border border-border/60 bg-surface-1 p-6"
                }
              >
                {highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full border border-brand/40 bg-brand/15 px-3 py-1 text-xs font-bold text-brand backdrop-blur-sm">
                    Mais popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.label}</h3>
                <p className="mt-1 min-h-[2.5rem] text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-6">
                  <span className={`text-4xl font-extrabold ${highlighted ? "gradient-text" : ""}`}>
                    {formatBRLFromCents(plan.priceCents)}
                  </span>
                  <span className="text-sm text-muted-foreground"> /mês</span>
                </div>
                <ul className="mt-6 grow space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={cta.href}
                  className={`mt-8 block rounded-[var(--radius-md)] py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    highlighted
                      ? "btn-gradient text-white"
                      : "border border-border/60 bg-surface-2 text-foreground hover:bg-surface-3"
                  }`}
                >
                  {cta.label}
                </Link>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          30 dias de garantia · Sem taxa de cancelamento · Migração gratuita
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6" aria-labelledby="addons">
        <div className="rounded-[var(--radius-xl)] border border-border/60 bg-surface-1 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 id="addons" className="text-xl font-semibold tracking-tight">Add-on</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {BILLING_ADD_ONS.extraMinutes200.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">
                {formatBRLFromCents(BILLING_ADD_ONS.extraMinutes200.priceCents)}
              </p>
              <p className="text-sm text-muted-foreground">por pacote de 200 minutos</p>
            </div>
          </div>
        </div>
      </section>

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
            <table className="w-full min-w-[640px] border-collapse text-sm" aria-label="Comparação de planos">
              <caption className="sr-only">Funcionalidades por plano</caption>
              <thead className="sticky top-16 z-10 bg-background">
                <tr className="border-b border-border/60">
                  <th scope="col" className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Funcionalidade
                  </th>
                  {BILLING_PLAN_ORDER.map((planKey) => (
                    <th
                      key={planKey}
                      scope="col"
                      className={`p-4 text-center text-sm font-semibold ${
                        planKey === "pro" ? "text-brand" : "text-foreground"
                      }`}
                    >
                      {BILLING_PLANS[planKey].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, index) => (
                  <tr key={row.label} className={index % 2 === 0 ? "bg-surface-2/30" : ""}>
                    <th scope="row" className="p-4 text-left font-medium text-muted-foreground">
                      {row.label}
                    </th>
                    {row.values.map((value, indexValue) => (
                      <td key={indexValue} className="p-4 text-center text-sm text-foreground">
                        {value === "—" ? (
                          <X className="mx-auto h-4 w-4 text-muted-foreground/40" aria-label="Não incluído" />
                        ) : value === "✓" ? (
                          <Check className="mx-auto h-4 w-4 text-brand" aria-label="Incluído" />
                        ) : (
                          value
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
