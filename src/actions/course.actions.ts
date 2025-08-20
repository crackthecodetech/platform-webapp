"use server";

import prisma from "@/config/prisma.config";
import { QuestionSource, SubTopic, SubTopicType } from "@/generated/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

export const getAllCoursesWithTopicsAndSubTopicsByOffline = async ({
    offline,
}: {
    offline: boolean;
}) => {
    try {
        const courses = await prisma.course.findMany({
            where: {
                offline,
            },
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
    type: SubTopicType;
    questionNumber?: number;
    questionHTML?: string;
    questionMarkdown?: string;
    testCases?: { input: string; output: string }[];
    projectMarkdown?: string;
    offlineContentMarkdown?: string;
    questionSource?: QuestionSource;
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
                                    type: subTopic.type,
                                    questionNumber: subTopic.questionNumber,
                                    questionHTML: subTopic.questionHTML,
                                    testCases: subTopic.testCases,
                                    projectMarkdown: subTopic.projectMarkdown,
                                    questionMarkdown: subTopic.questionMarkdown,
                                    offlineContentMarkdown:
                                        subTopic.offlineContentMarkdown,
                                    questionSource: subTopic.questionSource,
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

        const courseData = {
            ...course,
            price: course.price ? Number(course.price) : 0,
        };

        return { success: true, course: courseData };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};

export async function updateCourse(courseId: string, data: any) {
    const { userId } = await auth();
    if (!userId) {
        return { error: "Unauthorized" };
    }

    const price_in_paise = Math.round(data.price * 100);

    try {
        await prisma.course.update({
            where: { id: courseId },
            data: {
                title: data.title,
                description: data.description,
                price: price_in_paise,
                offline: data.offline,
                imageUrl: data.imageUrl,
                topics: {
                    deleteMany: {},
                    create: data.topics.map(
                        (topic: any, topicIndex: number) => ({
                            title: topic.title,
                            position: topicIndex,
                            subTopics: {
                                create: topic.subTopics.map(
                                    (
                                        subTopic: SubTopic,
                                        subTopicIndex: number
                                    ) => ({
                                        title: subTopic.title,
                                        type: subTopic.type,
                                        imageUrl: subTopic.imageUrl,
                                        videoUrl: subTopic.videoUrl,
                                        questionNumber: subTopic.questionNumber,
                                        questionHTML: subTopic.questionHTML,
                                        questionMarkdown:
                                            subTopic.questionMarkdown,
                                        testCases: subTopic.testCases,
                                        projectMarkdown:
                                            subTopic.projectMarkdown,
                                        offlineContentMarkdown:
                                            subTopic.offlineContentMarkdown,
                                        position: subTopicIndex,
                                        questionSource: subTopic.questionSource,
                                    })
                                ),
                            },
                        })
                    ),
                },
            },
        });

        revalidatePath(`/admin/update-course/${courseId}`);
        revalidatePath("/courses");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update course:", error);
        return { error: `Failed to update course: ${error.message}` };
    }
}
