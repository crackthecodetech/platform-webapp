"use server";

import prisma from "@/config/prisma.config";

export const getUserByClerkId = async (clerkId: string) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                clerk_id: clerkId,
            },
        });

        return { success: true, user };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};

export const getUserByUsername = async (username: string) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                username: username,
            },
        });

        return { success: true, user };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};
