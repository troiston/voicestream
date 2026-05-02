"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Provider catalog (static — never from DB)
// ---------------------------------------------------------------------------

type ProviderKey =
  | "google_calendar"
  | "notion"
  | "slack"
  | "zapier"
  | "hubspot"
  | "microsoft";

type ProviderMeta = {
  key: ProviderKey;
  name: string;
  description: string;
  category: string;
  comingSoon: boolean;
};

const PROVIDERS: ProviderMeta[] = [
  {
    key: "google_calendar",
    name: "Google Calendar",
    description: "Sincronize reuniões e lembretes com o seu calendário.",
    category: "Calendário",
    comingSoon: false,
  },
  {
    key: "notion",
    name: "Notion",
    description: "Exporte transcrições e tarefas para bases e páginas.",
    category: "Produtividade",
    comingSoon: true,
  },
  {
    key: "slack",
    name: "Slack",
    description: "Envie resumos e clips para canais ou mensagens diretas.",
    category: "Comunicação",
    comingSoon: true,
  },
  {
    key: "zapier",
    name: "Zapier",
    description: "Automatize fluxos com milhares de apps.",
    category: "Automação",
    comingSoon: true,
  },
  {
    key: "hubspot",
    name: "HubSpot",
    description: "Associe conversas a negócios e contactos CRM.",
    category: "CRM",
    comingSoon: true,
  },
  {
    key: "microsoft",
    name: "Microsoft Teams",
    description: "Importe gravações e presenças das reuniões Teams.",
    category: "Comunicação",
    comingSoon: true,
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface IntegrationsViewRealProps {
  /** Map of provider key → status from DB; missing key means "disconnected" */
  statusByProvider: Record<string, "disconnected" | "connected" | "error">;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IntegrationsViewReal({ statusByProvider }: IntegrationsViewRealProps) {
  const reduce = useReducedMotion();

  // Separate Google Calendar from the rest
  const googleCalendar = PROVIDERS.find((p) => p.key === "google_calendar")!;
  const comingSoonProviders = PROVIDERS.filter((p) => p.comingSoon);

  const googleStatus = statusByProvider[googleCalendar.key] ?? "disconnected";
  const isGoogleConnected = googleStatus === "connected";

  // Benefits for Google Calendar hero
  const benefits = [
    "Crie tarefas a partir de eventos automaticamente",
    "Veja transcrições anexadas ao calendário",
    "Permissão somente-leitura, escopo mínimo",
  ];

  // How it works steps
  const steps = [
    { icon: "🔐", title: "Conectar conta Google", desc: "Autorize acesso seguro" },
    { icon: "📅", title: "Autorizar leitura de eventos", desc: "Acesso aos seus eventos" },
    { icon: "📝", title: "Transcrições aparecem nos eventos", desc: "Tudo sincronizado" },
  ];

  return (
    <div className="space-y-12">
      {/* ===== Google Calendar Hero ===== */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-48px" }}
        transition={{ type: "spring", stiffness: 200, damping: 28 }}
        className="rounded-[var(--radius-lg)] border border-border/60 bg-surface-2 p-8 md:p-10"
      >
        {/* Header with icon and status */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-brand/15 p-3">
              <Calendar className="h-8 w-8 text-brand" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Google Calendar</h2>
              <p className="mt-1 text-base text-muted-foreground">
                Sincronize transcrições e tarefas com seus eventos automaticamente.
              </p>
            </div>
          </div>

          {/* Status badge */}
          <Badge
            variant={
              isGoogleConnected
                ? "success"
                : googleStatus === "error"
                  ? "destructive"
                  : "muted"
            }
            className="shrink-0"
          >
            {isGoogleConnected ? "Conectado" : googleStatus === "error" ? "Erro" : "Disponível"}
          </Badge>
        </div>

        {/* Benefits list */}
        <div className="mb-8 space-y-3">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <span className="text-sm text-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/api/integrations/google/connect"
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] px-6 py-2 text-sm font-medium transition-colors",
            isGoogleConnected
              ? "btn-gradient bg-brand text-brand-foreground hover:bg-brand/90"
              : "border border-border bg-surface-1 text-foreground hover:bg-surface-2",
          )}
        >
          {isGoogleConnected ? "Gerenciar conexão" : "Conectar agora"}
        </Link>
      </motion.section>

      {/* ===== How It Works ===== */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-48px" }}
        transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.06 }}
        className="space-y-6"
      >
        <h3 className="text-lg font-semibold text-foreground">Como funciona</h3>
        <ul className="grid list-none gap-4 p-0 md:grid-cols-3">
          {steps.map((step, idx) => (
            <motion.li
              key={idx}
              className="list-none"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-48px" }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 28,
                delay: reduce ? 0 : 0.12 + idx * 0.06,
              }}
            >
              <article className="flex flex-col rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-4 text-center">
                <div className="mb-3 text-4xl">{step.icon}</div>
                <h4 className="font-semibold text-foreground">{step.title}</h4>
                <p className="mt-2 text-xs text-muted-foreground">{step.desc}</p>
              </article>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      {/* ===== Coming Soon ===== */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-48px" }}
        transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.12 }}
        className="space-y-6"
      >
        <h3 className="text-lg font-semibold text-foreground">Em breve</h3>
        <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {comingSoonProviders.map((item, i) => (
            <motion.li
              key={item.key}
              className="list-none"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-48px" }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 28,
                delay: reduce ? 0 : 0.18 + i * 0.04,
              }}
            >
              <article className="flex h-full flex-col rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-4 text-left transition-all motion-reduce:transform-none">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0"
                    style={{
                      background: "var(--brand)/15",
                      color: "var(--brand)",
                    }}
                  >
                    {item.name.charAt(0)}
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    Em breve
                  </Badge>
                </div>

                <h4 className="mt-3 font-semibold text-foreground">{item.name}</h4>
                <p className="mt-2 flex-1 text-xs text-muted-foreground">{item.description}</p>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-4 min-h-10 w-full text-xs"
                  disabled
                  aria-disabled="true"
                >
                  Avise-me
                </Button>
              </article>
            </motion.li>
          ))}
        </ul>
      </motion.section>
    </div>
  );
}
