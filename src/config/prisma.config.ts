import { PrismaClient } from "@/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

function getPrismaClient() {
    return new PrismaClient().$extends(withAccelerate());
}

type PrismaClientWithAccelerate = ReturnType<typeof getPrismaClient>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientWithAccelerate | undefined;
};

const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
