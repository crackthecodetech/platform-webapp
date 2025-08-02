import prisma from "@/config/prisma.config";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const courses = await prisma.course.findMany();

        return NextResponse.json({
            message: "Fetched courses successfully",
            courses,
        });
    } catch (error) {
        console.error("Error fetching courses:", error);
        return NextResponse.json(
            { error: "Failed to fetch courses" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, price, imageUrl, videoUrls } = body;

        const videoCreateData = videoUrls.map((url: string, index: number) => ({
            title: `Video ${index + 1}`,
            videoUrl: url,
            position: index + 1,
        }));

        const course = await prisma.course.create({
            data: {
                title,
                description,
                price,
                imageUrl,
                videos: {
                    createMany: {
                        data: videoCreateData,
                    },
                },
            },
        });

        return NextResponse.json({
            message: "Course created successfully!",
            courseId: course.id,
        });
    } catch (error) {
        console.error("Error creating course:", error);
        return NextResponse.json(
            { error: "Failed to create course" },
            { status: 500 }
        );
    }
}
