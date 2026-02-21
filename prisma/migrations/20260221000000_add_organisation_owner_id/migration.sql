-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN "ownerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_ownerId_key" ON "Organisation"("ownerId");

-- AddForeignKey
ALTER TABLE "Organisation" ADD CONSTRAINT "Organisation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
