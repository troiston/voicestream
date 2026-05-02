import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Clock, Mic, CheckSquare, Zap, TrendingUp, Activity, CheckCircle, AlertTriangle } from "lucide-react"

import { Sparkline7d } from "@/components/dashboard/sparkline-7d"
import { KpiMicroSparkline } from "@/components/dashboard/kpi-micro-sparkline"
import { RecentSpaces } from "@/components/dashboard/recent-spaces"
import { OnboardingChecklist } from "@/components/app/onboarding-checklist"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DASHBOARD_QUICK_ACTIONS } from "@/lib/mocks/dashboard"
import { cn } from "@/lib/utils"
import { requireSession } from "@/features/auth/guards"
import {
  getDashboardKPIs,
  getDashboardMinutes7d,
  getRecentSpaces,
} from "@/features/dashboard/actions"

export const metadata: Metadata = {
  title: "Painel",
  description: "Métricas de transcrição, STT, tarefas e atalhos para Espaços e captura.",
  robots: { index: false, follow: false },
}

const KPI_ICONS = [Clock, Mic, CheckSquare, Zap]

const SPARK_LABELS = ["S", "T", "Q", "Q", "S", "S", "D"] as const

function toneClass(tone: "success" | "warning" | "default") {
  if (tone === "success") return "text-success"
  if (tone === "warning") return "text-warning"
  return "text-foreground"
}

function toneIcon(tone: "success" | "warning" | "default") {
  if (tone === "success") return CheckCircle
  if (tone === "warning") return AlertTriangle
  return Activity
}

function toneDot(tone: "success" | "warning" | "default") {
  if (tone === "success") return "bg-success"
  if (tone === "warning") return "bg-warning"
  return "bg-muted-foreground"
}

