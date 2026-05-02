"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomUUID } from "crypto";
import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import {
  presignPutUrl,
  presignGetUrl,
  deleteObject,
} from "@/lib/storage/seaweed";
import { buildRecordingExcerpt } from "@/components/tasks/task-detail-utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function assertTaskAccess(taskId: string, userId: string) {
  const task = await db.task.findUnique({
    where: { id: taskId },
    select: { spaceId: true, creatorUserId: true },
  });
  if (!task) throw new Error("Tarefa não encontrada.");
  await assertSpaceAccess(task.spaceId, userId);
  return task;
}

async function assertSpaceAccess(spaceId: string, userId: string) {
  const space = await db.space.findUnique({
    where: { id: spaceId },
    select: { ownerId: true },
  });
  if (!space) throw new Error("Espaço não encontrado.");
  if (space.ownerId === userId) return;
  const member = await db.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId, userId } },
    select: { status: true },
  });
  if (!member || member.status !== "active") throw new Error("Permissão negada.");
}

function revalidate(spaceId: string) {
  revalidatePath(`/spaces/${spaceId}`);
  revalidatePath("/tasks");
}

// ---------------------------------------------------------------------------
// Task CRUD
// ---------------------------------------------------------------------------

const createTaskSchema = z.object({
  columnId: z.string().min(1),
  title: z.string().min(1).max(255),
});

