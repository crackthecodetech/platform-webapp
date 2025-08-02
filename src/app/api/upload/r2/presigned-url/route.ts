import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export async function POST(request: Request) {
    try {
        const { key, contentType } = await request.json();

        if (!key || !contentType) {
            return NextResponse.json(
                { error: "Missing key or contentType" },
                { status: 400 }
            );
        }

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            ContentType: contentType,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
        });

        return NextResponse.json({ url: presignedUrl });
    } catch (error) {
        console.error("Error creating presigned URL:", error);
        return NextResponse.json(
            { error: "Failed to create presigned URL" },
            { status: 500 }
        );
    }
}
