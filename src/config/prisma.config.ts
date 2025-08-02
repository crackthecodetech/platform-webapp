import { PrismaClient } from "@/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

// Define a type for the extended Prisma Client
type PrismaClientWithAccelerate = ReturnType<typeof getPrismaClient>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientWithAccelerate | undefined;
};

function getPrismaClient() {
    return new PrismaClient().$extends(withAccelerate());
}

const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
