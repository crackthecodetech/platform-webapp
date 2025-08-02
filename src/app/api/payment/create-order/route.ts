import prisma from "@/config/prisma.config";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
    const { courseId } = await request.json();

    if (!courseId) {
        return NextResponse.json(
            { error: "Course ID is required" },
            { status: 400 }
        );
    }

    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course || course.price == null) {
            return NextResponse.json(
                { error: "Course not found or has no price" },
                { status: 404 }
            );
        }

        const options = {
            amount: course.price * 100,
            currency: "INR",
            receipt: `receipt_course_${course.id}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json(
            { error: "Could not create order" },
            { status: 500 }
        );
    }
}
