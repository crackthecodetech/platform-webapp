"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EnrollmentWithUser } from "@/types/enrollment.types";

export const columns: ColumnDef<EnrollmentWithUser>[] = [
    {
        accessorKey: "user_id",
        header: "User ID",
    },
    {
        accessorFn: (e) => e.user.username,
        header: "Username",
    },
    {
        accessorFn: (e) =>
            e.created_at.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }),
        header: "Enrolled At",
    },
];
