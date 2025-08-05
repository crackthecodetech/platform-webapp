import { columns } from "@/components/admin-page/course-analytics/CourseEnrollmentsColumns";
import CourseEnrollmentsDataTable from "@/components/admin-page/course-analytics/CourseEnrollmentsDataTable";
import { EnrollmentWithUser } from "@/types/enrollment.types";
import React from "react";

const CourseEnrollmentsList = ({
    enrollments,
}: {
    enrollments: EnrollmentWithUser[];
}) => {
    return (
        <div className="w-full h-full mx-auto">
            <CourseEnrollmentsDataTable data={enrollments} columns={columns} />
        </div>
    );
};

export default CourseEnrollmentsList;
