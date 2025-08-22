"use client";

import { useState } from "react";
import { UserSearch } from "@/components/UserSearch";
import { EnrollmentForm } from "@/components/EnrollmentForm";
import { User } from "@/generated/prisma";

export default function ManualEnrollmentPage() {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleUserSelected = (user: User | null) => {
        setSelectedUser(user);
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight mb-6">
                    Manual Enrollment
                </h1>
                <p className="text-muted-foreground mb-8">
                    Search for a user and enroll them into a course with a
                    specific role. This should only be used in emergency
                    situations.
                </p>
                <UserSearch onUserSelected={handleUserSelected} />

                {selectedUser && (
                    <div className="mt-8">
                        <EnrollmentForm user={selectedUser} />
                    </div>
                )}
            </div>
        </div>
    );
}
