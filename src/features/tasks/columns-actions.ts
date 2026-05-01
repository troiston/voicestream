"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function assertSpaceAccess(spaceId: string, userId: string): Promise<void> {
  const space = await db.space.findUnique({
    where: { id: spaceId },
    select: { ownerId: true },
  });
  if (!space) throw new Error("Espaço não encontrado.");

  if (space.ownerId === userId) return;

  const member = await db.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId, userId } },
    select: { status: true, role: true },
  });
  if (!member || member.status !== "active") {
    throw new Error("Permissão negada.");
  }
}

async function getColumnSpaceId(columnId: string): Promise<string> {
  const col = await db.taskColumn.findUnique({
    where: { id: columnId },
    select: { spaceId: true },
  });
  if (!col) throw new Error("Coluna não encontrada.");
  return col.spaceId;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function createColumn(
  spaceId: string,
  name: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const session = await requireSession();
    await assertSpaceAccess(spaceId, session.userId);

    if (!name || name.trim().length === 0) {
      return { ok: false, error: "Nome da coluna é obrigatório." };
    }

    const maxOrder = await db.taskColumn.aggregate({
      where: { spaceId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    const col = await db.taskColumn.create({
      data: { spaceId, name: name.trim(), order },
    });

    revalidatePath(`/spaces/${spaceId}`);
    revalidatePath("/tasks");
    return { ok: true, id: col.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao criar coluna." };
  }
}

export async function renameColumn(
  columnId: string,
  name: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await requireSession();
    const spaceId = await getColumnSpaceId(columnId);
    await assertSpaceAccess(spaceId, session.userId);

    if (!name || name.trim().length === 0) {
      return { ok: false, error: "Nome da coluna é obrigatório." };
    }

    await db.taskColumn.update({
      where: { id: columnId },
      data: { name: name.trim() },
    });

    revalidatePath(`/spaces/${spaceId}`);
    revalidatePath("/tasks");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao renomear coluna." };
  }
}

export async function deleteColumn(
  columnId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await requireSession();
    const spaceId = await getColumnSpaceId(columnId);
    await assertSpaceAccess(spaceId, session.userId);

    // Move tasks to first remaining column (or null)
    const remaining = await db.taskColumn.findMany({
      where: { spaceId, id: { not: columnId } },
      orderBy: { order: "asc" },
      select: { id: true },
      take: 1,
    });
    const fallbackColumnId = remaining[0]?.id ?? null;

    await db.$transaction([
      db.task.updateMany({
        where: { columnId },
        data: { columnId: fallbackColumnId },
      }),
      db.taskColumn.delete({ where: { id: columnId } }),
    ]);

    revalidatePath(`/spaces/${spaceId}`);
    revalidatePath("/tasks");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao eliminar coluna." };
  }
}

export async function reorderColumns(
  spaceId: string,
  orderedIds: string[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await requireSession();
    await assertSpaceAccess(spaceId, session.userId);

    await db.$transaction(
      orderedIds.map((id, index) =>
        db.taskColumn.update({ where: { id }, data: { order: index } }),
      ),
    );

    revalidatePath(`/spaces/${spaceId}`);
    revalidatePath("/tasks");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao reordenar colunas." };
  }
}

export async function moveTask(
  taskId: string,
  columnId: string | null,
  newOrder: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await requireSession();

    const task = await db.task.findUnique({
      where: { id: taskId },
      select: { spaceId: true },
    });
    if (!task) return { ok: false, error: "Tarefa não encontrada." };

    await assertSpaceAccess(task.spaceId, session.userId);

    await db.task.update({
      where: { id: taskId },
      data: { columnId, order: newOrder },
    });

    revalidatePath(`/spaces/${task.spaceId}`);
    revalidatePath("/tasks");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao mover tarefa." };
  }
}
