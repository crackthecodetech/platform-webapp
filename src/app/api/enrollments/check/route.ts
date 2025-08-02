import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/config/prisma.config";

export async function POST(request: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json(
                { isEnrolled: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { courseId } = await request.json();
        if (!courseId) {
            return NextResponse.json(
                { isEnrolled: false, error: "Course ID is required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { clerk_id: clerkId },
        });

        if (!user) {
            return NextResponse.json({ isEnrolled: false });
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                user_id_course_id: {
                    user_id: user.id,
                    course_id: courseId,
                },
            },
        });

        return NextResponse.json({ isEnrolled: !!enrollment });
    } catch (error) {
        console.error("Error checking enrollment:", error);
        return NextResponse.json(
            { isEnrolled: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
