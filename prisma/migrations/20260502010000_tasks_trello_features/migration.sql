-- AlterTable: task — add archivedAt
ALTER TABLE "task" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- CreateTable: label
CREATE TABLE "label" (
  "id" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  CONSTRAINT "label_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "label_spaceId_name_key" ON "label"("spaceId", "name");
CREATE INDEX "label_spaceId_idx" ON "label"("spaceId");

ALTER TABLE "label" ADD CONSTRAINT "label_spaceId_fkey"
  FOREIGN KEY ("spaceId") REFERENCES "space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: task_label
CREATE TABLE "task_label" (
  "taskId" TEXT NOT NULL,
  "labelId" TEXT NOT NULL,
  CONSTRAINT "task_label_pkey" PRIMARY KEY ("taskId", "labelId")
);

ALTER TABLE "task_label" ADD CONSTRAINT "task_label_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_label" ADD CONSTRAINT "task_label_labelId_fkey"
  FOREIGN KEY ("labelId") REFERENCES "label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: checklist
CREATE TABLE "checklist" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "checklist_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "checklist_taskId_idx" ON "checklist"("taskId");

ALTER TABLE "checklist" ADD CONSTRAINT "checklist_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: checklist_item
CREATE TABLE "checklist_item" (
  "id" TEXT NOT NULL,
  "checklistId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "done" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "checklist_item_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "checklist_item_checklistId_idx" ON "checklist_item"("checklistId");

ALTER TABLE "checklist_item" ADD CONSTRAINT "checklist_item_checklistId_fkey"
  FOREIGN KEY ("checklistId") REFERENCES "checklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: comment
CREATE TABLE "comment" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "comment_taskId_idx" ON "comment"("taskId");

ALTER TABLE "comment" ADD CONSTRAINT "comment_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "comment" ADD CONSTRAINT "comment_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: attachment
CREATE TABLE "attachment" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "s3Key" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "mimeType" TEXT NOT NULL,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "uploadedById" TEXT NOT NULL,
  CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "attachment_taskId_idx" ON "attachment"("taskId");

ALTER TABLE "attachment" ADD CONSTRAINT "attachment_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
