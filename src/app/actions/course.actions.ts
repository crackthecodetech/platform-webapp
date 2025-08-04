import prisma from "@/config/prisma.config";

export const getAllCourses = async () => {
    try {
        const courses = await prisma.course.findMany({
            orderBy: {
                created_at: "desc",
            },
        });

        return { courses, success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
};
