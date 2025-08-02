import axios from "axios";
import CourseCard from "./CourseCard";

const CoursesCatalog = async () => {
    const [coursesResponse, enrollmentsResponse] = await Promise.all([
        axios.get("http://localhost:3000/api/course"),
        axios
            .get("http://localhost:3000/api/enrollments")
            .catch(() => ({ data: [] })),
    ]);

    const courses = coursesResponse.data.courses;
    const enrolledCourses = enrollmentsResponse.data.enrolledCourseIds;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            isEnrolled={enrolledCourses?.has(course.id)}
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
