"use client"

import { useCallback, useMemo, useState } from "react"
import { Download, BarChart3, Target, Layers } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { IntentCount, SpaceUse, UsagePoint } from "@/lib/mocks/usage"

export interface UsageDashboardProps {
  series7d: UsagePoint[]
  series30d: UsagePoint[]
  topIntents: IntentCount[]
  topSpaces: SpaceUse[]
  subscriptionLimit?: number
  subscriptionUsed?: number
}

function maxMinutes(points: UsagePoint[]): number {
  return points.reduce((m, p) => (p.minutes > m ? p.minutes : m), 1)
}

function UsageBarChart({ points }: { points: UsagePoint[] }) {
  const max = maxMinutes(points)
  return (
    <div
      className="flex h-48 items-end gap-1 sm:gap-1.5"
      role="img"
      aria-label="Gráfico de barras de minutos por período"
    >
      {points.map((p) => {
        const pct = (p.minutes / max) * 100
        return (
          <div
            key={p.day}
            className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
          >
            <span className="sr-only">{p.day}: {p.minutes} min</span>
            <div
              className="w-full rounded-t-[var(--radius-xs)] transition-[height] duration-300"
              style={{
                height: `${Math.max(pct, 3)}%`,
                background: `linear-gradient(to top, var(--grad-from), var(--grad-to))`,
                opacity: 0.7 + (pct / max) * 0.3,
              }}
              aria-hidden
            />
            <span className="truncate text-center text-[9px] font-medium text-muted-foreground sm:text-[10px]">
              {p.day}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function buildUsageCsv(
  periodLabel: string,
  points: UsagePoint[],
  intents: IntentCount[],
  spaces: SpaceUse[],
): string {
  const lines: string[] = [
    "secção,chave,valor",
    `meta,periodo,${periodLabel}`,
    ...points.map((p) => `minutos_por_dia,${escapeCsv(p.day)},${p.minutes}`),
    ...intents.map((i) => `intent,${escapeCsv(i.intent)},${i.count}`),
    ...spaces.map((s) => `espaco,${escapeCsv(s.space)},${s.minutes}`),
  ]
  return lines.join("\n")
}

function escapeCsv(s: string): string {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replaceAll('"', '""')}"`
  }
  return s
}

export function UsageDashboard({
  series7d,
  series30d,
  topIntents,
  topSpaces,
  subscriptionLimit = 200,
  subscriptionUsed = 0,
}: UsageDashboardProps) {
  const [period, setPeriod] = useState<"7d" | "30d">("7d")
  const points = period === "7d" ? series7d : series30d

  const totalMinutes = points.reduce((s, p) => s + p.minutes, 0)
  const avgMinutes = points.length > 0 ? Math.round(totalMinutes / points.length) : 0

  const csvBlob = useMemo(
    () =>
      new Blob([buildUsageCsv(period, points, topIntents, topSpaces)], {
        type: "text/csv;charset=utf-8",
      }),
    [period, points, topIntents, topSpaces],
  )

  const handleExport = useCallback(() => {
    const url = URL.createObjectURL(csvBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `voicestream-uso-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [csvBlob, period])

  const subscriptionPercent = Math.round((subscriptionUsed / subscriptionLimit) * 100)

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex rounded-[var(--radius-md)] border border-border/60 bg-surface-1 p-1"
          role="group"
          aria-label="Período"
        >
          {(["7d", "30d"] as const).map((p) => (
            <button
              key={p}
              type="button"
              className={cn(
                "rounded-[var(--radius-sm)] px-4 py-1.5 text-sm font-medium transition-colors",
                period === p
                  ? "bg-brand text-brand-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
            >
              {p === "7d" ? "Últimos 7 dias" : "Últimos 30 dias"}
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleExport}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar CSV
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="gradient-border bg-surface-1">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Total no período</p>
            <p className="mt-1 text-3xl font-bold tracking-tight gradient-text">
              {totalMinutes}
              <span className="ml-1 text-sm font-normal text-muted-foreground">min</span>
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-1 border border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Média por dia</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {avgMinutes}
              <span className="ml-1 text-sm font-normal text-muted-foreground">min</span>
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-1 border border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">Plano - Limite</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {subscriptionUsed}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / {subscriptionLimit} min
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bar chart */}
      <Card className="bg-surface-1 border border-border/60">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand" />
            <CardTitle className="text-sm font-semibold">Minutos transcritos por dia</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <UsageBarChart points={points} />
        </CardContent>
      </Card>

      {/* Top intents + spaces */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-surface-1 border border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-brand" />
              <CardTitle className="text-sm font-semibold">Top intents</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {topIntents.length > 0 ? (
              topIntents.map((row, i) => {
                const max = topIntents[0]?.count ?? 1
                const w = Math.round((row.count / max) * 100)
                return (
                  <div key={row.intent}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{row.intent}</span>
                      <span className="text-muted-foreground tabular-nums">{row.count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{
                          width: `${w}%`,
                          background: `linear-gradient(90deg, var(--grad-from), var(--grad-to))`,
                        }}
                      />
                    </div>
                    <span className="sr-only">Posição {i + 1} de {topIntents.length}</span>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                Nenhum intent capturado ainda. (NLP placeholder — pós-MVP)
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface-1 border border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand" />
              <CardTitle className="text-sm font-semibold">Top espaços</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {topSpaces.length > 0 ? (
              topSpaces.map((row, i) => {
                const max = topSpaces[0]?.minutes ?? 1
                const w = Math.round((row.minutes / max) * 100)
                return (
                  <div key={row.space}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{row.space}</span>
                      <Badge variant="muted">{row.minutes} min</Badge>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-brand/50 transition-[width] duration-500"
                        style={{ width: `${w}%` }}
                      />
                    </div>
                    <span className="sr-only">Posição {i + 1} de {topSpaces.length}</span>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                Nenhum espaço com uso registrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
