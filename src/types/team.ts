export type UserRole = "admin" | "membro" | "convidado";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastSeenAt: string;
  avatarUrl?: string;
};

export type PendingInvite = {
  id: string;
  email: string;
  role: UserRole;
  sentAt: string;
};
