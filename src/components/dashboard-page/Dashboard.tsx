// "use client";
import { getClerkActiveEnrollments } from '@/actions/enrollment.actions';
import { auth } from '@clerk/nextjs/server';
import React from "react";
import CoursesCatalog from '../courses-page/CoursesCatalog';

const Dashboard = async () => {
  const { userId } = await auth();
  const loggedIn = !!userId;
  const userEnrollmentsData = loggedIn
    ? await getClerkActiveEnrollments(userId)
    : { enrollments: [] };

  return (
    <div className="flex justify-between h-screen">
      <div className="bg-blue-50 w-1/2 p-4">
        <h2 className="text-2xl font-bold">Offline Courses</h2>
        <CoursesCatalog
        isEnrolled={true}
        offline={true}/>
      </div>
      <div className="bg-green-50 w-1/2 p-4">
        <h2 className="text-2xl font-bold">Online Courses</h2>
        <pre>{JSON.stringify(userEnrollmentsData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default Dashboard;
