-- CreateEnum
CREATE TYPE "public"."EnquiryStatus" AS ENUM ('OPEN', 'FOLLOWED_UP', 'ENROLLED', 'LOST');

-- CreateTable
CREATE TABLE "public"."Enquiry" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "status" "public"."EnquiryStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "location" TEXT NOT NULL,
    "college" TEXT NOT NULL,
    "graduation_year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Enquiry_phone_idx" ON "public"."Enquiry"("phone");

-- CreateIndex
CREATE INDEX "Enquiry_course_id_idx" ON "public"."Enquiry"("course_id");

-- CreateIndex
CREATE INDEX "Enquiry_created_at_idx" ON "public"."Enquiry"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_phone_course_id_key" ON "public"."Enquiry"("phone", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_email_course_id_key" ON "public"."Enquiry"("email", "course_id");

-- AddForeignKey
ALTER TABLE "public"."Enquiry" ADD CONSTRAINT "Enquiry_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
