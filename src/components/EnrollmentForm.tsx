"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "./ui/card";
import { Course, User } from "@/generated/prisma";
import { getUnenrolledCoursesForUser } from "@/actions/course.actions";
import { createEnrollment } from "@/actions/enrollment.actions";
import { getExpiryDate } from "@/lib/utils";

interface EnrollmentFormProps {
    user: User;
}

export function EnrollmentForm({ user }: EnrollmentFormProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollmentStatus, setEnrollmentStatus] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            const response = await getUnenrolledCoursesForUser(user.id);
            const data: Course[] = response.courses;
            setCourses(data);
        };
        fetchCourses();
    }, [user.id]);

    const handleEnrollment = async () => {
        setIsEnrolling(true);
        setEnrollmentStatus(null);
        try {
            const expiry = getExpiryDate();

            const response = await createEnrollment(
                selectedCourseId,
                user.id,
                expiry
            );

            if (!response.success) {
                throw new Error("Failed to enroll user.");
            }

            setEnrollmentStatus({
                message: "User successfully enrolled!",
                type: "success",
            });
        } catch (error) {
            setEnrollmentStatus({
                message:
                    error instanceof Error
                        ? error.message
                        : "An error occurred.",
                type: "error",
            });
        } finally {
            setIsEnrolling(false);
        }
    };

    const selectedCourse = courses.find((c) => c.id === selectedCourseId);

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
                Enroll &quot;{user.username}&quot;
            </h2>
            <div className="space-y-6">
                <div>
                    <label
                        htmlFor="course-select"
                        className="block text-sm font-medium text-muted-foreground mb-2"
                    >
                        Select a Course
                    </label>
                    <Select
                        onValueChange={setSelectedCourseId}
                        value={selectedCourseId}
                    >
                        <SelectTrigger id="course-select">
                            <SelectValue placeholder="Select a course..." />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                    {course.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button disabled={!selectedCourseId || isEnrolling}>
                            Enroll User
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Confirm Enrollment
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to enroll{" "}
                                <strong>{user.username}</strong> in the course{" "}
                                <strong>
                                    &quot;{selectedCourse?.title}&quot;
                                </strong>
                                as a
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleEnrollment}>
                                {isEnrolling
                                    ? "Enrolling..."
                                    : "Confirm Enrollment"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {enrollmentStatus && (
                    <p
                        className={`text-sm ${
                            enrollmentStatus.type === "success"
                                ? "text-green-600"
                                : "text-red-600"
                        }`}
                    >
                        {enrollmentStatus.message}
                    </p>
                )}
            </div>
        </Card>
    );
}
