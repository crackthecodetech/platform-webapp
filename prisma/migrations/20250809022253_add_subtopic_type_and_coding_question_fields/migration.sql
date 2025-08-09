-- CreateEnum
CREATE TYPE "public"."SubTopicType" AS ENUM ('VIDEO', 'CODING_QUESTION');

-- AlterTable
ALTER TABLE "public"."SubTopic" ADD COLUMN     "question" TEXT,
ADD COLUMN     "testCases" JSONB,
ADD COLUMN     "type" "public"."SubTopicType" NOT NULL DEFAULT 'VIDEO';
