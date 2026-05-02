CREATE TABLE IF NOT EXISTS "calendar_event" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "externalId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "htmlLink" TEXT,
  "spaceId" TEXT,
  "recordingId" TEXT,
  "syncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "calendar_event_user_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "calendar_event_space_fk" FOREIGN KEY ("spaceId") REFERENCES "space"("id") ON DELETE SET NULL,
  CONSTRAINT "calendar_event_recording_fk" FOREIGN KEY ("recordingId") REFERENCES "recording"("id") ON DELETE SET NULL,
  CONSTRAINT "calendar_event_unique_external" UNIQUE ("userId", "source", "externalId")
);
CREATE INDEX IF NOT EXISTS "calendar_event_user_starts_idx" ON "calendar_event"("userId", "startsAt");
CREATE INDEX IF NOT EXISTS "calendar_event_space_starts_idx" ON "calendar_event"("spaceId", "startsAt");
