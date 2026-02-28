-- AlterTable
ALTER TABLE "public"."Meeting" ADD COLUMN     "recurrenceIndex" INTEGER,
ADD COLUMN     "recurrenceSeriesId" TEXT;
