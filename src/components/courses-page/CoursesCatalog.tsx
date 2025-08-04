import CourseCard from "./CourseCard";
import { Course } from "@/generated/prisma";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/config/prisma.config";

const CoursesCatalog = async () => {
    const { userId } = await auth();

    const coursesData = prisma.course.findMany({
        orderBy: { created_at: "desc" },
    });

    const userEnrollmentsData = userId
        ? prisma.enrollment.findMany({
              where: { user: { clerk_id: userId } },
              select: { course_id: true },
          })
        : Promise.resolve([]);

    const [courses, userEnrollments] = await Promise.all([
        coursesData,
        userEnrollmentsData,
    ]);

    const enrolledCourses: Set<string> = new Set(
        userEnrollments.map((e) => e.course_id)
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course: Course, index: number) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            isEnrolled={enrolledCourses.has(course.id)}
                            isFirstCard={index === 0}
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
