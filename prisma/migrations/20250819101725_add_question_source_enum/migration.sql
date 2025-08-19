/*
  Warnings:

  - The `questionSource` column on the `SubTopic` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."QuestionSource" AS ENUM ('LEETCODE', 'MANUAL');

-- AlterTable
ALTER TABLE "public"."SubTopic" DROP COLUMN "questionSource",
ADD COLUMN     "questionSource" "public"."QuestionSource";
