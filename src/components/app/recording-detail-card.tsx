"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Clock3, FileText, ListChecks, UserRound } from "lucide-react";
import { toast } from "sonner";

import type {
  RecordingDetailItem,
  RecordingSuggestedTaskItem,
  SpaceMemberOption,
} from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createTasksFromRecordingSuggestions } from "@/features/recordings/actions";
import { cn } from "@/lib/utils";

type Props = {
  recording: RecordingDetailItem;
  members: SpaceMemberOption[];
};

function formatDuration(sec: number): string {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function assigneeLabel(task: RecordingSuggestedTaskItem): string {
  if (task.assigneeStatus === "matched") return task.assigneeName ?? "Responsável definido";
  if (task.assigneeStatus === "not_found") return "Responsável citado não encontrado";
  if (task.assigneeStatus === "explicitly_unassigned") return "Sem responsável";
  return "Responsável pendente";
}

export function RecordingDetailCard({ recording, members }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(recording.suggestedTasks.filter((task) => task.canCreate).map((task) => task.id)),
  );
  const [drafts, setDrafts] = useState<Record<string, RecordingSuggestedTaskItem>>(() =>
    Object.fromEntries(recording.suggestedTasks.map((task) => [task.id, task])),
  );
  const [isPending, startTransition] = useTransition();

  const selectedTasks = useMemo(
    () => Array.from(selected).map((id) => drafts[id]).filter(Boolean),
    [drafts, selected],
  );

  function updateDraft(id: string, patch: Partial<RecordingSuggestedTaskItem>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function createSelectedTasks() {
    startTransition(async () => {
      const invalid = selectedTasks.find(
        (task) => !task.assigneeUserId && task.assigneeStatus !== "explicitly_unassigned",
      );
      if (invalid) {
        toast.error(`Defina o responsável de "${invalid.title}" antes de criar.`);
        return;
      }

      const result = await createTasksFromRecordingSuggestions({
        recordingId: recording.id,
        tasks: selectedTasks.map((task) => ({
          recordingId: recording.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueAt: task.dueAt,
          assigneeUserId: task.assigneeUserId,
          explicitlyUnassigned: task.assigneeStatus === "explicitly_unassigned",
          source: {
            why: task.fields.why,
            where: task.fields.where,
            how: task.fields.how,
            howMuch: task.fields.howMuch,
            transcriptQuote: task.transcriptQuote,
          },
        })),
      });

      if (result.ok) {
        toast.success(`${result.created} tarefa(s) criada(s).`);
        setSelected(new Set());
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <article className="rounded-[var(--radius-md)] border border-border bg-background px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full text-left"
        aria-expanded={open}
      >
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{recording.author}</span>
          <span aria-hidden>·</span>
          <time dateTime={recording.capturedAt}>
            {new Date(recording.capturedAt).toLocaleString("pt-BR")}
          </time>
          <Badge variant="outline">Voz</Badge>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              recording.statusClassName,
            )}
          >
            {recording.statusLabel}
          </span>
          <span>{formatDuration(recording.durationSec)}</span>
        </div>
        <p className="mt-2 text-sm font-medium text-foreground">
          {recording.title ?? "Gravação sem título"}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {recording.abstract ?? recording.transcript?.slice(0, 180) ?? "Processando conteúdo da gravação."}
        </p>
      </button>

      {open && (
        <div className="mt-4 space-y-5 border-t border-border/60 pt-4">
          <audio controls src={recording.streamUrl} className="w-full" />

          <section className="grid gap-3 md:grid-cols-3" aria-label="Resumo da gravação">
            <div className="rounded-[var(--radius-md)] border border-border/60 bg-surface-1 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="size-4" />
                Resumo rápido
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {recording.abstract ?? "Resumo ainda indisponível."}
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border/60 bg-surface-1 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="size-4" />
                Decisões
              </div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {recording.decisions.length > 0
                  ? recording.decisions.map((item) => <li key={item}>{item}</li>)
                  : <li>Nenhuma decisão explícita.</li>}
              </ul>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border/60 bg-surface-1 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ListChecks className="size-4" />
                Próximos passos
              </div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {recording.nextSteps.length > 0
                  ? recording.nextSteps.map((item) => <li key={item}>{item}</li>)
                  : <li>Nenhum próximo passo sem dono claro.</li>}
              </ul>
            </div>
          </section>

          <section className="space-y-3" aria-label="Tarefas sugeridas">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Tarefas sugeridas</h3>
                <p className="text-xs text-muted-foreground">
                  Revise o 5W2H antes de criar tarefas reais no VoiceStream.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="primary"
                disabled={selectedTasks.length === 0 || isPending}
                onClick={createSelectedTasks}
              >
                Criar selecionadas
              </Button>
            </div>

            {recording.suggestedTasks.length === 0 ? (
              <p className="rounded-[var(--radius-md)] border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                Nenhuma tarefa candidata foi identificada nesta gravação.
              </p>
            ) : (
              <div className="space-y-3">
                {recording.suggestedTasks.map((task) => {
                  const draft = drafts[task.id] ?? task;
                  return (
                    <div key={task.id} className="rounded-[var(--radius-md)] border border-border/60 bg-surface-1 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <label className="flex min-w-0 flex-1 items-start gap-2">
                          <input
                            type="checkbox"
                            checked={selected.has(task.id)}
                            onChange={() => toggle(task.id)}
                            className="mt-1"
                          />
                          <span className="min-w-0">
                            <input
                              value={draft.title}
                              onChange={(e) => updateDraft(task.id, { title: e.target.value })}
                              className="w-full bg-transparent text-sm font-semibold outline-none focus:ring-1 focus:ring-brand/40"
                              aria-label="O quê"
                            />
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {assigneeLabel(draft)}
                            </span>
                          </span>
                        </label>
                        <Badge variant={draft.priority === "alta" ? "danger" : draft.priority === "media" ? "warning" : "info"}>
                          {draft.priority === "alta" ? "Alta" : draft.priority === "media" ? "Média" : "Baixa"}
                        </Badge>
                      </div>

                      <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
                        <div><strong>Por quê:</strong> {draft.fields.why ?? "Não identificado"}</div>
                        <div><strong>Quando:</strong> {draft.dueAt ?? "Sem prazo"}</div>
                        <div><strong>Onde:</strong> {draft.fields.where}</div>
                        <div><strong>Como:</strong> {draft.fields.how ?? "Não identificado"}</div>
                        <div><strong>Quanto:</strong> {draft.fields.howMuch ?? "Não identificado"}</div>
                        <label className="flex items-center gap-2">
                          <UserRound className="size-3.5" />
                          <select
                            value={draft.assigneeUserId ?? (draft.assigneeStatus === "explicitly_unassigned" ? "__none" : "")}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateDraft(task.id, {
                                assigneeUserId: value === "__none" || value === "" ? null : value,
                                assigneeStatus: value === "__none" ? "explicitly_unassigned" : value ? "matched" : "missing",
                              });
                            }}
                            className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-border bg-background px-2 py-1"
                          >
                            <option value="">Definir responsável</option>
                            <option value="__none">Sem responsável</option>
                            {members.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock3 className="size-4" />
              Transcrição
            </div>
            {recording.segments.length > 0 ? (
              <ol className="space-y-2">
                {recording.segments.map((segment) => (
                  <li key={segment.id} className="rounded-[var(--radius-sm)] bg-surface-1 px-3 py-2 text-sm">
                    <span className="mr-2 text-xs font-semibold text-muted-foreground">
                      {formatMs(segment.startMs)}
                    </span>
                    <span className="mr-2 text-xs text-muted-foreground">
                      {segment.speaker ?? "Fala"}
                    </span>
                    {segment.text}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="whitespace-pre-wrap rounded-[var(--radius-md)] bg-surface-1 p-3 text-sm leading-relaxed">
                {recording.transcript ?? "Transcrição ainda indisponível."}
              </p>
            )}
          </section>
        </div>
      )}
    </article>
  );
}
