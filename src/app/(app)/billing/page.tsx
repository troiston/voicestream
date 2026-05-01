import type { Metadata } from "next";
import { Suspense } from "react";

import { BillingUpgradeDialog } from "@/components/app/billing-upgrade-dialog";
import { PortalButton } from "@/components/app/portal-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { requireSession } from "@/features/auth/guards";
import { getCurrentPlan } from "@/lib/billing/get-current-plan";
import { PLAN_LIMITS } from "@/lib/billing/plans";
import { getMonthlyMinutesUsed } from "@/lib/billing/get-monthly-usage";
import { stripe } from "@/lib/stripe.service";
import type { InvoiceRow } from "@/components/app/invoices-table";
import { InvoicesTable } from "@/components/app/invoices-table";

export const metadata: Metadata = {
  title: "Faturação",
  description: "Plano, faturas e métodos de pagamento.",
  robots: { index: false, follow: false },
};

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(iso));
}

function getPlanLabel(planKey: "free" | "pro" | "enterprise"): string {
  const labels: Record<"free" | "pro" | "enterprise", string> = {
    free: "Gratuito",
    pro: "Pro",
    enterprise: "Empresa",
  };
  return labels[planKey];
}

const PLAN_FEATURES: Record<string, string[]> = {
  Gratuito: ["200 minutos/mês", "1 espaço", "Transcrição básica"],
  Pro: ["2000 minutos/mês", "Espaços ilimitados", "Transcrição avançada", "Exportação CSV"],
  Empresa: ["10000 minutos/mês", "Espaços ilimitados", "Acesso à API", "Suporte prioritário", "SSO / SAML"],
};

const PLAN_PRICES: Record<string, string> = {
  Gratuito: "R$ 0",
  Pro: "R$ 29",
  Empresa: "R$ 79",
};

