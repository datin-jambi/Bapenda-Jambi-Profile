/*
  Warnings:

  - Added the required column `updatedAt` to the `news_categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "faq_categories" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "news_categories" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Remove default after backfill so Prisma manages it at application level
ALTER TABLE "news_categories" ALTER COLUMN "updatedAt" DROP DEFAULT;
