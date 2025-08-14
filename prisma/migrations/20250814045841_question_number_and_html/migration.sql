/*
  Warnings:

  - You are about to drop the column `question` on the `SubTopic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."SubTopic" DROP COLUMN "question",
ADD COLUMN     "questionHTML" TEXT,
ADD COLUMN     "questionNumber" INTEGER;
