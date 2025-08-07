/*
  Warnings:

  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Video" DROP CONSTRAINT "Video_topic_id_fkey";

-- DropTable
DROP TABLE "public"."Video";

-- CreateTable
CREATE TABLE "public"."SubTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "position" INTEGER NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "topic_id" TEXT NOT NULL,

    CONSTRAINT "SubTopic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SubTopic" ADD CONSTRAINT "SubTopic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
