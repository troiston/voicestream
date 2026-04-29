import Link from "next/link"
import { Check } from "lucide-react"

const tiers = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Para indivíduos e famílias começarem a mapear contexto num único Espaço",
    features: [
      "Cota inicial de minutos por mês",
      "1 Espaço, pessoal ou compartilhado",
      "Resumos e tarefas a partir do que foi falado",
      "Acesso à documentação pública",
    ],
    cta: "Criar conta",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 29",
    period: "/mês",
    description: "Espaços ilimitados, controle e integrações avançadas",
    features: [
      "Duração e rotas estendidas",
      "Espaços compartilhados e trilha de auditoria",
      "SSO e requisitos B2B",
      "Onboarding assistido",
    ],
    cta: "Começar com Pro",
    href: "mailto:hello@cloudvoice.com.br",
    highlighted: true,
  },
  {
    name: "Empresa",
    price: "Sob orçamento",
    period: "",
    description: "Dados, localização e contratos para grandes equipes",
    features: [
      "Suporte dedicado",
      "Políticas de retenção personalizadas",
      "Playbooks e evidências de conformidade",
    ],
    cta: "Pedir reunião",
    href: "mailto:hello@cloudvoice.com.br",
    highlighted: false,
  },
] as const

export function Pricing() {
  return (
    <section
      id="pricing"
      className="px-4 py-24 sm:px-6"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2
            id="pricing-heading"
            className="text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            Preços alinhados ao{" "}
            <span className="gradient-text">crescimento</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Pensado para indivíduos, famílias e equipes. O compromisso é começar cedo e escalar sem surpresas.
          </p>
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-[var(--radius-xl)] p-8 ${
                tier.highlighted
                  ? "gradient-border bg-surface-1 shadow-lg"
                  : "border border-border/60 bg-surface-1"
              }`}
            >
              {tier.highlighted && (
                <p className="mb-4">
                  <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                    Recomendado
                  </span>
                </p>
              )}
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
              <div className="mt-6">
                <span className={`text-4xl font-extrabold ${tier.highlighted ? "gradient-text" : ""}`}>
                  {tier.price}
                </span>
                {tier.period ? (
                  <span className="text-muted-foreground">{tier.period}</span>
                ) : null}
              </div>
              <ul className="mt-8 grow space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`mt-8 block rounded-[var(--radius-md)] py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  tier.highlighted
                    ? "btn-gradient text-white"
                    : "border border-border/60 bg-surface-2 text-foreground hover:bg-surface-3"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
