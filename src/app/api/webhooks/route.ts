import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const event = await verifyWebhook(req);

        const event_type = event.type;

        switch (event_type) {
            case "user.created":
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
