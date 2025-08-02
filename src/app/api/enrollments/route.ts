import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/config/prisma.config";

export async function GET() {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { clerk_id: clerkId },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const enrollments = await prisma.enrollment.findMany({
            where: {
                user_id: user.id,
            },
            select: {
                course_id: true,
            },
        });

        const enrolledCourseIds = enrollments.map((e) => e.course_id);
        return NextResponse.json(enrolledCourseIds);
    } catch (error) {
        console.error("Error fetching enrollments:", error);
        return NextResponse.json(
            { error: "Failed to fetch enrollments" },
            { status: 500 }
        );
    }
}
