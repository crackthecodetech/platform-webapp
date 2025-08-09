/*
  Warnings:

  - You are about to drop the column `updated_at` on the `Enrollment` table. All the data in the column will be lost.
  - Added the required column `expires_at` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Enrollment" DROP COLUMN "updated_at",
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;
