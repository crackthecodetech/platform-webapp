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

export const checkIfAdmin = async (clerkId: string) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                clerk_id: clerkId,
            },
        });

        const admin = user.email === process.env.ADMIN;

        return { success: true, admin };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};
