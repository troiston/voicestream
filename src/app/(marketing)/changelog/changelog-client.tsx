"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ChangelogEntry, ChangelogType } from "@/types/blog";

const ALL = "todos" as const;

const badge: Record<ChangelogType, string> = {
  novo: "Novo",
  melhoria: "Melhoria",
  correcao: "Correção",
};

const badgeStyle: Record<ChangelogType, string> = {
  novo: "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
  melhoria: "bg-[var(--info)]/15 text-[var(--info)] border-[var(--info)]/30",
  correcao: "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
};

type Props = { initial: ChangelogEntry[] };

export function ChangelogClient({ initial }: Props) {
  const f = useId();
  const [filter, setFilter] = useState<typeof ALL | ChangelogType>(ALL);

  const { groups, has } = useMemo(() => {
    const a = filter === ALL ? initial : initial.filter((x) => x.type === filter);
    const byM = new Map<string, ChangelogEntry[]>();
    for (const e of a) {
      const m = e.date.slice(0, 7);
      if (!byM.has(m)) {
        byM.set(m, []);
      }
      byM.get(m)!.push(e);
    }
    return { groups: byM, has: a.length };
  }, [initial, filter]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm" id={f}>
          Filtro:
        </span>
        <div className="inline-flex flex-wrap gap-1" role="group" aria-labelledby={f}>
          <FilterBtn active={filter === ALL} onSelect={() => setFilter(ALL)} label="Todos" />
          {(["novo", "melhoria", "correcao"] as const).map((k) => (
            <FilterBtn
              key={k}
              active={filter === k}
              onSelect={() => setFilter(k)}
              label={badge[k]}
            />
          ))}
        </div>
      </div>
      {has === 0 ? (
        <p className="text-sm text-muted-foreground" role="status">
          Sem entradas para este filtro.
        </p>
      ) : (
        <ol className="m-0 list-none space-y-8 p-0">
          {Array.from(groups.keys())
            .sort((a, b) => b.localeCompare(a))
            .map((m) => (
              <li key={m} className="m-0">
                <h2 className="text-sm font-bold uppercase text-muted-foreground">
                  {formatMonth(m)}
                </h2>
                <ol className="m-0 mt-2 list-none space-y-4 border-s-2 border-border p-0 ps-4" aria-label={`Alterações em ${formatMonth(m)}`}>
                  {groups.get(m)!.map((e) => (
                    <li key={e.id} className="m-0">
                      <div className="glass-card rounded-lg p-4 space-y-3">
                        <time className="text-xs text-muted-foreground" dateTime={e.date}>
                          {e.date}
                        </time>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span
                            className={cn(
                              "inline-flex min-h-6 items-center rounded-full border px-2.5 text-xs font-medium",
                              badgeStyle[e.type],
                            )}
                          >
                            {badge[e.type]}
                          </span>
                          <h3 className="m-0 text-base font-semibold text-foreground">{e.title}</h3>
                        </div>
                        {e.body ? <p className="m-0 text-sm text-foreground/80">{e.body}</p> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
        </ol>
      )}
    </div>
  );
}

function FilterBtn({ active, onSelect, label }: { active: boolean; onSelect: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "min-h-9 rounded-full border px-3 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border bg-surface-1 text-foreground hover:border-border/80"
      )}
    >
      {label}
    </button>
  );
}

function formatMonth(ym: string) {
  const d = new Date(`${ym}-15T12:00:00Z`);
  if (Number.isNaN(d.getTime())) {
    return ym;
  }
  return d.toLocaleDateString("pt-BR", { year: "numeric", month: "long" });
}
