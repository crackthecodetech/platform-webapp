import React from "react";
import { getOfflineAndOnlineUserEnrollments } from "@/actions/enrollment.actions";
import CoursesCatalog from "@/components/courses-page/CoursesCatalog";

const page = async () => {
    const {
        success,
        enrollments,
        error,
        filteredOfflineCourses,
        filteredOnlineCourses,
    } = await getOfflineAndOnlineUserEnrollments();

    if (!success) {
        throw error;
    }

    return (
        <div className="flex justify-between h-screen">
            <div className="bg-blue-50 w-1/2 p-4">
                <h2 className="text-2xl font-bold">Offline Courses</h2>
                <CoursesCatalog
                    courses={filteredOfflineCourses}
                    enrollments={enrollments}
                    isDashboard={true}
                />
            </div>
            <div className="bg-green-50 w-1/2 p-4">
                <h2 className="text-2xl font-bold">Online Courses</h2>
                <CoursesCatalog
                    courses={filteredOnlineCourses}
                    enrollments={enrollments}
                    isDashboard={true}
                />
            </div>
        </div>
    );
};

export default page;
