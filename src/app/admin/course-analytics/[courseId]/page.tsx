import { getCourseById } from "@/app/actions/course.actions";
import { getEnrollmentsByCourseIdWithUserDetails } from "@/app/actions/enrollment.actions";
import CourseEnrollmentsList from "./CourseEnrollmentsList";
import CourseEnrollmentsLineGraph from "./CourseEnrollmentsLineGraph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Users } from "lucide-react";

const CourseAnalyticsPage = async ({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) => {
    const { courseId } = await params;

    const [courseResult, enrollmentResult] = await Promise.all([
        getCourseById(courseId),
        getEnrollmentsByCourseIdWithUserDetails(courseId),
    ]);

    const { success: courseSuccess, course, error: courseError } = courseResult;
    const {
        success: enrollmentSuccess,
        enrollments,
        error: enrollmentError,
    } = enrollmentResult;

    if (!courseSuccess) {
        return <div>Failed to fetch course: {JSON.stringify(courseError)}</div>;
    }
    if (!enrollmentSuccess) {
        return (
            <div>
                Failed to fetch enrollments: {JSON.stringify(enrollmentError)}
            </div>
        );
    }

    const totalEnrollments = enrollments.length;
    const totalRevenue = totalEnrollments * (course.price || 0);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">
                    Analytics for:{" "}
                    <span className="text-primary">{course.title}</span>
                </h1>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex flex-col gap-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                }).format(totalRevenue)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Enrollments
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                +{totalEnrollments}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="flex-grow">
                        <CardHeader>
                            <CardTitle>Recent Enrollments</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[40vh] overflow-y-auto">
                            <CourseEnrollmentsList enrollments={enrollments} />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrollments Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CourseEnrollmentsLineGraph
                                enrollments={enrollments}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Revenue table coming soon...
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CourseAnalyticsPage;
