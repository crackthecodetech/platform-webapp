import React from "react";
import CoursesCatalog from "../courses-page/CoursesCatalog";
import {
    getAllCoursesWithTopicsAndSubTopics,
    getAllCoursesWithTopicsAndSubTopicsByOffline,
} from "@/actions/course.actions";
import { getClerkActiveEnrollments } from "@/actions/enrollment.actions";
import { checkIfAdmin } from "@/actions/user.actions";
import { auth } from "@clerk/nextjs/server";

const Dashboard = async () => {
    const { userId } = await auth();
    const loggedIn = !!userId;

    const { admin } = loggedIn ? await checkIfAdmin(userId) : { admin: false };
    const offlineCoursesData = getAllCoursesWithTopicsAndSubTopicsByOffline({
        offline: true,
    });
    const onlineCoursesData = getAllCoursesWithTopicsAndSubTopicsByOffline({
        offline: false,
    });
    const userEnrollmentsData = loggedIn
        ? getClerkActiveEnrollments(userId)
        : Promise.resolve({ enrollments: [], enrolledCourseIds: new Set() });

    const [
        offlineCoursesResponse,
        onlineCoursesResponse,
        userEnrollmentsResponse,
    ] = await Promise.all([
        offlineCoursesData,
        onlineCoursesData,
        userEnrollmentsData,
    ]);
    const { courses: offlineCourses } = offlineCoursesResponse;
    const { courses: onlineCourses } = onlineCoursesResponse;
    const { enrollments, enrolledCourseIds } = userEnrollmentsResponse;

    const filteredOfflineCourses = offlineCourses.filter((course) =>
        enrolledCourseIds.has(course.id)
    );
    const filteredOnlineCourses = onlineCourses.filter((course) =>
        enrolledCourseIds.has(course.id)
    );

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

export default Dashboard;
