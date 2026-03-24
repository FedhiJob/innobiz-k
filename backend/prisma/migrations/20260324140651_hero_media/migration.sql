-- CreateEnum
CREATE TYPE "public"."HeroMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "public"."HeroUpdate" ADD COLUMN     "mediaFileName" TEXT,
ADD COLUMN     "mediaFileSize" INTEGER,
ADD COLUMN     "mediaMimeType" TEXT,
ADD COLUMN     "mediaType" "public"."HeroMediaType";
