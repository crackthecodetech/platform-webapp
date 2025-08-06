"use server";

import prisma from "@/config/prisma.config";
import razorpay from "@/config/razorpay.config";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

interface VerifyPayload {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    courseId: string;
}

export const createRazorpayOrder = async (courseId: string) => {
    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });
        console.log(course);

        if (!course || course.price == null) {
            return { success: false, error: "Course not found" };
        }

        const options = {
            amount: course.price * 100,
            currency: "INR",
            receipt: `receipt_course_${course.id}`,
        };
        console.log(options);

        const order = await razorpay.orders.create(options);

        return { success: true, order };
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return { success: false, error };
    }
};

export async function verifyRazorpayPayment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    courseId,
}: VerifyPayload) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await prisma.user.findFirst({
            where: {
                clerk_id: userId,
            },
        });
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return { success: false, error: "Invalid Signature" };
        }

        await prisma.enrollment.create({
            data: {
                course_id: courseId,
                user_id: user.id,
            },
        });

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
}
