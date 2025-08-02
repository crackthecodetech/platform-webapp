import { NextResponse } from "next/server";
import prisma from "@/config/prisma.config";

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        const course = await prisma.course.findUnique({
            where: {
                id,
            },
            include: {
                videos: {
                    orderBy: {
                        position: "asc",
                    },
                },
            },
        });

        if (!course) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(course);
    } catch (error) {
        console.error("[COURSE_ID_GET]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
