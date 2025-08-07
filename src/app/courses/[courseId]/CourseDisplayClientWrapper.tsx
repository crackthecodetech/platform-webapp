"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Course, Topic, SubTopic } from "@/generated/prisma";
const CourseDisplayClient = dynamic(() => import("./CourseDisplayClient"), {
    ssr: false,
    loading: () => <div className="py-12 text-center">Loading course…</div>,
});

type CourseWithTopicsAndSubTopics = Course & {
    topics: (Topic & {
        subTopics: SubTopic[];
    })[];
};

const CourseDisplayClientWrapper = ({
    course,
}: {
    course: CourseWithTopicsAndSubTopics;
}) => {
    return <CourseDisplayClient course={course} />;
};

export default CourseDisplayClientWrapper;
