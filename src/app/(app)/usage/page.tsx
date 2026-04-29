import type { Metadata } from "next";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { UsageDashboard } from "@/components/app/usage-dashboard";
import {
  topIntents,
  topSpaces,
  usageLast30dByWeek,
  usageLast7d,
} from "@/lib/mocks/usage";

export const metadata: Metadata = {
  title: "Uso",
  description: "Minutos, intents e espaços (dados mock).",
  robots: { index: false, follow: false },
};

// Mock: 170 minutos usados de 200 = 85%
const mockUsedMinutes = 170;
const mockTotalMinutes = 200;
const usagePercent = (mockUsedMinutes / mockTotalMinutes) * 100;
const isHighUsage = usagePercent >= 80;

export default function UsagePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Uso</h1>
        <p className="mt-2 text-foreground/60">
          Visualização de consumo e exportação de relatório em CSV (mock, sem backend).
        </p>
      </div>

      {isHighUsage && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Uso próximo do limite</AlertTitle>
          <AlertDescription>
            Você utilizou {mockUsedMinutes} de {mockTotalMinutes} minutos ({Math.round(usagePercent)}%) neste ciclo.
            Considere fazer upgrade para continuar usando o serviço sem limite.
          </AlertDescription>
        </Alert>
      )}

      <UsageDashboard
        series7d={usageLast7d}
        series30d={usageLast30dByWeek}
        topIntents={topIntents}
        topSpaces={topSpaces}
      />
    </div>
  );
}
