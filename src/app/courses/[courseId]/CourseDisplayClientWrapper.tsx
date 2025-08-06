"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Course, Topic, Video } from "@/generated/prisma";
const CourseDisplayClient = dynamic(() => import("./CourseDisplayClient"), {
    ssr: false,
    loading: () => <div className="py-12 text-center">Loading course…</div>,
});

type CourseWithTopicsAndVideos = Course & {
    topics: (Topic & {
        videos: Video[];
    })[];
};

const CourseDisplayClientWrapper = ({
    course,
}: {
    course: CourseWithTopicsAndVideos;
}) => {
    return <CourseDisplayClient course={course} />;
};

export default CourseDisplayClientWrapper;
