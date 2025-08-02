import prisma from "@/config/prisma.config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { clerkId: string } }
) {
    try {
        const { clerkId } = await params;

        const user = await prisma.user.findFirst({
            where: {
                clerk_id: clerkId,
            },
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Get user by clerkId error", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
