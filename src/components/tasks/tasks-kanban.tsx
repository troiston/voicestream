"use client";

import { useState, useCallback, useRef, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TaskListItem, TaskColumnItem } from "@/types/domain";
import type { TaskPriority } from "@/generated/prisma/client";
import {
  createColumn,
  renameColumn,
  deleteColumn,
  reorderColumns,
  moveTask,
} from "@/features/tasks/columns-actions";
import { getTaskDetail } from "@/features/tasks/actions";
import { TaskCard } from "@/components/tasks/task-card";
import { AddCardButton } from "@/components/tasks/add-card-button";
import { FiltersBar, type KanbanFilters, type LabelFilterItem, type SpaceFilterItem } from "@/components/tasks/filters-bar";
import { TaskDetailDialog, type TaskDetailData } from "@/components/tasks/task-detail-dialog";
import type { LabelItem } from "@/components/tasks/labels-popover";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TasksKanbanProps {
  columns: TaskColumnItem[];
  tasks: TaskListItem[];
  onColumnsChange: (cols: TaskColumnItem[]) => void;
  onTasksChange: (tasks: TaskListItem[]) => void;
  defaultSpaceId: string | null;
  priorityVariant: (p: TaskPriority) => "danger" | "warning" | "info";
  mode?: "global" | "space";
  spaceLabels?: LabelFilterItem[];
  spaceFilterList?: SpaceFilterItem[];
  currentUserId?: string;
}

// ---------------------------------------------------------------------------
// Sortable Column
// ---------------------------------------------------------------------------

