"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import { Course } from "@/generated/prisma";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonCard = () => (
    <div className="flex flex-col space-y-3">
        <Skeleton className="h-[225px] w-full rounded-xl" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    </div>
);

const CoursesCatalog = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(
        new Set()
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [coursesResponse, enrollmentsResponse] =
                    await Promise.all([
                        axios.get("/api/course"),
                        axios
                            .get("/api/enrollments")
                            .catch(() => ({ data: [] })),
                    ]);

                setCourses(coursesResponse.data.courses as Course[]);
                setEnrolledCourses(
                    new Set(enrollmentsResponse.data as string[])
                );
            } catch (err) {
                setError("Failed to load courses. Please try again later.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (error) {
        return <p className="text-center text-red-500 py-12">{error}</p>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            isEnrolled={enrolledCourses.has(course.id)}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-12">
                    No courses found.
                </p>
            )}
        </div>
    );
};

export default CoursesCatalog;
