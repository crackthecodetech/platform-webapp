import { getCourseById } from "@/app/actions/course.actions";

const CourseAnalyticsPage = async ({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) => {
    const { courseId } = await params;
    const { success, course, error } = await getCourseById(courseId);

    if (!success) {
        return <div>Failed to fetch course: {JSON.stringify(error)}</div>;
    }

    return (
        <div className="">
            <div className="">
                <div className="">Course Name</div>
                <div className="">Enrollments list</div>
            </div>
            <div className="">
                <div className="">Line Graph</div>
                <div className="">Revenue table</div>
            </div>
        </div>
    );
};

export default CourseAnalyticsPage;
