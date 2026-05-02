"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";

const suggestedTaskSchema = z.object({
  recordingId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(""),
  priority: z.enum(["baixa", "media", "alta"]).default("media"),
  dueAt: z.string().nullable().optional(),
  assigneeUserId: z.string().nullable().optional(),
  explicitlyUnassigned: z.boolean().default(false),
  source: z
    .object({
      why: z.string().nullable().optional(),
      where: z.string().nullable().optional(),
      how: z.string().nullable().optional(),
      howMuch: z.string().nullable().optional(),
      transcriptQuote: z.string().nullable().optional(),
    })
    .optional(),
});

const createSuggestedTasksSchema = z.object({
  recordingId: z.string().min(1),
  tasks: z.array(suggestedTaskSchema).min(1),
});

async function assertRecordingAccess(recordingId: string, userId: string) {
  const recording = await db.recording.findUnique({
    where: { id: recordingId },
    include: {
      space: {
        select: {
          id: true,
          ownerId: true,
          name: true,
          members: {
            where: { status: "active" },
            select: { userId: true },
          },
        },
      },
    },
  });

  if (!recording) throw new Error("Gravação não encontrada.");
  const isOwner = recording.space.ownerId === userId;
  const isMember = recording.space.members.some((member) => member.userId === userId);
  if (!isOwner && !isMember) throw new Error("Permissão negada.");
  return recording;
}

export async function createTasksFromRecordingSuggestions(
  input: z.infer<typeof createSuggestedTasksSchema>,
) {
  try {
    const session = await requireSession();
    const parsed = createSuggestedTasksSchema.parse(input);
    const recording = await assertRecordingAccess(parsed.recordingId, session.userId);

    const allowedAssignees = new Set([
      recording.space.ownerId,
      ...recording.space.members.map((member) => member.userId),
    ]);

    for (const task of parsed.tasks) {
      if (!task.assigneeUserId && !task.explicitlyUnassigned) {
        return {
          ok: false as const,
          error: `Defina um responsável ou marque "Sem responsável" para "${task.title}".`,
        };
      }
      if (task.assigneeUserId && !allowedAssignees.has(task.assigneeUserId)) {
        return {
          ok: false as const,
          error: `Responsável inválido para "${task.title}".`,
        };
      }
    }

    const firstColumn = await db.taskColumn.findFirst({
      where: { spaceId: recording.spaceId },
      orderBy: { order: "asc" },
      select: { id: true },
    });

    const maxOrder = await db.task.aggregate({
      where: { spaceId: recording.spaceId, columnId: firstColumn?.id ?? null },
      _max: { order: true },
    });

    await db.task.createMany({
      data: parsed.tasks.map((task, index) => {
        const sourceLines = [
          task.description,
          task.source?.why ? `Por quê: ${task.source.why}` : null,
          task.source?.where ? `Onde: ${task.source.where}` : null,
          task.source?.how ? `Como: ${task.source.how}` : null,
          task.source?.howMuch ? `Quanto: ${task.source.howMuch}` : null,
          task.source?.transcriptQuote
            ? `Trecho de origem: "${task.source.transcriptQuote}"`
            : null,
        ].filter(Boolean);

        return {
          spaceId: recording.spaceId,
          recordingId: recording.id,
          creatorUserId: session.userId,
          assigneeUserId: task.assigneeUserId ?? null,
          columnId: firstColumn?.id ?? null,
          title: task.title.trim(),
          description: sourceLines.join("\n"),
          priority: task.priority,
          dueAt: task.dueAt ? new Date(task.dueAt) : null,
          order: (maxOrder._max.order ?? -1) + index + 1,
        };
      }),
    });

    revalidatePath("/tasks");
    revalidatePath(`/spaces/${recording.spaceId}`);
    revalidatePath("/calendar");
    return { ok: true as const, created: parsed.tasks.length };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Erro ao criar tarefas sugeridas.",
    };
  }
}

// ─── updateRecordingTitle ────────────────────────────────────────────────────

export async function updateRecordingTitle(recordingId: string, title: string) {
  try {
    const session = await requireSession();
    const trimmed = title.trim().slice(0, 200);

    await assertRecordingAccess(recordingId, session.userId);
    await db.recording.update({ where: { id: recordingId }, data: { title: trimmed || null } });

    revalidatePath(`/recordings/${recordingId}`);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao atualizar título." };
  }
}
