export type ActivityCtx = {
  recordingTitle?: string;
  spaceName?: string;
  taskTitle?: string;
  provider?: string;
};

const TEMPLATES: Record<string, (c: ActivityCtx) => string> = {
  "recording.create": (c) =>
    `Você gravou um áudio${c.spaceName ? ` em ${c.spaceName}` : ""}`,
  "recording.transcribed": (c) =>
    `Transcrição pronta${c.recordingTitle ? `: ${c.recordingTitle}` : ""}`,
  "recording.summarized": (c) =>
    `Resumo gerado${c.recordingTitle ? ` para ${c.recordingTitle}` : ""}`,
  "space.create": (c) =>
    `Espaço «${c.spaceName ?? "novo espaço"}» criado`,
  "task.create": (c) =>
    `Nova tarefa: ${c.taskTitle ?? "(sem título)"}`,
  "task.complete": (c) =>
    `Tarefa concluída: ${c.taskTitle ?? ""}`,
  "task.archive": (c) =>
    `Tarefa arquivada: ${c.taskTitle ?? ""}`,
  "integration.connected": (c) =>
    `Você conectou ${c.provider ?? "uma integração"}`,
};

export function formatActivityLabel(
  action: string,
  ctx: ActivityCtx = {},
): string {
  const tpl = TEMPLATES[action];
  if (tpl) return tpl(ctx);
  // fallback: traduz snake_case → "Palavra › Palavra"
  return action
    .split(".")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" › ");
}

export function getActivityIcon(
  action: string,
): "mic" | "folder" | "check-square" | "plug" | "activity" {
  if (action.startsWith("recording.")) return "mic";
  if (action.startsWith("space.")) return "folder";
  if (action.startsWith("task.")) return "check-square";
  if (action.startsWith("integration.")) return "plug";
  return "activity";
}
