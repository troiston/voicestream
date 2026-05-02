"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TaskListItem } from "@/types/domain";
import type { TaskPriority } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Label chip colors
// ---------------------------------------------------------------------------

const LABEL_COLOR_MAP: Record<string, string> = {
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
// Due date badge helpers
// ---------------------------------------------------------------------------

function getDueBadge(dueAt: string | null): {
  label: string;
  className: string;
} | null {
  if (!dueAt) return null;
  const due = new Date(dueAt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diff = dueDay.getTime() - today.getTime();
  const dayMs = 86400000;

  if (diff < 0) {
    return { label: dueAt, className: "bg-destructive/10 text-destructive border-destructive/20" };
  }
  if (diff < dayMs) {
    return { label: "Hoje", className: "bg-warning/10 text-warning border-warning/20" };
  }
  return { label: dueAt, className: "bg-muted text-muted-foreground border-border/40" };
}

// ---------------------------------------------------------------------------
// TaskCard props
// ---------------------------------------------------------------------------

export interface TaskCardLabel {
  id: string;
  name: string;
  color: string;
}

export interface TaskCardMeta {
  checklistTotal: number;
  checklistDone: number;
  commentCount: number;
  attachmentCount: number;
  hasDescription: boolean;
  labels: TaskCardLabel[];
}

export interface TaskCardProps {
  task: TaskListItem;
  meta?: TaskCardMeta;
  mode?: "global" | "space";
  priorityVariant: (p: TaskPriority) => "danger" | "warning" | "info";
  isDragging?: boolean;
  onClick?: (taskId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TaskCard({
  task,
  meta,
  mode = "space",
  priorityVariant,
  isDragging = false,
  onClick,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `task:${task.id}`,
    data: { type: "task", taskId: task.id, columnId: task.columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const dueBadge = getDueBadge(task.dueAt);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative rounded-[var(--radius-md)] border border-border/40 bg-gradient-to-br from-surface-2 to-surface-1 p-3",
        "cursor-grab active:cursor-grabbing select-none",
        isDragging && "opacity-40",
      )}
      onClick={(e) => {
        // Don't open dialog when clicking the drag handle itself
        if (!isDragging) {
          e.stopPropagation();
          onClick?.(task.id);
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(task.id);
        }
      } : undefined}
      aria-label={onClick ? `Abrir tarefa: ${task.title}` : undefined}
    >
      {/* Label chips */}
      {meta && meta.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {meta.labels.map((l) => (
            <span
              key={l.id}
              title={l.name}
              className={cn(
                "h-2 w-8 rounded-full",
                LABEL_COLOR_MAP[l.color] ?? "bg-gray-400",
              )}
              aria-label={l.name}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-medium text-foreground line-clamp-2 break-words mb-2">
        {task.title}
      </h4>

      {/* Space tag in global mode */}
      {mode === "global" && (
        <Badge variant="muted" className="text-xs mb-2">
          {task.spaceName}
        </Badge>
      )}

      {/* Priority + due date */}
      <div className="flex flex-wrap gap-1 mb-1">
        <Badge variant={priorityVariant(task.priority)} className="text-xs">
          {task.priority === "alta" ? "Alta" : task.priority === "media" ? "Média" : "Baixa"}
        </Badge>
        {dueBadge && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs rounded-[var(--radius-sm)] border px-1.5 py-0.5",
              dueBadge.className,
            )}
          >
            <Calendar className="size-3" />
            {dueBadge.label}
          </span>
        )}
      </div>

      {/* Metadata row */}
      {meta && (
        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
          {meta.hasDescription && (
            <span title="Tem descrição">
              <AlignLeft className="size-3" />
            </span>
          )}
          {meta.checklistTotal > 0 && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs",
                meta.checklistDone === meta.checklistTotal && "text-success",
              )}
              title="Checklist"
            >
              <CheckSquare className="size-3" />
              {meta.checklistDone}/{meta.checklistTotal}
            </span>
          )}
          {meta.commentCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-xs" title="Comentários">
              <MessageSquare className="size-3" />
              {meta.commentCount}
            </span>
          )}
          {meta.attachmentCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-xs" title="Anexos">
              <Paperclip className="size-3" />
              {meta.attachmentCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
