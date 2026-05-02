import type { Metadata } from "next"
import Link from "next/link"
import { Mic, Folder, CheckSquare, Plug, Activity } from "lucide-react"

import { requireSession } from "@/features/auth/guards"
import { getRecentActivity, type ActivityItem } from "@/features/dashboard/actions"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Atividade",
  description: "Histórico completo de gravações, tarefas e integrações.",
  robots: { index: false, follow: false },
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

function groupByDay(items: ActivityItem[]): Map<string, ActivityItem[]> {
  const map = new Map<string, ActivityItem[]>()
  for (const item of items) {
    const day = new Date(item.createdAt).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    const key = day.charAt(0).toUpperCase() + day.slice(1)
    const existing = map.get(key) ?? []
    existing.push(item)
    map.set(key, existing)
  }
  return map
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export default async function ActivityPage() {
  const session = await requireSession()
  const items = await getRecentActivity(session.userId, 50)
  const grouped = groupByDay(items)

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Atividade</h1>
        <p className="text-sm text-muted-foreground">
          Histórico dos seus eventos mais recentes.
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="bg-surface-1 border border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <Mic className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhuma atividade ainda.</p>
            <Link
              href="/capture"
              className="text-xs font-medium text-brand hover:text-brand/80 transition-colors"
            >
              Comece gravando seu primeiro áudio
            </Link>
          </CardContent>
        </Card>
      ) : (
        Array.from(grouped.entries()).map(([day, dayItems]) => (
          <section key={day} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {day}
            </h2>
            <Card className="bg-surface-1 border border-border/60">
              <CardContent className="px-5 py-3">
                <ul className="divide-y divide-border/40">
                  {dayItems.map((item) => (
                    <li key={item.id}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="flex items-center justify-between gap-3 py-3 hover:opacity-80 transition-opacity"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <ActivityIcon icon={item.icon} />
                            <p className="text-sm font-medium truncate">{item.label}</p>
                          </div>
                          <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            {formatTime(item.createdAt)}
                          </p>
                        </Link>
                      ) : (
                        <div className="flex items-center justify-between gap-3 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <ActivityIcon icon={item.icon} />
                            <p className="text-sm font-medium truncate">{item.label}</p>
                          </div>
                          <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            {formatTime(item.createdAt)}
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        ))
      )}
    </div>
  )
}
