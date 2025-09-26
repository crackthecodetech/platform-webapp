-- DropIndex
DROP INDEX "public"."Enrollment_user_id_course_id_key";

-- CreateIndex
CREATE INDEX "Enrollment_course_id_idx" ON "public"."Enrollment"("course_id");
