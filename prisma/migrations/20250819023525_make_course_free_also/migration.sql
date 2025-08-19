/*
  Warnings:

  - You are about to drop the column `isPublished` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "isPublished",
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false;
