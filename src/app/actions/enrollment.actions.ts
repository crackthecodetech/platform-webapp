"use server";

import prisma from "@/config/prisma.config";

export const getClerkUserEnrollmentsIds = async (clerkId: string) => {
    try {
        const enrollmentIds = await prisma.enrollment.findMany({
            where: {
                user: {
                    clerk_id: clerkId,
                },
            },
            select: {
                course_id: true,
            },
        });

        return { success: true, enrollmentIds };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};
