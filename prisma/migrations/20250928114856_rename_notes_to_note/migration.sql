/*
  Warnings:

  - You are about to drop the column `notes` on the `Enquiry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Enquiry" DROP COLUMN "notes",
ADD COLUMN     "note" TEXT;
