-- AlterTable: faq_categories - add new fields
ALTER TABLE "faq_categories" ADD COLUMN "description" TEXT;
ALTER TABLE "faq_categories" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "faq_categories" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "faq_categories" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: faqs - add new fields
ALTER TABLE "faqs" ADD COLUMN "slug" TEXT;
ALTER TABLE "faqs" ADD COLUMN "updatedById" INTEGER;
ALTER TABLE "faqs" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "faqs" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- Backfill slugs for existing FAQs (use id-based slug to ensure uniqueness)
UPDATE "faqs" SET "slug" = 'faq-' || id WHERE "slug" IS NULL;

-- Make slug NOT NULL and UNIQUE after backfill
ALTER TABLE "faqs" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_slug_key" UNIQUE ("slug");

-- CreateIndex
CREATE INDEX "faqs_slug_idx" ON "faqs"("slug");
CREATE INDEX "faqs_categoryId_idx" ON "faqs"("categoryId");
CREATE INDEX "faqs_isPublished_idx" ON "faqs"("isPublished");

-- AddForeignKey for updatedById
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_updatedById_fkey"
  FOREIGN KEY ("updatedById") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
