-- AlterEnum
ALTER TYPE "public"."SubTopicType" ADD VALUE 'OFFLINE_CONTENT';

-- AlterTable
ALTER TABLE "public"."SubTopic" ADD COLUMN     "offlineContentMarkdown" TEXT;
