import Navbar from "@/components/Navbar";
import React from "react";

const CourseLayout = ({ children }: React.PropsWithChildren) => {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
};

export default CourseLayout;
