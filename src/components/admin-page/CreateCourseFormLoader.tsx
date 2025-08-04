"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

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

const CreateCourseForm = dynamic(
    () => import("@/components/admin-page/CreateCourseForm"),
    {
        ssr: true,
        loading: () => <FormSkeleton />,
    }
);

export default function CreateCourseFormLoader() {
    return <CreateCourseForm />;
}
