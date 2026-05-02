"use server";

import { z } from "zod";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import type { TaskListItem } from "@/types/domain";
import type { TaskStatus, TaskPriority } from "@/generated/prisma/client";

export type CreateTaskActionState =
  | { status: "idle" }
  | { status: "success"; task: TaskListItem }
  | { status: "error"; formErrors: Record<string, string[]>; message?: string };

export type UpdateTaskStatusActionResult = { ok: true } | { ok: false; error: string };
export type DeleteTaskActionResult = { ok: true } | { ok: false; error: string };

function fdStr(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : "";
}

const createTaskSchema = z.object({
  title: z.string().min(2, "Mínimo de 2 caracteres.").max(120, "Máximo de 120 caracteres."),
  description: z.string().max(2000, "Máximo de 2000 caracteres."),
  priority: z.enum(["baixa", "media", "alta"] satisfies readonly TaskPriority[]),
  status: z.enum(["pendente", "em_curso"]),
  dueAt: z
    .string()
    .transform((s) => (s.trim().length > 0 ? s.trim() : ""))
    .refine((s) => s === "" || /^\d{4}-\d{2}-\d{2}$/.test(s), {
      message: "Use o formato AAAA-MM-DD.",
    }),
});

export async function createTaskAction(
  _prev: CreateTaskActionState,
  formData: FormData,
  defaultSpaceId: string | null,
  userId: string,
): Promise<CreateTaskActionState> {
  try {
    const session = await requireSession();
    if (session.userId !== userId) {
      return { status: "error", formErrors: {}, message: "Não autorizado." };
    }

    if (!defaultSpaceId) {
      return { status: "error", formErrors: {}, message: "Nenhum espaço disponível para criar tarefa." };
    }

    const honeypot = formData.get("company");
    if (typeof honeypot === "string" && honeypot.trim().length > 0) {
      return { status: "error", formErrors: {}, message: "Pedido rejeitado." };
    }

    const statusRaw = fdStr(formData.get("status"));
    const statusNorm = (statusRaw === "em_curso" ? "em_curso" : "pendente") as TaskStatus;

    const parsed = createTaskSchema.safeParse({
      title: fdStr(formData.get("title")),
      description: fdStr(formData.get("description")),
      priority: fdStr(formData.get("priority")),
      status: statusNorm,
      dueAt: fdStr(formData.get("dueAt")),
    });

    if (!parsed.success) {
      return {
        status: "error",
        formErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const dueDate = parsed.data.dueAt === "" ? null : new Date(`${parsed.data.dueAt}T00:00:00Z`);

    const createdTask = await db.task.create({
      data: {
        spaceId: defaultSpaceId,
        creatorUserId: session.userId,
        title: parsed.data.title,
        description: parsed.data.description,
        status: statusNorm,
        priority: parsed.data.priority,
        dueAt: dueDate,
      },
      include: {
        space: { select: { name: true } },
        recording: { select: { title: true, capturedAt: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    const task: TaskListItem = {
      id: createdTask.id,
      title: createdTask.title,
      description: createdTask.description,
      status: createdTask.status,
      priority: createdTask.priority,
      dueAt: createdTask.dueAt ? createdTask.dueAt.toISOString().split("T")[0] : null,
      spaceId: createdTask.spaceId,
      spaceName: createdTask.space.name,
      recordingId: createdTask.recordingId,
      recordingTitle: createdTask.recording?.title ?? null,
      recordingCapturedAt: createdTask.recording?.capturedAt
        ? createdTask.recording.capturedAt.toISOString().split("T")[0]
        : null,
      columnId: createdTask.columnId,
      order: createdTask.order,
      assigneeUserId: createdTask.assigneeUserId,
      assigneeName: createdTask.assignee?.name ?? null,
    };

    return { status: "success", task };
  } catch (error) {
    console.error("createTaskAction error:", error);
    return {
      status: "error",
      formErrors: {},
      message: "Erro ao criar tarefa. Tente novamente.",
    };
  }
}

export async function updateTaskStatusAction(
  taskId: string,
  newStatus: TaskStatus,
): Promise<UpdateTaskStatusActionResult> {
  try {
    const session = await requireSession();

    // Verify user is creator or space owner/member
    const task = await db.task.findUnique({
      where: { id: taskId },
      select: { creatorUserId: true, spaceId: true },
    });

    if (!task) {
      return { ok: false, error: "Tarefa não encontrada." };
    }

    const isCreator = task.creatorUserId === session.userId;
    const spaceMember = await db.spaceMember.findUnique({
      where: { spaceId_userId: { spaceId: task.spaceId, userId: session.userId } },
      select: { role: true },
    });
    const isSpaceOwnerOrMember =
      (spaceMember && (spaceMember.role === "owner" || spaceMember.role === "admin")) ||
      (await db.space.findUnique({
        where: { id: task.spaceId },
        select: { ownerId: true },
      }).then((s) => s?.ownerId === session.userId));

    if (!isCreator && !isSpaceOwnerOrMember) {
      return { ok: false, error: "Não autorizado." };
    }

    const completedAt = newStatus === "concluida" ? new Date() : null;

    await db.task.update({
      where: { id: taskId },
      data: { status: newStatus, completedAt },
    });

    return { ok: true };
  } catch (error) {
    console.error("updateTaskStatusAction error:", error);
    return { ok: false, error: "Erro ao atualizar tarefa." };
  }
}

export async function deleteTaskAction(taskId: string): Promise<DeleteTaskActionResult> {
  try {
    const session = await requireSession();

    // Verify user is creator or space owner
    const task = await db.task.findUnique({
      where: { id: taskId },
      select: { creatorUserId: true, spaceId: true },
    });

    if (!task) {
      return { ok: false, error: "Tarefa não encontrada." };
    }

    const isCreator = task.creatorUserId === session.userId;
    const spaceOwner = await db.space.findUnique({
      where: { id: task.spaceId },
      select: { ownerId: true },
    });
    const isSpaceOwner = spaceOwner?.ownerId === session.userId;

    if (!isCreator && !isSpaceOwner) {
      return { ok: false, error: "Não autorizado." };
    }

    await db.task.delete({
      where: { id: taskId },
    });

    return { ok: true };
  } catch (error) {
    console.error("deleteTaskAction error:", error);
    return { ok: false, error: "Erro ao deletar tarefa." };
  }
}
