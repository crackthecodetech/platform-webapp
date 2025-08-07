import CourseCard from "./CourseCard";
import { Course, Topic, SubTopic } from "@/generated/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAllCoursesWithTopicsAndSubTopics } from "@/app/actions/course.actions";
import { getClerkUserEnrollmentsIds } from "@/app/actions/enrollment.actions";

type CourseWithTopicsAndSubTopics = Course & {
    topics: (Topic & {
        subTopics: SubTopic[];
    })[];
};

const CoursesCatalog = async ({
    analytics = false,
}: {
    analytics?: boolean;
}) => {
    const { userId } = await auth();

    const coursesData = getAllCoursesWithTopicsAndSubTopics();

    const userEnrollmentsData = getClerkUserEnrollmentsIds(userId);

    const [coursesResponse, userEnrollmentsResponse] = await Promise.all([
        coursesData,
        userEnrollmentsData,
    ]);
    const { courses } = coursesResponse;
    const { enrollmentIds } = userEnrollmentsResponse;

    const enrolledCourses: Set<string> = new Set(
        enrollmentIds.map((e) => e.course_id)
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(
                        (
                            course: CourseWithTopicsAndSubTopics,
                            index: number
                        ) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                isEnrolled={enrolledCourses.has(course.id)}
                                isFirstCard={index === 0}
                                analytics={analytics}
                            />
                        )
                    )}
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