function KanbanColumn({
  column,
  tasks,
  priorityVariant,
  activeTaskId,
  mode,
  onRename,
  onDelete,
  onTaskClick,
  onTaskCreated,
}: {
  column: TaskColumnItem;
  tasks: TaskListItem[];
  priorityVariant: (p: TaskPriority) => "danger" | "warning" | "info";
  activeTaskId: string | null;
  mode: "global" | "space";
  onRename: (columnId: string, newName: string) => void;
  onDelete: (columnId: string) => void;
  onTaskClick: (taskId: string) => void;
  onTaskCreated: (task: TaskListItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `col:${column.id}`,
    data: { type: "column", columnId: column.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(column.name);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = useCallback(() => {
    setEditValue(column.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [column.name]);

  const commitEdit = useCallback(async () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== column.name) {
      onRename(column.id, trimmed);
    }
    setEditing(false);
  }, [editValue, column.id, column.name, onRename]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setEditValue(column.name);
  }, [column.name]);

  const taskIds = tasks.map((t) => `task:${t.id}`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col w-72 shrink-0 rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 min-h-96"
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
        {/* Drag handle for column */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
          aria-label={`Arrastar coluna ${column.name}`}
        >
          <GripVertical className="size-4" />
        </button>

        {editing ? (
          <div className="flex flex-1 items-center gap-1">
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void commitEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              className="flex-1 min-w-0 text-sm font-semibold bg-transparent border-b border-primary outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => void commitEdit()}
              className="text-success hover:opacity-70"
              aria-label="Confirmar"
            >
              <Check className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-muted-foreground hover:opacity-70"
              aria-label="Cancelar"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <h3 className="flex-1 text-sm font-semibold text-foreground truncate">{column.name}</h3>
        )}

        <Badge variant="muted" className="shrink-0">{tasks.length}</Badge>

        {!editing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={startEdit}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Renomear coluna ${column.name}`}
            >
              <Pencil className="size-3.5" />
            </button>
            {deleteConfirm ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { onDelete(column.id); setDeleteConfirm(false); }}
                  className="text-destructive hover:opacity-70 text-xs font-medium"
                  aria-label="Confirmar exclusão"
                >
                  <Check className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="text-muted-foreground hover:opacity-70"
                  aria-label="Cancelar exclusão"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Eliminar coluna ${column.name}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              mode={mode}
              priorityVariant={priorityVariant}
              isDragging={activeTaskId === task.id}
              onClick={onTaskClick}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-border/30">
            <p className="text-xs text-muted-foreground">Sem tarefas</p>
          </div>
        )}
      </div>

      {/* Add card button */}
      <div className="px-3 pb-3">
        <AddCardButton columnId={column.id} onTaskCreated={onTaskCreated} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------

function applyFilters(tasks: TaskListItem[], filters: KanbanFilters): TaskListItem[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);

  return tasks.filter((t) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!t.title.toLowerCase().includes(q)) return false;
    }
    if (filters.spaceId && t.spaceId !== filters.spaceId) return false;
    if (filters.overdue) {
      if (!t.dueAt) return false;
      const due = new Date(t.dueAt);
      if (due >= today) return false;
    }
    if (filters.dueToday) {
      if (!t.dueAt) return false;
      const due = new Date(t.dueAt);
      if (due < today || due >= tomorrow) return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Main Kanban Board
// ---------------------------------------------------------------------------

export function TasksKanban({
  columns,
  tasks,
  onColumnsChange,
  onTasksChange,
  defaultSpaceId,
  priorityVariant,
  mode = "space",
  spaceLabels = [],
  spaceFilterList = [],
  currentUserId,
}: TasksKanbanProps) {
  const [activeColId, setActiveColId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<KanbanFilters>({
    search: "",
    labelIds: [],
    overdue: false,
    dueToday: false,
  });

  // Task detail dialog
  const [selectedTask, setSelectedTask] = useState<TaskDetailData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, startDetailTransition] = useTransition();

  // New column input
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [addPending, setAddPending] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
  const columnIds = sortedColumns.map((c) => `col:${c.id}`);

  const filteredTasks = applyFilters(tasks, filters);

  const tasksInColumn = useCallback(
    (colId: string) =>
      filteredTasks
        .filter((t) => t.columnId === colId)
        .sort((a, b) => a.order - b.order),
    [filteredTasks],
  );

  const unassignedTasks = filteredTasks.filter((t) => t.columnId === null);

  // ---- Task detail ----

  const handleTaskClick = useCallback(
    (taskId: string) => {
      startDetailTransition(async () => {
        const result = await getTaskDetail(taskId);
        if (result.ok) {
          setSelectedTask(result.task as unknown as TaskDetailData);
          setDialogOpen(true);
        }
      });
    },
    [],
  );

  const handleTaskCreated = useCallback(
    (task: TaskListItem) => {
      onTasksChange([...tasks, task]);
    },
    [tasks, onTasksChange],
  );

  // ---- Drag Handlers ----

  function onDragStart(event: DragStartEvent) {
    const { active } = event;
    const id = String(active.id);
    if (id.startsWith("col:")) setActiveColId(id.replace("col:", ""));
    if (id.startsWith("task:")) setActiveTaskId(id.replace("task:", ""));
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (!activeId.startsWith("task:")) return;
    const taskId = activeId.replace("task:", "");

    // Determine target column
    let targetColId: string | null = null;
    if (overId.startsWith("col:")) {
      targetColId = overId.replace("col:", "");
    } else if (overId.startsWith("task:")) {
      const overTask = tasks.find((t) => t.id === overId.replace("task:", ""));
      targetColId = overTask?.columnId ?? null;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.columnId === targetColId) return;

    // Optimistically move task to new column
    onTasksChange(
      tasks.map((t) => (t.id === taskId ? { ...t, columnId: targetColId } : t)),
    );
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveColId(null);
    setActiveTaskId(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // --- Column reorder ---
    if (activeId.startsWith("col:") && overId.startsWith("col:")) {
      const fromId = activeId.replace("col:", "");
      const toId = overId.replace("col:", "");
      if (fromId === toId) return;

      const oldIndex = sortedColumns.findIndex((c) => c.id === fromId);
      const newIndex = sortedColumns.findIndex((c) => c.id === toId);
      const reordered = arrayMove(sortedColumns, oldIndex, newIndex).map(
        (c: TaskColumnItem, i: number) => ({ ...c, order: i }),
      );
      onColumnsChange(reordered);
      void reorderColumns(
        reordered[0]?.spaceId ?? defaultSpaceId ?? "",
        reordered.map((c: TaskColumnItem) => c.id),
      );
      return;
    }

    // --- Task move / reorder ---
    if (activeId.startsWith("task:")) {
      const taskId = activeId.replace("task:", "");
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Determine target column
      let targetColId: string | null = task.columnId;
      if (overId.startsWith("col:")) {
        targetColId = overId.replace("col:", "");
      } else if (overId.startsWith("task:")) {
        const overTask = tasks.find((t) => t.id === overId.replace("task:", ""));
        targetColId = overTask?.columnId ?? null;
      }

      // Determine new order within target column
      const colTasks = tasks
        .filter((t) => t.columnId === targetColId && t.id !== taskId)
        .sort((a, b) => a.order - b.order);

      let insertIndex = colTasks.length;
      if (overId.startsWith("task:")) {
        const overTask = tasks.find((t) => t.id === overId.replace("task:", ""));
        if (overTask) {
          insertIndex = colTasks.findIndex((t) => t.id === overTask.id);
          if (insertIndex === -1) insertIndex = colTasks.length;
        }
      }

      const newOrder = insertIndex;
      // Re-order all tasks in target column
      const updatedTasks = tasks.map((t) => {
        if (t.id === taskId) return { ...t, columnId: targetColId, order: newOrder };
        if (t.columnId === targetColId && t.id !== taskId && t.order >= newOrder) {
          return { ...t, order: t.order + 1 };
        }
        return t;
      });
      onTasksChange(updatedTasks);

      void moveTask(taskId, targetColId, newOrder);
    }
  }

  // ---- Handlers for column CRUD ----

  const handleRenameColumn = useCallback(
    async (columnId: string, newName: string) => {
      onColumnsChange(columns.map((c) => (c.id === columnId ? { ...c, name: newName } : c)));
      await renameColumn(columnId, newName);
    },
    [columns, onColumnsChange],
  );

  const handleDeleteColumn = useCallback(
    async (columnId: string) => {
      onColumnsChange(columns.filter((c) => c.id !== columnId));
      onTasksChange(tasks.map((t) => (t.columnId === columnId ? { ...t, columnId: null } : t)));
      await deleteColumn(columnId);
    },
    [columns, tasks, onColumnsChange, onTasksChange],
  );

  const handleAddColumn = useCallback(async () => {
    const name = newColName.trim();
    if (!name || !defaultSpaceId) return;
    setAddPending(true);
    const result = await createColumn(defaultSpaceId, name);
    if (result.ok) {
      const newCol: TaskColumnItem = {
        id: result.id,
        spaceId: defaultSpaceId,
        name,
        order: columns.length,
      };
      onColumnsChange([...columns, newCol]);
    }
    setNewColName("");
    setAddingColumn(false);
    setAddPending(false);
  }, [newColName, defaultSpaceId, columns, onColumnsChange]);

  // Active overlay items
  const activeCol = activeColId ? columns.find((c) => c.id === activeColId) : null;
  const activeTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;

  return (
    <div className="w-full space-y-3">
      {/* Filters bar */}
      <FiltersBar
        filters={filters}
        onChange={setFilters}
        labels={spaceLabels}
        spaces={spaceFilterList}
        mode={mode}
      />

      <div className="overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-4 min-w-max">
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              {sortedColumns.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={tasksInColumn(col.id)}
                  priorityVariant={priorityVariant}
                  activeTaskId={activeTaskId}
                  mode={mode}
                  onRename={(id, name) => void handleRenameColumn(id, name)}
                  onDelete={(id) => void handleDeleteColumn(id)}
                  onTaskClick={handleTaskClick}
                  onTaskCreated={handleTaskCreated}
                />
              ))}
            </SortableContext>

            {/* Unassigned column (if tasks exist without a column) */}
            {unassignedTasks.length > 0 && (
              <div className="flex flex-col w-72 shrink-0 rounded-[var(--radius-lg)] border border-dashed border-border/60 bg-surface-1 min-h-96">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
                  <h3 className="flex-1 text-sm font-semibold text-muted-foreground">Sem coluna</h3>
                  <Badge variant="muted">{unassignedTasks.length}</Badge>
                </div>
                <div className="flex-1 p-3 space-y-2">
                  {unassignedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      mode={mode}
                      priorityVariant={priorityVariant}
                      onClick={handleTaskClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add column button */}
            <div className="flex flex-col w-72 shrink-0">
              {addingColumn ? (
                <div className="rounded-[var(--radius-lg)] border border-border/60 bg-surface-1 p-3">
                  <input
                    autoFocus
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleAddColumn();
                      if (e.key === "Escape") { setAddingColumn(false); setNewColName(""); }
                    }}
                    placeholder="Nome da coluna"
                    className="w-full text-sm bg-transparent border-b border-primary outline-none py-1 mb-3"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => void handleAddColumn()}
                      isLoading={addPending}
                      loadingLabel="A criar..."
                    >
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => { setAddingColumn(false); setNewColName(""); }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingColumn(true)}
                  className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                >
                  <Plus className="size-4" />
                  Adicionar coluna
                </button>
              )}
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask && (
              <div className="rounded-[var(--radius-md)] border border-primary/40 bg-surface-2 p-3 shadow-lg w-64 rotate-2">
                <h4 className="text-sm font-medium text-foreground line-clamp-2">{activeTask.title}</h4>
              </div>
            )}
            {activeCol && (
              <div className="rounded-[var(--radius-lg)] border border-primary/40 bg-surface-1 p-4 shadow-lg w-72 opacity-90">
                <h3 className="text-sm font-semibold text-foreground">{activeCol.name}</h3>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task detail dialog */}
      {selectedTask && (
        <TaskDetailDialog
          open={dialogOpen}
          onClose={() => { setDialogOpen(false); setSelectedTask(null); }}
          task={selectedTask}
          spaceLabels={spaceLabels as LabelItem[]}
          currentUserId={currentUserId ?? ""}
        />
      )}
    </div>
  );
}
