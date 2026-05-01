import type { TaskStatus, TaskPriority } from "@/generated/prisma/client";

export type TaskColumnItem = {
  id: string;
  spaceId: string;
  name: string;
  order: number;
};

export type SpaceItem = {
  id: string;
  name: string;
  description: string;
  lastActivity: string; // ISO
  memberCount: number;
  color: string;
  icon: string;
};

export type SpaceFeedItem = {
  id: string;
  spaceId: string;
  author: string;
  body: string;
  at: string; // ISO
  kind: "voice" | "note" | "task";
};

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
  columnId: string | null;
  order: number;
};
