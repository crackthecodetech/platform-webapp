"use server";

import prisma from "@/config/prisma.config";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "./user.actions";

export const completeSubTopic = async (subTopicId: string) => {
    try {
        const { id: clerkId } = await currentUser();
        const { success, error, user } = await getUserByClerkId(clerkId);

        if (!success) {
            throw error;
        }

        await prisma.userSubTopicProgress.upsert({
            where: {
                user_id_subtopic_id: {
                    user_id: user.id,
                    subtopic_id: subTopicId,
                },
            },
            update: {},
            create: {
                user_id: user.id,
                subtopic_id: subTopicId,
            },
        });

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};
