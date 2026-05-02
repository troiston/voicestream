"use client";

import { Search, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LabelFilterItem {
  id: string;
  name: string;
  color: string;
}

export interface SpaceFilterItem {
  id: string;
  name: string;
}

export interface KanbanFilters {
  search: string;
  labelIds: string[];
  overdue: boolean;
  dueToday: boolean;
  spaceId?: string;
}

interface FiltersBarProps {
  filters: KanbanFilters;
  onChange: (filters: KanbanFilters) => void;
  labels?: LabelFilterItem[];
  spaces?: SpaceFilterItem[]; // Only for global mode
  mode?: "global" | "space";
}

const COLOR_BG: Record<string, string> = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-400",
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  gray: "bg-gray-400",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FiltersBar({
  filters,
  onChange,
  labels = [],
  spaces = [],
  mode = "space",
}: FiltersBarProps) {
  const set = (partial: Partial<KanbanFilters>) =>
    onChange({ ...filters, ...partial });

  const toggleLabel = (id: string) => {
    const current = filters.labelIds;
    set({
      labelIds: current.includes(id)
        ? current.filter((l) => l !== id)
        : [...current, id],
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {/* Search */}
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Buscar tarefas…"
          className="h-8 pl-8 pr-3 text-sm rounded-[var(--radius-md)] border border-input bg-transparent outline-none focus:ring-2 focus:ring-ring/50 w-48"
          aria-label="Buscar tarefas"
        />
      </div>

      {/* Space filter (global mode) */}
      {mode === "global" && spaces.length > 0 && (
        <select
          value={filters.spaceId ?? ""}
          onChange={(e) => set({ spaceId: e.target.value || undefined })}
          className="h-8 px-2 text-sm rounded-[var(--radius-md)] border border-input bg-transparent outline-none focus:ring-2 focus:ring-ring/50"
          aria-label="Filtrar por espaço"
        >
          <option value="">Todos os espaços</option>
          {spaces.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {/* Label filter chips */}
      {labels.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap" role="group" aria-label="Filtrar por label">
          {labels.map((l) => {
            const active = filters.labelIds.includes(l.id);
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => toggleLabel(l.id)}
                aria-pressed={active}
                title={l.name}
                className={cn(
                  "flex items-center gap-1 h-7 px-2 text-xs rounded-full border transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full shrink-0",
                    COLOR_BG[l.color] ?? "bg-gray-400",
                  )}
                />
                {l.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Due date toggles */}
      <button
        type="button"
        onClick={() => set({ overdue: !filters.overdue })}
        aria-pressed={filters.overdue}
        className={cn(
          "flex items-center gap-1.5 h-7 px-2 text-xs rounded-full border transition-colors",
          filters.overdue
            ? "border-destructive bg-destructive/10 text-destructive"
            : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground",
        )}
      >
        <AlertCircle className="size-3" />
        Atrasadas
      </button>

      <button
        type="button"
        onClick={() => set({ dueToday: !filters.dueToday })}
        aria-pressed={filters.dueToday}
        className={cn(
          "flex items-center gap-1.5 h-7 px-2 text-xs rounded-full border transition-colors",
          filters.dueToday
            ? "border-warning bg-warning/10 text-warning"
            : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground",
        )}
      >
        <Clock className="size-3" />
        Vence hoje
      </button>
    </div>
  );
}
