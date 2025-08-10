"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Course, SubTopic, Topic } from "@/generated/prisma";

type CourseWithTopicsAndSubTopics = Course & {
    topics: (Topic & {
        subTopics: SubTopic[];
    })[];
};

const FormSkeleton = () => (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
        <Skeleton className="h-8 w-1/2" />
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    </div>
);

const UpdateCourseForm = dynamic(
    () => import("@/components/admin-page/update-course/UpdateCourseForm"),
    {
        ssr: true,
        loading: () => <FormSkeleton />,
    }
);

export default function UpdateCourseFormLoader({
    course,
}: {
    course: CourseWithTopicsAndSubTopics;
}) {
    return <UpdateCourseForm course={course} />;
}
