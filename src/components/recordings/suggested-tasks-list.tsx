"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  updateSuggestion,
  discardSuggestion,
  createTaskFromSuggestion,
  bulkCreateFromSuggestions,
} from "@/features/task-suggestions/actions";

// ─── Types ───────────────────────────────────────────────────────────────────

type Suggestion = {
  id: string;
  what: string;
  why: string | null;
  who: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeMatch: string;
  whenText: string | null;
  whenDate: string | null;
  whereText: string | null;
  how: string | null;
  howMuch: string | null;
  sourceSnippet: string | null;
  status: string;
  createdTaskId: string | null;
};

type SpaceMember = { id: string; name: string };

type Props = {
  recordingId: string;
  suggestions: Suggestion[];
  spaceMembers: SpaceMember[];
};

// ─── Assignee indicator ───────────────────────────────────────────────────────

function AssigneeIndicator({ match }: { match: string }) {
  if (match === "matched") {
    return (
      <span title="Responsável identificado">
        <CheckCircle className="size-4 text-green-500 shrink-0" aria-hidden />
      </span>
    );
  }
  if (match === "not_found") {
    return (
      <span title="Responsável não encontrado no espaço">
        <AlertTriangle className="size-4 text-yellow-500 shrink-0" aria-hidden />
      </span>
    );
  }
  return (
    <span title="Aguardando definição de responsável">
      <Clock className="size-4 text-muted-foreground shrink-0" aria-hidden />
    </span>
  );
}

// ─── SuggestionCard ──────────────────────────────────────────────────────────

