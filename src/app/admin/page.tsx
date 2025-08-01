import AdminNavbar from "@/components/admin-page/AdminNavbar";
import CreateCourseForm from "@/components/admin-page/CreateCourseForm";
import React from "react";

const AdminPage = () => {
    return (
        <div>
            <AdminNavbar />
            <CreateCourseForm />
        </div>
    );
};

export default AdminPage;
