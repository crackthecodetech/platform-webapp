import prisma from "@/config/prisma.config";
import CourseDisplayClientWrapper from "./CourseDisplayClientWrapper";

const CourseDisplayPage = async ({
    params,
}: {
    params: { courseId: string };
}) => {
    const { courseId } = await params;
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            videos: {
                orderBy: {
                    position: "asc",
                },
            },
        },
    });

    if (!course) {
        return <div className="text-center py-12">Course not found.</div>;
    }

    return course ? (
        <CourseDisplayClientWrapper course={course} />
    ) : (
        <div className="py-12 text-center">Course not found.</div>
    );
};

export default CourseDisplayPage;
