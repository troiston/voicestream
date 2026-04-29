import type { TaskStatus, TaskPriority } from "@/generated/prisma/client";

export type TaskListItem = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  spaceId: string;
  spaceName: string;
  recordingId: string | null;
  recordingTitle: string | null;
  recordingCapturedAt: string | null;
};