async function BillingContent(props: { checkoutStatus: string | null }) {
  const session = await requireSession();
  const { plan: currentPlanKey, subscription } = await getCurrentPlan(session.userId);
  const minutesUsed = await getMonthlyMinutesUsed(session.userId);

  const planLabel = getPlanLabel(currentPlanKey);
  const planLimit = PLAN_LIMITS[currentPlanKey];
  const usagePercent = planLimit.minutesPerMonth === 0 ? 0 : Math.min(
    Math.round((minutesUsed / planLimit.minutesPerMonth) * 100),
    100
  );

  // Fetch invoices from Stripe
  let invoices: InvoiceRow[] = [];
  if (subscription?.stripeCustomerId) {
    try {
      const stripeInvoices = await stripe.invoices.list({
        customer: subscription.stripeCustomerId,
        limit: 12,
      });

      invoices = stripeInvoices.data.map((inv) => ({
        id: inv.id,
        number: inv.number || null,
        amountCents: inv.total || 0,
        currency: inv.currency || "brl",
        status: inv.status || "draft",
        createdAt: new Date(inv.created * 1000).toISOString(),
        hostedInvoiceUrl: inv.hosted_invoice_url || null,
        pdfUrl: inv.invoice_pdf || null,
      }));
    } catch (error) {
      console.error("Erro ao buscar invoices da Stripe:", error);
      // Graceful fallback: invoices permanece vazio
    }
  }

  const nextBillingDate = subscription?.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd.toISOString())
    : null;
  const daysUntilBilling = subscription?.currentPeriodEnd
    // eslint-disable-next-line react-hooks/purity -- server component, recomputed per request
    ? Math.max(1, Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // checkoutStatus virá de searchParams da page (passado pelo wrapper async).
  const checkoutStatus = props.checkoutStatus;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Faturação</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Plano atual, utilização e histórico de faturas.
        </p>
      </div>

      {/* Plan cards */}
      <section aria-labelledby="plans-heading">
        <h2 id="plans-heading" className="mb-4 text-lg font-semibold tracking-tight text-foreground">
          Planos disponíveis
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(["free", "pro", "enterprise"] as const).map((planKey) => {
            const planName = getPlanLabel(planKey);
            const isCurrent = currentPlanKey === planKey;
            const isRecommended = planKey === "pro";
            const price = PLAN_PRICES[planName];
            const features = PLAN_FEATURES[planName] ?? [];

            return (
              <div
                key={planKey}
                className={
                  isRecommended
                    ? "gradient-border flex flex-col rounded-[var(--radius-xl)] p-5"
                    : isCurrent
                      ? "flex flex-col rounded-[var(--radius-xl)] border border-brand/30 bg-brand/10 p-5"
                      : "flex flex-col rounded-[var(--radius-xl)] border border-border/60 bg-surface-1 p-5"
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-semibold text-foreground">{planName}</span>
                  {isRecommended && (
                    <Badge variant="info">Recomendado</Badge>
                  )}
                  {isCurrent && !isRecommended && (
                    <Badge variant="success">Atual</Badge>
                  )}
                </div>
                <p className="gradient-text mt-3 text-3xl font-bold">
                  {price}
                  <span className="text-base font-normal text-muted-foreground">/mês</span>
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg
                        className="h-4 w-4 shrink-0 text-brand"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && planKey !== "free" && (
                  <BillingUpgradeDialog
                    currentPlan={currentPlanKey}
                    targetPlan={planKey}
                    buttonLabel="Fazer upgrade"
                    buttonVariant="primary"
                    buttonClassName={`mt-6 w-full min-h-11 text-sm${isRecommended ? " btn-gradient" : ""}`}
                  />
                )}
                {isCurrent && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-6 w-full min-h-11"
                    disabled
                  >
                    Plano atual
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Current plan usage */}
      <section aria-labelledby="plan-heading" className="grid gap-4 lg:grid-cols-3">
        <Card className="border border-border/60 bg-surface-1 lg:col-span-2">
          <CardHeader>
            <h2 id="plan-heading" className="text-lg font-semibold tracking-tight text-foreground">
              Utilização do plano atual
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-foreground">{planLabel}</span>
              {subscription && <Badge variant="success">Ativo</Badge>}
            </div>
            {nextBillingDate && (
              <p className="text-sm text-muted-foreground">
                Próxima cobrança:{" "}
                <time dateTime={subscription?.currentPeriodEnd?.toISOString()}>
                  {nextBillingDate}
                </time>
              </p>
            )}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {minutesUsed} / {planLimit.minutesPerMonth} minutos
                </span>
                <span className="font-medium text-foreground">{usagePercent}%</span>
              </div>
              <Progress value={usagePercent} />
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {(currentPlanKey === "free" || currentPlanKey === "pro") && <BillingUpgradeDialog currentPlan={currentPlanKey} />}
              <PortalButton className="min-h-11">Gerenciar assinatura</PortalButton>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-surface-1">
          <CardHeader>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Próxima fatura</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextBillingDate ? (
              <>
                <div className="flex items-center justify-center">
                  <div className="relative h-40 w-40 flex items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(var(--brand) ${Math.min(usagePercent, 100)}%, var(--surface-3) 0%)`,
                      }}
                    />
                    <div className="absolute inset-3 rounded-full bg-surface-1" />
                    <div className="relative text-center">
                      <p className="text-3xl font-bold tabular-nums text-foreground">
                        {daysUntilBilling}
                      </p>
                      <p className="text-xs text-muted-foreground">dias</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 border-t border-border/60 pt-3 text-center">
                  <p className="text-xs text-muted-foreground">Próxima fatura</p>
                  <time dateTime={subscription?.currentPeriodEnd?.toISOString()} className="text-sm font-medium text-foreground">
                    {nextBillingDate}
                  </time>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Sem assinatura ativa</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Invoices */}
      <section aria-labelledby="invoices-heading">
        <Card className="border border-border/60 bg-surface-1">
          <CardHeader>
            <h2 id="invoices-heading" className="text-lg font-semibold tracking-tight text-foreground">
              Faturas recentes
            </h2>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <InvoicesTable invoices={invoices} />
          </CardContent>
        </Card>
      </section>

    </div>
  );
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const params = await searchParams;
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      }
    >
      <BillingContent checkoutStatus={params.checkout ?? null} />
    </Suspense>
  );
}
