import { getCourseById } from "@/actions/course.actions";
import UpdateCourseFormLoader from "@/components/admin-page/update-course/UpdateCourseFormLoader";
import React from "react";

const UpdateCoursePage = async ({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) => {
    const { courseId } = await params;
    const { course, success, error } = await getCourseById(courseId);

    if (!success) {
        return <div>Error loading course data: {JSON.stringify(error)}</div>;
    }

    return (
        <div>
            <UpdateCourseFormLoader course={course} />
        </div>
    );
};

export default UpdateCoursePage;
