import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/config/prisma.config";

export async function POST(request: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
        where: {
            clerk_id: userId,
        },
    });
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        courseId,
    } = await request.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    try {
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }

        await prisma.enrollment.create({
            data: {
                course_id: courseId,
                user_id: user.id,
            },
        });

        return NextResponse.json({ message: "Payment verified successfully" });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return NextResponse.json(
            { error: "Payment verification failed" },
            { status: 500 }
        );
    }
}
