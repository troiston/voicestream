export type UsagePoint = { day: string; minutes: number };
export type IntentCount = { intent: string; count: number };
export type SpaceUse = { space: string; minutes: number };

export const usageLast7d: UsagePoint[] = [
  { day: "Sáb", minutes: 12 },
  { day: "Dom", minutes: 8 },
  { day: "Seg", minutes: 34 },
  { day: "Ter", minutes: 22 },
  { day: "Qua", minutes: 41 },
  { day: "Qui", minutes: 19 },
  { day: "Sex", minutes: 28 },
];

export const topIntents: IntentCount[] = [
  { intent: "criar tarefa", count: 42 },
  { intent: "agendar reunião", count: 18 },
  { intent: "resumir notas", count: 31 },
];

export const topSpaces: SpaceUse[] = [
  { space: "Trabalho — Produto", minutes: 140 },
  { space: "Família", minutes: 62 },
  { space: "Pessoal", minutes: 35 },
];

/** Agregação semanal para o separador “30 dias” (mock). */
export const usageLast30dByWeek: UsagePoint[] = [
  { day: "Sem 1", minutes: 95 },
  { day: "Sem 2", minutes: 132 },
  { day: "Sem 3", minutes: 88 },
  { day: "Sem 4", minutes: 154 },
];
