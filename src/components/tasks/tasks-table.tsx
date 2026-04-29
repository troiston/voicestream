"use client";

import { useCallback } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Check } from "lucide-react";
import type { MockTask, TaskStatus, TaskPriority } from "@/lib/mocks/tasks";
import { cn } from "@/lib/utils";

interface TasksTableProps {
  filteredTasks: MockTask[];
  selected: Set<string>;
  onSelectTask: (id: string) => void;
  onSelectAll: () => void;
  onSort: (key: "title" | "dueAt") => void;
  onMarkComplete: () => void;
  onDelete: () => void;
  sortKey: "title" | "dueAt" | null;
  sortDir: "asc" | "desc";
  statusConfig: Record<TaskStatus, { label: string }>;
  priorityConfig: Record<TaskPriority, { label: string }>;
  statusVariant: (s: TaskStatus) => "success" | "default" | "warning";
  priorityVariant: (p: TaskPriority) => "danger" | "warning" | "info";
}

export function TasksTable({
  filteredTasks,
  selected,
  onSelectTask,
  onSelectAll,
  onSort,
  onMarkComplete,
  onDelete,
  sortKey,
  sortDir,
  statusConfig,
  priorityConfig,
  statusVariant,
  priorityVariant,
}: TasksTableProps) {
  const handleDateSort = useCallback(() => onSort("dueAt"), [onSort]);
  const handleTitleSort = useCallback(() => onSort("title"), [onSort]);

  return (
    <>
      {/* Selection Bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface-1 px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-foreground">
              {selected.size} tarefa{selected.size !== 1 ? "s" : ""} selecionada{selected.size !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={onMarkComplete}>
                <Check className="size-4" />
                Concluir
              </Button>
              <Button type="button" variant="danger" size="sm" onClick={onDelete}>
                <Trash2 className="size-4" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className={cn(
          "overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-surface-1",
          selected.size > 0 && "mb-24"
        )}
      >
        <Table aria-label="Lista de tarefas">
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={selected.size === filteredTasks.length && filteredTasks.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead
                className="text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={handleTitleSort}
              >
                Título {sortKey === "title" && <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>}
              </TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="text-muted-foreground">Prioridade</TableHead>
              <TableHead
                className="text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={handleDateSort}
              >
                Prazo {sortKey === "dueAt" && <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow
                key={task.id}
                className={cn(
                  "border-border/60 hover:bg-surface-2/50 transition-colors cursor-pointer",
                  selected.has(task.id) && "bg-primary/5"
                )}
              >
                <TableCell
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTask(task.id);
                  }}
                >
                  <Checkbox checked={selected.has(task.id)} onCheckedChange={() => onSelectTask(task.id)} />
                </TableCell>
                <TableCell className="font-medium text-foreground">{task.title}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(task.status)}>{statusConfig[task.status].label}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityVariant(task.priority)}>{priorityConfig[task.priority].label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{task.dueAt ? formatDatePt(task.dueAt) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function formatDatePt(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) {
    return iso;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
