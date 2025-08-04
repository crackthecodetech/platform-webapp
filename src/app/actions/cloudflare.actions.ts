"use server";

import cloudflareClient from "@/config/cloudflare.config";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getPresignedUrl = async (key: string, contentType: string) => {
    try {
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            ContentType: contentType,
        });

        const presignedUrl = await getSignedUrl(cloudflareClient, command, {
            expiresIn: 3600,
        });

        return { success: true, presignedUrl };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
};
