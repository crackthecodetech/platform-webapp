import CourseDisplayClientWrapper from "./CourseDisplayClientWrapper";
import { currentUser } from "@clerk/nextjs/server";
import { checkUserCourseEnrollment } from "@/app/actions/enrollment.actions";
import { getCourseById } from "@/app/actions/course.actions";

const CourseDisplayPage = async ({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) => {
    const { courseId } = await params;
    const { id: clerkId } = await currentUser();
    const {
        course,
        success: getCourseSuccess,
        error,
    } = await getCourseById(courseId);

    if (!getCourseSuccess) {
        return (
            <div className="text-center py-12">
                An error occurred {error.toString()}
            </div>
        );
    }

    if (!course) {
        return <div className="text-center py-12">Course not found.</div>;
    }

    const { isEnrolled } = await checkUserCourseEnrollment(clerkId, courseId);

    if (!isEnrolled) {
        return <div className="text-center py-12">Course Not Enrolled</div>;
    }

    return course ? (
        <CourseDisplayClientWrapper course={course} />
    ) : (
        <div className="py-12 text-center">Course not found.</div>
    );
};

export default CourseDisplayPage;
