/*
  Warnings:

  - The `question` column on the `SubTopic` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."SubTopic" DROP COLUMN "question",
ADD COLUMN     "question" INTEGER;
