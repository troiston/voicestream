import type { TaskPriority } from "@/generated/prisma/client";

export type SuggestedTaskCandidate = {
  what: string;
  why: string | null;
  who: string | null;
  when: string | null;
  where: string | null;
  how: string | null;
  howMuch: string | null;
  priority: TaskPriority;
  transcriptQuote?: string | null;
};

export type KnownMember = {
  id: string;
  name: string;
};

export type NormalizedSuggestedTask = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueAt: string | null;
  assigneeUserId: string | null;
  assigneeName: string | null;
  assigneeStatus: "matched" | "missing" | "not_found" | "explicitly_unassigned";
  canCreate: boolean;
  fields: {
    what: string;
    why: string | null;
    who: string | null;
    when: string | null;
    where: string;
    how: string | null;
    howMuch: string | null;
  };
  transcriptQuote: string | null;
};

export type SuggestedTaskInput = SuggestedTaskCandidate & {
  id?: string;
  assigneeUserId?: string | null;
  explicitlyUnassigned?: boolean;
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function makeId(value: string): string {
  const base = normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return base || `sugestao-${Date.now().toString(36)}`;
}

function findMember(spokenName: string, members: KnownMember[]): KnownMember | null {
  const needle = normalizeText(spokenName);
  if (!needle) return null;

  return (
    members.find((member) => {
      const haystack = normalizeText(member.name);
      return haystack === needle || haystack.includes(needle) || needle.includes(haystack);
    }) ?? null
  );
}

export function normalizeSuggestedTask(
  candidate: SuggestedTaskInput,
  context: { spaceName: string; knownMembers: KnownMember[] },
): NormalizedSuggestedTask {
  const title = candidate.what.trim();
  const matched = candidate.who ? findMember(candidate.who, context.knownMembers) : null;
  const assigneeUserId = candidate.assigneeUserId ?? matched?.id ?? null;

  let assigneeStatus: NormalizedSuggestedTask["assigneeStatus"];
  if (assigneeUserId) {
    assigneeStatus = "matched";
  } else if (candidate.explicitlyUnassigned) {
    assigneeStatus = "explicitly_unassigned";
  } else if (candidate.who) {
    assigneeStatus = "not_found";
  } else {
    assigneeStatus = "missing";
  }

  const where = candidate.where?.trim() || context.spaceName;
  const descriptionParts = [
    candidate.why ? `Por quê: ${candidate.why}` : null,
    candidate.how ? `Como: ${candidate.how}` : null,
    candidate.howMuch ? `Quanto: ${candidate.howMuch}` : null,
    candidate.transcriptQuote ? `Trecho de origem: "${candidate.transcriptQuote}"` : null,
  ].filter(Boolean);

  return {
    id: candidate.id ?? makeId(`${title}-${candidate.who ?? "sem-responsavel"}`),
    title,
    description: descriptionParts.join("\n"),
    priority: candidate.priority,
    dueAt: candidate.when,
    assigneeUserId,
    assigneeName: matched?.name ?? candidate.who,
    assigneeStatus,
    canCreate: assigneeStatus === "matched" || assigneeStatus === "explicitly_unassigned",
    fields: {
      what: title,
      why: candidate.why,
      who: candidate.who,
      when: candidate.when,
      where,
      how: candidate.how,
      howMuch: candidate.howMuch,
    },
    transcriptQuote: candidate.transcriptQuote ?? null,
  };
}

export function normalizeSuggestedTasks(
  candidates: SuggestedTaskInput[],
  context: { spaceName: string; knownMembers: KnownMember[] },
): NormalizedSuggestedTask[] {
  return candidates.map((candidate) => normalizeSuggestedTask(candidate, context));
}
