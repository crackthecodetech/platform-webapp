import { getAllCoursesWithTopicsAndSubTopics } from "@/actions/course.actions";
import { getClerkActiveEnrollments } from "@/actions/enrollment.actions";
import CoursesCatalog from "@/components/courses-page/CoursesCatalog";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@clerk/nextjs/server";
import React, { Suspense } from "react";

const CatalogSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                    <Skeleton
                        key={i}
                        className="h-[520px] w-full animate-pulse rounded-lg bg-gray-200"
                    />
                ))}
            </div>
        </div>
    );
};

const CoursesPage = async () => {
    const { sessionClaims, userId } = await auth();
    const loggedIn = !!sessionClaims;

    const admin = loggedIn && sessionClaims["metadata"]["role"] === "admin";

    const coursesData = getAllCoursesWithTopicsAndSubTopics();
    const userEnrollmentsData = loggedIn
        ? getClerkActiveEnrollments(userId)
        : Promise.resolve({ enrollments: [] });

    const [coursesResponse, userEnrollmentsResponse] = await Promise.all([
        coursesData,
        userEnrollmentsData,
    ]);

    const { courses } = coursesResponse;
    const { enrollments } = userEnrollmentsResponse;

    const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

    const unenrolledCourses = courses.filter(
        (course) => !enrolledCourseIds.has(course.id) && !course.isFree
    );

    return (
        <div>
            <Suspense fallback={<CatalogSkeleton />}>
                {admin ? (
                    <CoursesCatalog
                        courses={courses}
                        enrollments={enrollments}
                        admin={admin}
                        loggedIn={loggedIn}
                    />
                ) : (
                    <CoursesCatalog
                        courses={unenrolledCourses}
                        enrollments={enrollments}
                        admin={admin}
                        loggedIn={loggedIn}
                    />
                )}
            </Suspense>
        </div>
    );
};

export default CoursesPage;
