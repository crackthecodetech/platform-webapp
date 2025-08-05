import { getCourseById } from "@/app/actions/course.actions";
import { getEnrollmentsByCourseIdWithUserDetails } from "@/app/actions/enrollment.actions";
import CourseEnrollmentsList from "./CourseEnrollmentsList";

const CourseAnalyticsPage = async ({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) => {
    const { courseId } = await params;
    const {
        success: courseSuccess,
        course,
        error: courseError,
    } = await getCourseById(courseId);
    const {
        success: enrollmentSuccess,
        enrollments,
        error: enrollmentError,
    } = await getEnrollmentsByCourseIdWithUserDetails(courseId);

    if (!courseSuccess) {
        return <div>Failed to fetch course: {JSON.stringify(courseError)}</div>;
    }
    if (!enrollmentSuccess) {
        return (
            <div>
                Failed to fetch enrollments: {JSON.stringify(enrollmentError)}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-7">
            <div className="col-span-3 flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-center my-4">
                    <h1 className="font-bold text-4xl text-center">
                        {course.title}
                    </h1>
                </div>
                <div className="flex-1 max-h-full">
                    <CourseEnrollmentsList enrollments={enrollments} />
                </div>
            </div>
            <div className="col-span-4">
                <div className="">Line Graph</div>
                <div className="">Revenue table</div>
            </div>
        </div>
    );
};

export default CourseAnalyticsPage;
