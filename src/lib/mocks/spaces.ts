import type { UserRole } from "@/types/team";

export type MockSpace = {
  id: string;
  name: string;
  description: string;
  lastActivity: string;
  members: number;
  color: string;
  icon: string;
};

const now = "2026-04-20T10:00:00.000Z";

export const mockSpaces: MockSpace[] = [
  {
    id: "sp_1",
    name: "Família",
    description: "Calendário, compras, conversas de casa",
    lastActivity: now,
    members: 3,
    color: "oklch(62% 0.12 255)",
    icon: "home",
  },
  {
    id: "sp_2",
    name: "Trabalho — Produto",
    description: "Decisões, reuniões, follow-ups de sprint",
    lastActivity: "2026-04-19T16:20:00.000Z",
    members: 8,
    color: "oklch(58% 0.14 280)",
    icon: "work",
  },
  {
    id: "sp_3",
    name: "Pessoal",
    description: "Hábitos, notas, reflexões de voz",
    lastActivity: "2026-04-18T08:00:00.000Z",
    members: 1,
    color: "oklch(64% 0.12 150)",
    icon: "self",
  },
];

export const mockSpaceMembers: { spaceId: string; name: string; role: UserRole }[] = [
  { spaceId: "sp_1", name: "Ana", role: "admin" },
  { spaceId: "sp_1", name: "Miguel", role: "membro" },
  { spaceId: "sp_2", name: "Rita", role: "admin" },
  { spaceId: "sp_2", name: "Tiago", role: "membro" },
];

export type MockSpaceFeedItem = {
  id: string;
  spaceId: string;
  author: string;
  body: string;
  at: string;
  kind: "voice" | "note" | "task";
};

const feedBySpace: Record<string, MockSpaceFeedItem[]> = {
  sp_1: [
    {
      id: "f1",
      spaceId: "sp_1",
      author: "Ana",
      body: "Lembrem-se de confirmar a consulta na terça.",
      at: "2026-04-20T09:15:00.000Z",
      kind: "voice",
    },
    {
      id: "f2",
      spaceId: "sp_1",
      author: "Miguel",
      body: "Lista de compras: leite, pão integral, fruta.",
      at: "2026-04-19T18:40:00.000Z",
      kind: "note",
    },
  ],
  sp_2: [
    {
      id: "f3",
      spaceId: "sp_2",
      author: "Rita",
      body: "Sprint review — foco em métricas de adoção e NPS.",
      at: "2026-04-19T15:00:00.000Z",
      kind: "voice",
    },
    {
      id: "f4",
      spaceId: "sp_2",
      author: "Tiago",
      body: "Follow-up: enviar mockups até quinta.",
      at: "2026-04-18T11:22:00.000Z",
      kind: "task",
    },
  ],
  sp_3: [
    {
      id: "f5",
      spaceId: "sp_3",
      author: "Tu",
      body: "Reflexão rápida: sono melhorou com rotina fixa.",
      at: "2026-04-18T07:30:00.000Z",
      kind: "note",
    },
  ],
};

export function getMockSpaceById(id: string): MockSpace | undefined {
  return mockSpaces.find((s) => s.id === id);
}

export function getMockFeedForSpace(spaceId: string): MockSpaceFeedItem[] {
  return feedBySpace[spaceId] ?? [];
}
