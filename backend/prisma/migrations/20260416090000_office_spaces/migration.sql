-- CreateTable
CREATE TABLE "public"."OfficeSpace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "locationLabel" TEXT,
    "capacity" INTEGER,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageFileName" TEXT,
    "imageFileSize" INTEGER,
    "imageMimeType" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeSpace_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "public"."SpaceRequest"
ADD COLUMN     "officeSpaceId" TEXT,
ADD COLUMN     "officeSpaceName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OfficeSpace_slug_key" ON "public"."OfficeSpace"("slug");

-- CreateIndex
CREATE INDEX "OfficeSpace_published_sortOrder_createdAt_idx" ON "public"."OfficeSpace"("published", "sortOrder", "createdAt");

-- CreateIndex
CREATE INDEX "SpaceRequest_officeSpaceId_idx" ON "public"."SpaceRequest"("officeSpaceId");

-- AddForeignKey
ALTER TABLE "public"."SpaceRequest" ADD CONSTRAINT "SpaceRequest_officeSpaceId_fkey" FOREIGN KEY ("officeSpaceId") REFERENCES "public"."OfficeSpace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
