import type { PendingInvite, TeamMember } from "@/types/team";

export const mockTeamMembers: TeamMember[] = [
  {
    id: "m1",
    name: "Ana Silva",
    email: "ana@exemplo.com",
    role: "admin",
    lastSeenAt: "2026-04-25T12:00:00.000Z",
  },
  {
    id: "m2",
    name: "Miguel Costa",
    email: "miguel@exemplo.com",
    role: "membro",
    lastSeenAt: "2026-04-24T18:30:00.000Z",
  },
  {
    id: "m3",
    name: "Convidado Demo",
    email: "convidado@exemplo.com",
    role: "convidado",
    lastSeenAt: "2026-04-20T09:00:00.000Z",
  },
];

export const mockInvites: PendingInvite[] = [
  {
    id: "inv_p1",
    email: "rita@exemplo.com",
    role: "membro",
    sentAt: "2026-04-23T10:00:00.000Z",
  },
];
