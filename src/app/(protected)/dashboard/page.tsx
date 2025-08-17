import React from "react";
import { getOfflineAndOnlineUserEnrollments } from "@/actions/enrollment.actions";
import CoursesCatalog from "@/components/courses-page/CoursesCatalog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <div className="mx-auto px-4 py-8">
            <Tabs defaultValue="offline" className="w-full max-w-5xl mx-auto">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="offline">Offline Courses</TabsTrigger>
                    <TabsTrigger value="online">Online Courses</TabsTrigger>
                </TabsList>
                <TabsContent value="offline" className="mt-6">
                    <CoursesCatalog
                        courses={filteredOfflineCourses}
                        enrollments={enrollments}
                        isDashboard={true}
                    />
                </TabsContent>
                <TabsContent value="online" className="mt-6">
                    <CoursesCatalog
                        courses={filteredOnlineCourses}
                        enrollments={enrollments}
                        isDashboard={true}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default page;
