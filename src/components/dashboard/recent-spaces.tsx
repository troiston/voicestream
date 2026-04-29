import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { mockSpaces } from "@/lib/mocks/spaces";

/**
 * Recent Spaces Section — exibe 3 espaços mais recentes com:
 * - Dot colorido + nome
 * - Última atividade (relativa)
 * - Contagem de membros
 * - Link para /spaces/[id]
 */

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays}d`;
  return "há mais de uma semana";
}

export function RecentSpaces() {
  // Ordena por lastActivity (mais recentes primeiro) e pega os 3 primeiros
  const recentThree = [...mockSpaces]
    .sort((a, b) => {
      const dateA = new Date(a.lastActivity).getTime();
      const dateB = new Date(b.lastActivity).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <section aria-labelledby="spaces-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="spaces-heading"
          className="text-sm font-semibold text-muted-foreground uppercase tracking-wider"
        >
          Espaços recentes
        </h2>
        <Link
          href="/spaces"
          className="text-xs font-medium text-brand hover:text-brand/80 transition-colors inline-flex items-center gap-1"
        >
          Ver todos
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recentThree.map((space) => (
          <Link
            key={space.id}
            href={`/spaces/${space.id}`}
            className={cn(
              "group flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-4",
              "hover:border-brand/30 hover:bg-surface-2/40 transition-colors"
            )}
          >
            {/* Header: Dot + name */}
            <div className="flex items-start gap-3">
              <div
                className="h-3 w-3 shrink-0 rounded-full mt-0.5"
                style={{ backgroundColor: space.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {space.name}
                </p>
              </div>
            </div>

            {/* Activity + Members */}
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <p className="truncate">{formatRelativeTime(space.lastActivity)}</p>
              <div className="inline-flex items-center gap-1 shrink-0">
                <Users className="h-3 w-3" />
                <span>{space.members}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
