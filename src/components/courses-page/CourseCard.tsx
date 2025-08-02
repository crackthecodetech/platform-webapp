import { Course } from "@/generated/prisma";
import React from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import Image from "next/image";
import { Star } from "lucide-react";

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price);
};

const CourseCard = ({ course }: { course: Course }) => {
    const rating = 5;

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
                    {course.price! > 0 ? formatPrice(course.price!) : "Free"}
                </p>
                <Button>Enroll Now</Button>
            </CardFooter>
        </Card>
    );
};

export default CourseCard;
