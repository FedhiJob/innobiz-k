-- CreateTable
CREATE TABLE "public"."HeroUpdate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ctaLabel" TEXT,
    "ctaUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "HeroUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroUpdate_published_createdAt_idx" ON "public"."HeroUpdate"("published", "createdAt");

-- CreateIndex
CREATE INDEX "HeroUpdate_createdAt_idx" ON "public"."HeroUpdate"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."HeroUpdate" ADD CONSTRAINT "HeroUpdate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
