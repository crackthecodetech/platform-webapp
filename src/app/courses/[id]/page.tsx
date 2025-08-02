"use client";

import { useParams } from "next/navigation";
import React from "react";

const CoursePage = () => {
    const { id } = useParams();

    return <div>CoursePage</div>;
};

export default CoursePage;
