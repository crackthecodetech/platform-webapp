import axios from "axios";
import CourseCard from "./CourseCard";
import { Course } from "@/generated/prisma";
import { auth } from "@clerk/nextjs/server";

const CoursesCatalog = async () => {
    const { getToken } = await auth();
    const token = await getToken();

    const [coursesResponse, enrollmentsResponse] = await Promise.all([
        axios.get(`${process.env.BASE_URL}/api/course`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
        axios.get(`${process.env.BASE_URL}/api/enrollments`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),
    ]);

    const courses: Course[] = coursesResponse.data.courses;
    const enrolledCourses: Set<string> = new Set(enrollmentsResponse.data);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course: Course) => (
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
