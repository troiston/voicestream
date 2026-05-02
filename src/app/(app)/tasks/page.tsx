import type { Metadata } from "next";

import { requireSession } from "@/features/auth/guards";
import { db } from "@/lib/db";
import { getAccessibleSpaceIds } from "@/features/spaces/access";
import { TasksView } from "@/components/tasks/tasks-view";
import type { TaskColumnItem } from "@/types/domain";

export const metadata: Metadata = {
  title: "Tarefas",
  description: "Gestão de tarefas com dados Prisma.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TasksPage() {
  const session = await requireSession();

  // Get all spaces the user has access to
  const accessibleSpaceIds = await getAccessibleSpaceIds(session.userId);

  // Fetch tasks + columns from accessible spaces
  const [tasks, columns, defaultSpace] = await Promise.all([
    db.task.findMany({
      where: { spaceId: { in: accessibleSpaceIds } },
      include: {
        space: { select: { name: true } },
        recording: { select: { title: true, capturedAt: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    db.taskColumn.findMany({
      where: { spaceId: { in: accessibleSpaceIds } },
      orderBy: { order: "asc" },
    }),
    db.space.findFirst({
      where: { ownerId: session.userId },
      select: { id: true },
    }),
  ]);

  const initialTasks = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueAt: task.dueAt ? task.dueAt.toISOString().split("T")[0] : null,
    spaceId: task.spaceId,
    spaceName: task.space.name,
    recordingId: task.recordingId,
    recordingTitle: task.recording?.title ?? null,
    recordingCapturedAt: task.recording?.capturedAt
      ? task.recording.capturedAt.toISOString().split("T")[0]
      : null,
    columnId: task.columnId,
    order: task.order,
    assigneeUserId: task.assigneeUserId,
    assigneeName: task.assignee?.name ?? null,
  }));

  const initialColumns: TaskColumnItem[] = columns.map((c) => ({
    id: c.id,
    spaceId: c.spaceId,
    name: c.name,
    order: c.order,
  }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Tarefas</h1>
        <p className="mt-2 max-w-2xl text-foreground/60">
          Gestão de tarefas com dados persistidos. Utilize filtros, alterne entre tabela e cartões e crie
          tarefas através do painel lateral.
        </p>
      </header>
      <TasksView
        initialTasks={initialTasks}
        initialColumns={initialColumns}
        defaultSpaceId={defaultSpace?.id ?? null}
        userId={session.userId}
      />
    </div>
  );
}
