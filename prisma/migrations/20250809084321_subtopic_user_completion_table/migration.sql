/*
  Warnings:

  - You are about to drop the column `completed` on the `SubTopic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."SubTopic" DROP COLUMN "completed";

-- CreateTable
CREATE TABLE "public"."UserSubTopicProgress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subtopic_id" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "UserSubTopicProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSubTopicProgress_user_id_subtopic_id_key" ON "public"."UserSubTopicProgress"("user_id", "subtopic_id");

-- AddForeignKey
ALTER TABLE "public"."UserSubTopicProgress" ADD CONSTRAINT "UserSubTopicProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSubTopicProgress" ADD CONSTRAINT "UserSubTopicProgress_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "public"."SubTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
