/*
  Warnings:

  - You are about to drop the column `expires_at` on the `Enquiry` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Enquiry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Enquiry" DROP COLUMN "expires_at",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
