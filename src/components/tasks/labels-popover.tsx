"use client";

import { useState, useTransition } from "react";
import { Tag, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createLabel, attachLabel, detachLabel } from "@/features/tasks/actions";

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------

type LabelColor =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "gray";

const COLORS: { value: LabelColor; bg: string; label: string }[] = [
  { value: "red", bg: "bg-red-500", label: "Vermelho" },
  { value: "orange", bg: "bg-orange-500", label: "Laranja" },
  { value: "yellow", bg: "bg-yellow-400", label: "Amarelo" },
  { value: "green", bg: "bg-green-500", label: "Verde" },
  { value: "blue", bg: "bg-blue-500", label: "Azul" },
  { value: "purple", bg: "bg-purple-500", label: "Roxo" },
  { value: "pink", bg: "bg-pink-500", label: "Rosa" },
  { value: "gray", bg: "bg-gray-400", label: "Cinza" },
];

const COLOR_BG: Record<string, string> = Object.fromEntries(
  COLORS.map((c) => [c.value, c.bg]),
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LabelItem {
  id: string;
  name: string;
  color: string;
}

interface LabelsPopoverProps {
  taskId: string;
  spaceId: string;
  spaceLabels: LabelItem[];
  taskLabels: LabelItem[];
  onLabelsChange?: (labels: LabelItem[]) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LabelsPopover({
  taskId,
  spaceId,
  spaceLabels,
  taskLabels,
  onLabelsChange,
}: LabelsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<LabelColor>("blue");
  const [currentTaskLabels, setCurrentTaskLabels] = useState<LabelItem[]>(taskLabels);
  const [currentSpaceLabels, setCurrentSpaceLabels] = useState<LabelItem[]>(spaceLabels);
  const [isPending, startTransition] = useTransition();

  const isAttached = (labelId: string) =>
    currentTaskLabels.some((l) => l.id === labelId);

  const handleToggle = (label: LabelItem) => {
    startTransition(async () => {
      if (isAttached(label.id)) {
        await detachLabel(taskId, label.id);
        const updated = currentTaskLabels.filter((l) => l.id !== label.id);
        setCurrentTaskLabels(updated);
        onLabelsChange?.(updated);
      } else {
        await attachLabel(taskId, label.id);
        const updated = [...currentTaskLabels, label];
        setCurrentTaskLabels(updated);
        onLabelsChange?.(updated);
      }
    });
  };

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await createLabel({ spaceId, name: trimmed, color: newColor });
      if (result.ok) {
        const label = result.label;
        setCurrentSpaceLabels([...currentSpaceLabels, label]);
        setNewName("");
        setCreating(false);
      }
    });
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Gerenciar labels"
        className="w-full justify-start gap-2"
      >
        <Tag className="size-4" />
        Labels
      </Button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-64 rounded-[var(--radius-lg)] border border-border/60 bg-popover p-3 shadow-xl"
          role="dialog"
          aria-label="Seleção de labels"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Labels
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {currentSpaceLabels.length === 0 && (
              <p className="text-xs text-muted-foreground py-2 text-center">
                Nenhuma label. Crie uma abaixo.
              </p>
            )}
            {currentSpaceLabels.map((label) => (
              <button
                key={label.id}
                type="button"
                onClick={() => handleToggle(label)}
                disabled={isPending}
                className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 hover:bg-surface-2 transition-colors"
                aria-pressed={isAttached(label.id)}
              >
                <span
                  className={cn(
                    "h-4 w-8 rounded-sm shrink-0",
                    COLOR_BG[label.color] ?? "bg-gray-400",
                  )}
                />
                <span className="flex-1 text-sm text-left truncate">{label.name}</span>
                {isAttached(label.id) && <Check className="size-3.5 text-primary shrink-0" />}
              </button>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-border/40">
            {creating ? (
              <div className="space-y-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") { setCreating(false); setNewName(""); }
                  }}
                  placeholder="Nome da label"
                  className="w-full text-sm bg-transparent border-b border-primary outline-none py-0.5"
                  aria-label="Nome da nova label"
                />
                <div className="flex flex-wrap gap-1">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewColor(c.value)}
                      className={cn(
                        "h-5 w-5 rounded-full transition-transform",
                        c.bg,
                        newColor === c.value && "ring-2 ring-offset-1 ring-primary scale-110",
                      )}
                      aria-label={c.label}
                      aria-pressed={newColor === c.value}
                      title={c.label}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={handleCreate}
                    isLoading={isPending}
                    loadingLabel="A criar…"
                    disabled={!newName.trim()}
                  >
                    Criar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => { setCreating(false); setNewName(""); }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-1"
              >
                <Plus className="size-3.5" />
                Criar nova label
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
