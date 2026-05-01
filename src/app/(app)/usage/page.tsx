import type { Metadata } from "next";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { UsageDashboard } from "@/components/app/usage-dashboard";
import { requireSession } from "@/features/auth/guards";
import {
  getUsageLast7d,
  getUsageLast30dByWeek,
  getTopIntents,
  getTopSpaces,
  getSubscriptionLimitAndUsage,
} from "@/features/usage/actions";

export const metadata: Metadata = {
  title: "Uso",
  description: "Minutos, intents e espaços — dados reais de Prisma.",
  robots: { index: false, follow: false },
};

export default async function UsagePage() {
  const session = await requireSession();
  const [
    usageLast7d,
    usageLast30dByWeek,
    topIntents,
    topSpaces,
    subscriptionData,
  ] = await Promise.all([
    getUsageLast7d(session.userId),
    getUsageLast30dByWeek(session.userId),
    getTopIntents(session.userId),
    getTopSpaces(session.userId),
    getSubscriptionLimitAndUsage(session.userId),
  ]);

  const isHighUsage = subscriptionData.percentageUsed >= 80;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Uso</h1>
        <p className="mt-2 text-foreground/60">
          Visualização de consumo e exportação de relatório em CSV.
        </p>
      </div>

      {isHighUsage && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Uso próximo do limite</AlertTitle>
          <AlertDescription>
            Você utilizou {subscriptionData.usedMinutesThisMonth} de{" "}
            {subscriptionData.limitMinutes} minutos (
            {Math.round(subscriptionData.percentageUsed)}%) neste ciclo. Considere
            fazer upgrade para continuar usando o serviço sem limite.
          </AlertDescription>
        </Alert>
      )}

      <UsageDashboard
        series7d={usageLast7d}
        series30d={usageLast30dByWeek}
        topIntents={topIntents}
        topSpaces={topSpaces}
        subscriptionLimit={subscriptionData.limitMinutes}
        subscriptionUsed={subscriptionData.usedMinutesThisMonth}
      />
    </div>
  );
}
