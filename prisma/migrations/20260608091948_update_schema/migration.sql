/*
  Warnings:

  - The primary key for the `audit_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `audit_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `banners` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `banners` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `faq_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `faq_categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `faqs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `faqs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `galleries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `galleries` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `gallery_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `gallery_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `news` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `news` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `news_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `news_categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `pages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `pages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `regulations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `regulations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `uptds` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `uptds` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `uptdId` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userId` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `entityId` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `categoryId` on the `faqs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `authorId` on the `faqs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `authorId` on the `galleries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `galleryId` on the `gallery_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `categoryId` on the `news` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `authorId` on the `news` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "faqs" DROP CONSTRAINT "faqs_authorId_fkey";

-- DropForeignKey
ALTER TABLE "faqs" DROP CONSTRAINT "faqs_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "galleries" DROP CONSTRAINT "galleries_authorId_fkey";

-- DropForeignKey
ALTER TABLE "gallery_items" DROP CONSTRAINT "gallery_items_galleryId_fkey";

-- DropForeignKey
ALTER TABLE "news" DROP CONSTRAINT "news_authorId_fkey";

-- DropForeignKey
ALTER TABLE "news" DROP CONSTRAINT "news_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_uptdId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "entityId",
ADD COLUMN     "entityId" INTEGER NOT NULL,
ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "banners" DROP CONSTRAINT "banners_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "banners_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "faq_categories" DROP CONSTRAINT "faq_categories_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "faq_categories_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "faqs" DROP CONSTRAINT "faqs_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
DROP COLUMN "authorId",
ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD CONSTRAINT "faqs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "galleries" DROP CONSTRAINT "galleries_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "authorId",
ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD CONSTRAINT "galleries_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "gallery_items" DROP CONSTRAINT "gallery_items_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "galleryId",
ADD COLUMN     "galleryId" INTEGER NOT NULL,
ADD CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "news" DROP CONSTRAINT "news_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
DROP COLUMN "authorId",
ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD CONSTRAINT "news_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "news_categories" DROP CONSTRAINT "news_categories_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "news_categories_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "pages" DROP CONSTRAINT "pages_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "pages_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "regulations" DROP CONSTRAINT "regulations_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "regulations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "settings" DROP CONSTRAINT "settings_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "uptds" DROP CONSTRAINT "uptds_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "uptds_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "uptdId",
ADD COLUMN     "uptdId" INTEGER,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_uptdId_fkey" FOREIGN KEY ("uptdId") REFERENCES "uptds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "news_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "galleries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "faq_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
