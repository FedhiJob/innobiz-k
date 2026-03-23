-- CreateTable
CREATE TABLE "public"."MonthlyReport" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reportMonth" TIMESTAMP(3) NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyReport_applicationId_idx" ON "public"."MonthlyReport"("applicationId");

-- CreateIndex
CREATE INDEX "MonthlyReport_startupId_idx" ON "public"."MonthlyReport"("startupId");

-- CreateIndex
CREATE INDEX "MonthlyReport_reportMonth_idx" ON "public"."MonthlyReport"("reportMonth");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyReport_applicationId_reportMonth_key" ON "public"."MonthlyReport"("applicationId", "reportMonth");

-- AddForeignKey
ALTER TABLE "public"."MonthlyReport" ADD CONSTRAINT "MonthlyReport_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MonthlyReport" ADD CONSTRAINT "MonthlyReport_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
