"use server";

import prisma from "@/config/prisma.config";
import { EnrollmentWithUser } from "@/types/enrollment.types";
import { auth } from "@clerk/nextjs/server";
import { getAllCoursesWithTopicsAndSubTopicsByOffline } from "./course.actions";

export const getOfflineAndOnlineUserEnrollments = async () => {
    try {
        const { userId } = await auth();
        const loggedIn = !!userId;

        const offlineCoursesData = getAllCoursesWithTopicsAndSubTopicsByOffline(
            {
                offline: true,
            }
        );
        const onlineCoursesData = getAllCoursesWithTopicsAndSubTopicsByOffline({
            offline: false,
        });
        const userEnrollmentsData = loggedIn
            ? getClerkActiveEnrollments(userId)
            : { enrollments: [], enrolledCourseIds: new Set() };

        const [
            offlineCoursesResponse,
            onlineCoursesResponse,
            userEnrollmentsResponse,
        ] = await Promise.all([
            offlineCoursesData,
            onlineCoursesData,
            userEnrollmentsData,
        ]);
        const { courses: offlineCourses } = offlineCoursesResponse;
        const { courses: onlineCourses } = onlineCoursesResponse;
        const { enrollments, enrolledCourseIds } = userEnrollmentsResponse;

        const filteredOfflineCourses = offlineCourses.filter(
            (course) =>
                enrolledCourseIds.has(course.id) ||
                (enrolledCourseIds.size !== 0 && course.isFree)
        );
        const filteredOnlineCourses = onlineCourses.filter(
            (course) =>
                enrolledCourseIds.has(course.id) ||
                (enrolledCourseIds.size !== 0 && course.isFree)
        );

        return {
            success: true,
            enrollments,
            filteredOfflineCourses,
            filteredOnlineCourses,
        };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};

export const getEnrollmentsByCourseIdWithUserDetails = async (
    courseId: string
): Promise<{
    success: boolean;
    error?: unknown;
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

export const getClerkActiveEnrollments = async (clerkId: string) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: {
                user: {
                    clerk_id: clerkId,
                },
                expires_at: {
                    gte: new Date(),
                },
            },
            select: {
                course_id: true,
                course: {
                    select: {
                        offline: true,
                    },
                },
                expires_at: true,
            },
        });

        const enrolledCourseIds = new Set();

        enrollments.forEach((enrollment) => {
            enrolledCourseIds.add(enrollment.course_id);
        });

        return { success: true, enrollments, enrolledCourseIds };
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
                expires_at: {
                    gte: new Date(),
                },
            },
        });

        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
        });

        const { enrolledCourseIds } = await getClerkActiveEnrollments(clerkId);

        return {
            success: true,
            isEnrolled:
                !!enrollment || (!!course && enrolledCourseIds.size !== 0),
        };
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
