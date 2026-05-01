"use client";

import { useMemo, useState, useCallback } from "react";
import { Search, Grid3x3, Table as TableIcon } from "lucide-react";

import type { TaskListItem } from "@/types/domain";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateTaskDrawer } from "./create-task-drawer";
import { TasksTable } from "./tasks-table";
import { TasksKanban } from "./tasks-kanban";
import { cn } from "@/lib/utils";

export interface TasksViewProps {
  initialTasks: TaskListItem[];
  defaultSpaceId: string | null;
  userId: string;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; variant: "success" | "default" | "warning" }> = {
  pendente: { label: "Pendente", variant: "warning" },
  em_curso: { label: "Em curso", variant: "default" },
  concluida: { label: "Concluída", variant: "success" },
  cancelada: { label: "Cancelada", variant: "default" },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; variant: "danger" | "warning" | "info" }> = {
  alta: { label: "Alta", variant: "danger" },
  media: { label: "Média", variant: "warning" },
  baixa: { label: "Baixa", variant: "info" },
};

function priorityVariant(p: TaskPriority): "danger" | "warning" | "info" {
  return PRIORITY_CONFIG[p].variant;
}

function statusVariant(s: TaskStatus): "success" | "default" | "warning" {
  return STATUS_CONFIG[s].variant;
}

export function TasksView({ initialTasks, defaultSpaceId, userId }: TasksViewProps) {
  const [tasks, setTasks] = useState<TaskListItem[]>(initialTasks);
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<"title" | "dueAt" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = tasks.filter((t) => {
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
      const matchSearch = !q || `${t.title} ${t.description}`.toLowerCase().includes(q);
      return matchStatus && matchPriority && matchSearch;
    });

    if (sortKey) {
      result.sort((a, b) => {
        let aVal: string | null, bVal: string | null;
        if (sortKey === "title") {
          aVal = a.title;
          bVal = b.title;
        } else {
          aVal = a.dueAt;
          bVal = b.dueAt;
        }
        const cmp = aVal && bVal ? aVal.localeCompare(bVal) : aVal ? 1 : bVal ? -1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [tasks, statusFilter, priorityFilter, searchQuery, sortKey, sortDir]);

  const toggleSort = useCallback((key: "title" | "dueAt") => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }, [sortKey]);

  const toggleTaskSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selected.size === filteredTasks.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredTasks.map((t) => t.id)));
    }
  }, [filteredTasks, selected.size]);

  const markSelectedComplete = useCallback(() => {
    setTasks((prev) =>
      prev.map((t) => (selected.has(t.id) ? { ...t, status: "concluida" as const } : t))
    );
    setSelected(new Set());
  }, [selected]);

  const deleteSelected = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !selected.has(t.id)));
    setSelected(new Set());
  }, [selected]);

  const clearFilters = useCallback(() => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSearchQuery("");
  }, []);

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all" || searchQuery;
  const isEmpty = filteredTasks.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CreateTaskDrawer
          defaultSpaceId={defaultSpaceId}
          userId={userId}
          onCreated={(task) => {
            setTasks((prev) => [task, ...prev]);
          }}
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Modo de visualização">
          <Button
            type="button"
            size="sm"
            variant={view === "table" ? "primary" : "secondary"}
            onClick={() => setView("table")}
            aria-pressed={view === "table"}
          >
            <TableIcon className="size-4" />
            Tabela
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "kanban" ? "primary" : "secondary"}
            onClick={() => setView("kanban")}
            aria-pressed={view === "kanban"}
          >
            <Grid3x3 className="size-4" />
            Kanban
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <section aria-labelledby="tasks-filters-heading" className="space-y-3">
        <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-4">
          <div>
            <h2 id="tasks-filters-heading" className="text-sm font-semibold text-foreground mb-3">
              Filtros
            </h2>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="tasks-search"
                name="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Procurar tarefas…"
                className="pl-9"
                autoComplete="off"
              />
            </div>

            {/* Status Pills */}
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Estado</p>
              <div className="flex flex-wrap gap-2">
                {(["all", "pendente", "em_curso", "concluida", "cancelada"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-medium transition-all",
                      statusFilter === status
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-2 text-foreground hover:bg-surface-2/80"
                    )}
                  >
                    {status === "all" ? "Todas" : STATUS_CONFIG[status as TaskStatus].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Pills */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Prioridade</p>
              <div className="flex flex-wrap gap-2">
                {(["all", "alta", "media", "baixa"] as const).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setPriorityFilter(priority)}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-medium transition-all",
                      priorityFilter === priority
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-2 text-foreground hover:bg-surface-2/80"
                    )}
                  >
                    {priority === "all" ? "Todas" : PRIORITY_CONFIG[priority as TaskPriority].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        )}
      </section>

      {/* Empty State */}
      {isEmpty ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border/50 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {hasActiveFilters
              ? "Nenhuma tarefa encontrada com estes filtros."
              : "Nenhuma tarefa ainda. Comece criando uma nova!"}
          </p>
          {hasActiveFilters && (
            <Button type="button" variant="secondary" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
          {!hasActiveFilters && (
            <CreateTaskDrawer
              defaultSpaceId={defaultSpaceId}
              userId={userId}
              onCreated={(task) => {
                setTasks((prev) => [task, ...prev]);
              }}
            />
          )}
        </div>
      ) : view === "table" ? (
        <TasksTable
          filteredTasks={filteredTasks}
          selected={selected}
          onSelectTask={toggleTaskSelect}
          onSelectAll={toggleSelectAll}
          onSort={toggleSort}
          onMarkComplete={markSelectedComplete}
          onDelete={deleteSelected}
          sortKey={sortKey}
          sortDir={sortDir}
          statusConfig={STATUS_CONFIG}
          priorityConfig={PRIORITY_CONFIG}
          statusVariant={statusVariant}
          priorityVariant={priorityVariant}
        />
      ) : (
        <TasksKanban
          filteredTasks={filteredTasks}
          selected={selected}
          onSelectTask={toggleTaskSelect}
          statusConfig={STATUS_CONFIG}
          priorityConfig={PRIORITY_CONFIG}
          priorityVariant={priorityVariant}
        />
      )}
    </div>
  );
}
