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

export type SpaceMemberOption = {
  id: string;
  name: string;
};

export type RecordingSuggestedTaskItem = {
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

export type RecordingDetailItem = {
  id: string;
  title: string | null;
  status: string;
  statusLabel: string;
  statusClassName: string;
  capturedAt: string;
  durationSec: number;
  streamUrl: string;
  author: string;
  abstract: string | null;
  decisions: string[];
  nextSteps: string[];
  transcript: string | null;
  segments: Array<{
    id: string;
    speaker: string | null;
    startMs: number;
    endMs: number;
    text: string;
  }>;
  suggestedTasks: RecordingSuggestedTaskItem[];
};

export type CaptureHistoryItem = {
  id: string;
  title: string | null;
  capturedAt: string;
  durationSec: number;
  status: string;
  errorMessage: string | null;
  spaceId: string;
  spaceName: string;
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
