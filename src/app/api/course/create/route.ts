import { auth } from "@clerk/nextjs/server";
import prisma from "@/config/prisma.config";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 1. Update the helper function to return a typed Promise
const uploadToCloudinary = (
    buffer: Buffer,
    options: object
): Promise<UploadApiResponse | undefined> => {
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

        // 2. The result is now a properly typed array
        const uploadResults = await Promise.all(uploadPromises);

        // 3. Access properties safely without 'any'
        const imageUrl = uploadResults[0]?.secure_url;
        const videoUrls = uploadResults
            .slice(1)
            .map((result) => result?.secure_url);

        // 4. Add a check to ensure all uploads were successful
        if (!imageUrl || videoUrls.some((url) => !url)) {
            return NextResponse.json(
                { error: "One or more files failed to upload." },
                { status: 500 }
            );
        }

        const videoCreateData = videoFiles.map((video, index) => ({
            title: video.name,
            videoUrl: videoUrls[index]!, // Use non-null assertion as we've checked above
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
