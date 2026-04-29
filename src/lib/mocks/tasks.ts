export type TaskStatus = "pendente" | "em_curso" | "concluida";

export type TaskPriority = "baixa" | "media" | "alta";

export type MockTask = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** Data ISO (YYYY-MM-DD) ou null */
  dueAt: string | null;
};

export const MOCK_TASKS: MockTask[] = [
  {
    id: "t_1",
    title: "Rever transcrição da reunião com cliente",
    description: "Validar nomes próprios e ações acordadas.",
    status: "pendente",
    priority: "alta",
    dueAt: "2026-04-28",
  },
  {
    id: "t_2",
    title: "Partilhar resumo no Slack",
    description: "Canal #produto — incluir bullets e próximos passos.",
    status: "em_curso",
    priority: "media",
    dueAt: "2026-04-26",
  },
  {
    id: "t_3",
    title: "Arquivar gravação de onboarding",
    description: "Mover para o Espaço correto e etiquetar.",
    status: "concluida",
    priority: "baixa",
    dueAt: null,
  },
  {
    id: "t_4",
    title: "Sincronizar calendário da equipe",
    description: "Confirmar disponibilidade para sprint review.",
    status: "pendente",
    priority: "media",
    dueAt: "2026-05-02",
  },
  {
    id: "t_5",
    title: "Exportar notas para Notion",
    description: "Página «Sprint 18» — secção Decisões.",
    status: "pendente",
    priority: "baixa",
    dueAt: "2026-04-30",
  },
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendente: "Pendente",
  em_curso: "Em curso",
  concluida: "Concluída",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};
