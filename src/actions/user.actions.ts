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

export const getUserByUsernameAndEmail = async (query: string) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        username: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                ],
            },
        });

        if (user.email === "crackthecode.tech@gmail.com") {
            return { success: false, error: "User not found" };
        }

        return { success: true, user };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};
