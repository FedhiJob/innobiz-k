-- CreateEnum
CREATE TYPE "public"."SupportInterest" AS ENUM ('OFFICE_SPACE', 'TRAINING', 'FUNDING', 'MENTORSHIP', 'NETWORKING', 'MARKET_ACCESS', 'LEGAL_SUPPORT', 'PRODUCT_DEVELOPMENT', 'INVESTMENT_READINESS', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "supportInterests" "public"."SupportInterest"[] DEFAULT ARRAY[]::"public"."SupportInterest"[];
