import React from "react";
import { getOfflineAndOnlineUserEnrollments } from "@/actions/enrollment.actions";
import CoursesCatalog from "@/components/courses-page/CoursesCatalog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

const EmptyState = ({
    title,
    description,
    showLink = false,
}: {
    title: string;
    description: string;
    showLink?: boolean;
}) => (
    <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg mt-6">
        <BookOpenCheck className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            {title}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {description}
        </p>
        {showLink && (
            <Button asChild className="mt-6">
                <Link href="/courses">Explore Courses</Link>
            </Button>
        )}
    </div>
);

const page = async () => {
    const {
        success,
        enrollments,
        error,
        filteredOfflineCourses,
        filteredOnlineCourses,
    } = await getOfflineAndOnlineUserEnrollments();

    if (!success) {
        return (
            <div className="container mx-auto px-4 py-8">
                <EmptyState
                    title="Could Not Load Courses"
                    description={
                        error?.toString() ||
                        "There was an issue fetching your enrollments. Please try again later."
                    }
                />
            </div>
        );
    }
    const { sessionClaims } = await auth();
    const loggedIn = !!sessionClaims;

    const hasOfflineCourses = filteredOfflineCourses.length > 0;
    const hasOnlineCourses = filteredOnlineCourses.length > 0;

    if (!hasOfflineCourses && !hasOnlineCourses) {
        return (
            <div className="container mx-auto px-4 py-8">
                <EmptyState
                    title="No Courses Yet!"
                    description="You haven't enrolled in any courses. Let's find one for you."
                    showLink={true}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">My Courses</h1>
            <Tabs
                defaultValue={hasOfflineCourses ? "offline" : "online"}
                className="w-full max-w-5xl mx-auto"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="offline">Offline Courses</TabsTrigger>
                    <TabsTrigger value="online">Online Courses</TabsTrigger>
                </TabsList>
                <TabsContent value="offline">
                    {hasOfflineCourses ? (
                        <CoursesCatalog
                            courses={filteredOfflineCourses}
                            enrollments={enrollments}
                            isDashboard={true}
                            loggedIn={loggedIn}
                        />
                    ) : (
                        <EmptyState
                            title="No Offline Courses"
                            description="You haven't enrolled in any offline courses yet."
                        />
                    )}
                </TabsContent>
                <TabsContent value="online">
                    {hasOnlineCourses ? (
                        <CoursesCatalog
                            courses={filteredOnlineCourses}
                            enrollments={enrollments}
                            isDashboard={true}
                            loggedIn={loggedIn}
                        />
                    ) : (
                        <EmptyState
                            title="No Online Courses"
                            description="You haven't enrolled in any online courses yet."
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default page;
