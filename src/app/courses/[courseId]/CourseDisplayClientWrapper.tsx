"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Course, Video } from "@/generated/prisma";
const CourseDisplayClient = dynamic(() => import("./CourseDisplayClient"), {
    ssr: false,
    loading: () => <div className="py-12 text-center">Loading course…</div>,
});

const CourseDisplayClientWrapper = ({
    course,
}: {
    course: Course & { videos: Video[] };
}) => {
    return <CourseDisplayClient course={course} />;
};

export default CourseDisplayClientWrapper;
