import CourseCard from "./CourseCard";
import { Course, Topic, SubTopic } from "@/generated/prisma";
import { auth } from "@clerk/nextjs/server";
import { getAllCoursesWithTopicsAndSubTopics } from "@/actions/course.actions";
import { getClerkActiveEnrollments } from "@/actions/enrollment.actions";

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
    const userEnrollmentsData = getClerkActiveEnrollments(userId);

    const [coursesResponse, userEnrollmentsResponse] = await Promise.all([
        coursesData,
        userEnrollmentsData,
    ]);
    const { courses } = coursesResponse;
    const { enrollments } = userEnrollmentsResponse;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(
                        (
                            course: CourseWithTopicsAndSubTopics,
                            index: number
                        ) => {
                            const enrollment = enrollments.find(
                                (e) => e.course_id === course.id
                            );
                            const isEnrolled = !!enrollment;

                            return (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    isEnrolled={isEnrolled}
                                    isFirstCard={index === 0}
                                    analytics={analytics}
                                    expiresAt={
                                        isEnrolled
                                            ? enrollment.expires_at
                                            : null
                                    }
                                />
                            );
                        }
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
