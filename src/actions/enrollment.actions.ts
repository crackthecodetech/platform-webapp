"use server";

import prisma from "@/config/prisma.config";
import { EnrollmentWithUser } from "@/types/enrollment.types";

export const getEnrollmentsByCourseIdWithUserDetails = async (
    courseId: string
): Promise<{
    success: boolean;
    error?: Error;
    enrollments?: EnrollmentWithUser[];
}> => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: {
                course_id: courseId,
            },
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        });

        return { success: true, enrollments };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};

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

export const checkUserCourseEnrollment = async (
    clerkId: string,
    courseId: string
) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                clerk_id: clerkId,
            },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                user_id_course_id: {
                    user_id: user.id,
                    course_id: courseId,
                },
            },
        });

        return { success: true, isEnrolled: !!enrollment };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};

export const createEnrollment = async (
    courseId: string,
    userId: string,
    expiresAt: Date
) => {
    try {
        await prisma.enrollment.create({
            data: {
                course_id: courseId,
                user_id: userId,
                expires_at: expiresAt,
            },
        });
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};
