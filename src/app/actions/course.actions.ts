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

export const getAllCoursesWithTopicsAndSubTopics = async () => {
    try {
        const courses = await prisma.course.findMany({
            orderBy: {
                created_at: "desc",
            },
            include: {
                topics: {
                    include: {
                        subTopics: {
                            orderBy: {
                                position: "asc",
                            },
                        },
                    },
                },
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
    subTopics: SubTopicData[];
}

interface SubTopicData {
    title: string;
    imageUrl?: string;
    videoUrl?: string;
    isFree?: boolean;
}

export const createCourse = async (data: {
    title: string;
    description?: string;
    price: number;
    imageUrl?: string;
    topics: TopicData[];
    offline: boolean;
}) => {
    try {
        const { title, description, price, imageUrl, topics, offline } = data;
        const price_in_paise = Math.round(price * 100);

        const course = await prisma.course.create({
            data: {
                title,
                description,
                price: price_in_paise,
                imageUrl,
                offline,
                topics: {
                    create: topics.map((topic, topicIndex) => ({
                        title: topic.title,
                        position: topicIndex + 1,
                        subTopics: {
                            create: topic.subTopics.map(
                                (subTopic, subTopicIndex) => ({
                                    title: subTopic.title,
                                    imageUrl: subTopic.imageUrl,
                                    videoUrl: subTopic.videoUrl,
                                    isFree: subTopic.isFree,
                                    position: subTopicIndex + 1,
                                })
                            ),
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
                        subTopics: {
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
