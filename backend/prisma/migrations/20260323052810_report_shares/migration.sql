-- AlterEnum
ALTER TYPE "public"."EmailTemplateType" ADD VALUE 'ADMIN_WEEKLY_REPORT';

-- CreateTable
CREATE TABLE "public"."ReportShare" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReportShare_token_key" ON "public"."ReportShare"("token");

-- CreateIndex
CREATE INDEX "ReportShare_token_idx" ON "public"."ReportShare"("token");

-- CreateIndex
CREATE INDEX "ReportShare_expiresAt_idx" ON "public"."ReportShare"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."ReportShare" ADD CONSTRAINT "ReportShare_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
