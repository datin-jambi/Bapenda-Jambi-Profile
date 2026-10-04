/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `regulations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `regulations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "regulations" ADD COLUMN     "fileId" TEXT,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX "regulations_slug_key" ON "regulations"("slug");
