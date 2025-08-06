/*
  Warnings:

  - You are about to drop the column `course_id` on the `Video` table. All the data in the column will be lost.
  - Added the required column `topic_id` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Video" DROP CONSTRAINT "Video_course_id_fkey";

-- AlterTable
ALTER TABLE "public"."Video" DROP COLUMN "course_id",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "topic_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "course_id" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Topic" ADD CONSTRAINT "Topic_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
