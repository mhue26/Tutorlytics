-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "bio" TEXT;

-- CreateTable
CREATE TABLE "public"."OrganisationPreferences" (
    "id" TEXT NOT NULL,
    "defaultStudentRateCents" INTEGER,
    "defaultSubjects" JSONB,
    "subjectColorsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organisationId" TEXT NOT NULL,

    CONSTRAINT "OrganisationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserPreferences" (
    "id" TEXT NOT NULL,
    "studentsTablePrefsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationPreferences_organisationId_key" ON "public"."OrganisationPreferences"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_organisationId_key" ON "public"."UserPreferences"("userId", "organisationId");

-- AddForeignKey
ALTER TABLE "public"."OrganisationPreferences" ADD CONSTRAINT "OrganisationPreferences_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserPreferences" ADD CONSTRAINT "UserPreferences_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
