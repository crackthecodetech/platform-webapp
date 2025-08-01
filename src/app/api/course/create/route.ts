import { auth } from "@clerk/nextjs/server";
import prisma from "@/config/prisma.config";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer: Buffer, options: object) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(options, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            })
            .end(buffer);
    });
};

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const description = formData.get("description") as string | null;
        const price = formData.get("price") as string;
        const imageFile = formData.get("image_file") as File;
        const videoFiles = formData.getAll("video_files") as File[];

        if (!title || !price || !imageFile || videoFiles.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields." },
                { status: 400 }
            );
        }

        const folderName = `courses/${title
            .replace(/\s+/g, "-")
            .toLowerCase()}`;

        const uploadPromises = [
            uploadToCloudinary(Buffer.from(await imageFile.arrayBuffer()), {
                folder: folderName,
            }),
        ];

        for (const videoFile of videoFiles) {
            const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
            uploadPromises.push(
                uploadToCloudinary(videoBuffer, {
                    folder: folderName,
                    resource_type: "video",
                })
            );
        }

        const uploadResults = await Promise.all(uploadPromises);

        const imageUrl = (uploadResults[0] as any).secure_url;
        const videoUrls = uploadResults
            .slice(1)
            .map((result: any) => result.secure_url);

        const videoCreateData = videoFiles.map((video, index) => ({
            title: video.name,
            videoUrl: videoUrls[index],
            position: index + 1,
        }));

        const course = await prisma.course.create({
            data: {
                title,
                description,
                price: parseFloat(price),
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
            course: course.id,
        });
    } catch (error) {
        console.error("Error creating course:", error);
        return NextResponse.json(
            { error: "Failed to create course" },
            { status: 500 }
        );
    }
}
