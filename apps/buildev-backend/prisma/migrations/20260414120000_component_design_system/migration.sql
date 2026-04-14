-- AlterTable
ALTER TABLE "Component" ADD COLUMN "designSystemId" TEXT;

-- CreateIndex
CREATE INDEX "Component_siteId_designSystemId_idx" ON "Component"("siteId", "designSystemId");
