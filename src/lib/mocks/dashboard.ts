/**
 * Dados mock para o painel — alinhado ao PRD (transcrição, STT, tarefas, integrações).
 */

export type DashboardKpi = {
  id: string;
  title: string;
  value: string;
  hint: string;
  deltaLabel: string;
  deltaPositive: boolean | null;
};

export const DASHBOARD_KPIS: readonly DashboardKpi[] = [
  {
    id: "minutes",
    title: "Minutos transcritos (7d)",
    value: "142",
    hint: "Áudio processado via STT",
    deltaLabel: "+12% vs. período anterior",
    deltaPositive: true,
  },
  {
    id: "sessions",
    title: "Sessões STT",
    value: "38",
    hint: "Gravações com transcrição em tempo real",
    deltaLabel: "+4",
    deltaPositive: true,
  },
  {
    id: "tasks",
    title: "Tarefas extraídas",
    value: "21",
    hint: "Intents → itens no painel",
    deltaLabel: "3 pendentes revisão",
    deltaPositive: null,
  },
  {
    id: "integrations",
    title: "Integrações ativas",
    value: "5",
    hint: "Slack, Linear, Notion…",
    deltaLabel: "1 aviso de quota",
    deltaPositive: false,
  },
] as const;

/** Valores relativos (minutos por dia) para sparkline — últimos 7 dias. */
export const DASHBOARD_MINUTES_7D: readonly number[] = [12, 18, 9, 22, 19, 26, 24] as const;

export type DashboardActivityItem = {
  id: string;
  title: string;
  meta: string;
  tone: "default" | "success" | "warning";
};

export const DASHBOARD_RECENT_ACTIVITY: readonly DashboardActivityItem[] = [
  {
    id: "a1",
    title: "Nova gravação no espaço Produto Q2",
    meta: "há 12 min",
    tone: "success",
  },
  {
    id: "a2",
    title: "Tarefa criada: Follow-up cliente X",
    meta: "há 48 min",
    tone: "warning",
  },
  {
    id: "a3",
    title: "Você criou o espaço Equipa de Voz",
    meta: "há 2 h",
    tone: "default",
  },
  {
    id: "a4",
    title: "Gravação sincronizada com sucesso",
    meta: "ontem",
    tone: "default",
  },
] as const;

export type QuickAction = {
  href: string;
  label: string;
  description: string;
};

export const DASHBOARD_QUICK_ACTIONS: readonly QuickAction[] = [
  {
    href: "/capture",
    label: "Nova captura",
    description: "Iniciar sessão de voz e STT",
  },
  {
    href: "/spaces",
    label: "Espaços",
    description: "Organizar ambientes e membros",
  },
  {
    href: "/tasks",
    label: "Tarefas",
    description: "Rever intents e pendências",
  },
  {
    href: "/integrations",
    label: "Integrações",
    description: "Ligar Slack, Linear, calendário…",
  },
  {
    href: "/onboarding",
    label: "Primeiros passos",
    description: "Rever privacidade, voz e ligações",
  },
  {
    href: "/settings",
    label: "Configurações",
    description: "Perfil, notificações e segurança",
  },
] as const;