function SuggestionCard({
  suggestion: initial,
  spaceMembers,
  selected,
  onToggleSelect,
}: {
  suggestion: Suggestion;
  spaceMembers: SpaceMember[];
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const [s, setS] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [explicitlyUnassigned, setExplicitlyUnassigned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (s.status === "created") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/10 p-4 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
        <CheckCircle className="size-4" />
        <span>Tarefa criada: <strong>{s.what}</strong></span>
      </div>
    );
  }

  const canCreate = s.assigneeMatch === "matched" || !!s.assigneeId || explicitlyUnassigned;

  const handleFieldBlur = (field: string, value: string | null) => {
    startTransition(async () => {
      await updateSuggestion({ id: s.id, [field]: value || null });
    });
  };

  const handleAssigneeChange = (value: string | null) => {
    const newId = !value || value === "__none__" ? null : value;
    setS((prev) => ({ ...prev, assigneeId: newId, assigneeMatch: newId ? "matched" : "pending" }));
    startTransition(async () => {
      await updateSuggestion({ id: s.id, assigneeId: newId });
    });
  };

  const handleDiscard = () => {
    startTransition(async () => {
      await discardSuggestion(s.id);
      setS((prev) => ({ ...prev, status: "discarded" }));
    });
  };

  const handleCreate = () => {
    setError(null);
    startTransition(async () => {
      const result = await createTaskFromSuggestion(s.id, {
        assigneeId: s.assigneeId,
        explicitlyUnassigned,
      });
      if (result.ok) {
        setS((prev) => ({ ...prev, status: "created", createdTaskId: result.taskId }));
      } else {
        setError(result.error);
      }
    });
  };

  if (s.status === "discarded") return null;

  return (
    <div className={cn("rounded-lg border bg-surface-1 p-4 space-y-3 transition-colors", selected && "ring-2 ring-primary/40")}>
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(s.id)}
          className="mt-1 shrink-0"
          aria-label="Selecionar sugestão"
        />
        <div className="flex-1 space-y-3">
          {/* O quê */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">O quê</label>
            <Input
              defaultValue={s.what}
              onBlur={(e) => {
                setS((prev) => ({ ...prev, what: e.target.value }));
                handleFieldBlur("what", e.target.value);
              }}
              className="mt-1"
              placeholder="Ação a ser realizada"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Por quê */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Por quê</label>
              <Input
                defaultValue={s.why ?? ""}
                onBlur={(e) => handleFieldBlur("why", e.target.value)}
                className="mt-1"
                placeholder="Contexto / motivação"
              />
            </div>

            {/* Quando */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Quando</label>
              <Input
                defaultValue={s.whenText ?? ""}
                onBlur={(e) => handleFieldBlur("whenText", e.target.value)}
                className="mt-1"
                placeholder="Prazo"
              />
            </div>

            {/* Onde */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Onde</label>
              <Input
                defaultValue={s.whereText ?? ""}
                onBlur={(e) => handleFieldBlur("whereText", e.target.value)}
                className="mt-1"
                placeholder="Contexto / local"
              />
            </div>

            {/* Como */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Como</label>
              <Input
                defaultValue={s.how ?? ""}
                onBlur={(e) => handleFieldBlur("how", e.target.value)}
                className="mt-1"
                placeholder="Método / instrução"
              />
            </div>

            {/* Quanto */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Quanto</label>
              <Input
                defaultValue={s.howMuch ?? ""}
                onBlur={(e) => handleFieldBlur("howMuch", e.target.value)}
                className="mt-1"
                placeholder="Custo / esforço"
              />
            </div>

            {/* Responsável */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <label className="text-xs font-medium text-muted-foreground">Responsável</label>
                <AssigneeIndicator match={s.assigneeId ? "matched" : s.assigneeMatch} />
                {s.assigneeMatch === "not_found" && s.who && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    &quot;{s.who}&quot; não encontrado
                  </span>
                )}
              </div>
              <Select
                value={s.assigneeId ?? "__none__"}
                onValueChange={handleAssigneeChange}
              >
                <SelectTrigger className="mt-0">
                  <SelectValue placeholder="Selecionar membro..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Nenhum —</SelectItem>
                  {spaceMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Trecho de origem */}
          {s.sourceSnippet && (
            <blockquote className="text-xs text-muted-foreground border-l-2 border-border pl-3 italic line-clamp-2">
              {s.sourceSnippet}
            </blockquote>
          )}

          {/* Sem responsável toggle */}
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={explicitlyUnassigned}
              onChange={(e) => setExplicitlyUnassigned(e.target.checked)}
            />
            Criar sem responsável
          </label>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={isPending || !canCreate}
              title={!canCreate ? "Defina o responsável ou marque 'Sem responsável'" : undefined}
            >
              Criar tarefa
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDiscard} disabled={isPending}>
              Descartar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SuggestedTasksList ──────────────────────────────────────────────────────

export function SuggestedTasksList({ suggestions, spaceMembers }: Omit<Props, "recordingId"> & { recordingId?: string }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [bulkResult, setBulkResult] = useState<{ created: number; skipped: number } | null>(null);

  const pending = suggestions.filter((s) => s.status === "pending");

  if (pending.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhuma sugestão de tarefa disponível para esta gravação.
      </p>
    );
  }

  const allIds = pending.map((s) => s.id);
  const allSelected = allIds.every((id) => selected.has(id));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  };

  const handleBulkCreate = () => {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await bulkCreateFromSuggestions(ids);
      setBulkResult({ created: result.created, skipped: result.skipped });
      setSelected(new Set());
    });
  };

  const handleBulkDiscard = () => {
    const ids = Array.from(selected);
    startTransition(async () => {
      await Promise.all(ids.map((id) => discardSuggestion(id)));
      setSelected(new Set());
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} />
          Selecionar tudo
        </label>
        <Button
          size="sm"
          variant="outline"
          onClick={handleBulkCreate}
          disabled={selected.size === 0 || isPending}
        >
          Criar selecionadas ({selected.size})
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleBulkDiscard}
          disabled={selected.size === 0 || isPending}
        >
          Descartar selecionadas
        </Button>
      </div>

      {bulkResult && (
        <p className="text-sm text-muted-foreground">
          {bulkResult.created} tarefa(s) criada(s), {bulkResult.skipped} ignorada(s).
        </p>
      )}

      {/* Cards */}
      <div className="space-y-3">
        {suggestions.map((s) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            spaceMembers={spaceMembers}
            selected={selected.has(s.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>
    </div>
  );
}
