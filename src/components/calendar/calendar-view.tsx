"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  MoveHorizontal,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
  CalendarDayCell,
  CalendarEntry,
  CalendarSpaceOption,
} from "./calendar-utils";
import {
  buildMonthGrid,
  countEntriesByKind,
  filterCalendarEntries,
  formatCalendarDayLabel,
  formatCalendarMonthLabel,
  groupCalendarEntriesByDate,
} from "./calendar-utils";

type CalendarViewProps = {
  entries: CalendarEntry[];
  spaces: CalendarSpaceOption[];
  googleStatus: "connected" | "disconnected" | "error";
  googleConnectedAt: string | null;
};

function shiftMonth(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function formatConnectedAt(connectedAt: string | null) {
  if (!connectedAt) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(connectedAt));
}

function EntryBadge({ entry }: { entry: CalendarEntry }) {
  const tone =
    entry.kind === "task"
      ? entry.statusLabel === "Concluída"
        ? "success"
        : entry.statusLabel === "Cancelada"
          ? "muted"
          : "warning"
      : entry.kind === "google_event"
        ? "success"
        : "info";

  return (
    <Badge variant={tone} className="h-6 max-w-full truncate px-2 text-[11px]">
      <span className="truncate">
        {entry.kind === "task" ? `${entry.sourceLabel} · ${entry.priorityLabel}` : entry.sourceLabel}
      </span>
    </Badge>
  );
}

function MonthCell({
  cell,
  entries,
}: {
  cell: CalendarDayCell;
  entries: CalendarEntry[];
}) {
  const items = entries.slice(0, 3);
  const extra = Math.max(0, entries.length - items.length);

  return (
    <div
      className={cn(
        "min-h-[8.25rem] rounded-[var(--radius-md)] border p-2 text-left",
        cell.monthOffset === "current"
          ? "border-border/60 bg-surface-1"
          : "border-dashed border-border/40 bg-surface-1/40 text-muted-foreground",
        cell.isToday && "ring-1 ring-brand/40"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
            cell.isToday ? "bg-brand text-brand-foreground" : "bg-surface-2 text-foreground",
            cell.monthOffset !== "current" && "bg-muted text-muted-foreground"
          )}
        >
          {cell.day}
        </span>
        {entries.length > 0 && (
          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
            {entries.length}
          </Badge>
        )}
      </div>
      <div className="space-y-1.5">
        {items.map((entry) => (
          <div
            key={entry.id}
            className={cn(
      "rounded-[var(--radius-sm)] border px-2 py-1 text-[11px] leading-tight",
              entry.kind === "task"
                ? "border-warning/20 bg-warning/10 text-foreground"
                : entry.kind === "google_event"
                  ? "border-success/20 bg-success/10 text-foreground"
                : "border-info/20 bg-info/10 text-foreground"
            )}
          >
            <div className="flex items-center gap-1.5">
              <EntryBadge entry={entry} />
            </div>
            <div className="mt-1 line-clamp-2 font-medium">{entry.title}</div>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="truncate">{entry.spaceName}</span>
              <span aria-hidden="true">•</span>
              <span>{entry.timeLabel}</span>
            </div>
          </div>
        ))}
        {extra > 0 && (
          <div className="px-2 pt-1 text-[11px] font-medium text-muted-foreground">
            +{extra} eventos
          </div>
        )}
      </div>
    </div>
  );
}

