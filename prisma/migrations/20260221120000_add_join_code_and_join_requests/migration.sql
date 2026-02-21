-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN "joinCode" TEXT;
ALTER TABLE "Organisation" ADD COLUMN "joinCodeExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_joinCode_key" ON "Organisation"("joinCode");

-- CreateTable
CREATE TABLE "OrganisationJoinRequest" (
    "id" TEXT NOT NULL,
    "status" "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "role" "Role" NOT NULL DEFAULT 'TEACHER',
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "decidedById" TEXT,

    CONSTRAINT "OrganisationJoinRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrganisationJoinRequest" ADD CONSTRAINT "OrganisationJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationJoinRequest" ADD CONSTRAINT "OrganisationJoinRequest_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationJoinRequest" ADD CONSTRAINT "OrganisationJoinRequest_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
