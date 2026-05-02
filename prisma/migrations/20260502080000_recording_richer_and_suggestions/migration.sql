-- Recording: campos novos
ALTER TABLE "recording" ADD COLUMN IF NOT EXISTS "topicalSummary" TEXT;
ALTER TABLE "recording" ADD COLUMN IF NOT EXISTS "decisions" JSONB;
ALTER TABLE "recording" ADD COLUMN IF NOT EXISTS "nextSteps" JSONB;
ALTER TABLE "recording" ADD COLUMN IF NOT EXISTS "transcriptSegments" JSONB;

-- TaskSuggestion
CREATE TABLE IF NOT EXISTS "task_suggestion" (
  "id" TEXT PRIMARY KEY,
  "recordingId" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "what" TEXT NOT NULL,
  "why" TEXT,
  "who" TEXT,
  "assigneeId" TEXT,
  "assigneeMatch" TEXT NOT NULL DEFAULT 'pending',
  "whenText" TEXT,
  "whenDate" TIMESTAMP(3),
  "whereText" TEXT,
  "how" TEXT,
  "howMuch" TEXT,
  "sourceSnippet" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdTaskId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "task_suggestion_recording_fk" FOREIGN KEY ("recordingId") REFERENCES "recording"("id") ON DELETE CASCADE,
  CONSTRAINT "task_suggestion_space_fk" FOREIGN KEY ("spaceId") REFERENCES "space"("id") ON DELETE CASCADE,
  CONSTRAINT "task_suggestion_assignee_fk" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "task_suggestion_recordingId_idx" ON "task_suggestion"("recordingId");
CREATE INDEX IF NOT EXISTS "task_suggestion_status_idx" ON "task_suggestion"("status");
