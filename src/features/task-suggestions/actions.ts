"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";

// ─── helpers ────────────────────────────────────────────────────────────────

async function assertSuggestionAccess(id: string, userId: string) {
  const suggestion = await db.taskSuggestion.findUnique({
    where: { id },
    include: {
      recording: {
        select: {
          id: true,
          spaceId: true,
          space: {
            select: {
              ownerId: true,
              members: { where: { status: "active" }, select: { userId: true } },
            },
          },
        },
      },
    },
  });
  if (!suggestion) throw new Error("Sugestão não encontrada.");
  const { space } = suggestion.recording;
  const isOwner = space.ownerId === userId;
  const isMember = space.members.some((m) => m.userId === userId);
  if (!isOwner && !isMember) throw new Error("Permissão negada.");
  return suggestion;
}

// ─── updateSuggestion ────────────────────────────────────────────────────────

const UpdateSuggestionSchema = z.object({
  id: z.string().min(1),
  what: z.string().min(1).max(500).optional(),
  why: z.string().max(1000).nullish(),
  who: z.string().max(200).nullish(),
  assigneeId: z.string().nullish(),
  whenText: z.string().max(200).nullish(),
  whenDate: z.string().nullish(),
  whereText: z.string().max(200).nullish(),
  how: z.string().max(1000).nullish(),
  howMuch: z.string().max(500).nullish(),
});

export async function updateSuggestion(input: z.infer<typeof UpdateSuggestionSchema>) {
  try {
    const session = await requireSession();
    const parsed = UpdateSuggestionSchema.parse(input);
    await assertSuggestionAccess(parsed.id, session.userId);

    const { id, whenDate, ...rest } = parsed;
    const data: Record<string, unknown> = { ...rest };
    if (whenDate !== undefined) {
      data.whenDate = whenDate ? new Date(whenDate) : null;
    }

    await db.taskSuggestion.update({ where: { id }, data });
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao atualizar sugestão." };
  }
}

// ─── discardSuggestion ───────────────────────────────────────────────────────

export async function discardSuggestion(id: string) {
  try {
    const session = await requireSession();
    await assertSuggestionAccess(id, session.userId);
    await db.taskSuggestion.update({ where: { id }, data: { status: "discarded" } });
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao descartar sugestão." };
  }
}

// ─── createTaskFromSuggestion ────────────────────────────────────────────────

type Overrides = {
  assigneeId?: string | null;
  explicitlyUnassigned?: boolean;
};

export async function createTaskFromSuggestion(
  suggestionId: string,
  overrides?: Overrides,
) {
  try {
    const session = await requireSession();
    const suggestion = await assertSuggestionAccess(suggestionId, session.userId);

    if (suggestion.status === "created") {
      return { ok: false as const, error: "Tarefa já foi criada a partir desta sugestão." };
    }
    if (suggestion.status === "discarded") {
      return { ok: false as const, error: "Sugestão descartada não pode ser convertida em tarefa." };
    }

    const resolvedAssigneeId = overrides?.assigneeId ?? suggestion.assigneeId;
    const explicitlyUnassigned = overrides?.explicitlyUnassigned ?? false;

    if (!resolvedAssigneeId && !explicitlyUnassigned) {
      const isMatched = suggestion.assigneeMatch === "matched";
      if (!isMatched) {
        return {
          ok: false as const,
          error: "Defina o responsável ou marque 'Sem responsável' para criar a tarefa.",
        };
      }
    }

    const firstColumn = await db.taskColumn.findFirst({
      where: { spaceId: suggestion.spaceId },
      orderBy: { order: "asc" },
      select: { id: true },
    });

    const maxOrder = await db.task.aggregate({
      where: { spaceId: suggestion.spaceId, columnId: firstColumn?.id ?? null },
      _max: { order: true },
    });

    const descParts = [
      suggestion.why ? `Por quê: ${suggestion.why}` : null,
      suggestion.how ? `Como: ${suggestion.how}` : null,
      suggestion.howMuch ? `Quanto: ${suggestion.howMuch}` : null,
    ].filter(Boolean);

    const task = await db.task.create({
      data: {
        spaceId: suggestion.spaceId,
        recordingId: suggestion.recordingId,
        creatorUserId: session.userId,
        assigneeUserId: resolvedAssigneeId ?? null,
        columnId: firstColumn?.id ?? null,
        title: suggestion.what,
        description: descParts.join("\n"),
        order: (maxOrder._max.order ?? -1) + 1,
      },
      select: { id: true },
    });

    await db.taskSuggestion.update({
      where: { id: suggestionId },
      data: { status: "created", createdTaskId: task.id },
    });

    revalidatePath(`/recordings/${suggestion.recordingId}`);
    revalidatePath("/tasks");
    return { ok: true as const, taskId: task.id };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao criar tarefa." };
  }
}

// ─── bulkCreateFromSuggestions ───────────────────────────────────────────────

export async function bulkCreateFromSuggestions(ids: string[]) {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const id of ids) {
    const result = await createTaskFromSuggestion(id, { explicitlyUnassigned: false });
    if (result.ok) {
      created++;
    } else {
      skipped++;
      errors.push(result.error);
    }
  }

  return { created, skipped, errors };
}
