"use client";

import { Course } from "@/generated/prisma";
import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import Image from "next/image";
import { Star, Loader2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

// This is required to access the Razorpay object on the window
declare const window: any;

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(price);
};

// Define the props interface for type safety
interface CourseCardProps {
    course: Course;
    isEnrolled: boolean;
}

const CourseCard = ({ course, isEnrolled }: CourseCardProps) => {
    const [isEnrolling, setIsEnrolling] = useState(false);
    const rating = 5;
    const router = useRouter(); // Initialize the router

    const handleEnroll = async () => {
        setIsEnrolling(true);
        try {
            // 1. Create a payment order on your server
            const { data: order } = await axios.post(
                "/api/payment/create-order",
                {
                    courseId: course.id,
                }
            );

            // 2. Configure Razorpay Checkout options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "CrackTheCode",
                description: `Enroll in ${course.title}`,
                image: "/favicon.ico", // Your logo URL
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify the payment on your server
                    try {
                        await axios.post("/api/payment/verify", {
                            ...response,
                        });
                        alert("Enrollment successful!");
                        window.location.reload();
                    } catch (verifyError) {
                        console.error(
                            "Payment verification failed:",
                            verifyError
                        );
                        alert(
                            "Payment verification failed. Please contact support."
                        );
                    }
                },
                prefill: {
                    name: "",
                    email: "",
                    contact: "",
                },
                theme: {
                    color: "#3399cc",
                },
            };

            // 4. Open the Razorpay payment modal
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error("Could not start enrollment:", error);
            alert("Could not start enrollment. Please try again.");
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleOpenCourse = () => {
        router.push(`/courses/${course.id}`);
    };

    return (
        <Card className="flex flex-col overflow-hidden h-full transition-shadow hover:shadow-lg">
            <div className="relative w-full aspect-video">
                <Image
                    fill
                    src={course.imageUrl!}
                    alt={course.title}
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col flex-grow p-6">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl font-bold leading-tight">
                        {course.title}
                    </CardTitle>
                    <div className="flex items-center gap-1 mt-2">
                        <span className="text-amber-500 font-bold">
                            {rating.toFixed(1)}
                        </span>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                className={
                                    i < rating
                                        ? "text-amber-500 fill-amber-500"
                                        : "text-gray-300"
                                }
                            />
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="p-0 text-sm text-muted-foreground flex-grow">
                    <p className="line-clamp-3">{course.description}</p>
                </CardContent>
            </div>
            <CardFooter className="p-6 pt-0 mt-auto flex justify-between items-center">
                <p className="text-lg font-semibold">
                    {isEnrolled
                        ? ""
                        : course.price! > 0
                        ? formatPrice(course.price!)
                        : "Free"}
                </p>
                {isEnrolled ? (
                    <Button variant="outline" onClick={handleOpenCourse}>
                        Open Course
                    </Button>
                ) : (
                    <Button onClick={handleEnroll} disabled={isEnrolling}>
                        {isEnrolling && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Enroll Now
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default CourseCard;
