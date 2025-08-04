"use server";

import prisma from "@/config/prisma.config";
import razorpay from "@/config/razorpay.config";

export const createRazorpayOrder = async (courseId: string) => {
    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course || course.price == null) {
            return { success: false, error: "Course not found" };
        }

        const options = {
            amount: course.price * 100,
            currency: "INR",
            receipt: `receipt_course_${course.id}`,
        };

        const order = await razorpay.orders.create(options);

        return { success: true, order };
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return { success: false, error };
    }
};