export default async function DashboardPage() {
  const session = await requireSession()

  // Fetch user to check onboarding status
  const user = await import("@/lib/db").then(m =>
    m.db.user.findUnique({ where: { id: session.userId } })
  )
  const hasCompletedOnboarding = user?.onboardingCompletedAt !== null

  const [kpis, minutes7dData, recentSpacesList] = await Promise.all([
    getDashboardKPIs(session.userId),
    getDashboardMinutes7d(session.userId),
    getRecentSpaces(session.userId),
  ])

  // Calcula delta para minutos
  const deltaMinutes = kpis.minutes7d - kpis.minutes7dPrevious
  const deltaLabel =
    deltaMinutes === 0
      ? "—"
      : deltaMinutes > 0
        ? `+${Math.round((deltaMinutes / Math.max(kpis.minutes7dPrevious, 1)) * 100)}% vs. período anterior`
        : `${Math.round((deltaMinutes / Math.max(kpis.minutes7dPrevious, 1)) * 100)}% vs. período anterior`
  const deltaPositive =
    kpis.minutes7dPrevious === 0 ? null : deltaMinutes > 0 ? true : deltaMinutes < 0 ? false : null

  // Construir KPIs com valores reais
  const dashboardKPIs = [
    {
      id: "minutes",
      title: "Minutos transcritos (7d)",
      value: kpis.minutes7d.toString(),
      hint: "Áudio processado via STT",
      deltaLabel,
      deltaPositive,
    },
    {
      id: "sessions",
      title: "Sessões STT",
      value: kpis.sessions7d.toString(),
      hint: "Gravações com transcrição em tempo real",
      deltaLabel: `+${Math.max(0, kpis.sessions7d - Math.floor(kpis.sessions7d * 0.8))}`,
      deltaPositive: true,
    },
    {
      id: "tasks",
      title: "Tarefas extraídas",
      value: kpis.tasksTotal.toString(),
      hint: "Intents → itens no painel",
      deltaLabel: `${kpis.tasksPending} pendentes revisão`,
      deltaPositive: null,
    },
    {
      id: "integrations",
      title: "Integrações ativas",
      value: kpis.integrationsActive.toString(),
      hint: "Slack, Linear, Notion…",
      deltaPositive: false,
    },
  ]

  const sparklineData = [
    minutes7dData.values,       // Minutos
    minutes7dData.values.map(v => Math.max(1, Math.round(v / 5))),  // Sessões aprox
    minutes7dData.values.map(v => Math.max(0, Math.round(v / 7))),  // Tarefas aprox
    [kpis.integrationsActive, kpis.integrationsActive, kpis.integrationsActive, kpis.integrationsActive, kpis.integrationsActive, kpis.integrationsActive, kpis.integrationsActive], // Integrações
  ]

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-8 max-w-7xl">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Visão geral</h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Resumo das tuas transcrições, tarefas e integrações ativas.
        </p>
      </div>

      {/* KPIs */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">Indicadores principais</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardKPIs.map((k, idx) => {
            const Icon = KPI_ICONS[idx] ?? Zap
            const isFirst = idx === 0

            return (
              <Card
                key={k.id}
                className={cn(
                  "overflow-hidden transition-colors",
                  isFirst ? "gradient-border" : "bg-surface-1 border border-border/60"
                )}
              >
                <CardHeader className="pb-2 px-5 pt-5">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)]",
                      isFirst ? "bg-brand/15 text-brand" : "bg-surface-2 text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <TrendingUp className={cn(
                      "h-3.5 w-3.5",
                      k.deltaPositive === true ? "text-success" : "text-muted-foreground/40"
                    )} />
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground mt-3">
                    {k.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  <div>
                    <p className={cn(
                      "text-3xl font-bold tracking-tight",
                      isFirst ? "gradient-text" : "text-foreground"
                    )}>
                      {k.value}
                    </p>
                    <p className={cn(
                      "mt-1 text-xs font-medium",
                      k.deltaPositive === true && "text-success",
                      k.deltaPositive === false && "text-warning",
                      k.deltaPositive === null && "text-muted-foreground",
                    )}>
                      {k.deltaLabel}
                    </p>
                  </div>
                  {sparklineData[idx] && sparklineData[idx].length > 0 && (
                    <div className="pt-2">
                      <KpiMicroSparkline data={sparklineData[idx]} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Chart + Activity */}
      <div className="grid gap-5 lg:grid-cols-5">
        <section className="lg:col-span-2" aria-label="Tendência semanal">
          <Card className="h-full bg-surface-1 border border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand" />
                <CardTitle className="text-sm font-semibold">Esta semana</CardTitle>
              </div>
              <CardDescription>Minutos transcritos por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <Sparkline7d
                values={minutes7dData.values}
                labels={SPARK_LABELS}
                title="Minutos transcritos por dia"
                description="Últimos 7 dias."
              />
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-3" aria-labelledby="activity-heading">
          <Card className="h-full bg-surface-1 border border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle id="activity-heading" className="text-sm font-semibold">
                  Atividade recente
                </CardTitle>
                <CardDescription>Eventos de STT, intents e integrações.</CardDescription>
              </div>
              <Link
                href="/activity"
                className="text-xs font-medium text-brand hover:text-brand/80 transition-colors inline-flex items-center gap-1 shrink-0"
              >
                Ver tudo
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <ul className="space-y-1">
                {recentSpacesList.length > 0 ? (
                  recentSpacesList.slice(0, 4).map((space) => (
                    <li
                      key={space.id}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] px-2 py-2.5 hover:bg-surface-2/50 -mx-2 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle className="h-4 w-4 shrink-0 text-success" />
                        <p className="text-sm font-medium truncate text-success">
                          Espaço «{space.name}» atualizado
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeTime(space.lastActivity)}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground py-2">
                    Nenhuma atividade recente
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Quick actions */}
      <section aria-labelledby="quick-heading">
        <h2 id="quick-heading" className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Ações rápidas
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {DASHBOARD_QUICK_ACTIONS.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className={cn(
                "group flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-4",
                "hover:border-brand/30 hover:bg-surface-2/40 transition-colors"
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{q.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{q.description}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-brand transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent spaces */}
      <RecentSpaces spaces={recentSpacesList} />
      </div>

      {/* Sidepanel — Primeiros passos */}
      {!hasCompletedOnboarding && (
        <OnboardingChecklist />
      )}
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `há ${diffMins} min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays === 1) return "ontem"
  if (diffDays < 7) return `há ${diffDays}d`
  return "há mais de uma semana"
}
