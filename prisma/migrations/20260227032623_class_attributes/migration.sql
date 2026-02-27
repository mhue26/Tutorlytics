-- CreateEnum
CREATE TYPE "public"."CalendarEventType" AS ENUM ('LESSON', 'CHECK_IN', 'KEY_DATE');

-- CreateEnum
CREATE TYPE "public"."CheckInRecurrence" AS ENUM ('TERM', 'MONTH', 'QUARTER', 'YEAR');

-- CreateEnum
CREATE TYPE "public"."KeyDateScope" AS ENUM ('ORGANISATION', 'CLASS', 'YEAR_LEVEL');

-- CreateEnum
CREATE TYPE "public"."ClassFormat" AS ENUM ('IN_PERSON', 'ONLINE', 'HYBRID');

-- AlterTable
ALTER TABLE "public"."CheckIn" ADD COLUMN     "ruleId" TEXT;

-- AlterTable
ALTER TABLE "public"."Class" ADD COLUMN     "defaultRateCents" INTEGER,
ADD COLUMN     "format" "public"."ClassFormat" NOT NULL DEFAULT 'IN_PERSON',
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "public"."OrganisationPreferences" ADD COLUMN     "calendarEventColorsJson" JSONB;

-- CreateTable
CREATE TABLE "public"."KeyDate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "color" TEXT,
    "scope" "public"."KeyDateScope" NOT NULL,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organisationId" TEXT NOT NULL,
    "classId" INTEGER,

    CONSTRAINT "KeyDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CheckInRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "recurrence" "public"."CheckInRecurrence" NOT NULL,
    "anchor" TIMESTAMP(3) NOT NULL,
    "notesTemplate" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organisationId" TEXT NOT NULL,
    "studentId" INTEGER,
    "classId" INTEGER,

    CONSTRAINT "CheckInRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."KeyDate" ADD CONSTRAINT "KeyDate_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KeyDate" ADD CONSTRAINT "KeyDate_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckIn" ADD CONSTRAINT "CheckIn_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."CheckInRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckInRule" ADD CONSTRAINT "CheckInRule_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckInRule" ADD CONSTRAINT "CheckInRule_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckInRule" ADD CONSTRAINT "CheckInRule_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
