import { getAllCoursesWithTopicsAndSubTopics } from "@/actions/course.actions";
import CoursesCatalog from "@/components/courses-page/CoursesCatalog";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@clerk/nextjs/server";
import React, { Suspense } from "react";

const CatalogSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                    <Skeleton
                        key={i}
                        className="h-[520px] w-full animate-pulse rounded-lg bg-gray-200"
                    />
                ))}
                {[...Array(3)].map((_, i) => (
                    <Skeleton
                        key={i}
                        className="h-[520px] w-full animate-pulse rounded-lg bg-gray-200"
                    />
                ))}
            </div>
        </div>
    );
};

const CoursesAnalyticsPage = async () => {
    const { courses } = await getAllCoursesWithTopicsAndSubTopics();
    const { sessionClaims } = await auth();

    return (
        <div>
            <Suspense fallback={<CatalogSkeleton />}>
                <CoursesCatalog
                    analytics={true}
                    courses={courses}
                    admin={sessionClaims["metadata"]["role"] === "admin"}
                />
            </Suspense>
        </div>
    );
};

export default CoursesAnalyticsPage;
