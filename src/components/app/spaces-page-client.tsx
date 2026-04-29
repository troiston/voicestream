"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Grid3X3, List, Layers } from "lucide-react";

import type { MockSpace } from "@/lib/mocks/spaces";
import { CreateSpaceForm } from "@/components/app/create-space-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SpacesPageClientProps {
  initialSpaces: MockSpace[];
}

const MOCK_AVATARS = ["🧑", "👩", "🧔", "👨"];

function getRelativeTime(date: Date): string {
  const now = new Date("2026-04-28T10:00:00.000Z");
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes}m`;
  if (hours < 24) return `há ${hours}h`;
  if (days < 7) return `há ${days}d`;
  return date.toLocaleDateString("pt-BR");
}

export function SpacesPageClient({ initialSpaces }: SpacesPageClientProps) {
  const reduce = useReducedMotion();
  const [extras, setExtras] = useState<MockSpace[]>([]);
  const [query, setQuery] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const formId = useId();
  const [formMountKey, setFormMountKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const merged = useMemo(() => [...extras, ...initialSpaces], [extras, initialSpaces]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return merged;
    }
    return merged.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [merged, query]);

  const closeDialog = useCallback(() => {
    setFormMountKey((k) => k + 1);
    setIsOpen(false);
  }, []);

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDialog();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeDialog]);

  const handleCreated = useCallback(
    (space: MockSpace) => {
      setExtras((prev) => [space, ...prev]);
      closeDialog();
    },
    [closeDialog],
  );

  const emptyAll = merged.length === 0;
  const emptyFilter = !emptyAll && filtered.length === 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Espaços</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Agrupe conversas, notas e tarefas. Dados em mock — a criação simula gravação local até
            existir API.
          </p>
        </div>
        <Button type="button" variant="primary" className="btn-gradient shrink-0" onClick={openDialog}>
          Novo espaço
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1">
          <label htmlFor={`${formId}-search`} className="sr-only">
            Procurar espaços
          </label>
          <input
            id={`${formId}-search`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Procurar por nome ou descrição…"
            className={cn(
              "min-h-11 w-full max-w-md rounded-[var(--radius-md)] border border-border/60 bg-surface-1 px-3 text-sm text-foreground placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand/40",
            )}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            type="button"
            variant={isGridView ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setIsGridView(true)}
            aria-label="Visualização em grelha"
            className="transition-colors"
          >
            <Grid3X3 className="size-4" />
          </Button>
          <Button
            type="button"
            variant={!isGridView ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setIsGridView(false)}
            aria-label="Visualização em lista"
            className="transition-colors"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {emptyAll ? (
        <section
          className="rounded-[var(--radius-xl)] border-2 border-dashed border-border/50 bg-surface-1/30 p-10 text-center"
          aria-labelledby={`${formId}-empty`}
        >
          <Layers className="mx-auto size-12 text-muted-foreground/40" />
          <h2 id={`${formId}-empty`} className="mt-4 text-lg font-semibold">
            Sem espaços
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie o primeiro espaço para começar a organizar gravações e conversas.
          </p>
          <Button type="button" className="btn-gradient mt-6" variant="primary" onClick={openDialog}>
            Criar espaço
          </Button>
        </section>
      ) : null}

      {emptyFilter ? (
        <div className="rounded-[var(--radius-md)] border border-border/60 bg-surface-1 px-4 py-6 text-center">
          <Layers className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhum espaço corresponde à procura.{" "}
            <button
              type="button"
              className="font-semibold text-brand underline-offset-2 hover:underline"
              onClick={() => setQuery("")}
            >
              Limpar filtro
            </button>
          </p>
        </div>
      ) : null}

      {!emptyAll && !emptyFilter ? (
        <ul className={cn(
          "list-none p-0",
          isGridView
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "space-y-3"
        )}>
          {filtered.map((s, index) => (
            <motion.li
              key={s.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 26,
                delay: reduce ? 0 : index * 0.04,
              }}
            >
              <Link
                href={`/spaces/${s.id}`}
                className={cn(
                  "glass-card block h-full rounded-[var(--radius-xl)] transition-all hover:border-brand/30 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
                  isGridView ? "p-5" : "p-4 flex items-center gap-4"
                )}
              >
                <div className={isGridView ? "" : "flex-shrink-0"}>
                  {/* Color dot */}
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.color }}
                    aria-hidden
                  />
                </div>

                <div className={isGridView ? "" : "min-w-0 flex-1"}>
                  <h2 className={cn(
                    "font-semibold text-foreground",
                    isGridView ? "mt-3 text-base" : "text-sm"
                  )}>
                    {s.name}
                  </h2>
                  <p className={cn(
                    "text-muted-foreground",
                    isGridView ? "mt-2 line-clamp-2 text-sm" : "mt-0.5 line-clamp-1 text-xs"
                  )}>
                    {s.description}
                  </p>
                </div>

                {isGridView ? (
                  <>
                    {/* Member avatars stack */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: Math.min(3, s.members) }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-muted text-xs font-semibold",
                              i > 0 && "-ml-2"
                            )}
                            style={{
                              backgroundColor: `var(--color-brand-hsl-${i % 3})`,
                            }}
                            title={`Membro ${i + 1}`}
                          >
                            {MOCK_AVATARS[i % MOCK_AVATARS.length]}
                          </div>
                        ))}
                      </div>
                      {s.members > 3 && (
                        <span className="text-xs font-medium text-muted-foreground">
                          +{s.members - 3}
                        </span>
                      )}
                    </div>

                    {/* Captures + last activity */}
                    <p className="mt-4 text-xs text-muted-foreground">
                      {s.members} membro{s.members === 1 ? "" : "s"} · {getRelativeTime(new Date(s.lastActivity))}
                    </p>
                  </>
                ) : (
                  <div className="ml-auto flex flex-col items-end text-xs text-muted-foreground">
                    <span>{s.members} membro{s.members === 1 ? "" : "s"}</span>
                    <span>{getRelativeTime(new Date(s.lastActivity))}</span>
                  </div>
                )}
              </Link>
            </motion.li>
          ))}
        </ul>
      ) : null}

      {isOpen ? (
        <div
          className="fixed inset-0 z-50"
          role="presentation"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            role="presentation"
            onClick={closeDialog}
          />
          <div
            role="dialog"
            id="e2e-spaces-dlg"
            aria-modal="true"
            aria-labelledby={`${formId}-dlg`}
            data-testid="e2e-space-dialog"
            className="fixed top-1/2 left-1/2 z-50 w-[min(100%,28rem)] max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 glass-card rounded-[var(--radius-xl)] p-0 shadow-xl"
          >
            <span id={`${formId}-dlg`} className="sr-only">
              Diálogo criar espaço
            </span>
            <CreateSpaceForm
              key={formMountKey}
              onSuccess={handleCreated}
              onCancel={closeDialog}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
