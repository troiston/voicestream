import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Clock, Mic, CheckSquare, Zap, TrendingUp, TrendingDown, Activity, Folder, Plug } from "lucide-react"

import { Sparkline7d } from "@/components/dashboard/sparkline-7d"
import { KpiMicroSparkline } from "@/components/dashboard/kpi-micro-sparkline"
import { RecentSpaces } from "@/components/dashboard/recent-spaces"
import { OnboardingChecklist } from "@/components/app/onboarding-checklist"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DASHBOARD_QUICK_ACTIONS } from "@/lib/mocks/dashboard"
import { cn } from "@/lib/utils"
import { requireSession } from "@/features/auth/guards"
import {
  getDashboardKPIs,
  getDashboardMinutes7d,
  getRecentSpaces,
  getRecentActivity,
  type ActivityItem,
} from "@/features/dashboard/actions"

export const metadata: Metadata = {
  title: "Painel",
  description: "Métricas de gravações, tarefas e integrações ativas.",
  robots: { index: false, follow: false },
}

const SPARK_LABELS = ["S", "T", "Q", "Q", "S", "S", "D"] as const

function deltaClass(delta: number): string {
  if (delta > 0) return "text-success"
  if (delta < 0) return "text-destructive"
  return "text-muted-foreground"
}

function deltaLabel(delta: number, prev: number): string {
  if (prev === 0 && delta === 0) return "—"
  if (prev === 0) return delta > 0 ? `+${delta} vs. anterior` : "—"
  const pct = Math.round((delta / prev) * 100)
  if (pct === 0) return "igual ao período anterior"
  return `${pct > 0 ? "+" : ""}${pct}% vs. período anterior`
}

function ActivityIcon({ icon }: { icon: ActivityItem["icon"] }) {
  const cls = "h-4 w-4 shrink-0"
  switch (icon) {
    case "mic": return <Mic className={cn(cls, "text-brand")} />
    case "folder": return <Folder className={cn(cls, "text-amber-500")} />
    case "check-square": return <CheckSquare className={cn(cls, "text-success")} />
    case "plug": return <Plug className={cn(cls, "text-purple-500")} />
    default: return <Activity className={cn(cls, "text-muted-foreground")} />
  }
}

export default async function DashboardPage() {
  const session = await requireSession()

  const user = await import("@/lib/db").then(m =>
    m.db.user.findUnique({ where: { id: session.userId } })
  )
  const hasCompletedOnboarding = user?.onboardingCompletedAt !== null

  const [kpis, minutes7dData, recentSpacesList, recentActivity] = await Promise.all([
    getDashboardKPIs(session.userId),
    getDashboardMinutes7d(session.userId),
    getRecentSpaces(session.userId),
    getRecentActivity(session.userId, 8),
  ])

  const dashboardKPIs = [
    {
      id: "recordings",
      title: "Gravações esta semana",
      value: kpis.recordingsThisWeek.value.toString(),
      hint: "Qualquer status",
      delta: kpis.recordingsThisWeek.delta,
      deltaLabel: deltaLabel(
        kpis.recordingsThisWeek.delta,
        kpis.recordingsThisWeek.value - kpis.recordingsThisWeek.delta,
      ),
      Icon: Mic,
    },
    {
      id: "minutes",
      title: "Minutos gravados",
      value: kpis.minutesRecorded.value.toString(),
      hint: "Áudio capturado nos últimos 7 dias",
      delta: kpis.minutesRecorded.delta,
      deltaLabel: deltaLabel(
        kpis.minutesRecorded.delta,
        kpis.minutesRecorded.value - kpis.minutesRecorded.delta,
      ),
      Icon: Clock,
    },
    {
      id: "tasks",
      title: "Tarefas criadas",
      value: kpis.tasksCreated.value.toString(),
      hint: "Esta semana nos seus espaços",
      delta: kpis.tasksCreated.delta,
      deltaLabel: deltaLabel(
        kpis.tasksCreated.delta,
        kpis.tasksCreated.value - kpis.tasksCreated.delta,
      ),
      Icon: CheckSquare,
    },
    {
      id: "integrations",
      title: "Integrações ativas",
      value: kpis.integrationsActive.value.toString(),
      hint: "Conectadas à sua conta",
      delta: 0,
      deltaLabel: kpis.integrationsActive.value === 0 ? "Nenhuma conectada" : "Conectadas",
      Icon: Zap,
    },
  ]

  const sparklineData = [
    minutes7dData.values.map(v => Math.max(1, Math.round(v / 5))), // Gravações aprox
    minutes7dData.values,  // Minutos
    minutes7dData.values.map(v => Math.max(0, Math.round(v / 7))), // Tarefas aprox
    new Array(7).fill(kpis.integrationsActive.value),
  ]

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-8 max-w-7xl">
        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Visão geral</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Resumo das suas gravações, tarefas e integrações ativas.
          </p>
        </div>

        {/* KPIs */}
        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">Indicadores principais</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardKPIs.map((k, idx) => {
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
                        <k.Icon className="h-4 w-4" />
                      </div>
                      {k.delta > 0
                        ? <TrendingUp className="h-3.5 w-3.5 text-success" />
                        : k.delta < 0
                        ? <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                        : <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/40" />
                      }
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
                      <p className={cn("mt-1 text-xs font-medium", deltaClass(k.delta))}>
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
                <CardDescription>Minutos gravados por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <Sparkline7d
                  values={minutes7dData.values}
                  labels={SPARK_LABELS}
                  title="Minutos gravados por dia"
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
                  <CardDescription>Gravações, tarefas e integrações.</CardDescription>
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
                {recentActivity.length > 0 ? (
                  <ul className="space-y-1">
                    {recentActivity.map((item) => (
                      <li key={item.id}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] px-2 py-2.5 hover:bg-surface-2/50 -mx-2 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ActivityIcon icon={item.icon} />
                              <p className="text-sm font-medium truncate">{item.label}</p>
                            </div>
                            <p className="shrink-0 text-xs text-muted-foreground">
                              {formatRelativeTime(new Date(item.createdAt))}
                            </p>
                          </Link>
                        ) : (
                          <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] px-2 py-2.5 -mx-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ActivityIcon icon={item.icon} />
                              <p className="text-sm font-medium truncate">{item.label}</p>
                            </div>
                            <p className="shrink-0 text-xs text-muted-foreground">
                              {formatRelativeTime(new Date(item.createdAt))}
                            </p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                    <Mic className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma atividade ainda.
                    </p>
                    <Link
                      href="/capture"
                      className="text-xs font-medium text-brand hover:text-brand/80 transition-colors"
                    >
                      Comece gravando seu primeiro áudio em /capture
                    </Link>
                  </div>
                )}
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
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" })
  const diffMs = date.getTime() - Date.now()
  const diffSecs = Math.round(diffMs / 1000)
  const diffMins = Math.round(diffSecs / 60)
  const diffHours = Math.round(diffMins / 60)
  const diffDays = Math.round(diffHours / 24)

  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, "minutes")
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hours")
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "days")
  return rtf.format(Math.round(diffDays / 30), "months")
}
