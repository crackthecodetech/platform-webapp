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

interface TopicData {
    title: string;
    videos: VideoData[];
}

interface VideoData {
    title: string;
    imageUrl?: string;
    videoUrl: string;
    isFree?: boolean;
}

export const createCourse = async (data: {
    title: string;
    description?: string;
    price: number;
    imageUrl?: string;
    topics: TopicData[];
}) => {
    try {
        const { title, description, price, imageUrl, topics } = data;

        const course = await prisma.course.create({
            data: {
                title,
                description,
                price,
                imageUrl,
                topics: {
                    create: topics.map((topic, topicIndex) => ({
                        title: topic.title,
                        position: topicIndex + 1,
                        videos: {
                            create: topic.videos.map((video, videoIndex) => ({
                                title: video.title,
                                imageUrl: video.imageUrl,
                                videoUrl: video.videoUrl,
                                isFree: video.isFree,
                                position: videoIndex + 1,
                            })),
                        },
                    })),
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
                topics: {
                    orderBy: {
                        position: "asc",
                    },
                    include: {
                        videos: {
                            orderBy: {
                                position: "asc",
                            },
                        },
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
