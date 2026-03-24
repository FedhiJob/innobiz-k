-- CreateEnum
CREATE TYPE "public"."SpaceRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "public"."NotificationType" ADD VALUE 'SPACE_REQUEST_SUBMITTED';

-- CreateTable
CREATE TABLE "public"."SpaceRequest" (
    "id" TEXT NOT NULL,
    "startupName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "teamSize" INTEGER,
    "resourceTypes" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT NOT NULL,
    "additionalNotes" TEXT,
    "status" "public"."SpaceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpaceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpaceRequest_status_createdAt_idx" ON "public"."SpaceRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SpaceRequest_email_idx" ON "public"."SpaceRequest"("email");

-- CreateIndex
CREATE INDEX "SpaceRequest_createdAt_idx" ON "public"."SpaceRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."SpaceRequest" ADD CONSTRAINT "SpaceRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
