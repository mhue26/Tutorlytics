-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('OWNER', 'ADMIN', 'TEACHER');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CheckInStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrganisationMember" (
    "id" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'TEACHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,

    CONSTRAINT "OrganisationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'TEACHER',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organisationId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "subjects" TEXT NOT NULL DEFAULT '',
    "schoolSubjects" TEXT,
    "hourlyRateCents" INTEGER NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentEmail" TEXT,
    "parentName" TEXT,
    "parentPhone" TEXT,
    "year" INTEGER,
    "meetingLocation" TEXT,
    "resourceLink" TEXT,
    "school" TEXT,
    "classId" INTEGER,
    "customTermRateCents" INTEGER,
    "organisationId" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Class" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organisationId" TEXT NOT NULL,
    "teacherId" TEXT,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Meeting" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organisationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Term" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organisationId" TEXT NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Holiday" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#F59E0B',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organisationId" TEXT NOT NULL,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assessment" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "grade" TEXT,
    "notes" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organisationId" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "meetingId" INTEGER,
    "recordedById" TEXT NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CheckIn" (
    "id" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "status" "public"."CheckInStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organisationId" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BillingSettings" (
    "id" TEXT NOT NULL,
    "defaultTermRateCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organisationId" TEXT NOT NULL,

    CONSTRAINT "BillingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Discount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "billingSettingsId" TEXT NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentDiscount" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" INTEGER NOT NULL,
    "discountId" TEXT NOT NULL,

    CONSTRAINT "StudentDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "tax" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organisationId" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "termId" INTEGER,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "reference" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organisationId" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "invoiceId" TEXT,
    "recordedById" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_slug_key" ON "public"."Organisation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationMember_userId_organisationId_key" ON "public"."OrganisationMember"("userId", "organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "public"."Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BillingSettings_organisationId_key" ON "public"."BillingSettings"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentDiscount_studentId_discountId_key" ON "public"."StudentDiscount"("studentId", "discountId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_organisationId_number_key" ON "public"."Invoice"("organisationId", "number");

-- AddForeignKey
ALTER TABLE "public"."OrganisationMember" ADD CONSTRAINT "OrganisationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganisationMember" ADD CONSTRAINT "OrganisationMember_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meeting" ADD CONSTRAINT "Meeting_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meeting" ADD CONSTRAINT "Meeting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meeting" ADD CONSTRAINT "Meeting_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Term" ADD CONSTRAINT "Term_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Holiday" ADD CONSTRAINT "Holiday_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "public"."Meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckIn" ADD CONSTRAINT "CheckIn_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckIn" ADD CONSTRAINT "CheckIn_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckIn" ADD CONSTRAINT "CheckIn_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BillingSettings" ADD CONSTRAINT "BillingSettings_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Discount" ADD CONSTRAINT "Discount_billingSettingsId_fkey" FOREIGN KEY ("billingSettingsId") REFERENCES "public"."BillingSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentDiscount" ADD CONSTRAINT "StudentDiscount_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentDiscount" ADD CONSTRAINT "StudentDiscount_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
