-- AlterEnum
ALTER TYPE "public"."SubTopicType" ADD VALUE 'PROJECT';

-- AlterTable
ALTER TABLE "public"."SubTopic" ADD COLUMN     "projectMarkdown" TEXT;
