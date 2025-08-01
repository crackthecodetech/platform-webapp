import prisma from "@/config/prisma.config";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const event = await verifyWebhook(req);

        const event_type = event.type;

        switch (event_type) {
            case "user.created":
                const {
                    id,
                    first_name,
                    last_name,
                    username,
                    email_addresses,
                    image_url,
                } = event.data;
                await prisma.user.create({
                    data: {
                        clerk_id: id,
                        first_name: first_name || "",
                        last_name: last_name || "",
                        username: username || "",
                        email: email_addresses[0].email_address,
                        profile_image_url: image_url,
                    },
                });
                break;
            default:
                break;
        }

        return new Response("Webhook received", {
            status: 200,
        });
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error verifying webhook", {
            status: 400,
        });
    }
}
