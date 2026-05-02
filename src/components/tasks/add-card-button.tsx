"use client";

import { useState, useRef, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTask } from "@/features/tasks/actions";
import type { TaskListItem } from "@/types/domain";

interface AddCardButtonProps {
  columnId: string;
  onTaskCreated?: (task: TaskListItem) => void;
}

export function AddCardButton({ columnId, onTaskCreated }: AddCardButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleOpen = () => {
    setIsAdding(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setTitle("");
  };

  const handleCreate = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await createTask({ columnId, title: trimmed });
      if (result.ok) {
        onTaskCreated?.(result.task as unknown as TaskListItem);
        setTitle("");
        setIsAdding(false);
      }
    });
  };

  if (!isAdding) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
        aria-label="Adicionar cartão"
      >
        <Plus className="size-4" />
        Adicionar cartão
      </button>
    );
  }

  return (
    <div className="p-2 rounded-[var(--radius-md)] bg-surface-2 border border-border/40 space-y-2">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleCreate();
          }
          if (e.key === "Escape") handleCancel();
        }}
        placeholder="Título da tarefa…"
        rows={2}
        className="w-full resize-none text-sm bg-transparent outline-none placeholder:text-muted-foreground"
        aria-label="Título da nova tarefa"
        disabled={isPending}
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={handleCreate}
          isLoading={isPending}
          loadingLabel="A criar…"
          disabled={!title.trim()}
        >
          Adicionar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
