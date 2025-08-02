import prisma from "@/config/prisma.config";
import CourseDisplayClient from "./CourseDisplayClient";

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

    return <CourseDisplayClient course={course} />;
};

export default CourseDisplayPage;
