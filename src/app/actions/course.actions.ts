"use server";

import prisma from "@/config/prisma.config";

export const getAllCourses = async () => {
    try {
        const courses = await prisma.course.findMany({
            orderBy: {
                created_at: "desc",
            },
        });

        return { success: true, courses };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};

export const createCourse = async (data: {
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    videoUrls: string[];
}) => {
    try {
        const { title, description, price, imageUrl, videoUrls } = data;

        const videoCreateData = videoUrls.map((url: string, index: number) => ({
            title: `Video ${index + 1}`,
            videoUrl: url,
            position: index + 1,
        }));

        const course = await prisma.course.create({
            data: {
                title,
                description,
                price,
                imageUrl,
                videos: {
                    createMany: {
                        data: videoCreateData,
                    },
                },
            },
        });

        return { success: true, course };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};

export const getCourseById = async (courseId: string) => {
    try {
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

        return { success: true, course };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};
