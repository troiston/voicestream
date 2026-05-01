"use client";

import { useActionState, useCallback, useEffect, useId, useRef, useState } from "react";

import { createTaskAction, type CreateTaskActionState } from "@/server/actions/tasks";
import type { TaskListItem } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const initial: CreateTaskActionState = { status: "idle" };

export interface CreateTaskDrawerProps {
  onCreated: (task: TaskListItem) => void;
  defaultSpaceId: string | null;
  userId: string;
}

export function CreateTaskDrawer({ onCreated, defaultSpaceId, userId }: CreateTaskDrawerProps) {
  const titleId = useId();
  const [formKey, setFormKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setFormKey((k) => k + 1);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <>
      <Button type="button" onClick={open} size="sm" variant="primary" className="min-h-11">
        Nova tarefa
      </Button>
      {isOpen ? (
        <div className="fixed inset-0 z-50" role="presentation">
          <div
            className="absolute inset-0 bg-foreground/30"
            role="presentation"
            onClick={close}
          />
          <div
            id="e2e-tasks-dlg"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-testid="e2e-task-dialog"
            className={cn(
              "fixed end-0 top-0 z-50 m-0 h-dvh w-[min(100%,26rem)] max-w-full",
              "rounded-s-[var(--radius-lg)] border border-s border-t border-b-0 border-border bg-surface-1 p-0 shadow-md",
            )}
          >
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 id={titleId} className="text-base font-semibold tracking-tight">
                  Criar tarefa
                </h2>
                <Button type="button" size="sm" variant="ghost" onClick={close} aria-label="Fechar painel">
                  Fechar
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <CreateTaskForm
                  key={formKey}
                  defaultSpaceId={defaultSpaceId}
                  userId={userId}
                  onCancel={close}
                  onSuccess={(task) => {
                    onCreated(task);
                    close();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CreateTaskForm({
  onCancel,
  onSuccess,
  defaultSpaceId,
  userId,
}: {
  onCancel: () => void;
  onSuccess: (task: TaskListItem) => void;
  defaultSpaceId: string | null;
  userId: string;
}) {
  const [state, action, pending] = useActionState(
    (prev: CreateTaskActionState, formData: FormData) =>
      createTaskAction(prev, formData, defaultSpaceId, userId),
    initial
  );
  const titleRef = useRef<HTMLInputElement>(null);
  const formErrId = useId();
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (state.status !== "error" || !state.formErrors) {
      return;
    }
    const order = ["title", "description", "priority", "status", "dueAt"] as const;
    const first = order.find((k) => state.formErrors[k]?.[0]);
    if (first === "title" || first === undefined) {
      titleRef.current?.focus();
    } else {
      document.getElementById(`task-field-${first}`)?.focus();
    }
  }, [state]);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }
    onSuccessRef.current(state.task);
  }, [state]);

  const fe = state.status === "error" ? state.formErrors : undefined;
  const globalMsg = state.status === "error" && state.message ? state.message : undefined;

  return (
    <form action={action} className="space-y-4">
      {globalMsg ? (
        <p id={formErrId} className="text-sm text-danger" role="alert">
          {globalMsg}
        </p>
      ) : null}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute start-[-9999px] h-px w-px overflow-hidden"
        aria-hidden
      />
      <Input
        ref={titleRef}
        id="task-field-title"
        name="title"
        label="Título"
        required
        minLength={2}
        maxLength={120}
        error={fe?.title?.[0]}
        autoComplete="off"
      />
      <Textarea
        id="task-field-description"
        name="description"
        label="Descrição (opcional)"
        rows={4}
        maxLength={2000}
        error={fe?.description?.[0]}
      />
      <SelectField
        id="task-field-priority"
        name="priority"
        label="Prioridade"
        defaultValue="media"
        required
        error={fe?.priority?.[0]}
        options={[
          { value: "baixa", label: "Baixa" },
          { value: "media", label: "Média" },
          { value: "alta", label: "Alta" },
        ]}
      />
      <SelectField
        id="task-field-status"
        name="status"
        label="Estado inicial"
        defaultValue="pendente"
        required
        error={fe?.status?.[0]}
        options={[
          { value: "pendente", label: "Pendente" },
          { value: "em_curso", label: "Em curso" },
        ]}
      />
      <Input
        id="task-field-dueAt"
        name="dueAt"
        type="date"
        label="Prazo (opcional)"
        error={fe?.dueAt?.[0]}
      />
      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="min-h-11">
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="min-h-11"
          disabled={pending}
          isLoading={pending}
          loadingLabel="Salvando"
          aria-busy={pending || undefined}
        >
          Criar
        </Button>
      </div>
    </form>
  );
}