export async function createTask(input: z.infer<typeof createTaskSchema>) {
  try {
    const session = await requireSession();
    const { columnId, title } = createTaskSchema.parse(input);

    const column = await db.taskColumn.findUnique({
      where: { id: columnId },
      select: { spaceId: true },
    });
    if (!column) return { ok: false as const, error: "Coluna não encontrada." };

    await assertSpaceAccess(column.spaceId, session.userId);

    const maxOrder = await db.task.aggregate({
      where: { columnId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    const task = await db.task.create({
      data: {
        spaceId: column.spaceId,
        columnId,
        title: title.trim(),
        description: "",
        creatorUserId: session.userId,
        order,
      },
    });

    revalidate(column.spaceId);
    return { ok: true as const, task };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao criar tarefa." };
  }
}

const updateTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  dueDate: z.string().nullable().optional(), // ISO date string or null
});

export async function updateTask(input: z.infer<typeof updateTaskSchema>) {
  try {
    const session = await requireSession();
    const { id, title, description, dueDate } = updateTaskSchema.parse(input);

    const task = await assertTaskAccess(id, session.userId);

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description;
    if (dueDate !== undefined) data.dueAt = dueDate ? new Date(dueDate) : null;

    await db.task.update({ where: { id }, data });
    revalidate(task.spaceId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao atualizar tarefa." };
  }
}

export async function archiveTask(id: string) {
  try {
    const session = await requireSession();
    const task = await assertTaskAccess(id, session.userId);
    await db.task.update({ where: { id }, data: { archivedAt: new Date() } });
    revalidate(task.spaceId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao arquivar tarefa." };
  }
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

const addCommentSchema = z.object({
  taskId: z.string().min(1),
  body: z.string().min(1).max(5000),
});

export async function addComment(input: z.infer<typeof addCommentSchema>) {
  try {
    const session = await requireSession();
    const { taskId, body } = addCommentSchema.parse(input);
    await assertTaskAccess(taskId, session.userId);

    const comment = await db.comment.create({
      data: { taskId, authorId: session.userId, body: body.trim() },
      include: { author: { select: { id: true, name: true, image: true } } },
    });

    const task = await db.task.findUnique({ where: { id: taskId }, select: { spaceId: true } });
    if (task) revalidate(task.spaceId);
    return { ok: true as const, comment };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao adicionar comentário." };
  }
}

export async function deleteComment(id: string) {
  try {
    const session = await requireSession();
    const comment = await db.comment.findUnique({
      where: { id },
      select: { authorId: true, task: { select: { spaceId: true } } },
    });
    if (!comment) return { ok: false as const, error: "Comentário não encontrado." };
    if (comment.authorId !== session.userId) return { ok: false as const, error: "Permissão negada." };
    await db.comment.delete({ where: { id } });
    revalidate(comment.task.spaceId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao eliminar comentário." };
  }
}

// ---------------------------------------------------------------------------
// Checklists
// ---------------------------------------------------------------------------

const addChecklistSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().min(1).max(255),
});

export async function addChecklist(input: z.infer<typeof addChecklistSchema>) {
  try {
    const session = await requireSession();
    const { taskId, title } = addChecklistSchema.parse(input);
    await assertTaskAccess(taskId, session.userId);

    const maxOrder = await db.checklist.aggregate({
      where: { taskId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    const checklist = await db.checklist.create({
      data: { taskId, title: title.trim(), order },
      include: { items: true },
    });

    const task = await db.task.findUnique({ where: { id: taskId }, select: { spaceId: true } });
    if (task) revalidate(task.spaceId);
    return { ok: true as const, checklist };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao adicionar checklist." };
  }
}

export async function renameChecklist(id: string, title: string) {
  try {
    const session = await requireSession();
    const checklist = await db.checklist.findUnique({
      where: { id },
      select: { taskId: true, task: { select: { spaceId: true, creatorUserId: true } } },
    });
    if (!checklist) return { ok: false as const, error: "Checklist não encontrada." };
    await assertSpaceAccess(checklist.task.spaceId, session.userId);
    await db.checklist.update({ where: { id }, data: { title: title.trim() } });
    revalidate(checklist.task.spaceId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao renomear checklist." };
  }
}

export async function deleteChecklist(id: string) {
  try {
    const session = await requireSession();
    const checklist = await db.checklist.findUnique({
      where: { id },
      select: { task: { select: { spaceId: true } } },
    });
    if (!checklist) return { ok: false as const, error: "Checklist não encontrada." };
    await assertSpaceAccess(checklist.task.spaceId, session.userId);
    await db.checklist.delete({ where: { id } });
    revalidate(checklist.task.spaceId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao eliminar checklist." };
  }
}

const addChecklistItemSchema = z.object({
  checklistId: z.string().min(1),
  text: z.string().min(1).max(500),
});

export async function addChecklistItem(input: z.infer<typeof addChecklistItemSchema>) {
  try {
    const session = await requireSession();
    const { checklistId, text } = addChecklistItemSchema.parse(input);
    const checklist = await db.checklist.findUnique({
      where: { id: checklistId },
      select: { task: { select: { spaceId: true } } },
    });
    if (!checklist) return { ok: false as const, error: "Checklist não encontrada." };
    await assertSpaceAccess(checklist.task.spaceId, session.userId);

    const maxOrder = await db.checklistItem.aggregate({
      where: { checklistId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    const item = await db.checklistItem.create({
      data: { checklistId, text: text.trim(), order },
    });
    revalidate(checklist.task.spaceId);
    return { ok: true as const, item };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao adicionar item." };
  }
}

export async function toggleChecklistItem(id: string) {
  try {
    const session = await requireSession();
    const item = await db.checklistItem.findUnique({
      where: { id },
      select: { done: true, checklist: { select: { task: { select: { spaceId: true } } } } },
    });
    if (!item) return { ok: false as const, error: "Item não encontrado." };
    await assertSpaceAccess(item.checklist.task.spaceId, session.userId);
    await db.checklistItem.update({ where: { id }, data: { done: !item.done } });
    revalidate(item.checklist.task.spaceId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao atualizar item." };
  }
}

export async function deleteChecklistItem(id: string) {
  try {
    const session = await requireSession();
    const item = await db.checklistItem.findUnique({
      where: { id },
      select: { checklist: { select: { task: { select: { spaceId: true } } } } },
    });
    if (!item) return { ok: false as const, error: "Item não encontrado." };
    await assertSpaceAccess(item.checklist.task.spaceId, session.userId);
    await db.checklistItem.delete({ where: { id } });
    revalidate(item.checklist.task.spaceId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao eliminar item." };
  }
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const ALLOWED_COLORS = [
  "red", "orange", "yellow", "green", "blue", "purple", "pink", "gray",
] as const;

const createLabelSchema = z.object({
  spaceId: z.string().min(1),
  name: z.string().min(1).max(50),
  color: z.enum(ALLOWED_COLORS),
});

export async function createLabel(input: z.infer<typeof createLabelSchema>) {
  try {
    const session = await requireSession();
    const { spaceId, name, color } = createLabelSchema.parse(input);
    await assertSpaceAccess(spaceId, session.userId);

    const label = await db.label.create({
      data: { spaceId, name: name.trim(), color },
    });
    revalidate(spaceId);
    return { ok: true as const, label };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao criar label." };
  }
}

export async function deleteLabel(id: string) {
  try {
    const session = await requireSession();
    const label = await db.label.findUnique({ where: { id }, select: { spaceId: true } });
    if (!label) return { ok: false as const, error: "Label não encontrada." };
    await assertSpaceAccess(label.spaceId, session.userId);
    await db.label.delete({ where: { id } });
    revalidate(label.spaceId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao eliminar label." };
  }
}

export async function attachLabel(taskId: string, labelId: string) {
  try {
    const session = await requireSession();
    const task = await assertTaskAccess(taskId, session.userId);
    await db.taskLabel.upsert({
      where: { taskId_labelId: { taskId, labelId } },
      create: { taskId, labelId },
      update: {},
    });
    revalidate(task.spaceId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao adicionar label." };
  }
}

export async function detachLabel(taskId: string, labelId: string) {
  try {
    const session = await requireSession();
    const task = await assertTaskAccess(taskId, session.userId);
    await db.taskLabel.deleteMany({ where: { taskId, labelId } });
    revalidate(task.spaceId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao remover label." };
  }
}

// ---------------------------------------------------------------------------
// Attachments
// ---------------------------------------------------------------------------

const presignSchema = z.object({
  taskId: z.string().min(1),
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  size: z.number().int().positive().max(50 * 1024 * 1024), // 50MB max
});

export async function presignAttachmentUpload(input: z.infer<typeof presignSchema>) {
  try {
    const session = await requireSession();
    const { taskId, filename, mimeType, size } = presignSchema.parse(input);
    await assertTaskAccess(taskId, session.userId);

    const uid = randomUUID();
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `attachments/${taskId}/${uid}-${safeFilename}`;
    const url = await presignPutUrl({ key, contentType: mimeType });

    return { ok: true as const, url, key };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao gerar URL." };
  }
}

const confirmAttachmentSchema = z.object({
  taskId: z.string().min(1),
  key: z.string().min(1),
  filename: z.string().min(1).max(255),
  size: z.number().int().positive(),
  mimeType: z.string().min(1),
});

export async function confirmAttachment(input: z.infer<typeof confirmAttachmentSchema>) {
  try {
    const session = await requireSession();
    const { taskId, key, filename, size, mimeType } = confirmAttachmentSchema.parse(input);
    const task = await assertTaskAccess(taskId, session.userId);

    const attachment = await db.attachment.create({
      data: { taskId, s3Key: key, filename, size, mimeType, uploadedById: session.userId },
    });
    revalidate(task.spaceId);
    return { ok: true as const, attachment };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao confirmar anexo." };
  }
}

export async function deleteAttachment(id: string) {
  try {
    const session = await requireSession();
    const attachment = await db.attachment.findUnique({
      where: { id },
      select: { s3Key: true, uploadedById: true, task: { select: { spaceId: true } } },
    });
    if (!attachment) return { ok: false as const, error: "Anexo não encontrado." };
    await assertSpaceAccess(attachment.task.spaceId, session.userId);
    await deleteObject({ key: attachment.s3Key });
    await db.attachment.delete({ where: { id } });
    revalidate(attachment.task.spaceId);
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao eliminar anexo." };
  }
}

export async function listAttachments(taskId: string) {
  try {
    const session = await requireSession();
    await assertTaskAccess(taskId, session.userId);

    const attachments = await db.attachment.findMany({
      where: { taskId },
      orderBy: { uploadedAt: "asc" },
    });

    const withUrls = await Promise.all(
      attachments.map(async (a) => ({
        ...a,
        url: await presignGetUrl({ key: a.s3Key }),
        uploadedAt: a.uploadedAt.toISOString(),
      })),
    );
    return { ok: true as const, attachments: withUrls };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao listar anexos." };
  }
}

// ---------------------------------------------------------------------------
// Full task detail fetch (for dialog)
// ---------------------------------------------------------------------------

export async function getTaskDetail(taskId: string) {
  try {
    const session = await requireSession();
    await assertTaskAccess(taskId, session.userId);

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        labels: { include: { label: true } },
        checklists: { include: { items: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
        comments: {
          include: { author: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "asc" },
        },
        attachments: { orderBy: { uploadedAt: "asc" } },
        assignee: { select: { id: true, name: true, image: true } },
        recording: {
          select: {
            title: true,
            capturedAt: true,
            summary: { select: { abstract: true } },
            transcription: { select: { text: true } },
          },
        },
      },
    });

    if (!task) return { ok: false as const, error: "Tarefa não encontrada." };

    const attachmentsWithUrls = await Promise.all(
      task.attachments.map(async (a) => ({
        ...a,
        url: await presignGetUrl({ key: a.s3Key }),
        uploadedAt: a.uploadedAt.toISOString(),
      })),
    );

    const comments = task.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    }));

    return {
      ok: true as const,
      task: {
        ...task,
        dueAt: task.dueAt?.toISOString() ?? null,
        completedAt: task.completedAt?.toISOString() ?? null,
        archivedAt: task.archivedAt?.toISOString() ?? null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        recordingTitle: task.recording?.title ?? null,
        recordingCapturedAt: task.recording?.capturedAt
          ? task.recording.capturedAt.toISOString()
          : null,
        recordingExcerpt: buildRecordingExcerpt(
          task.recording?.summary?.abstract ?? null,
          task.recording?.transcription?.text ?? null,
        ),
        comments,
        attachments: attachmentsWithUrls,
      },
    };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao buscar tarefa." };
  }
}
