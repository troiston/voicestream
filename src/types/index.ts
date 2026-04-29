export type { BlogFrontmatter, BlogPost, ChangelogEntry, ChangelogType } from "./blog";
export type { PendingInvite, TeamMember, UserRole } from "./team";

export type KpiId = "minutos" | "capturas" | "tarefas" | "intents";

export type DashboardKpi = {
  id: KpiId;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
};

export type ActivityItem = {
  id: string;
  kind: "captura" | "tarefa" | "integ";
  label: string;
  at: string;
};

export type PlanTier = "free" | "pro" | "team" | "enterprise";
