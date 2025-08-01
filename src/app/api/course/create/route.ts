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
                if (error) {
                    return reject(error);
                }
                resolve(result);
            })
            .end(buffer);
    });
};

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get("title") as string;
        const imageFile = formData.get("image_file") as File;
        const videoFiles = formData.getAll("video_files") as File[];

        if (!title || !imageFile || videoFiles.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields." },
                { status: 400 }
            );
        }

        const folderName = `courses/${title
            .replace(/\s+/g, "-")
            .toLowerCase()}`;

        const uploadPromises = [];

        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        uploadPromises.push(
            uploadToCloudinary(imageBuffer, { folder: folderName })
        );

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

        // TODO: Now save the title, description, imageUrl, and videoUrls to your database

        return NextResponse.json({
            message: "Course created successfully!",
        });
    } catch (error) {
        console.error("Error creating course:", error);
        return NextResponse.json(
            { error: "Failed to create course" },
            { status: 500 }
        );
    }
}
