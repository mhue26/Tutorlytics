-- AlterTable
ALTER TABLE "public"."BillingSettings" ADD COLUMN     "taxInclusive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "taxRatePercent" DOUBLE PRECISION NOT NULL DEFAULT 0;