export function CalendarView({
  entries,
  spaces,
  googleStatus,
  googleConnectedAt,
}: CalendarViewProps) {
  const [selectedSpaceId, setSelectedSpaceId] = useState("all");
  const [viewMode, setViewMode] = useState<"month" | "list">("month");
  const [activeMonth, setActiveMonth] = useState(() => new Date());

  const visibleEntries = useMemo(
    () => filterCalendarEntries(entries, selectedSpaceId),
    [entries, selectedSpaceId],
  );
  const monthCells = useMemo(() => buildMonthGrid(activeMonth), [activeMonth]);
  const entriesByDate = useMemo(
    () => new Map(groupCalendarEntriesByDate(visibleEntries).map((group) => [group.dateKey, group.items])),
    [visibleEntries],
  );
  const groupedEntries = useMemo(() => groupCalendarEntriesByDate(visibleEntries), [visibleEntries]);
  const counts = useMemo(() => countEntriesByKind(visibleEntries), [visibleEntries]);
  const monthLabel = useMemo(() => formatCalendarMonthLabel(activeMonth), [activeMonth]);
  const connectedAtLabel = useMemo(() => formatConnectedAt(googleConnectedAt), [googleConnectedAt]);
  const selectedSpaceLabel =
    selectedSpaceId === "all"
      ? "Todos os espaços"
      : spaces.find((space) => space.id === selectedSpaceId)?.name ?? "Espaço";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4 rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                VoiceStream
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">Calendário interno</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Acompanhe prazos de tarefas e a data de captura das gravações sem sair do app.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="h-6 px-2 text-[11px]">
                {counts.task} tarefas
              </Badge>
              <Badge variant="outline" className="h-6 px-2 text-[11px]">
                {counts.recording} gravações
              </Badge>
              <Badge variant="outline" className="h-6 px-2 text-[11px]">
                {counts.google_event} Google
              </Badge>
              <Badge variant="outline" className="h-6 px-2 text-[11px]">
                {visibleEntries.length} eventos
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setActiveMonth((date) => shiftMonth(date, -1))}
                aria-label="Mês anterior"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{monthLabel}</p>
                <p className="text-xs text-muted-foreground">
                  Visão mensal de {selectedSpaceLabel.toLowerCase()}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setActiveMonth((date) => shiftMonth(date, 1))}
                aria-label="Próximo mês"
              >
                <ChevronRight className="size-4" />
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveMonth(new Date())}
              >
                <RefreshCw className="size-4" />
                Hoje
              </Button>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <label className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Espaço</span>
                <div className="relative">
                  <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={selectedSpaceId}
                    onChange={(e) => setSelectedSpaceId(e.target.value)}
                    className="h-10 w-full rounded-[var(--radius-md)] border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value="all">Todos os espaços</option>
                    {spaces.map((space) => (
                      <option key={space.id} value={space.id}>
                        {space.name}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <div className="flex gap-2" role="group" aria-label="Modo de visualização">
                <Button
                  type="button"
                  variant={viewMode === "month" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                  aria-pressed={viewMode === "month"}
                >
                  <CalendarDays className="size-4" />
                  Mês
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "list" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  aria-pressed={viewMode === "list"}
                >
                  <LayoutList className="size-4" />
                  Lista
                </Button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Google Calendar
              </p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">Status da conexão</h3>
            </div>
            <Badge
              variant={
                googleStatus === "connected"
                  ? "success"
                  : googleStatus === "error"
                    ? "destructive"
                    : "muted"
              }
            >
              {googleStatus === "connected"
                ? "Conectado"
                : googleStatus === "error"
                  ? "Erro"
                  : "Desconectado"}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            {googleStatus === "connected"
              ? "A integração está ativa. Eventos do Google entram como leitura nesta fase."
              : "Sem sincronização ativa por enquanto. Esta tela exibe apenas dados internos já existentes."}
          </p>

          {connectedAtLabel && (
            <div className="rounded-[var(--radius-md)] border border-border/60 bg-surface-2 p-3 text-sm">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Conectado em
              </div>
              <div className="mt-1 font-medium text-foreground">{connectedAtLabel}</div>
            </div>
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-brand" />
              <span>Eventos internos consolidados por dia.</span>
            </div>
            <div className="flex items-center gap-2">
              <MoveHorizontal className="size-4 shrink-0 text-brand" />
              <span>Filtro global em todos os espaços ou por espaço específico.</span>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/integrations">Ver integrações</Link>
          </Button>
        </aside>
      </section>

      {viewMode === "month" ? (
        <section className="space-y-3 rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-4">
          <div className="grid grid-cols-7 gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {["dom", "seg", "ter", "qua", "qui", "sex", "sáb"].map((label) => (
              <div key={label} className="px-2">
                {label}
              </div>
            ))}
          </div>
          <div className="overflow-x-auto pb-1">
            <div className="grid min-w-[46rem] grid-cols-7 gap-2">
              {monthCells.map((cell) => (
                <MonthCell key={cell.dateKey} cell={cell} entries={entriesByDate.get(cell.dateKey) ?? []} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-3 rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-4">
          {groupedEntries.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-border/60 bg-surface-2 text-center">
              <p className="text-sm font-medium text-foreground">Nenhum evento encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                O filtro atual não encontrou tarefas ou gravações para mostrar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedEntries.map((group) => (
                <div key={group.dateKey} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {formatCalendarDayLabel(group.dateKey)}
                    </h3>
                    <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                      {group.items.length}
                    </Badge>
                  </div>
                  <div className="grid gap-2">
                    {group.items.map((entry) => (
                      <article
                        key={entry.id}
                        className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-border/60 bg-surface-2 p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <EntryBadge entry={entry} />
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                              {entry.spaceName}
                            </Badge>
                          </div>
                          <p className="truncate text-sm font-medium text-foreground">{entry.title}</p>
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {entry.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2 py-1">
                            <CalendarDays className="size-3.5" />
                            {entry.timeLabel}
                          </span>
                          {entry.durationLabel && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2 py-1">
                              <SlidersHorizontal className="size-3.5" />
                              {entry.durationLabel}
                            </span>
                          )}
                          {entry.statusLabel && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2 py-1">
                              {entry.statusLabel}
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {viewMode === "month" && visibleEntries.length === 0 && (
        <section className="rounded-[var(--radius-lg)] border border-dashed border-border/60 bg-surface-1 p-6 text-center">
          <p className="text-sm font-medium text-foreground">Sem eventos para exibir</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajuste o filtro de espaço ou volte para todos os espaços para ver prazos e gravações.
          </p>
        </section>
      )}
    </div>
  );
}
