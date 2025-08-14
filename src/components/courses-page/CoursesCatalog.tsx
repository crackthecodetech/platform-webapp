import CourseCard from "./CourseCard";
import { Course, Topic, SubTopic } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type Enrollment = {
    course_id: string;
    expires_at: Date | null;
};

type CourseWithTopicsAndSubTopics = Course & {
    topics: (Topic & {
        subTopics: SubTopic[];
    })[];
};

interface CoursesCatalogProps {
    analytics?: boolean;
    courses: CourseWithTopicsAndSubTopics[];
    enrollments?: Enrollment[];
    admin?: boolean;
    loggedIn?: boolean;
    isDashboard?: boolean;
}

const CoursesCatalog = ({
    analytics = false,
    courses = [],
    enrollments = [],
    admin = false,
    loggedIn = false,
    isDashboard = false,
}: CoursesCatalogProps) => {
    const enrollmentsMap = useMemo(() => {
        const map = new Map<string, Enrollment>();
        for (const enrollment of enrollments) {
            map.set(enrollment.course_id, enrollment);
        }
        return map;
    }, [enrollments]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {courses.length > 0 ? (
                <div
                    className={cn(
                        "grid gap-8",
                        isDashboard
                            ? "grid-cols-1 lg:grid-cols-2"
                            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    )}
                >
                    {courses.map((course, index) => {
                        const enrollment = enrollmentsMap.get(course.id);
                        const isEnrolled = !!enrollment;

                        return (
                            <CourseCard
                                key={course.id}
                                course={course}
                                isEnrolled={isEnrolled}
                                isFirstCard={index === 0}
                                analytics={analytics}
                                admin={admin}
                                loggedIn={loggedIn}
                                expiresAt={enrollment?.expires_at || null}
                            />
                        );
                    })}
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
