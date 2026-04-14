-- CreateTable
CREATE TABLE "SiteInvitation" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "SiteInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteInvitation_token_key" ON "SiteInvitation"("token");

-- CreateIndex
CREATE INDEX "SiteInvitation_siteId_idx" ON "SiteInvitation"("siteId");

-- CreateIndex
CREATE INDEX "SiteInvitation_email_idx" ON "SiteInvitation"("email");

-- AddForeignKey
ALTER TABLE "SiteInvitation" ADD CONSTRAINT "SiteInvitation_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
