-- CreateTable: task_column
CREATE TABLE "task_column" (
  "id" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "task_column_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "task_column_spaceId_idx" ON "task_column"("spaceId");
CREATE UNIQUE INDEX "task_column_spaceId_name_key" ON "task_column"("spaceId", "name");

ALTER TABLE "task_column" ADD CONSTRAINT "task_column_spaceId_fkey"
  FOREIGN KEY ("spaceId") REFERENCES "space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: task — add columnId and order
ALTER TABLE "task" ADD COLUMN "columnId" TEXT;
ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "task_columnId_idx" ON "task"("columnId");

ALTER TABLE "task" ADD CONSTRAINT "task_columnId_fkey"
  FOREIGN KEY ("columnId") REFERENCES "task_column"("id") ON DELETE SET NULL ON UPDATE CASCADE;
