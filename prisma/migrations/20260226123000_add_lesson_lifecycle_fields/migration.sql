-- CreateEnum
CREATE TYPE "public"."LessonStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'CANCELLED', 'NEEDS_REVIEW', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."Meeting"
ADD COLUMN "status" "public"."LessonStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN "lessonPlan" TEXT,
ADD COLUMN "homework" TEXT,
ADD COLUMN "lessonSummary" TEXT,
ADD COLUMN "nextLessonPrep" TEXT,
ADD COLUMN "cancelReason" TEXT;

-- Backfill from legacy completion flag
UPDATE "public"."Meeting"
SET "status" = 'COMPLETED'
WHERE "isCompleted" = TRUE;
