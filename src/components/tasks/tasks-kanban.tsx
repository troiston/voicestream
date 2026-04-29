"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { MockTask, TaskStatus, TaskPriority } from "@/lib/mocks/tasks";
import { cn } from "@/lib/utils";

interface TasksKanbanProps {
  filteredTasks: MockTask[];
  selected: Set<string>;
  onSelectTask: (id: string) => void;
  statusConfig: Record<TaskStatus, { label: string }>;
  priorityConfig: Record<TaskPriority, { label: string }>;
  priorityVariant: (p: TaskPriority) => "danger" | "warning" | "info";
}

export function TasksKanban({
  filteredTasks,
  selected,
  onSelectTask,
  statusConfig,
  priorityConfig,
  priorityVariant,
}: TasksKanbanProps) {
  const reduce = useReducedMotion();

  const groupedByStatus = useMemo(() => ({
    pendente: filteredTasks.filter((t) => t.status === "pendente"),
    em_curso: filteredTasks.filter((t) => t.status === "em_curso"),
    concluida: filteredTasks.filter((t) => t.status === "concluida"),
  }), [filteredTasks]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {(["pendente", "em_curso", "concluida"] as const).map((status) => (
        <div key={status} className="flex flex-col rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-4 min-h-96">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{statusConfig[status].label}</h3>
            <Badge variant="muted">{groupedByStatus[status].length}</Badge>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {groupedByStatus[status].map((task, i) => (
              <motion.div
                key={task.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 26,
                  delay: reduce ? 0 : Math.min(i * 0.03, 0.2),
                }}
              >
                <div
                  className={cn(
                    "glass-card group relative rounded-[var(--radius-md)] p-3 transition-all cursor-grab hover:cursor-grabbing",
                    "border border-border/40 bg-gradient-to-br from-surface-2 to-surface-1",
                    selected.has(task.id) && "ring-2 ring-primary"
                  )}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Checkbox
                      checked={selected.has(task.id)}
                      onCheckedChange={() => onSelectTask(task.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground line-clamp-2 break-words">
                        {task.title}
                      </h4>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant={priorityVariant(task.priority)} className="text-xs">
                      {priorityConfig[task.priority].label}
                    </Badge>
                  </div>
                  {task.dueAt && <p className="text-xs text-muted-foreground">{formatDatePt(task.dueAt)}</p>}
                </div>
              </motion.div>
            ))}
            {groupedByStatus[status].length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-border/30">
                <p className="text-xs text-muted-foreground">Nenhuma tarefa</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
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
