"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

import type { SpaceItem, SpaceFeedItem } from "@/types/domain";
import { SimpleTabs } from "@/components/ui/simple-tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export interface SpaceDetailViewProps {
  space: SpaceItem;
  initialFeed: SpaceFeedItem[];
}

const kindLabel: Record<SpaceFeedItem["kind"], string> = {
  voice: "Voz",
  note: "Nota",
  task: "Tarefa",
};

export function SpaceDetailView({ space, initialFeed }: SpaceDetailViewProps) {
  const reduce = useReducedMotion();
  const [items, setItems] = useState<SpaceFeedItem[]>(initialFeed);
  const [draft, setDraft] = useState("");

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    [items],
  );

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) {
      return;
    }
    const next: SpaceFeedItem = {
      id: `local_${Date.now().toString(36)}`,
      spaceId: space.id,
      author: "Tu",
      body,
      at: new Date().toISOString(),
      kind: "note",
    };
    setItems((prev) => [next, ...prev]);
    setDraft("");
  };

  const headerBg = space.color.replace(/oklch\((.+)\s(.+)\s(.+)\)/, (_, l, c, h) => {
    return `oklch(${l} ${c} ${h} / 0.1)`;
  });

  const tabItems = [
    {
      id: "conversas",
      label: "Gravações",
      content: (
        <div className="grid gap-6 lg:grid-cols-[1fr_min(100%,20rem)]">
          <motion.ul
            className="space-y-3"
            initial={false}
            role="list"
            aria-label="Histórico do espaço"
          >
            {sorted.map((m, i) => (
              <motion.li
                key={m.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  delay: reduce ? 0 : Math.min(i * 0.03, 0.24),
                }}
                className="rounded-[var(--radius-md)] border border-border bg-background px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{m.author}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={m.at}>{new Date(m.at).toLocaleString("pt-BR")}</time>
                  <Badge variant="outline">{kindLabel[m.kind]}</Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{m.body}</p>
              </motion.li>
            ))}
          </motion.ul>

          <aside className="rounded-[var(--radius-lg)] border border-border bg-surface-1 p-4">
            <h2 className="text-sm font-semibold">Nova mensagem</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Adicione uma nota ou resumo ao espaço.
            </p>
            <form onSubmit={handleSend} className="mt-4 space-y-3">
              <Textarea
                label="Compor"
                name="composer"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                placeholder="Escreva uma nota ou resumo…"
              />
              <Button type="submit" variant="primary" className="w-full" disabled={!draft.trim()}>
                Adicionar ao feed
              </Button>
            </form>
          </aside>
        </div>
      ),
    },
    {
      id: "tarefas",
      label: "Tarefas",
      content: (
        <p className="text-sm text-foreground/70">
          As tarefas do espaço aparecem aqui assim que forem criadas a partir de uma gravação.
        </p>
      ),
    },
    {
      id: "membros",
      label: "Membros",
      content: (
        <p className="text-sm text-foreground/70">
          Membros do espaço e as suas funções. Gestão de permissões disponível em breve.
        </p>
      ),
    },
    {
      id: "config",
      label: "Configurações",
      content: (
        <p className="text-sm text-foreground/70">
          Nome, cor, permissões e exportação. Configurações persistentes disponíveis em breve.
        </p>
      ),
    },
  ] as const satisfies Array<{ id: string; label: string; content: ReactNode }>;

  return (
    <div className="space-y-6">
      <div
        className="rounded-[var(--radius-xl)] border border-border/60 px-6 py-8 sm:py-10"
        style={{ backgroundColor: headerBg }}
      >
        <Link
          href="/spaces"
          className="inline-flex items-center text-sm font-medium text-accent underline-offset-2 hover:underline"
        >
          ← Espaços
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div
            className="h-5 w-5 rounded-full flex-shrink-0"
            style={{ backgroundColor: space.color }}
            aria-hidden
          />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{space.name}</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-foreground/75">{space.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{space.memberCount} membros</Badge>
          <span className="text-xs text-foreground/60">
            Última atividade: {new Date(space.lastActivity).toLocaleString("pt-BR")}
          </span>
        </div>
      </div>

      <SimpleTabs items={tabItems} />
    </div>
  );
}
