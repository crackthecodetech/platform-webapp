/*
  Warnings:

  - You are about to drop the column `completed` on the `UserSubTopicProgress` table. All the data in the column will be lost.
  - Made the column `completed_at` on table `UserSubTopicProgress` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."UserSubTopicProgress" DROP COLUMN "completed",
ALTER COLUMN "completed_at" SET NOT NULL,
ALTER COLUMN "completed_at" SET DEFAULT CURRENT_TIMESTAMP;
